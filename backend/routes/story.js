import express from 'express';
import fetch from 'node-fetch';
import configService from '../services/configService.js';

const router = express.Router();

// Story generation endpoint
router.post('/generate', async (req, res) => {
  try {
    const { prompt, genre, length, modelConfig } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required and must be a non-empty string'
      });
    }

    // Get AI model configuration
    let aiConfig;
    try {
      if (modelConfig && modelConfig.config_name) {
        aiConfig = await configService.getAIModelConfigByName(modelConfig.config_name);
      } else {
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

    // Prepare tailored system prompt for story generation
    const systemPrompt = `You are a creative writing AI specializing in generating stories, poems, or scripts. 
    Genre: ${genre || 'any'}. 
    Length: ${length || 'medium'}. 
    Be engaging, original, and structured. Start with a title.`;

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
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt.trim()
        }
      ],
      temperature: aiConfig.temperature || 0.7,
      max_tokens: aiConfig.max_tokens || 1000,
      ...aiConfig.model_params
    };

    // Call AI API
    const response = await fetch(aiConfig.endpoint_url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.error?.message || errorData.message || '';
      } catch (e) {}
      
      return res.status(500).json({
        success: false,
        message: 'Failed to generate story',
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({
        success: false,
        message: 'Invalid response from AI service'
      });
    }

    res.json({
      success: true,
      data: {
        content: data.choices[0].message.content,
        timestamp: new Date().toISOString(),
        model_used: aiConfig.model_name,
        provider: aiConfig.provider,
        config_name: aiConfig.config_name
      }
    });

  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
