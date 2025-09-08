/**
 * Data Migration Utility for LLM Services
 * This utility helps migrate data and models from DevvAI to open-source LLMs
 */

import fs from 'fs';
import path from 'path';

// Interface for a migration task
interface MigrationTask {
  name: string;
  description: string;
  migrate: () => Promise<boolean>;
  verify: () => Promise<boolean>;
}

// Configuration for the migration
export interface MigrationConfig {
  sourceDir: string;
  modelsDir: string;
  backupDir: string;
  preserveData: boolean;
}

/**
 * Migrates data, models, and configurations from DevvAI to open-source LLMs
 */
export class DataMigration {
  private config: MigrationConfig;
  private tasks: MigrationTask[] = [];
  
  constructor(config: MigrationConfig) {
    this.config = {
      backupDir: path.join(config.sourceDir, 'backup'),
      ...config
    };
    
    // Define migration tasks
    this.tasks = [
      {
        name: 'backup',
        description: 'Backing up existing data',
        migrate: () => this.backupData(),
        verify: () => this.verifyBackup()
      },
      {
        name: 'models',
        description: 'Migrating model references',
        migrate: () => this.migrateModels(),
        verify: () => this.verifyModels()
      },
      {
        name: 'datasets',
        description: 'Migrating datasets and training data',
        migrate: () => this.migrateDatasets(),
        verify: () => this.verifyDatasets()
      },
      {
        name: 'prompts',
        description: 'Migrating saved prompts',
        migrate: () => this.migratePrompts(),
        verify: () => this.verifyPrompts()
      },
      {
        name: 'configuration',
        description: 'Migrating configurations',
        migrate: () => this.migrateConfigurations(),
        verify: () => this.verifyConfigurations()
      }
    ];
  }
  
  /**
   * Run all migration tasks
   */
  async runAll(): Promise<boolean> {
    console.log('Starting migration process...');
    
    let success = true;
    
    for (const task of this.tasks) {
      success = success && await this.runTask(task);
      
      if (!success) {
        console.error(`Migration failed at task: ${task.name}`);
        return false;
      }
    }
    
    console.log('Migration completed successfully!');
    return true;
  }
  
