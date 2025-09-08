/**
 * Open Source LLM Service
 * Provides AI generation capabilities using self-hosted models
 * Replaces DevvAI dependency for AI generation
 */

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface CompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Configuration for the LLM backend service
export interface LLMConfig {
  endpoint: string;
  models: {
    default: string;
    advanced: string;
    
    // Task-specific model mappings (optional)
    text?: string;
    chat?: string;
    code?: string;
    analysis?: string;
    graph?: string;
    image?: string;
  };
}

// Default configuration
const DEFAULT_CONFIG: LLMConfig = {
  endpoint: 'http://localhost:4001/api/generate', // LLM backend service
  models: {
    default: 'llama2', // Default general-purpose model
    advanced: 'mistral', // Default advanced model
    
    // Task-specific model mappings
    text: 'llama3',           // General text generation
    chat: 'gemma2',           // Conversational responses
    code: 'command-r',        // Code generation
    analysis: 'mistral-large', // Data analysis
    graph: 'mistral',         // Graph/chart generation
    image: 'falcon2'          // Image generation
  }
};

// Available LLM models
export const LLM_MODELS = {
  DEFAULT: 'default', // Maps to whatever is set as default in config
  ADVANCED: 'advanced', // Maps to whatever is set as advanced in config
  
  // Foundation models
  LLAMA2: 'llama2',
  LLAMA3: 'llama3',
  MISTRAL: 'mistral',
  MISTRAL_LARGE: 'mistral-large',
  GEMMA2: 'gemma2',
  COMMAND_R: 'command-r',
  COMMAND_R_PLUS: 'command-r-plus',
  FALCON: 'falcon',
  FALCON2: 'falcon2',
  GROK1: 'grok1',
  BLOOM: 'bloom',
  PYTHIA: 'pythia',
  FASTCHAT_T5: 'fastchat-t5',
  
  // Task-specific models
  TEXT_GENERATION: 'text-generation', // For general text generation
  CHAT: 'chat',                       // For conversational responses
  CODE: 'code',                       // For code generation
  ANALYSIS: 'analysis',               // For data analysis
  GRAPH: 'graph',                     // For graph/chart generation
  IMAGE: 'image',                     // For image generation
};

export class OpenSourceLLMService {
  private config: LLMConfig;
  
  constructor(config?: Partial<LLMConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
  }

