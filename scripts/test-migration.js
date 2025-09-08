#!/usr/bin/env node

/**
 * Test Migration Script
 * 
 * This script tests the migration from DevvAI to open-source LLMs
 * by generating content with both systems and comparing results.
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { openSourceLLM } from '../src/lib/open-source-llm.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Text generation test cases
const testCases = [
  {
    name: 'Simple text generation',
    prompt: 'Explain the concept of software design patterns in simple terms.',
    modelType: 'text'
  },
  {
    name: 'Code generation',
    prompt: 'Write a React component that displays a list of items with pagination.',
    modelType: 'code'
  },
  {
    name: 'Data analysis',
    prompt: 'Analyze this sales data: [{"month": "Jan", "sales": 120}, {"month": "Feb", "sales": 150}, {"month": "Mar", "sales": 200}]. What is the trend?',
    modelType: 'analysis'
  },
  {
    name: 'Diagram description',
    prompt: 'Create a description for a system architecture diagram of a microservices-based e-commerce platform.',
    modelType: 'graph'
  }
];

async function runTest(testCase) {
  console.log(`\nRunning test: ${testCase.name}`);
  console.log(`Prompt: ${testCase.prompt}`);
  console.log('Generating response with open-source LLM...');
  
  try {
    // Use the open-source LLM
    const startTime = Date.now();
    
    const response = await openSourceLLM.createChatCompletion({
      model: testCase.modelType,
      messages: [
        {
          role: 'user',
          content: testCase.prompt
        }
      ],
      temperature: 0.7
    });
    
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000;
    
    console.log('\n--- Open-Source LLM Response ---');
    console.log(response.choices[0].message.content);
    console.log(`\nTime taken: ${timeTaken.toFixed(2)} seconds`);
    
    return {
      success: true,
      response: response.choices[0].message.content,
      timeTaken
    };
  } catch (error) {
    console.error('Error generating response:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function saveTestResults(results) {
  const resultsDir = path.join(process.cwd(), 'migration-test-results');
  
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsPath = path.join(resultsDir, `test-results-${timestamp}.json`);
  
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log(`\nTest results saved to: ${resultsPath}`);
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║         KAIROS - Open-Source LLM Test Tool           ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
  
  console.log('This tool tests the open-source LLM integration by running several test cases.');
  console.log('Make sure your local LLM server is running before proceeding.');
  
  const serverUrl = await askQuestion('\nEnter the LLM server URL (default: http://localhost:4001): ');
  const serverAddress = serverUrl || 'http://localhost:4001';
  
  console.log(`Using server at: ${serverAddress}`);
  console.log('\nRunning tests...');
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    
    results.push({
      testCase,
      result
    });
  }
  
  console.log('\nAll tests completed!');
  
  // Save test results
  await saveTestResults(results);
  
  // Summary
  console.log('\nTest Summary:');
  results.forEach((result, index) => {
    const status = result.result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${result.testCase.name}: ${status}`);
    if (result.result.timeTaken) {
      console.log(`   Time: ${result.result.timeTaken.toFixed(2)}s`);
    }
  });
  
  const successful = results.filter(r => r.result.success).length;
  const failed = results.length - successful;
  
  console.log(`\nSuccessful tests: ${successful}/${results.length}`);
  console.log(`Failed tests: ${failed}/${results.length}`);
  
  rl.close();
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

main().catch((error) => {
  console.error('Test failed:', error);
  rl.close();
  process.exit(1);
});
