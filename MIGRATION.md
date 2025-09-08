# DevvAI to Open-Source LLM Migration Guide

This guide provides detailed instructions for migrating KAIROS from DevvAI dependencies to open-source LLMs. The migration utility is designed to simplify this process while ensuring backward compatibility.

## Overview of Changes

1. **Removed DevvAI Dependency**:
   - Removed `@devvai/devv-code-backend` package
   - Removed DevvAI API key requirements

2. **Added Open-Source Alternatives**:
   - Local LLM server using Ollama
   - Support for multiple models (LLaMA, Mistral, etc.)
   - Compatible API layer for seamless transition

3. **Updated Interface**:
   - Compatibility layer preserves existing API calls
   - Extended capabilities for model selection and fallbacks

## Migration Steps

### Automated Migration

The easiest way to migrate is using the provided migration script:

```bash
npm run migrate:devvai
```

This script will:
- Create a backup of your current project
- Remove DevvAI dependencies
- Update code references to use open-source alternatives
- Install required new packages
- Update environment configuration

### Setting Up Local LLM Server

After migration, set up a local LLM server using the provided utility:

```bash
npm run setup:local-llm
```

This script helps you:
- Install Ollama (if not already installed)
- Download required models
- Configure your environment

## Manual Migration (Advanced)

If you prefer to migrate manually, follow these steps:

### 1. Update Dependencies

Remove DevvAI dependencies and add open-source alternatives:

```bash
npm uninstall @devvai/devv-code-backend
npm install langchain openai llama-node mistral-client replicate-api ollama
```

### 2. Update Import Statements

Replace DevvAI imports with our open-source alternative:

```typescript
// Old import
import { DevvAI } from '@devvai/devv-code-backend';

// New import
import { openSourceLLM } from '../lib/open-source-llm';
```

### 3. Update API Calls

The open-source LLM service provides compatible methods with DevvAI:

```typescript
// Old DevvAI call
const response = await devvai.chat.completions.create({
  model: 'kimi-k2-0711-preview',
  messages: messages
});

// New open-source call
const response = await openSourceLLM.createChatCompletion({
  model: 'llama3-70b',
  messages: messages
});
```

### 4. Update Environment Variables

Create or update your `.env` file with:

```
# Local LLM Configuration
OPENAI_API_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=ollama
```

## Model Mappings

DevvAI models are mapped to open-source alternatives:

| DevvAI Model | Open-Source Alternative |
|--------------|-------------------------|
| kimi-k2-0711-preview | llama3-70b |
| google/gemini-2.5-flash-image | stable-diffusion-3 |
| google/gemini-1.5-pro | gemma-7b-it |
| meta/llama-3-8b | llama3-8b |
| mistral-medium | mistral-7b-instruct |

## Compatibility Layer

The `open-source-llm.ts` module provides:

1. **API Compatibility**: Same method signatures as DevvAI
2. **Automatic Fallbacks**: If a model fails, tries alternative models
3. **Task-Specific Models**: Optimized models for different tasks
4. **Local Execution**: All processing happens on your machine

## Troubleshooting

### Common Issues

1. **Missing Models**:
   - Run: `ollama list` to see available models
   - If missing, download with: `ollama pull MODEL_NAME`

2. **Connection Errors**:
   - Ensure Ollama server is running: `ollama serve`
   - Check the API URL in your `.env` file

3. **Memory Issues**:
   - Use smaller models (e.g., llama3-8b instead of llama3-70b)
   - Increase swap space or available memory

### Getting Support

If you encounter issues during migration:
- Check our [GitHub repository](https://github.com/your-org/kairos-isdp)
- Open an issue with details about the problem
- Join our community Discord for real-time support

## Advanced Configuration

For advanced users, you can customize the LLM service:

```typescript
// Custom configuration
import { OpenSourceLLMService } from '../lib/open-source-llm';

const customLLM = new OpenSourceLLMService({
  endpoint: 'http://custom-server:8000/v1',
  models: {
    default: 'custom-model',
    advanced: 'another-model',
    
    // Task-specific mappings
    text: 'text-model',
    chat: 'chat-model',
    // ...
  }
});
```

## Additional Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [LLaMA Documentation](https://llama.meta.com/docs)
- [Mistral AI Documentation](https://mistral.ai/docs)
- [LocalAI Documentation](https://localai.io/docs)
