// Centralized API configuration
const API_CONFIG = {
  // Base URL - can be overridden by environment variables
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://xen-ai-test-env.eba-yqhbvx3c.ap-northeast-1.elasticbeanstalk.com',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      VERIFY: '/api/auth/verify',
      GOOGLE: '/api/auth/google',
      PROFILE: '/api/auth/profile'
    },
    CHAT: {
      MESSAGE: '/api/chat/message',
      MODELS: '/api/chat/models'
    },
    CONFIG: {
      // Public configuration endpoints
      APP_CONFIG: '/api/config/app',
      
      // Protected configuration endpoints (require authentication)
      AI_MODELS: '/api/config/ai-models',
      AI_MODELS_DEFAULT: '/api/config/ai-models/default',
      AI_MODEL_BY_NAME: (name) => `/api/config/ai-models/${name}`,
      APP_CONFIG_BY_KEY: (key) => `/api/config/app/${key}`,
      
      // Internal endpoints (for backend services)
      INTERNAL_AI_MODEL_DEFAULT: '/api/config/internal/ai-model/default'
    }
  }
}

// Helper function to build full URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Configuration service for frontend
export const ConfigService = {
  // Get public app configuration
  async getAppConfig() {
    try {
      const response = await fetch(buildApiUrl(ENDPOINTS.CONFIG.APP_CONFIG));
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching app config:', error);
      return null;
    }
  },

  // Get available AI models (public endpoint)
  async getAvailableModels() {
    try {
      const response = await fetch(buildApiUrl(ENDPOINTS.CHAT.MODELS));
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching available models:', error);
      return [];
    }
  },

  // Get AI model configurations (requires authentication)
  async getAIModelConfigs(authToken) {
    try {
      const response = await fetch(buildApiUrl(ENDPOINTS.CONFIG.AI_MODELS), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching AI model configs:', error);
      return [];
    }
  },

  // Get specific app configuration by key (requires authentication)
  async getAppConfigByKey(key, authToken) {
    try {
      const response = await fetch(buildApiUrl(ENDPOINTS.CONFIG.APP_CONFIG_BY_KEY(key)), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data.success ? data.data.value : null;
    } catch (error) {
      console.error('Error fetching app config by key:', error);
      return null;
    }
  },

  // Create new AI model configuration (requires authentication)
  async createAIModelConfig(configData, authToken) {
    try {
      const response = await fetch(buildApiUrl(ENDPOINTS.CONFIG.AI_MODELS), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating AI model config:', error);
      return { success: false, message: 'Failed to create configuration' };
    }
  },

  // Update AI model configuration (requires authentication)
  async updateAIModelConfig(id, updateData, authToken) {
    try {
      const response = await fetch(buildApiUrl(`${ENDPOINTS.CONFIG.AI_MODELS}/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating AI model config:', error);
      return { success: false, message: 'Failed to update configuration' };
    }
  },

  // Delete AI model configuration (requires authentication)
  async deleteAIModelConfig(id, authToken) {
    try {
      const response = await fetch(buildApiUrl(`${ENDPOINTS.CONFIG.AI_MODELS}/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting AI model config:', error);
      return { success: false, message: 'Failed to delete configuration' };
    }
  },

  // Set app configuration (requires authentication)
  async setAppConfig(key, value, type = 'string', isSensitive = false, description = '', authToken) {
    try {
      const response = await fetch(buildApiUrl(ENDPOINTS.CONFIG.APP_CONFIG), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key,
          value,
          type,
          isSensitive,
          description
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting app config:', error);
      return { success: false, message: 'Failed to set configuration' };
    }
  }
};

// Environment configuration helper
export const EnvironmentConfig = {
  // Get current environment
  getEnvironment() {
    return import.meta.env.MODE || 'development';
  },

  // Check if in development mode
  isDevelopment() {
    return this.getEnvironment() === 'development';
  },

  // Check if in production mode
  isProduction() {
    return this.getEnvironment() === 'production';
  },

  // Get all environment variables (for debugging in development)
  getAllEnvVars() {
    if (this.isDevelopment()) {
      return import.meta.env;
    }
    return {};
  },

  // Get specific environment variable
  getEnvVar(key, defaultValue = null) {
    return import.meta.env[key] || defaultValue;
  }
};

// Export individual configurations
export const API_BASE_URL = API_CONFIG.BASE_URL
export const ENDPOINTS = API_CONFIG.ENDPOINTS

export default API_CONFIG
