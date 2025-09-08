/**
 * DevvAI to Open-Source LLM Migration Utility
 * 
 * This utility helps migrate from DevvAI dependencies to open-source LLM alternatives.
 * It provides data migration, configuration setup, and API compatibility layers.
 */
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Models mapping from DevvAI to open-source alternatives
const MODEL_MAPPINGS = {
  'kimi-k2-0711-preview': 'llama3-70b',
  'google/gemini-2.5-flash-image': 'stable-diffusion-3',
  'google/gemini-1.5-pro': 'gemma-7b-it',
  'meta/llama-3-8b': 'llama3-8b',
  'mistral-medium': 'mistral-7b-instruct',
  'claude-3-opus': 'falcon-40b',
};

// Configuration for different API endpoints
const API_ENDPOINTS = {
  textGeneration: 'http://localhost:8000/v1/chat/completions',
  imageGeneration: 'http://localhost:8000/v1/images/generations',
  embeddings: 'http://localhost:8000/v1/embeddings',
  moderation: 'http://localhost:8000/v1/moderations',
};

// Migration options interface
export interface MigrationOptions {
  sourceDir: string;
  backupDir?: string;
  createBackup: boolean;
  installDependencies: boolean;
  updateEnvironment: boolean;
  migrateConfigs: boolean;
  removeDevvDependencies: boolean;
}

export class OpenSourceMigration {
  private options: MigrationOptions;
  private backupCreated: boolean = false;
  
  constructor(options: MigrationOptions) {
    this.options = {
      backupDir: path.join(options.sourceDir, 'backup-devvai'),
      ...options,
    };
  }
  
  /**
   * Run the complete migration process
   */
  public async migrate(): Promise<void> {
    console.log('Starting migration from DevvAI to open-source LLMs...');
    
    try {
      // Create backup if requested
      if (this.options.createBackup) {
        await this.createBackup();
      }
      
      // Update source code references
      await this.updateSourceCodeReferences();
      
      // Update package.json
      if (this.options.removeDevvDependencies) {
        await this.updatePackageJson();
      }
      
      // Update environment variables
      if (this.options.updateEnvironment) {
        await this.updateEnvironmentVariables();
      }
      
      // Install new dependencies
      if (this.options.installDependencies) {
        await this.installNewDependencies();
      }
      
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      
      // Restore from backup if available and migration failed
      if (this.backupCreated) {
        console.log('Attempting to restore from backup...');
        await this.restoreFromBackup();
      }
      
      throw new Error(`Migration failed: ${error}`);
    }
  }
  
  /**
   * Create a backup of the project
   */
  private async createBackup(): Promise<void> {
    const { sourceDir, backupDir } = this.options;
    
    console.log(`Creating backup at ${backupDir}...`);
    
    // Ensure the backup directory exists
    if (!fs.existsSync(backupDir!)) {
      fs.mkdirSync(backupDir!, { recursive: true });
    }
    
    // Copy all files except node_modules and .git
    const copyCommands = [
      `cp -R ${sourceDir}/* ${backupDir}`,
      `rm -rf ${backupDir}/node_modules`,
      `rm -rf ${backupDir}/.git`,
    ];
    
    for (const cmd of copyCommands) {
      await execAsync(cmd);
    }
    
    this.backupCreated = true;
    console.log('Backup created successfully.');
  }
  
  /**
   * Update source code references from DevvAI to open-source alternatives
   */
  private async updateSourceCodeReferences(): Promise<void> {
    console.log('Updating source code references...');
    
    const { sourceDir } = this.options;
    const filesToProcess = await this.findFilesWithDevvReferences(sourceDir);
    
    for (const file of filesToProcess) {
      await this.processFile(file);
    }
    
    console.log(`Updated ${filesToProcess.length} files with DevvAI references.`);
  }
  
  /**
   * Find files with DevvAI references
   */
  private async findFilesWithDevvReferences(dir: string): Promise<string[]> {
    const result: string[] = [];
    
    // Find files with DevvAI references using grep
    try {
      const { stdout } = await execAsync(
        `grep -r --include="*.{ts,js,tsx,jsx}" "@devvai\|DevvAI\|devvai\|kimi-\|google/gemini" ${dir} | grep -v "node_modules" | grep -v "backup-devvai" | cut -d':' -f1`
      );
      
      if (stdout) {
        result.push(...stdout.split('\n').filter(Boolean));
      }
    } catch (error) {
      // grep returns non-zero exit code if no matches found
      if ((error as any).code !== 1) {
        throw error;
      }
    }
    
    return [...new Set(result)]; // Remove duplicates
  }
  
