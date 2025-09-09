// Test the unified AI service
const { unifiedAI } = require('./src/lib/unified-ai-service.ts');

const testProject = {
  _id: 'test-123',
  _uid: 'demo-user',
  _tid: 'projects',
  name: 'AI Test Project',
  industry: 'Technology',
  problem_statement: 'Testing AI generation functionality for the client demo',
  status: 'active',
  created_at: Date.now(),
  updated_at: Date.now()
};

async function testAIGeneration() {
  console.log('🧪 Testing AI Generation System');
  console.log('================================');
  
  try {
    console.log('\n1. Testing Roadmap Generation...');
    const roadmapResult = await unifiedAI.generateDocument('roadmap', testProject);
    console.log('✅ Roadmap:', roadmapResult.success ? 'SUCCESS' : 'FAILED');
    if (roadmapResult.content) {
      console.log('   Preview:', roadmapResult.content.substring(0, 100) + '...');
    }
    
    console.log('\n2. Testing Elevator Pitch Generation...');
    const pitchResult = await unifiedAI.generateDocument('elevator_pitch', testProject);
    console.log('✅ Elevator Pitch:', pitchResult.success ? 'SUCCESS' : 'FAILED');
    if (pitchResult.content) {
      console.log('   Preview:', pitchResult.content.substring(0, 100) + '...');
    }
    
    console.log('\n3. Testing Business Case Generation...');
    const businessResult = await unifiedAI.generateDocument('business_case', testProject);
    console.log('✅ Business Case:', businessResult.success ? 'SUCCESS' : 'FAILED');
    if (businessResult.content) {
      console.log('   Preview:', businessResult.content.substring(0, 100) + '...');
    }
    
    console.log('\n🎉 AI Generation System Test Complete!');
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAIGeneration().catch(console.error);
