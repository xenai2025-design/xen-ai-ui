import { query } from '../config/database.js';
import { encrypt, decrypt } from '../middleware/encryption.js';

class ConfigService {
  
  /**
   * Get all active AI model configurations
   * @returns {Array} Array of AI model configurations
   */
  async getAllAIModelConfigs() {
    try {
      const configs = await query.all(
        'SELECT * FROM ai_model_configs WHERE is_active = ? ORDER BY is_default DESC, created_at ASC',
        [true]
      );
      
      // Decrypt API keys for internal use
      return configs.map(config => ({
        ...config,
        api_key: config.api_key_encrypted ? decrypt(config.api_key_encrypted) : null,
        model_params: config.model_params ? JSON.parse(config.model_params) : {}
      }));
    } catch (error) {
      console.error('Error fetching AI model configs:', error);
      throw new Error('Failed to fetch AI model configurations');
    }
  }

  /**
   * Get default AI model configuration
   * @returns {Object} Default AI model configuration
   */
  async getDefaultAIModelConfig() {
    try {
      const config = await query.get(
        'SELECT * FROM ai_model_configs WHERE is_default = ? AND is_active = ? LIMIT 1',
        [true, true]
      );
      
      if (!config) {
        // If no default config exists, get the first active one
        const fallbackConfig = await query.get(
          'SELECT * FROM ai_model_configs WHERE is_active = ? ORDER BY created_at ASC LIMIT 1',
          [true]
        );
        
        if (!fallbackConfig) {
          throw new Error('No AI model configurations found');
        }
        
        return {
          ...fallbackConfig,
          api_key: fallbackConfig.api_key_encrypted ? decrypt(fallbackConfig.api_key_encrypted) : null,
          model_params: fallbackConfig.model_params ? JSON.parse(fallbackConfig.model_params) : {}
        };
      }
      
      return {
        ...config,
        api_key: config.api_key_encrypted ? decrypt(config.api_key_encrypted) : null,
        model_params: config.model_params ? JSON.parse(config.model_params) : {}
      };
    } catch (error) {
      console.error('Error fetching default AI model config:', error);
      throw new Error('Failed to fetch default AI model configuration');
    }
  }

  /**
   * Get AI model configuration by name
   * @param {string} configName - Configuration name
   * @returns {Object} AI model configuration
   */
  async getAIModelConfigByName(configName) {
    try {
      const config = await query.get(
        'SELECT * FROM ai_model_configs WHERE config_name = ? AND is_active = ?',
        [configName, true]
      );
      
      if (!config) {
        throw new Error(`AI model configuration '${configName}' not found`);
      }
      
      return {
        ...config,
        api_key: config.api_key_encrypted ? decrypt(config.api_key_encrypted) : null,
        model_params: config.model_params ? JSON.parse(config.model_params) : {}
      };
    } catch (error) {
      console.error('Error fetching AI model config by name:', error);
      throw error;
    }
  }

