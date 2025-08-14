import express from 'express';
import fetch from 'node-fetch';
import configService from '../services/configService.js';

const router = express.Router();

// Chat endpoint
router.post('/message', async (req, res) => {
  try {
    const { message, modelConfig } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string'
      });
    }

    // Get AI model configuration
    let aiConfig;
    try {
      if (modelConfig && modelConfig.config_name) {
        // Use specific model configuration if provided
        aiConfig = await configService.getAIModelConfigByName(modelConfig.config_name);
      } else {
        // Use default configuration
        aiConfig = await configService.getDefaultAIModelConfig();
      }
    } catch (configError) {
      console.error('Error fetching AI model config:', configError);
      return res.status(500).json({
        success: false,
        message: 'AI service configuration error'
      });
    }

    if (!aiConfig || !aiConfig.api_key) {
      console.error('AI model configuration not found or missing API key');
      return res.status(500).json({
        success: false,
        message: 'AI service not properly configured'
      });
    }

    // Prepare request headers
    const headers = {
      'Authorization': `Bearer ${aiConfig.api_key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
      'X-Title': 'Xen AI'
    };

    // Prepare request body
    const requestBody = {
      model: aiConfig.model_name,
      messages: [
        {
          role: 'system',
          content: aiConfig.system_prompt || 'You are Xen AI, a helpful AI assistant. Be concise, friendly, and informative in your responses.'
        },
        {
          role: 'user',
          content: message.trim()
        }
      ],
      temperature: aiConfig.temperature || 0.7,
      max_tokens: aiConfig.max_tokens || 1000,
      ...aiConfig.model_params // Spread any additional model parameters
    };

    // Call AI API
    const response = await fetch(aiConfig.endpoint_url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error(`${aiConfig.provider} API error:`, response.status, response.statusText);
      
      // Try to get error details from response
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error?.message || errorData.message || '';
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get response from AI service',
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error(`Invalid response from ${aiConfig.provider}:`, data);
      return res.status(500).json({
        success: false,
        message: 'Invalid response from AI service'
      });
    }

    res.json({
      success: true,
      data: {
        message: data.choices[0].message.content,
        timestamp: new Date().toISOString(),
        model_used: aiConfig.model_name,
        provider: aiConfig.provider,
        config_name: aiConfig.config_name
      }
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Endpoint to get available AI models (for frontend selection)
router.get('/models', async (req, res) => {
  try {
    const configs = await configService.getAllAIModelConfigs();
    
    // Return only public information about available models
    const publicConfigs = configs.map(config => ({
      config_name: config.config_name,
      provider: config.provider,
      model_name: config.model_name,
      description: `${config.provider} - ${config.model_name}`,
      is_default: config.is_default,
      max_tokens: config.max_tokens,
      temperature: config.temperature
    }));

    res.json({
      success: true,
      data: publicConfigs
    });
  } catch (error) {
    console.error('Error fetching AI models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available AI models'
    });
  }
});

export default router;
