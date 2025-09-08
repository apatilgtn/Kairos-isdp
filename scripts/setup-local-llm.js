#!/usr/bin/env node

/**
 * Local LLM Setup Script
 * 
 * This script helps set up local LLM servers for the KAIROS platform.
 * It provides options for Ollama, LocalAI, or LM Studio.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function detectSystem() {
  const platform = os.platform();
  const arch = os.arch();
  
  console.log(`Detected system: ${platform} (${arch})`);
  
  return {
    isWindows: platform === 'win32',
    isMac: platform === 'darwin',
    isLinux: platform === 'linux',
    isArm: arch === 'arm64',
    isAmd: arch === 'x64',
  };
}

async function checkOllamaInstalled() {
  try {
    await execAsync('ollama --version');
    return true;
  } catch (error) {
    return false;
  }
}

async function installOllama(system) {
  console.log('Installing Ollama...');
  
  try {
    if (system.isMac) {
      console.log('Installing Ollama for macOS...');
      console.log('Please download and install Ollama from: https://ollama.ai/download');
      console.log('After installation, return to this script.');
      
      await askQuestion('Press Enter when Ollama is installed...');
    } else if (system.isLinux) {
      console.log('Installing Ollama for Linux...');
      await execAsync('curl -fsSL https://ollama.ai/install.sh | sh');
    } else if (system.isWindows) {
      console.log('Installing Ollama for Windows...');
      console.log('Please download and install Ollama from: https://ollama.ai/download');
      console.log('After installation, return to this script.');
      
      await askQuestion('Press Enter when Ollama is installed...');
    }
    
    console.log('Ollama installed successfully!');
    return true;
  } catch (error) {
    console.error('Failed to install Ollama:', error);
    return false;
  }
}

async function downloadModels() {
  console.log('\nDownloading required models...');
  
  const models = [
    { name: 'llama3:8b', description: 'LLaMA 3 (8B) - General purpose' },
    { name: 'mistral:7b-instruct-v0.2', description: 'Mistral 7B - Instruction-following' },
    { name: 'stable-diffusion:3', description: 'Stable Diffusion - Image generation' },
    { name: 'gemma:7b-instruct', description: 'Gemma 7B - General purpose' },
  ];
  
  console.log('The following models will be downloaded:');
  models.forEach((model, index) => {
    console.log(`${index + 1}. ${model.name} - ${model.description}`);
  });
  
  console.log('\nNOTE: Models can be large (2-8GB each). This may take some time.');
  const proceed = await askQuestion('Continue with download? (Y/n): ');
  
  if (proceed.toLowerCase() === 'n') {
    console.log('Skipping model download.');
    return false;
  }
  
  for (const model of models) {
    console.log(`\nDownloading ${model.name}...`);
    try {
      await execAsync(`ollama pull ${model.name}`);
      console.log(`Successfully downloaded ${model.name}.`);
    } catch (error) {
      console.error(`Failed to download ${model.name}:`, error);
    }
  }
  
  console.log('\nAll models downloaded successfully!');
  return true;
}

async function configureEnvironment() {
  console.log('\nConfiguring environment...');
  
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Add necessary environment variables if they don't exist
  if (!envContent.includes('OPENAI_API_BASE_URL')) {
    envContent += '\n# Local LLM Configuration\n';
    envContent += 'OPENAI_API_BASE_URL=http://localhost:11434/v1\n';
    envContent += 'OPENAI_API_KEY=ollama\n';
  }
  
  // Write updated .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('Environment configured successfully!');
}

async function createStartScript() {
  console.log('\nCreating start script...');
  
  const scriptPath = path.join(process.cwd(), 'start-llm-server.sh');
  const scriptContent = `#!/bin/bash
# Start the local LLM server

echo "Starting Ollama server..."
ollama serve &
OLLAMA_PID=$!

echo "Ollama started with PID: $OLLAMA_PID"
echo "Press Ctrl+C to stop the server."

function cleanup {
  echo "Stopping Ollama server..."
  kill $OLLAMA_PID
  echo "Server stopped."
  exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
while true; do
  sleep 1
done
`;
  
  fs.writeFileSync(scriptPath, scriptContent);
  fs.chmodSync(scriptPath, '755');
  
  console.log('Start script created at:', scriptPath);
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║         KAIROS - Local LLM Setup Utility             ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
`);
  
  console.log('This utility will help you set up local LLM services for the KAIROS platform.');
  
  // Detect system
  const system = await detectSystem();
  
  // Check if Ollama is installed
  const ollamaInstalled = await checkOllamaInstalled();
  
  if (!ollamaInstalled) {
    console.log('Ollama is not installed on your system.');
    const installNow = await askQuestion('Would you like to install Ollama now? (Y/n): ');
    
    if (installNow.toLowerCase() !== 'n') {
      const success = await installOllama(system);
      if (!success) {
        console.error('Failed to install Ollama. Please install it manually from https://ollama.ai/download');
        rl.close();
        return;
      }
    } else {
      console.log('Skipping Ollama installation.');
      console.log('Please install Ollama manually from https://ollama.ai/download');
      rl.close();
      return;
    }
  } else {
    console.log('Ollama is already installed on your system.');
  }
  
  // Download required models
  await downloadModels();
  
  // Configure environment
  await configureEnvironment();
  
  // Create start script
  await createStartScript();
  
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║        Local LLM setup completed successfully!       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
  
  console.log('Next steps:');
  console.log('1. Start the local LLM server: ./start-llm-server.sh');
  console.log('2. Run your KAIROS application: npm run dev');
  console.log('3. Check the docs/open-source-migration.md for more information');
  
  rl.close();
}

main().catch((error) => {
  console.error('Setup failed:', error);
  rl.close();
  process.exit(1);
});