  /**
   * Create new AI model configuration
   * @param {Object} configData - Configuration data
   * @returns {Object} Created configuration
   */
  async createAIModelConfig(configData) {
    try {
      const {
        config_name,
        provider,
        model_name,
        endpoint_url,
        api_key,
        model_params = {},
        system_prompt = '',
        max_tokens = 1000,
        temperature = 0.7,
        is_default = false
      } = configData;

      // Encrypt the API key
      const api_key_encrypted = api_key ? encrypt(api_key) : null;

      // If this is set as default, unset other defaults
      if (is_default) {
        await query.run(
          'UPDATE ai_model_configs SET is_default = ? WHERE is_default = ?',
          [false, true]
        );
      }

      const result = await query.run(
        `INSERT INTO ai_model_configs 
         (config_name, provider, model_name, endpoint_url, api_key_encrypted, 
          model_params, system_prompt, max_tokens, temperature, is_default) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          config_name,
          provider,
          model_name,
          endpoint_url,
          api_key_encrypted,
          JSON.stringify(model_params),
          system_prompt,
          max_tokens,
          temperature,
          is_default
        ]
      );

      return {
        id: result.lastID,
        config_name,
        provider,
        model_name,
        endpoint_url,
        api_key,
        model_params,
        system_prompt,
        max_tokens,
        temperature,
        is_default,
        is_active: true
      };
    } catch (error) {
      console.error('Error creating AI model config:', error);
      throw new Error('Failed to create AI model configuration');
    }
  }

  /**
   * Update AI model configuration
   * @param {number} id - Configuration ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated configuration
   */
  async updateAIModelConfig(id, updateData) {
    try {
      const existingConfig = await query.get(
        'SELECT * FROM ai_model_configs WHERE id = ?',
        [id]
      );

      if (!existingConfig) {
        throw new Error('AI model configuration not found');
      }

      const updates = { ...updateData };
      
      // Encrypt API key if provided
      if (updates.api_key) {
        updates.api_key_encrypted = encrypt(updates.api_key);
        delete updates.api_key;
      }

      // Handle model_params JSON
      if (updates.model_params) {
        updates.model_params = JSON.stringify(updates.model_params);
      }

      // If setting as default, unset other defaults
      if (updates.is_default) {
        await query.run(
          'UPDATE ai_model_configs SET is_default = ? WHERE is_default = ? AND id != ?',
          [false, true, id]
        );
      }

      // Build dynamic update query
      const updateFields = Object.keys(updates);
      const updateValues = Object.values(updates);
      const setClause = updateFields.map(field => `${field} = ?`).join(', ');

      await query.run(
        `UPDATE ai_model_configs SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...updateValues, id]
      );

      // Return updated config
      return await this.getAIModelConfigByName(existingConfig.config_name);
    } catch (error) {
      console.error('Error updating AI model config:', error);
      throw new Error('Failed to update AI model configuration');
    }
  }

  /**
   * Delete AI model configuration
   * @param {number} id - Configuration ID
   * @returns {boolean} Success status
   */
  async deleteAIModelConfig(id) {
    try {
      const result = await query.run(
        'UPDATE ai_model_configs SET is_active = ? WHERE id = ?',
        [false, id]
      );

      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting AI model config:', error);
      throw new Error('Failed to delete AI model configuration');
    }
  }

  /**
   * Get app configuration by key
   * @param {string} key - Configuration key
   * @returns {any} Configuration value
   */
  async getAppConfig(key) {
    try {
      const config = await query.get(
        'SELECT * FROM app_configs WHERE config_key = ? AND is_active = ?',
        [key, true]
      );

      if (!config) {
        return null;
      }

      let value = config.config_value;

      // Parse value based on type
      switch (config.config_type) {
        case 'number':
          value = parseFloat(value);
          break;
        case 'boolean':
          value = value === 'true';
          break;
        case 'json':
          value = JSON.parse(value);
          break;
        default:
          // string - no parsing needed
          break;
      }

      // Decrypt if sensitive
      if (config.is_sensitive && value) {
        value = decrypt(value);
      }

      return value;
    } catch (error) {
      console.error('Error fetching app config:', error);
      throw new Error('Failed to fetch app configuration');
    }
  }

  /**
   * Set app configuration
   * @param {string} key - Configuration key
   * @param {any} value - Configuration value
   * @param {string} type - Value type (string, number, boolean, json)
   * @param {boolean} isSensitive - Whether the value is sensitive
   * @param {string} description - Configuration description
   * @returns {boolean} Success status
   */
  async setAppConfig(key, value, type = 'string', isSensitive = false, description = '') {
    try {
      let processedValue = value;

      // Convert value to string based on type
      switch (type) {
        case 'number':
          processedValue = value.toString();
          break;
        case 'boolean':
          processedValue = value ? 'true' : 'false';
          break;
        case 'json':
          processedValue = JSON.stringify(value);
          break;
        default:
          processedValue = value.toString();
          break;
      }

      // Encrypt if sensitive
      if (isSensitive && processedValue) {
        processedValue = encrypt(processedValue);
      }

      // Check if config exists
      const existingConfig = await query.get(
        'SELECT id FROM app_configs WHERE config_key = ?',
        [key]
      );

      if (existingConfig) {
        // Update existing
        await query.run(
          'UPDATE app_configs SET config_value = ?, config_type = ?, is_sensitive = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE config_key = ?',
          [processedValue, type, isSensitive, description, key]
        );
      } else {
        // Create new
        await query.run(
          'INSERT INTO app_configs (config_key, config_value, config_type, is_sensitive, description) VALUES (?, ?, ?, ?, ?)',
          [key, processedValue, type, isSensitive, description]
        );
      }

      return true;
    } catch (error) {
      console.error('Error setting app config:', error);
      throw new Error('Failed to set app configuration');
    }
  }

  /**
   * Initialize default configurations
   */
  async initializeDefaultConfigs() {
    try {
      // Check if default AI model config exists
      const existingDefault = await query.get(
        'SELECT id FROM ai_model_configs WHERE is_default = ? AND is_active = ?',
        [true, true]
      );

      if (!existingDefault) {
        // Create default OpenRouter configuration
        await this.createAIModelConfig({
          config_name: 'openrouter_mistral_default',
          provider: 'openrouter',
          model_name: 'mistralai/mistral-7b-instruct:free',
          endpoint_url: 'https://openrouter.ai/api/v1/chat/completions',
          api_key: process.env.OPENROUTER_API_KEY || '',
          model_params: {
            temperature: 0.7,
            max_tokens: 1000
          },
          system_prompt: 'You are Xen AI, a helpful AI assistant. Be concise, friendly, and informative in your responses. Keep responses under 500 words unless specifically asked for longer content.',
          max_tokens: 1000,
          temperature: 0.7,
          is_default: true
        });

        console.log('✅ Default AI model configuration created');
      }

      // Initialize other default app configs
      const defaultConfigs = [
        {
          key: 'app_name',
          value: 'Xen AI',
          type: 'string',
          description: 'Application name'
        },
        {
          key: 'max_chat_history',
          value: 50,
          type: 'number',
          description: 'Maximum chat history to keep'
        },
        {
          key: 'enable_voice_features',
          value: true,
          type: 'boolean',
          description: 'Enable voice input/output features'
        }
      ];

      for (const config of defaultConfigs) {
        const existing = await this.getAppConfig(config.key);
        if (existing === null) {
          await this.setAppConfig(
            config.key,
            config.value,
            config.type,
            false,
            config.description
          );
        }
      }

      console.log('✅ Default app configurations initialized');
    } catch (error) {
      console.error('Error initializing default configs:', error);
      // Don't throw error here to prevent app startup failure
    }
  }
}

export default new ConfigService();
