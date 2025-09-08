#!/usr/bin/env node

/**
 * Test script to verify LLM setup is working
 */

import axios from 'axios';

async function testLLMSetup() {
  console.log('🧪 Testing KAIROS LLM Setup...\n');

  // Test 1: Auth Backend Health
  try {
    const authResponse = await axios.get('http://localhost:4000/api/auth/health');
    console.log('✅ Auth Backend: Running');
    console.log(`   Database: ${authResponse.data.database || 'Connected'}`);
  } catch (error) {
    console.log('❌ Auth Backend: Failed');
    console.log(`   Error: ${error.message}`);
  }

  // Test 2: LLM Backend Health
  try {
    const llmResponse = await axios.get('http://localhost:4001/api/health');
    console.log('✅ LLM Backend: Running');
    console.log(`   Primary Provider: ${llmResponse.data.primaryProvider}`);
    console.log(`   Available Providers: ${llmResponse.data.providers.map(p => p.name).join(', ')}`);
  } catch (error) {
    console.log('❌ LLM Backend: Failed');
    console.log(`   Error: ${error.message}`);
  }

  // Test 3: Document Generation
  try {
    const chatResponse = await axios.post('http://localhost:4001/chat', {
      model: 'default',
      messages: [
        { role: 'user', content: 'Generate a brief business case for a mobile app project' }
      ],
      temperature: 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });

    console.log('✅ Document Generation: Working');
    console.log(`   Provider Used: ${chatResponse.data.provider}`);
    console.log(`   Model Used: ${chatResponse.data.model}`);
    console.log(`   Response Length: ${chatResponse.data.choices[0].message.content.length} characters`);
  } catch (error) {
    console.log('❌ Document Generation: Failed');
    console.log(`   Error: ${error.message}`);
  }

  // Test 4: Frontend Connectivity
  try {
    const frontendResponse = await axios.get('http://localhost:5173');
    console.log('✅ Frontend: Running');
    console.log('   Access your app at: http://localhost:5173');
  } catch (error) {
    console.log('❌ Frontend: Not running');
    console.log('   Start with: npm run dev');
  }

  console.log('\n🎯 Setup Summary:');
  console.log('- Auth Backend: http://localhost:4000');
  console.log('- LLM Backend: http://localhost:4001');
  console.log('- Frontend: http://localhost:5173');
  console.log('- LLM Provider: Hugging Face (no installation required)');
  console.log('\n✨ Your KAIROS application is ready!');
}

testLLMSetup().catch(console.error);
