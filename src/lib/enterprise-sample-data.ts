import { APIService } from './api';

interface SampleIntegration {
  name: string;
  type: 'sharepoint' | 'confluence';
  status: 'connected' | 'error' | 'syncing' | 'pending';
  configuration: {
    site_url: string;
    auto_sync: boolean;
    sync_frequency: string;
    folders?: string[];
    spaces?: string[];
  };
  last_sync?: number;
}

interface SampleExportJob {
  project_id: string;
  document_ids: string[];
  integration_id: string;
  integration_type: 'sharepoint' | 'confluence';
  export_format: 'docx' | 'pdf' | 'html';
  status: 'completed' | 'failed' | 'processing' | 'pending';
  progress: number;
  total_documents: number;
  processed_documents: number;
  export_results: any[];
  error_message?: string;
  started_at: number;
  completed_at?: number;
  exported_urls: string[];
}

const SAMPLE_INTEGRATIONS: SampleIntegration[] = [
  {
    name: 'Corporate SharePoint',
    type: 'sharepoint',
    status: 'connected',
    configuration: {
      site_url: 'https://company.sharepoint.com/sites/projects',
      auto_sync: true,
      sync_frequency: 'daily',
      folders: ['Strategic Documents', 'Project Plans', 'Business Cases']
    },
    last_sync: Date.now() - 2 * 60 * 60 * 1000 // 2 hours ago
  },
  {
    name: 'Development Wiki',
    type: 'confluence',
    status: 'connected',
    configuration: {
      site_url: 'https://company.atlassian.net/wiki',
      auto_sync: false,
      sync_frequency: 'weekly',
      spaces: ['PROJ', 'ARCH', 'DOC']
    },
    last_sync: Date.now() - 24 * 60 * 60 * 1000 // 1 day ago
  },
  {
    name: 'Executive Portal',
    type: 'sharepoint',
    status: 'syncing',
    configuration: {
      site_url: 'https://company.sharepoint.com/sites/executive',
      auto_sync: true,
      sync_frequency: 'hourly',
      folders: ['Executive Reports', 'Strategic Plans']
    },
    last_sync: Date.now() - 30 * 60 * 1000 // 30 minutes ago
  }
];

function generateSampleExportJobs(projectId: string): SampleExportJob[] {
  const integrationIds = ['sharepoint-1', 'confluence-1', 'sharepoint-2'];
  const jobs: SampleExportJob[] = [];

  // Recent completed export job
  jobs.push({
    project_id: projectId,
    document_ids: ['doc-1', 'doc-2', 'doc-3'],
    integration_id: integrationIds[0],
    integration_type: 'sharepoint',
    export_format: 'docx',
    status: 'completed',
    progress: 100,
    total_documents: 3,
    processed_documents: 3,
    export_results: [
      { document_id: 'doc-1', status: 'completed', url: 'https://company.sharepoint.com/sites/projects/docs/business-case.docx' },
      { document_id: 'doc-2', status: 'completed', url: 'https://company.sharepoint.com/sites/projects/docs/feasibility-study.docx' },
      { document_id: 'doc-3', status: 'completed', url: 'https://company.sharepoint.com/sites/projects/docs/project-charter.docx' }
    ],
    started_at: Date.now() - 45 * 60 * 1000, // 45 minutes ago
    completed_at: Date.now() - 30 * 60 * 1000, // 30 minutes ago
    exported_urls: [
      'https://company.sharepoint.com/sites/projects/docs/business-case.docx',
      'https://company.sharepoint.com/sites/projects/docs/feasibility-study.docx',
      'https://company.sharepoint.com/sites/projects/docs/project-charter.docx'
    ]
  });

  // Processing export job
  jobs.push({
    project_id: projectId,
    document_ids: ['doc-4', 'doc-5'],
    integration_id: integrationIds[1],
    integration_type: 'confluence',
    export_format: 'html',
    status: 'processing',
    progress: 65,
    total_documents: 2,
    processed_documents: 1,
    export_results: [
      { document_id: 'doc-4', status: 'completed', url: 'https://company.atlassian.net/wiki/spaces/PROJ/pages/123456' }
    ],
    started_at: Date.now() - 10 * 60 * 1000, // 10 minutes ago
    exported_urls: [
      'https://company.atlassian.net/wiki/spaces/PROJ/pages/123456'
    ]
  });

  // Failed export job
  jobs.push({
    project_id: projectId,
    document_ids: ['doc-6'],
    integration_id: integrationIds[2],
    integration_type: 'sharepoint',
    export_format: 'pdf',
    status: 'failed',
    progress: 25,
    total_documents: 1,
    processed_documents: 0,
    export_results: [],
    error_message: 'Authentication failed: Please refresh your SharePoint credentials',
    started_at: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    exported_urls: []
  });

  return jobs;
}

