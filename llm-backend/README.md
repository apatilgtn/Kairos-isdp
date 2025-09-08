# Enhanced LLM Backend for KAIROS

This service provides access to multiple open-source AI models through a unified API, allowing the KAIROS application to use different specialized models for different tasks.

## Supported Open-Source Models

The service supports the following open-source models via Ollama:

| Model | Provider | Best For | Description |
|-------|----------|----------|-------------|
| **LLaMA 2/3** | Meta | General text | Meta's powerful general-purpose LLM |
| **Mistral** | Mistral AI | Analysis, reasoning | Strong reasoning and analytical capabilities |
| **Gemma 2** | Google | Chat, conversation | Google's lightweight yet powerful conversational model |
| **Command R/R+** | Cohere | Code generation | Specialized for code generation and understanding |
| **Falcon 2** | TII | Image prompting | Good for image-related text generation |
| **Grok 1.5** | xAI | Chat, reasoning | Well-rounded model with strong reasoning |
| **Bloom** | BigScience | Multilingual | Strong multilingual capabilities |
| **Pythia** | EleutherAI | Research | Technical and research-focused responses |
| **FastChat-T5** | Microsoft | Instruction tuning | Good for following complex instructions |

## Prerequisites

- [Ollama](https://ollama.ai/) installed and running locally
- Node.js v16+ and npm

## Setup

1. Install dependencies:



2. Start Ollama (in a separate terminal) and pull the models you want to use:

```bash
# Start Ollama (if not already running)
ollama serve

# Pull the models you want to use
ollama pull llama2
ollama pull mistral
ollama pull gemma2    # Google's model
ollama pull command-r # For code generation
ollama pull falcon    # For image prompting
```

3. Start the LLM backend server:

```bash
npm start
```

The server will run on port 4001 by default. You can change this by setting the `PORT` environment variable.

## Task-Specific Endpoints

The service automatically selects the best model for different tasks:

- **Text Generation**: `/api/generate` (General text generation)
- **Code Generation**: `/api/generate-code` (Using Command-R for optimized code)
- **Data Analysis**: `/api/analyze` (Using Mistral for analytical reasoning)
- **Graph/Chart Generation**: `/api/generate-graph` (For visualization code)
- **Image Prompt Generation**: `/api/image-prompt` (For detailed image descriptions)

## API Endpoints

- `GET /api/health` - Health check & model availability
- `GET /api/models` - List available models
- `POST /api/generate` - General text generation using any model

### Generate API (General Text)

```json
{
  "model": "llama3", // Model to use (optional, defaults to llama2)
  "messages": [
    {
      "role": "system", 
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, can you help me with a task?"
    }
  ],
  "temperature": 0.7, // Optional
  "max_tokens": 1000, // Optional
  "top_p": 1, // Optional
  "stream": false // Optional
}
```

### Code Generation API

```json
{
  "prompt": "Create a React component that displays a list of items",
  "language": "javascript", // Optional
  "model": "command-r",    // Optional (defaults to best code model)
  "temperature": 0.2       // Optional
}
```

### Data Analysis API

```json
{
  "data": [{"sales": 100, "month": "Jan"}, {"sales": 150, "month": "Feb"}],
  "question": "What is the trend in sales?",
  "model": "mistral"  // Optional (defaults to best analysis model)
}
```

### Chart/Graph Generation API

```json
{
  "data": [{"sales": 100, "month": "Jan"}, {"sales": 150, "month": "Feb"}],
  "chartType": "bar chart",
  "model": "mistral"  // Optional
}
```

### Image Prompt API

```json
{
  "description": "A futuristic city with flying cars",
  "style": "cyberpunk", // Optional
  "model": "falcon"     // Optional
}
```

## Environment Variables

- `PORT` - Port to run the server on (default: 4001)
- `OLLAMA_API` - URL to Ollama API (default: http://localhost:11434/api)

## Integration with KAIROS

The LLM backend is designed to be used with the KAIROS application. It implements an API that is compatible with the OpenSourceLLMService in the KAIROS frontend.