  /**
   * Create a chat completion using an open source model
   */
  async createChatCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    try {
      // Map the model name if it's using our aliases
      let modelName = this.mapModelName(request.model);
      
      // Determine if we need to use a different endpoint based on model type
      const endpoint = this.getEndpointForModel(modelName);

      // Get the auth token from localStorage if available
      let authToken = null;
      
      // Try new auth system first
      try {
        const authData = localStorage.getItem('kairos-auth-user');
        if (authData) {
          const user = JSON.parse(authData);
          authToken = user?.uid;
          console.log('✅ Found user token from kairos-auth-user');
        }
      } catch (e) {
        console.warn('Failed to parse new auth data:', e);
      }
      
      // Fallback to old auth system
      if (!authToken) {
        try {
          const oldAuthData = localStorage.getItem('mvp-auth-storage');
          if (oldAuthData) {
            const parsed = JSON.parse(oldAuthData);
            authToken = parsed?.state?.user?.uid;
            console.log('✅ Found user token from mvp-auth-storage');
          }
        } catch (e) {
          console.warn('Failed to parse old auth data:', e);
        }
      }
      
      // Demo fallback - provide a demo token for non-authenticated users
      if (!authToken) {
        authToken = 'demo-user-token';
        console.log('🎭 Using demo token for AI request (user not logged in)');
      }

      // Prepare the request payload
      const payload = {
        model: modelName,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 1000,
        top_p: request.top_p ?? 1,
        stream: request.stream ?? false
      };

      // Make the request to our backend service with auth token
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `LLM request failed with status ${response.status}`);
      }

      const result = await response.json();
      return {
        id: result.id || `gen-${Date.now()}`,
        choices: [
          {
            message: {
              role: 'assistant',
              content: result.content || result.text || ''
            },
            finish_reason: result.finish_reason || 'stop',
            index: 0
          }
        ],
        usage: result.usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };
    } catch (error) {
      console.error('LLM completion request failed:', error);
      throw error;
    }
  }
  
  /**
   * Map model name aliases to actual model names
   */
  private mapModelName(modelName: string): string {
    // Check for task-specific model aliases first
    if (modelName === LLM_MODELS.TEXT_GENERATION && this.config.models.text) {
      return this.config.models.text;
    } else if (modelName === LLM_MODELS.CHAT && this.config.models.chat) {
      return this.config.models.chat;
    } else if (modelName === LLM_MODELS.CODE && this.config.models.code) {
      return this.config.models.code;
    } else if (modelName === LLM_MODELS.ANALYSIS && this.config.models.analysis) {
      return this.config.models.analysis;
    } else if (modelName === LLM_MODELS.GRAPH && this.config.models.graph) {
      return this.config.models.graph;
    } else if (modelName === LLM_MODELS.IMAGE && this.config.models.image) {
      return this.config.models.image;
    }
    
    // Then check basic aliases
    if (modelName === LLM_MODELS.DEFAULT) {
      return this.config.models.default;
    } else if (modelName === LLM_MODELS.ADVANCED) {
      return this.config.models.advanced;
    }
    
    // If it's not an alias, return the original name
    return modelName;
  }
  
  /**
   * Get the appropriate endpoint for a given model
   */
  private getEndpointForModel(modelName: string): string {
    // The base endpoint from config
    const baseEndpoint = this.config.endpoint;
    
    // Special endpoints for specific model types
    if (modelName === 'falcon2' || modelName.includes('falcon')) {
      return baseEndpoint.replace('/generate', '/image-generate');
    }
    
    return baseEndpoint;
  }

  /**
   * Simple text completion (convenience wrapper around chat completion)
   */
  async createCompletion(prompt: string, options?: Partial<CompletionRequest>): Promise<string> {
    const response = await this.createChatCompletion({
      model: options?.model || LLM_MODELS.DEFAULT,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options?.temperature,
      max_tokens: options?.max_tokens
    });

    return response.choices[0]?.message.content || '';
  }
  
  /**
   * Check if the LLM service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('LLM service availability check failed:', error);
      return false;
    }
  }

  /**
   * Get available models from the backend
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.endpoint}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get available models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to get available models:', error);
      return Object.values(LLM_MODELS).filter(model => typeof model === 'string');
    }
  }
  
  /**
   * Generate code using specialized code models (like Command R+)
   */
  async generateCode(prompt: string, language: string, options?: Partial<CompletionRequest>): Promise<string> {
    const codePrompt = `Generate ${language} code for the following task: ${prompt}\n\nRespond with only the code, no explanations or additional text.`;
    
    const response = await this.createChatCompletion({
      model: options?.model || LLM_MODELS.CODE,
      messages: [
        {
          role: 'system',
          content: `You are an expert ${language} developer. Generate clean, efficient, and well-commented code.`
        },
        {
          role: 'user',
          content: codePrompt
        }
      ],
      temperature: options?.temperature || 0.2,
      max_tokens: options?.max_tokens || 2000
    });

    return response.choices[0]?.message.content || '';
  }
  
  /**
   * Generate graph/chart using specialized visualization models (like Mistral for analytics)
   */
  async generateGraph(data: any, chartType: string, options?: Partial<CompletionRequest>): Promise<string> {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const graphPrompt = `Generate a ${chartType} chart visualization for the following data:\n\n${dataString}\n\nRespond with valid code to create this visualization.`;
    
    const response = await this.createChatCompletion({
      model: options?.model || LLM_MODELS.GRAPH,
      messages: [
        {
          role: 'system',
          content: 'You are an expert in data visualization. Generate professional, accurate, and clear charts.'
        },
        {
          role: 'user',
          content: graphPrompt
        }
      ],
      temperature: options?.temperature || 0.3,
      max_tokens: options?.max_tokens || 1500
    });

    return response.choices[0]?.message.content || '';
  }
  
  /**
   * Generate images using Falcon 2 or other image models
   */
  async generateImage(prompt: string): Promise<{ url: string }> {
    try {
      const imageEndpoint = this.getEndpointForModel('falcon2');
      
      const response = await fetch(imageEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          model: this.config.models.image || 'falcon2',
          n: 1,
          size: '1024x1024'
        })
      });

      if (!response.ok) {
        throw new Error(`Image generation failed with status ${response.status}`);
      }

      const data = await response.json();
      return { url: data.url || data.images[0] || '' };
    } catch (error) {
      console.error('Image generation failed:', error);
      throw error;
    }
  }
  
  /**
   * Perform data analysis using specialized models
   */
  async analyzeData(data: any, question: string): Promise<string> {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const analysisPrompt = `Analyze the following data and answer this question: ${question}\n\nDATA:\n${dataString}`;
    
    const response = await this.createChatCompletion({
      model: LLM_MODELS.ANALYSIS,
      messages: [
        {
          role: 'system',
          content: 'You are an expert data analyst. Provide clear, accurate, and insightful analysis.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    return response.choices[0]?.message.content || '';
  }
}

// Create and export a singleton instance for easy importing
export const openSourceLLM = new OpenSourceLLMService();

// Re-export the chat interface for compatibility
export const chat = {
  completions: {
    create: (request: CompletionRequest) => openSourceLLM.createChatCompletion(request)
  },
  
  // Added dedicated chat method
  chat: async (message: string, history: Message[] = []): Promise<string> => {
    try {
      const messages = [
        ...history,
        { role: 'user', content: message }
      ];
      
      // Get the current host URL for API calls (works with both dev and production)
      const apiUrl = 'http://localhost:4001/chat'; // Direct URL to LLM backend chat endpoint
      
      console.log('Chat API URL:', apiUrl);
      
      // Get auth token with fallback
      let authToken = null;
      try {
        const authData = localStorage.getItem('kairos-auth-user');
        if (authData) {
          const user = JSON.parse(authData);
          authToken = user?.uid;
          console.log('✅ Chat: Found user token from kairos-auth-user');
        }
      } catch (e) {
        console.warn('Failed to parse new auth data:', e);
      }
      
      // Fallback to old auth system
      if (!authToken) {
        try {
          const oldAuthData = localStorage.getItem('mvp-auth-storage');
          if (oldAuthData) {
            const parsed = JSON.parse(oldAuthData);
            authToken = parsed?.state?.user?.uid;
            console.log('✅ Chat: Found user token from mvp-auth-storage');
          }
        } catch (e) {
          console.warn('Failed to parse old auth data:', e);
        }
      }
      
      // Demo fallback for chat
      if (!authToken) {
        authToken = 'demo-chat-token';
        console.log('🎭 Chat: Using demo token (user not logged in)');
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Get auth token from localStorage  
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          model: LLM_MODELS.CHAT,
          messages: messages,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication Required - Please log in to access AI services');
        }
        throw new Error(`Chat request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      return result.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Chat request failed:', error);
      throw error;
    }
  }
};
