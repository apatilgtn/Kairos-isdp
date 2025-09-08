# Migration Guide: From DevvAI to Open-Source LLMs

This guide explains how to migrate from DevvAI to open-source LLM alternatives in the KAIROS platform.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Migration Process](#migration-process)
4. [Local LLM Setup](#local-llm-setup)
5. [API Compatibility Layer](#api-compatibility-layer)
6. [Model Mappings](#model-mappings)
7. [Troubleshooting](#troubleshooting)

## Overview

The KAIROS platform previously relied on DevvAI's proprietary services for AI capabilities. This migration transitions the application to use open-source alternatives, providing:

- Greater flexibility in model selection
- Reduced costs through local model deployment
- Full control over AI capabilities and fine-tuning
- No dependency on external API services

## Prerequisites

Before migrating, ensure you have:

- Node.js 18.x or later
- At least 16GB RAM for running local models
- 30GB+ disk space for model weights
- Git LFS (for downloading large model files)

## Migration Process

### Option 1: Automated Migration

1. Run the migration script:
   ```bash
   npm run migrate:devvai
   ```

2. Follow the prompts to configure your migration options
3. Review and test the migrated code

### Option 2: Manual Migration

If you prefer a manual approach or need more control:

1. Install required dependencies:
   ```bash
   npm install langchain openai llama-node mistral-client replicate-api ollama
   ```

2. Remove DevvAI dependencies:
   ```bash
   npm uninstall @devvai/devv-code-backend
   ```

3. Update imports in your code:
   ```typescript
   // Old import
   import { DevvAI } from '@devvai/devv-code-backend';
   
   // New import
   import { OpenSourceLLM } from './lib/open-source-llm';
   ```

4. Update model references:
   ```typescript
   // Old reference
   model: 'kimi-k2-0711-preview'
   
   // New reference
   model: 'llama3-70b' // or another appropriate model
   ```

5. Update API endpoints:
   ```typescript
   // Old endpoint
   'https://api.devv.ai/v1/chat/completions'
   
   // New endpoint
   'http://localhost:8000/v1/chat/completions'
   ```

## Local LLM Setup

After migration, you'll need to set up local LLM services:

### Option 1: Using Ollama (Recommended)

1. Install Ollama from [ollama.ai](https://ollama.ai)

2. Pull required models:
   ```bash
   ollama pull llama3:70b
   ollama pull mistral:latest
   ollama pull stable-diffusion:3
   ollama pull gemma:7b-it
   ```

3. Start the Ollama server:
   ```bash
   ollama serve
   ```

### Option 2: Using LocalAI

1. Install LocalAI from [localai.io](https://localai.io)

2. Configure models in `config.yaml`

3. Start the LocalAI server:
   ```bash
   localai serve
   ```

## API Compatibility Layer

The migration provides a compatibility layer that maps DevvAI API calls to open-source alternatives:

```typescript
// src/lib/open-source-llm.ts
import { OpenAI } from 'openai';

export class OpenSourceLLM {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      baseURL: process.env.OPENAI_API_BASE_URL || 'http://localhost:8000/v1',
      apiKey: process.env.OPENAI_API_KEY || 'sk-local-key',
    });
  }
  
  // Compatible methods with DevvAI
  async createChatCompletion(options: any) {
    return this.client.chat.completions.create(options);
  }
  
  // Additional methods...
}
```

## Model Mappings

DevvAI models are mapped to open-source alternatives:

| DevvAI Model | Open-Source Alternative | Use Case |
|--------------|-------------------------|----------|
| kimi-k2-0711-preview | llama3-70b | General text generation |
| google/gemini-2.5-flash-image | stable-diffusion-3 | Image generation |
| google/gemini-1.5-pro | gemma-7b-it | Complex reasoning |
| meta/llama-3-8b | llama3-8b | Efficient text tasks |
| mistral-medium | mistral-7b-instruct | Instructions/chat |
| claude-3-opus | falcon-40b | Detailed analysis |

## Troubleshooting

### Common Issues

1. **Missing Model Files**  
   Error: "Model not found"  
   Solution: Check if you downloaded the correct model files

2. **Memory Issues**  
   Error: "CUDA out of memory" or similar  
   Solution: Try a smaller model or increase GPU memory

3. **API Compatibility**  
   Error: Missing methods or incompatible arguments  
   Solution: Check the compatibility layer implementation

### Getting Help

For further assistance:

- Check the [GitHub repository](https://github.com/kairos/support)
- Join our [Discord community](https://discord.gg/kairos)
- Email support at support@kairos.com