  /**
   * Process a single file to update DevvAI references
   */
  private async processFile(filePath: string): Promise<void> {
    console.log(`Processing file: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import statements
    content = content.replace(
      /import\s+.*\s+from\s+['"]@devvai\/.*['"]/g,
      (match) => `// Migrated: ${match}\n// Now using open-source LLM alternatives`
    );
    
    // Replace model references
    for (const [devvModel, openSourceModel] of Object.entries(MODEL_MAPPINGS)) {
      const regex = new RegExp(`['"]${devvModel}['"]`, 'g');
      content = content.replace(regex, `'${openSourceModel}'`);
    }
    
    // Replace API endpoint references
    content = content.replace(
      /https:\/\/api\.devv\.ai\/v1\/(chat\/completions|images\/generations|embeddings|moderations)/g,
      (match, endpoint) => API_ENDPOINTS[endpoint as keyof typeof API_ENDPOINTS] || match
    );
    
    // Replace DevvAI class references
    content = content.replace(
      /new DevvAI\(.*\)/g,
      'new OpenSourceLLM()'
    );
    
    // Replace DevvTable references
    content = content.replace(
      /new DevvTable\(.*\)/g,
      'new LocalTable()'
    );
    
    // Write updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  /**
   * Update package.json to remove DevvAI dependencies and add open-source alternatives
   */
  private async updatePackageJson(): Promise<void> {
    console.log('Updating package.json...');
    
    const packageJsonPath = path.join(this.options.sourceDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.warn('package.json not found, skipping package.json update');
      return;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Remove DevvAI dependencies
    if (packageJson.dependencies) {
      for (const dep of Object.keys(packageJson.dependencies)) {
        if (dep.includes('@devvai') || dep.includes('devv-')) {
          delete packageJson.dependencies[dep];
        }
      }
    }
    
    // Add open-source alternatives
    const newDependencies = {
      'langchain': '^0.1.0',
      'openai': '^4.20.0',
      'llama-node': '^0.1.6',
      'mistral-client': '^1.0.0',
      'replicate-api': '^0.4.0',
    };
    
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...newDependencies,
    };
    
    // Add migration script
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts['migrate:devvai'] = 'node scripts/migrate-to-open-source.js';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log('package.json updated successfully.');
  }
  
  /**
   * Update environment variables
   */
  private async updateEnvironmentVariables(): Promise<void> {
    console.log('Updating environment variables...');
    
    const envPath = path.join(this.options.sourceDir, '.env');
    const envExamplePath = path.join(this.options.sourceDir, '.env.example');
    
    // Create .env.example with new variables
    const envExampleContent = `# Open-Source LLM Configuration
OPENAI_API_BASE_URL=http://localhost:8000/v1
OPENAI_API_KEY=sk-local-key
LLAMA_MODEL_PATH=/path/to/llama/model
MISTRAL_API_KEY=your-mistral-key
REPLICATE_API_TOKEN=your-replicate-token

# Legacy DevvAI keys (no longer used)
# DEVVAI_API_KEY=your-old-api-key
`;
    
    fs.writeFileSync(envExamplePath, envExampleContent, 'utf8');
    
    // Update .env if it exists
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Add new variables if they don't exist
      if (!envContent.includes('OPENAI_API_BASE_URL')) {
        envContent += '\n# Added by migration script\nOPENAI_API_BASE_URL=http://localhost:8000/v1\n';
      }
      
      if (!envContent.includes('OPENAI_API_KEY')) {
        envContent += 'OPENAI_API_KEY=sk-local-key\n';
      }
      
      // Comment out DevvAI variables
      envContent = envContent.replace(
        /^(DEVVAI_API_KEY=.*)$/gm,
        '# $1 # Commented by migration script'
      );
      
      fs.writeFileSync(envPath, envContent, 'utf8');
    } else {
      // Create new .env file
      fs.copyFileSync(envExamplePath, envPath);
    }
    
    console.log('Environment variables updated successfully.');
  }
  
  /**
   * Install new dependencies
   */
  private async installNewDependencies(): Promise<void> {
    console.log('Installing new dependencies...');
    
    try {
      await execAsync('npm install langchain openai llama-node mistral-client replicate-api', {
        cwd: this.options.sourceDir,
      });
      
      console.log('Dependencies installed successfully.');
    } catch (error) {
      console.error('Failed to install dependencies:', error);
      throw new Error('Dependency installation failed');
    }
  }
  
  /**
   * Restore from backup if migration fails
   */
  private async restoreFromBackup(): Promise<void> {
    if (!this.backupCreated) {
      console.log('No backup available for restoration.');
      return;
    }
    
    const { sourceDir, backupDir } = this.options;
    
    console.log(`Restoring from backup at ${backupDir}...`);
    
    try {
      // Preserve node_modules and .git
      await execAsync(`mv ${sourceDir}/node_modules ${sourceDir}/_node_modules_temp || true`);
      await execAsync(`mv ${sourceDir}/.git ${sourceDir}/_git_temp || true`);
      
      // Clear the source directory except for temp folders and backup
      await execAsync(`find ${sourceDir} -mindepth 1 -maxdepth 1 -not -name "_node_modules_temp" -not -name "_git_temp" -not -name "backup-devvai" -exec rm -rf {} \\;`);
      
      // Copy back from backup
      await execAsync(`cp -R ${backupDir}/* ${sourceDir}`);
      
      // Restore preserved folders
      await execAsync(`mv ${sourceDir}/_node_modules_temp ${sourceDir}/node_modules || true`);
      await execAsync(`mv ${sourceDir}/_git_temp ${sourceDir}/.git || true`);
      
      console.log('Restoration completed successfully.');
    } catch (error) {
      console.error('Restoration failed:', error);
    }
  }
}

/**
 * Create a new migration instance
 */
export function createMigration(options: MigrationOptions): OpenSourceMigration {
  return new OpenSourceMigration(options);
}

/**
 * Run migration with default options
 */
export async function runDefaultMigration(sourceDir: string): Promise<void> {
  const migration = createMigration({
    sourceDir,
    createBackup: true,
    installDependencies: true,
    updateEnvironment: true,
    migrateConfigs: true,
    removeDevvDependencies: true,
  });
  
  await migration.migrate();
}

export default {
  createMigration,
  runDefaultMigration,
  OpenSourceMigration,
};