  /**
   * Run a specific migration task
   */
  async runTask(task: MigrationTask): Promise<boolean> {
    console.log(`Starting task: ${task.name} - ${task.description}`);
    
    try {
      const success = await task.migrate();
      
      if (success) {
        const verified = await task.verify();
        
        if (verified) {
          console.log(`✅ Task ${task.name} completed and verified successfully.`);
          return true;
        } else {
          console.error(`❌ Task ${task.name} completed but verification failed.`);
          return false;
        }
      } else {
        console.error(`❌ Task ${task.name} failed to complete.`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error in task ${task.name}:`, error);
      return false;
    }
  }
  
  /**
   * Backup existing data
   */
  private async backupData(): Promise<boolean> {
    try {
      console.log(`Creating backup in ${this.config.backupDir}...`);
      
      // Create backup directory if it doesn't exist
      if (!fs.existsSync(this.config.backupDir)) {
        fs.mkdirSync(this.config.backupDir, { recursive: true });
      }
      
      // Create directories for each type of data
      const modelBackupDir = path.join(this.config.backupDir, 'models');
      const datasetBackupDir = path.join(this.config.backupDir, 'datasets');
      const promptBackupDir = path.join(this.config.backupDir, 'prompts');
      const configBackupDir = path.join(this.config.backupDir, 'config');
      
      fs.mkdirSync(modelBackupDir, { recursive: true });
      fs.mkdirSync(datasetBackupDir, { recursive: true });
      fs.mkdirSync(promptBackupDir, { recursive: true });
      fs.mkdirSync(configBackupDir, { recursive: true });
      
      // Copy model data
      if (fs.existsSync(this.config.modelsDir)) {
        this.copyDirectory(this.config.modelsDir, modelBackupDir);
      }
      
      // Copy configuration files
      const configFiles = [
        path.join(this.config.sourceDir, '.env'),
        path.join(this.config.sourceDir, 'src', 'lib', 'enhanced-ai.ts'),
        path.join(this.config.sourceDir, 'src', 'lib', 'enhanced-ai-analysis.ts'),
        path.join(this.config.sourceDir, 'src', 'services', 'ai-diagram-service.ts'),
      ];
      
      for (const configFile of configFiles) {
        if (fs.existsSync(configFile)) {
          const destFile = path.join(
            configBackupDir, 
            path.basename(configFile)
          );
          fs.copyFileSync(configFile, destFile);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Backup failed:', error);
      return false;
    }
  }
  
  /**
   * Verify backup was created successfully
   */
  private async verifyBackup(): Promise<boolean> {
    return fs.existsSync(this.config.backupDir);
  }
  
  /**
   * Migrate model references
   */
  private async migrateModels(): Promise<boolean> {
    try {
      // Map of DevvAI models to open-source alternatives
      const modelMappings = {
        'kimi-k2-0711-preview': 'llama3-70b',
        'kimi-k2': 'llama3-70b',
        'google/gemini-2.5-flash-image': 'stable-diffusion-3',
        'google/gemini-1.5-pro': 'gemma-7b-it',
        'meta/llama-3-8b': 'llama3-8b',
        'mistral-medium': 'mistral-7b-instruct',
        'claude-3-opus': 'falcon-40b'
      };
      
      // Find and update model references in source files
      const sourceDir = path.join(this.config.sourceDir, 'src');
      const filesToUpdate = this.findFilesWithModelReferences(sourceDir);
      
      for (const file of filesToUpdate) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Replace model references
        for (const [devvModel, openSourceModel] of Object.entries(modelMappings)) {
          const regex = new RegExp(`['"]${devvModel}['"]`, 'g');
          content = content.replace(regex, `'${openSourceModel}'`);
        }
        
        fs.writeFileSync(file, content, 'utf8');
      }
      
      console.log(`Updated model references in ${filesToUpdate.length} files.`);
      return true;
    } catch (error) {
      console.error('Model migration failed:', error);
      return false;
    }
  }
  
  /**
   * Verify model migration
   */
  private async verifyModels(): Promise<boolean> {
    // Check for a few key files that should have been updated
    const filesToCheck = [
      path.join(this.config.sourceDir, 'src', 'services', 'ai-diagram-service.ts'),
      path.join(this.config.sourceDir, 'src', 'lib', 'enhanced-ai.ts')
    ];
    
    for (const file of filesToCheck) {
      if (!fs.existsSync(file)) {
        return false;
      }
      
      const content = fs.readFileSync(file, 'utf8');
      
      // Check if any DevvAI model references remain
      if (content.includes('kimi-k2') || content.includes('google/gemini')) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Migrate datasets and training data
   */
  private async migrateDatasets(): Promise<boolean> {
    // No actual dataset migration needed for this project
    return true;
  }
  
  /**
   * Verify dataset migration
   */
  private async verifyDatasets(): Promise<boolean> {
    return true;
  }
  
  /**
   * Migrate saved prompts
   */
  private async migratePrompts(): Promise<boolean> {
    try {
      // Migrate system prompts if present
      const systemPromptsFile = path.join(this.config.sourceDir, 'src', 'lib', 'system-prompt.ts');
      
      if (fs.existsSync(systemPromptsFile)) {
        let content = fs.readFileSync(systemPromptsFile, 'utf8');
        
        // Update import statements
        content = content.replace(
          /import.*from ['"]@devvai\/devv-code-backend['"]/g,
          '// Migrated to open-source LLMs'
        );
        
        fs.writeFileSync(systemPromptsFile, content, 'utf8');
      }
      
      return true;
    } catch (error) {
      console.error('Prompt migration failed:', error);
      return false;
    }
  }
  
  /**
   * Verify prompt migration
   */
  private async verifyPrompts(): Promise<boolean> {
    // Check if system prompts file exists and has been updated
    const systemPromptsFile = path.join(this.config.sourceDir, 'src', 'lib', 'system-prompt.ts');
    
    if (fs.existsSync(systemPromptsFile)) {
      const content = fs.readFileSync(systemPromptsFile, 'utf8');
      
      // Check if DevvAI imports have been removed
      if (content.includes('import') && content.includes('@devvai/devv-code-backend')) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Migrate configurations
   */
  private async migrateConfigurations(): Promise<boolean> {
    try {
      // Update .env file
      const envFile = path.join(this.config.sourceDir, '.env');
      
      if (fs.existsSync(envFile)) {
        let content = fs.readFileSync(envFile, 'utf8');
        
        // Comment out DevvAI API keys
        content = content.replace(
          /^(DEVVAI_API_KEY=.*)/gm,
          '# $1 # Migrated to open-source LLMs'
        );
        
        // Add new configuration variables
        if (!content.includes('OPENAI_API_BASE_URL')) {
          content += '\n# Open-source LLM Configuration\n';
          content += 'OPENAI_API_BASE_URL=http://localhost:11434/v1\n';
          content += 'OPENAI_API_KEY=ollama\n';
        }
        
        fs.writeFileSync(envFile, content, 'utf8');
      } else {
        // Create a new .env file
        const newEnvContent = `# Open-source LLM Configuration
OPENAI_API_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=ollama

# Local server configuration
LOCAL_LLM_SERVER=http://localhost:4001
`;
        
        fs.writeFileSync(envFile, newEnvContent, 'utf8');
      }
      
      return true;
    } catch (error) {
      console.error('Configuration migration failed:', error);
      return false;
    }
  }
  
  /**
   * Verify configuration migration
   */
  private async verifyConfigurations(): Promise<boolean> {
    const envFile = path.join(this.config.sourceDir, '.env');
    
    if (!fs.existsSync(envFile)) {
      return false;
    }
    
    const content = fs.readFileSync(envFile, 'utf8');
    
    // Check if new configuration variables have been added
    if (!content.includes('OPENAI_API_BASE_URL') || !content.includes('OPENAI_API_KEY')) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Find files with model references
   */
  private findFilesWithModelReferences(directory: string): string[] {
    const result: string[] = [];
    
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively check subdirectories, but skip node_modules
        if (file !== 'node_modules') {
          result.push(...this.findFilesWithModelReferences(filePath));
        }
      } else if (stat.isFile() && 
                (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.tsx'))) {
        
        // Check if file contains model references
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('kimi-k2') || 
            content.includes('google/gemini') ||
            content.includes('mistral-medium') ||
            content.includes('claude-3')) {
          
          result.push(filePath);
        }
      }
    }
    
    return result;
  }
  
  /**
   * Utility to copy a directory recursively
   */
  private copyDirectory(source: string, destination: string) {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    // Read source directory
    const files = fs.readdirSync(source);
    
    // Copy each file/directory
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const destPath = path.join(destination, file);
      
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        // Recursively copy subdirectory
        this.copyDirectory(sourcePath, destPath);
      } else {
        // Copy file
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }
}

/**
 * Create a new data migration instance
 */
export function createDataMigration(config: MigrationConfig): DataMigration {
  return new DataMigration(config);
}

/**
 * Run migration with default settings
 */
export async function runDefaultMigration(sourceDir: string): Promise<boolean> {
  const migration = createDataMigration({
    sourceDir,
    modelsDir: path.join(sourceDir, 'models'),
    backupDir: path.join(sourceDir, 'backup'),
    preserveData: true
  });
  
  return migration.runAll();
}

export default {
  createDataMigration,
  runDefaultMigration,
  DataMigration
};
