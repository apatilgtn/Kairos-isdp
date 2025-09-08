#!/usr/bin/env node

/**
 * Complete Migration Script
 * 
 * This script orchestrates the full migration from DevvAI to open-source LLMs,
 * including code updates, data migration, and environment setup.
 */

import readline from 'readline';
import { runDefaultMigration } from '../src/utils/create-new-migration.js';
import { runDefaultMigration as runDataMigration } from '../src/utils/data-migration.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

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

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║        KAIROS - Complete Migration Utility           ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
  
  console.log('This utility will migrate your KAIROS installation from DevvAI to open-source LLMs.');
  console.log('The migration process involves several steps:');
  console.log('1. Code migration - Update code references from DevvAI to open-source');
  console.log('2. Data migration - Migrate data and configurations');
  console.log('3. Environment setup - Configure local LLM environment');
  console.log('4. Testing - Verify the migration was successful');
  console.log('');
  
  const sourceDir = path.resolve(process.cwd());
  console.log(`Project directory: ${sourceDir}`);
  
  const proceed = await askQuestion('\nContinue with migration? (Y/n): ');
  if (proceed.toLowerCase() === 'n') {
    console.log('Migration cancelled.');
    rl.close();
    return;
  }
  
  try {
    // Step 1: Code migration
    console.log('\n===== STEP 1: CODE MIGRATION =====');
    console.log('Updating code references from DevvAI to open-source LLMs...');
    
    await runDefaultMigration(sourceDir);
    console.log('✅ Code migration completed successfully!');
    
    // Step 2: Data migration
    console.log('\n===== STEP 2: DATA MIGRATION =====');
    console.log('Migrating data and configurations...');
    
    await runDataMigration(sourceDir);
    console.log('✅ Data migration completed successfully!');
    
    // Step 3: Environment setup
    console.log('\n===== STEP 3: ENVIRONMENT SETUP =====');
    console.log('Setting up local LLM environment...');
    
    const setupEnv = await askQuestion('Set up local LLM environment now? (Y/n): ');
    if (setupEnv.toLowerCase() !== 'n') {
      console.log('Running setup-local-llm.js...');
      await execAsync('node scripts/setup-local-llm.js');
    } else {
      console.log('Skipping environment setup. You can run it later with: npm run setup:local-llm');
    }
    
    // Step 4: Testing
    console.log('\n===== STEP 4: TESTING =====');
    
    const runTests = await askQuestion('Run migration tests now? (Y/n): ');
    if (runTests.toLowerCase() !== 'n') {
      console.log('Running test-migration.js...');
      await execAsync('node scripts/test-migration.js');
    } else {
      console.log('Skipping tests. You can run them later with: npm run test:migration');
    }
    
    console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║        Migration completed successfully!             ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
    `);
    
    console.log('Next steps:');
    console.log('1. Start the LLM server: npm run start:llm-server');
    console.log('2. Start your application: npm run dev');
    console.log('3. Review the migration documentation: docs/open-source-migration.md');
    console.log('\nEnjoy using KAIROS with open-source LLMs!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.log('\nPlease check the error message and try again or migrate manually.');
  } finally {
    rl.close();
  }
}

main();
