#!/usr/bin/env node

/**
 * AI Analysis Features Migration Script
 * 
 * This script helps migrate AI analysis features from DevvAI to open-source LLMs.
 * It focuses on document analysis, content intelligence, and stakeholder optimization.
 */

import { migrateAIAnalysisFeatures, validateModelCompatibility } from '../src/utils/ai-analysis-migration.js';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

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

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   KAIROS - Enhanced AI Analysis Migration Tool       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
  
  console.log('This tool will migrate AI analysis features from DevvAI to open-source LLMs.');
  console.log('The migration will update document analysis, content intelligence, and stakeholder optimization features.');
  console.log('');
  
  const projectDir = path.resolve(process.cwd());
  console.log(`Project directory: ${projectDir}`);
  console.log('');
  
  // Check if enhanced-ai-analysis.ts exists
  const analysisFilePath = path.join(projectDir, 'src/lib/enhanced-ai-analysis.ts');
  if (!fs.existsSync(analysisFilePath)) {
    console.error(`Error: Could not find enhanced-ai-analysis.ts in ${path.join(projectDir, 'src/lib')}`);
    console.log('Make sure you are running this script from the root of your KAIROS project.');
    rl.close();
    return;
  }
  
  console.log('Found enhanced-ai-analysis.ts');
  
  // Configuration options
  console.log('\nMigration options:');
  
  const backupFiles = await askQuestion('Create backup of original files? (Y/n): ');
  const preserveData = await askQuestion('Preserve training data and examples? (Y/n): ');
  const migratePrompts = await askQuestion('Migrate custom system prompts? (Y/n): ');
  const regenerateExamples = await askQuestion('Regenerate example outputs? (n/Y): ');
  
  const options = {
    backupOriginalFiles: backupFiles.toLowerCase() !== 'n',
    preserveTrainingData: preserveData.toLowerCase() !== 'n',
    migrateCustomPrompts: migratePrompts.toLowerCase() !== 'n',
    regenerateExamples: regenerateExamples.toLowerCase() === 'y',
    backupDir: path.join(projectDir, 'backup/ai-analysis'),
    verbose: true
  };
  
  console.log('\nMigration configuration:');
  for (const [key, value] of Object.entries(options)) {
    console.log(`- ${key}: ${value}`);
  }
  
  const proceed = await askQuestion('\nProceed with migration? (Y/n): ');
  if (proceed.toLowerCase() === 'n') {
    console.log('Migration cancelled.');
    rl.close();
    return;
  }
  
  console.log('\nStarting AI analysis features migration...');
  
  try {
    // Step 1: Test model compatibility
    console.log('\n===== STEP 1: TESTING MODEL COMPATIBILITY =====');
    
    const compatibilityResults = await Promise.all([
      validateModelCompatibility('analysis', 'kimi-k2', 'llama3'),
      validateModelCompatibility('intelligence', 'claude-3-opus', 'mistral'),
      validateModelCompatibility('optimization', 'gpt-4', 'llama3')
    ]);
    
    const allCompatible = compatibilityResults.every(result => result);
    
    if (allCompatible) {
      console.log('✅ All models compatible with required tasks');
    } else {
      console.warn('⚠️ Some models may not be fully compatible. Migration will proceed but may require adjustments.');
      
      if (!compatibilityResults[0]) {
        console.warn('⚠️ Document analysis compatibility issues detected');
      }
      if (!compatibilityResults[1]) {
        console.warn('⚠️ Content intelligence compatibility issues detected');
      }
      if (!compatibilityResults[2]) {
        console.warn('⚠️ Stakeholder optimization compatibility issues detected');
      }
      
      const forceContinue = await askQuestion('Continue despite compatibility issues? (y/N): ');
      if (forceContinue.toLowerCase() !== 'y') {
        console.log('Migration cancelled.');
        rl.close();
        return;
      }
    }
    
    // Step 2: Run migration
    console.log('\n===== STEP 2: RUNNING MIGRATION =====');
    const success = await migrateAIAnalysisFeatures(options);
    
    if (success) {
      console.log('\n✅ AI analysis features migration completed successfully!');
    } else {
      console.error('\n❌ AI analysis features migration completed with errors');
      console.log('See above for details on specific failures.');
    }
    
    // Step 3: Validation
    console.log('\n===== STEP 3: VALIDATION =====');
    console.log('Checking for any remaining DevvAI references...');
    
    // Look for any remaining DevvAI references
    const analysisContent = fs.readFileSync(analysisFilePath, 'utf-8');
    const devvReferences = [
      'DevvAI',
      'devvai',
      '@devvai',
      'kimi-k2',
      'claude-3-opus',
      'google/gemini'
    ];
    
    const remainingReferences = devvReferences.filter(ref => analysisContent.includes(ref));
    
    if (remainingReferences.length > 0) {
      console.warn('⚠️ Found remaining DevvAI references:');
      for (const ref of remainingReferences) {
        console.warn(`  - ${ref}`);
      }
      console.warn('You may need to manually update these references.');
    } else {
      console.log('✅ No remaining DevvAI references found');
    }
    
    console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   AI Analysis Features Migration Complete            ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
    `);
    
    console.log('Next steps:');
    console.log('1. Review the enhanced-ai-analysis.ts file for any manual adjustments needed');
    console.log('2. Test the AI analysis features with your application');
    console.log('3. Check the migration logs for any warnings or errors');
    
    if (options.backupOriginalFiles) {
      console.log(`\nBackup files are available at: ${options.backupDir}`);
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed with error:', error);
  } finally {
    rl.close();
  }
}

main();
