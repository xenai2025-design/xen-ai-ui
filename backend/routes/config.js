import express from 'express';
import configService from '../services/configService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is authenticated for sensitive operations
const requireAuth = (req, res, next) => {
  authenticateToken(req, res, (err) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access configuration'
      });
    }
    next();
  });
};

// Public endpoint to get basic app configuration (non-sensitive)
router.get('/app', async (req, res) => {
  try {
    const publicConfigs = {
      app_name: await configService.getAppConfig('app_name'),
      enable_voice_features: await configService.getAppConfig('enable_voice_features'),
      max_chat_history: await configService.getAppConfig('max_chat_history')
    };

    res.json({
      success: true,
      data: publicConfigs
    });
  } catch (error) {
    console.error('Error fetching app config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch app configuration'
    });
  }
});

// Protected endpoint to get AI model configurations (for internal use)
router.get('/ai-models', requireAuth, async (req, res) => {
  try {
    const configs = await configService.getAllAIModelConfigs();
    
    // Remove sensitive data from response
    const sanitizedConfigs = configs.map(config => ({
      id: config.id,
      config_name: config.config_name,
      provider: config.provider,
      model_name: config.model_name,
      endpoint_url: config.endpoint_url,
      model_params: config.model_params,
      system_prompt: config.system_prompt,
      max_tokens: config.max_tokens,
      temperature: config.temperature,
      is_active: config.is_active,
      is_default: config.is_default,
      created_at: config.created_at,
      updated_at: config.updated_at
      // Note: api_key is intentionally excluded from response
    }));

    res.json({
      success: true,
      data: sanitizedConfigs
    });
  } catch (error) {
    console.error('Error fetching AI model configs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI model configurations'
    });
  }
});

// Protected endpoint to get default AI model configuration (for chat service)
router.get('/ai-models/default', requireAuth, async (req, res) => {
  try {
    const config = await configService.getDefaultAIModelConfig();
    
    // For internal API calls, we can include the API key
    // This endpoint should only be called by authenticated backend services
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching default AI model config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch default AI model configuration'
    });
  }
});

// Protected endpoint to get specific AI model configuration by name
router.get('/ai-models/:configName', requireAuth, async (req, res) => {
  try {
    const { configName } = req.params;
    const config = await configService.getAIModelConfigByName(configName);
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching AI model config:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Protected endpoint to create new AI model configuration
router.post('/ai-models', requireAuth, async (req, res) => {
  try {
    const configData = req.body;
    
    // Validate required fields
    const requiredFields = ['config_name', 'provider', 'model_name', 'endpoint_url', 'api_key'];
    const missingFields = requiredFields.filter(field => !configData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const newConfig = await configService.createAIModelConfig(configData);
    
    // Remove API key from response
    const { api_key, ...sanitizedConfig } = newConfig;
    
    res.status(201).json({
      success: true,
      data: sanitizedConfig,
      message: 'AI model configuration created successfully'
    });
  } catch (error) {
    console.error('Error creating AI model config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create AI model configuration'
    });
  }
});

// Protected endpoint to update AI model configuration
router.put('/ai-models/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedConfig = await configService.updateAIModelConfig(parseInt(id), updateData);
    
    // Remove API key from response
    const { api_key, ...sanitizedConfig } = updatedConfig;
    
    res.json({
      success: true,
      data: sanitizedConfig,
      message: 'AI model configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating AI model config:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Protected endpoint to delete AI model configuration
router.delete('/ai-models/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await configService.deleteAIModelConfig(parseInt(id));
    
    if (success) {
      res.json({
        success: true,
        message: 'AI model configuration deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'AI model configuration not found'
      });
    }
  } catch (error) {
    console.error('Error deleting AI model config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete AI model configuration'
    });
  }
});

// Protected endpoint to get app configuration by key
router.get('/app/:key', requireAuth, async (req, res) => {
  try {
    const { key } = req.params;
    const value = await configService.getAppConfig(key);
    
    if (value === null) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }
    
    res.json({
      success: true,
      data: { key, value }
    });
  } catch (error) {
    console.error('Error fetching app config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch configuration'
    });
  }
});

// Protected endpoint to set app configuration
router.post('/app', requireAuth, async (req, res) => {
  try {
    const { key, value, type = 'string', isSensitive = false, description = '' } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Key and value are required'
      });
    }
    
    await configService.setAppConfig(key, value, type, isSensitive, description);
    
    res.json({
      success: true,
      message: 'Configuration updated successfully'
    });
  } catch (error) {
    console.error('Error setting app config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update configuration'
    });
  }
});

// Internal endpoint for chat service to get AI model config (no auth required for internal calls)
router.get('/internal/ai-model/default', async (req, res) => {
  try {
    // Verify this is an internal call by checking request headers or IP
    const internalToken = req.headers['x-internal-token'];
    const expectedToken = process.env.INTERNAL_API_TOKEN || 'xen-ai-internal-token';
    
    if (internalToken !== expectedToken) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Internal access only'
      });
    }
    
    const config = await configService.getDefaultAIModelConfig();
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching internal AI model config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI model configuration'
    });
  }
});

export default router;