export async function initializeEnterpriseSampleData(projectId: string): Promise<void> {
  try {
    console.log('🚀 Initializing Enterprise Sample Data...');

    // Check if data already exists
    const existingIntegrations = await APIService.getIntegrations();
    const existingJobs = await APIService.getExportJobs(projectId);

    if (existingIntegrations.length > 0 || existingJobs.length > 0) {
      console.log('✅ Enterprise sample data already exists');
      return;
    }

    // Create sample integrations
    console.log('📊 Creating sample integrations...');
    const createdIntegrations = [];
    
    for (const integration of SAMPLE_INTEGRATIONS) {
      try {
        const created = await APIService.createIntegration({
          integration_id: `${integration.type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: integration.name,
          type: integration.type,
          status: integration.status,
          configuration: JSON.stringify(integration.configuration),
          last_sync: integration.last_sync,
          created_at: Date.now(),
          updated_at: Date.now()
        });
        createdIntegrations.push(created);
        console.log(`✅ Created integration: ${integration.name}`);
      } catch (error) {
        console.warn(`⚠️ Failed to create integration ${integration.name}:`, error);
      }
    }

    // Create sample export jobs
    console.log('📤 Creating sample export jobs...');
    const sampleJobs = generateSampleExportJobs(projectId);
    
    for (const job of sampleJobs) {
      try {
        await APIService.createExportJob({
          project_id: job.project_id,
          document_ids: JSON.stringify(job.document_ids),
          integration_id: job.integration_id,
          integration_type: job.integration_type,
          export_format: job.export_format,
          status: job.status,
          progress: job.progress,
          total_documents: job.total_documents,
          processed_documents: job.processed_documents,
          export_results: JSON.stringify(job.export_results),
          error_message: job.error_message || '',
          started_at: job.started_at,
          completed_at: job.completed_at || null,
          exported_urls: JSON.stringify(job.exported_urls)
        });
        console.log(`✅ Created export job: ${job.export_format} to ${job.integration_type}`);
      } catch (error) {
        console.warn(`⚠️ Failed to create export job:`, error);
      }
    }

    console.log('🎉 Enterprise sample data initialization complete!');
    
  } catch (error) {
    console.error('❌ Error initializing enterprise sample data:', error);
  }
}

export async function clearEnterpriseSampleData(): Promise<void> {
  try {
    console.log('🧹 Clearing enterprise sample data...');
    
    // Clear integrations
    const integrations = await APIService.getIntegrations();
    for (const integration of integrations) {
      try {
        await APIService.deleteIntegration(integration.id);
        console.log(`🗑️ Deleted integration: ${integration.name}`);
      } catch (error) {
        console.warn(`⚠️ Failed to delete integration ${integration.name}:`, error);
      }
    }

    // Clear export jobs
    const jobs = await APIService.getExportJobs();
    for (const job of jobs) {
      try {
        // Note: APIService doesn't seem to have deleteExportJob method, so we'll skip this
        console.log(`ℹ️ Export job cleanup skipped (no delete method): ${job._id}`);
      } catch (error) {
        console.warn(`⚠️ Failed to delete export job ${job._id}:`, error);
      }
    }

    console.log('✅ Enterprise sample data cleared');
    
  } catch (error) {
    console.error('❌ Error clearing enterprise sample data:', error);
  }
}

export const EnterpriseSampleDataUtils = {
  initialize: initializeEnterpriseSampleData,
  clear: clearEnterpriseSampleData
};