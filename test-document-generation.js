#!/usr/bin/env node

const axios = require('axios');

// Test configuration
const API_URL = 'http://localhost:4001/api/generate';
const AUTH_TOKEN = 'demo-user-token';

// Document types to test
const documentTypes = [
  { name: 'Business Case', prompt: 'business case for my project' },
  { name: 'Feasibility Study', prompt: 'feasibility study for my project' },
  { name: 'Project Charter', prompt: 'project charter for my project' },
  { name: 'Scope Statement', prompt: 'scope statement for my project' },
  { name: 'RFP', prompt: 'rfp for my project' },
  { name: 'Roadmap', prompt: 'roadmap for my project' },
  { name: 'Elevator Pitch', prompt: 'elevator pitch for my project' }
];

async function testDocumentGeneration() {
  console.log('🧪 Testing Document Generation API\n');
  
  for (const docType of documentTypes) {
    try {
      console.log(`📄 Testing ${docType.name}...`);
      
      const response = await axios.post(API_URL, {
        model: 'default',
        messages: [
          {
            role: 'user',
            content: docType.prompt
          }
        ]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        timeout: 10000
      });
      
      if (response.data?.choices?.[0]?.message?.content) {
        const content = response.data.choices[0].message.content;
        const preview = content.substring(0, 150).replace(/\n/g, ' ');
        console.log(`✅ ${docType.name}: Success - ${preview}...`);
      } else {
        console.log(`❌ ${docType.name}: No content returned`);
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${docType.name}: LLM Backend not running on port 4001`);
      } else if (error.response?.status === 401) {
        console.log(`❌ ${docType.name}: Authentication failed`);
      } else {
        console.log(`❌ ${docType.name}: ${error.message}`);
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✨ Document Generation Test Complete');
}

// Check if LLM backend is running
async function checkBackendStatus() {
  try {
    const response = await axios.get('http://localhost:4001/api/health');
    console.log('🟢 LLM Backend is running\n');
    return true;
  } catch (error) {
    console.log('🔴 LLM Backend is NOT running on port 4001');
    console.log('   Please start it with: cd llm-backend && node server.js\n');
    return false;
  }
}

// Main execution
async function main() {
  const backendRunning = await checkBackendStatus();
  if (backendRunning) {
    await testDocumentGeneration();
  }
}

main().catch(console.error);
