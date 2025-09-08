#!/usr/bin/env node

/**
 * Migration Script: DevvAI to Open-Source LLMs
 *
 * This script helps transition from DevvAI dependencies to open-source LLM alternatives.
 * Usage: npm run migrate:devvai
 */

import path from 'path';
import { createMigration } from '../src/utils/create-new-migration.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the project root directory
const projectRoot = path.resolve(process.cwd());

console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║        KAIROS - DevvAI to Open-Source LLMs           ║
║                 Migration Tool                       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
`);

console.log('This tool will help you migrate from DevvAI to open-source LLM alternatives.');
console.log('Project directory:', projectRoot);
console.log('');

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function runMigration() {
  try {
    // Ask for configuration options
    const createBackup = await askQuestion('Create a backup before migration? (Y/n): ') !== 'n';
    const installDeps = await askQuestion('Install new dependencies? (Y/n): ') !== 'n';
    const updateEnv = await askQuestion('Update environment variables? (Y/n): ') !== 'n';
    const removeDevvDeps = await askQuestion('Remove DevvAI dependencies from package.json? (Y/n): ') !== 'n';
    
    console.log('\nMigration configuration:');
    console.log(`- Create backup: ${createBackup ? 'Yes' : 'No'}`);
    console.log(`- Install new dependencies: ${installDeps ? 'Yes' : 'No'}`);
    console.log(`- Update environment variables: ${updateEnv ? 'Yes' : 'No'}`);
    console.log(`- Remove DevvAI dependencies: ${removeDevvDeps ? 'Yes' : 'No'}`);
    
    const confirm = await askQuestion('\nProceed with migration? (Y/n): ');
    
    if (confirm === 'n') {
      console.log('Migration cancelled.');
      rl.close();
      return;
    }
    
    // Create and run migration
    const migration = createMigration({
      sourceDir: projectRoot,
      createBackup,
      installDependencies: installDeps,
      updateEnvironment: updateEnv,
      migrateConfigs: true,
      removeDevvDependencies: removeDevvDeps,
    });
    
    console.log('\nStarting migration process...');
    await migration.migrate();
    
    console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║        Migration completed successfully!             ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
    `);
    
    console.log('Next steps:');
    console.log('1. Review the migrated code for any issues');
    console.log('2. Start a local LLM server (see docs/open-source-migration.md)');
    console.log('3. Update environment variables in .env if needed');
    console.log('4. Run your application to verify everything works');
    
    rl.close();
  } catch (error) {
    console.error('\nMigration failed:', error);
    console.log('\nPlease check the error message and try again.');
    rl.close();
    process.exit(1);
  }
}

runMigration();
