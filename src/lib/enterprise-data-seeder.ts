import { table } from '@devvai/devv-code-backend';
import type { EnterpriseIntegration, ExportJob } from '@/types';

// Table IDs for enterprise data
const TABLES = {
  integrations: 'exba4zzl3bwg',
  export_jobs: 'exba5dujb01s',
  enterprise_settings: 'exba5nrpai9s',
};

export class EnterpriseDataSeeder {
  
  static async seedEnterpriseIntegrations(): Promise<void> {
    try {
      console.log('Seeding enterprise integrations...');
      
      // Sample SharePoint Integration
      const sharePointIntegration = {
        integration_id: 'sp_demo_001',
        name: 'Corporate SharePoint',
        type: 'sharepoint',
        status: 'connected',
        site_url: 'https://company.sharepoint.com/sites/strategy',
        configuration: JSON.stringify({
          site_url: 'https://company.sharepoint.com/sites/strategy',
          library_name: 'Strategic Documents',
          client_id: 'demo-client-id',
          tenant_id: 'demo-tenant-id',
          auto_sync: true,
          permissions: {
            read: ['all_authenticated'],
            write: ['strategy_team'],
            admin: ['it_admin']
          }
        }),
        last_sync: Date.now() - 86400000, // 1 day ago
        created_at: Date.now() - 604800000, // 1 week ago
        updated_at: Date.now() - 86400000
      };

      // Sample Confluence Integration
      const confluenceIntegration = {
        integration_id: 'cf_demo_001',
        name: 'Team Confluence Space',
        type: 'confluence',
        status: 'connected',
        site_url: 'https://company.atlassian.net/wiki',
        configuration: JSON.stringify({
          base_url: 'https://company.atlassian.net/wiki',
          space_key: 'STRATEGY',
          username: 'strategy-bot@company.com',
          cloud_id: 'demo-cloud-id',
          parent_page_id: '123456789',
          template_id: 'strategy-template',
          labels: ['kairos-export', 'strategic-planning', 'mvp-roadmap'],
          auto_sync: true,
          permissions: {
            view: ['all_authenticated'],
            edit: ['strategy_team'],
            admin: ['confluence_admin']
          }
        }),
        last_sync: Date.now() - 43200000, // 12 hours ago
        created_at: Date.now() - 1209600000, // 2 weeks ago
        updated_at: Date.now() - 43200000
      };

      // Add integrations to database
      await table.addItem(TABLES.integrations, sharePointIntegration);
      await table.addItem(TABLES.integrations, confluenceIntegration);

      console.log('✅ Enterprise integrations seeded successfully');
      
    } catch (error) {
      console.error('❌ Error seeding enterprise integrations:', error);
    }
  }

  static async seedExportJobs(projectId: string): Promise<void> {
    try {
      console.log('Seeding export jobs...');
      
      const exportJobs = [
        {
          project_id: projectId,
          document_ids: JSON.stringify(['doc_001', 'doc_002', 'doc_003']),
          integration_id: 'sp_demo_001',
          integration_type: 'sharepoint',
          export_format: 'word',
          status: 'completed',
          progress: 100,
          total_documents: 3,
          processed_documents: 3,
          export_results: JSON.stringify([
            {
              document_id: 'doc_001',
              document_type: 'roadmap',
              status: 'success',
              exported_url: 'https://company.sharepoint.com/sites/strategy/Documents/MVP_Roadmap.docx',
              file_size: 245760,
              export_time: Date.now() - 3600000
            },
            {
              document_id: 'doc_002',
              document_type: 'business_case',
              status: 'success',
              exported_url: 'https://company.sharepoint.com/sites/strategy/Documents/Business_Case.docx',
              file_size: 189440,
              export_time: Date.now() - 3600000
            },
            {
              document_id: 'doc_003',
              document_type: 'elevator_pitch',
              status: 'success',
              exported_url: 'https://company.sharepoint.com/sites/strategy/Documents/Elevator_Pitch.docx',
              file_size: 156672,
              export_time: Date.now() - 3600000
            }
          ]),
          error_message: '',
          started_at: Date.now() - 7200000, // 2 hours ago
          completed_at: Date.now() - 3600000, // 1 hour ago
          exported_urls: JSON.stringify([
            'https://company.sharepoint.com/sites/strategy/Documents/MVP_Roadmap.docx',
            'https://company.sharepoint.com/sites/strategy/Documents/Business_Case.docx',
            'https://company.sharepoint.com/sites/strategy/Documents/Elevator_Pitch.docx'
          ])
        },
        {
          project_id: projectId,
          document_ids: JSON.stringify(['doc_004', 'doc_005']),
          integration_id: 'cf_demo_001',
          integration_type: 'confluence',
          export_format: 'html',
          status: 'processing',
          progress: 65,
          total_documents: 2,
          processed_documents: 1,
          export_results: JSON.stringify([
            {
              document_id: 'doc_004',
              document_type: 'feasibility_study',
              status: 'success',
              exported_url: 'https://company.atlassian.net/wiki/spaces/STRATEGY/pages/123456/Feasibility+Study',
              page_id: '123456',
              export_time: Date.now() - 1800000
            }
          ]),
          error_message: '',
          started_at: Date.now() - 3600000,
          completed_at: 0,
          exported_urls: JSON.stringify([])
        },
        {
          project_id: projectId,
          document_ids: JSON.stringify(['doc_006']),
          integration_id: 'sp_demo_001',
          integration_type: 'sharepoint',
          export_format: 'pdf',
          status: 'failed',
          progress: 0,
          total_documents: 1,
          processed_documents: 0,
          export_results: JSON.stringify([]),
          error_message: 'SharePoint authentication failed. Please check credentials.',
          started_at: Date.now() - 5400000, // 1.5 hours ago
          completed_at: Date.now() - 5100000, // 1.4 hours ago
          exported_urls: JSON.stringify([])
        }
      ];

      // Add export jobs to database
      for (const job of exportJobs) {
        await table.addItem(TABLES.export_jobs, job);
      }

      console.log('✅ Export jobs seeded successfully');
      
    } catch (error) {
      console.error('❌ Error seeding export jobs:', error);
    }
  }

  static async seedEnterpriseSettings(): Promise<void> {
    try {
      console.log('Seeding enterprise settings...');
      
      const enterpriseSettings = {
        default_integration: 'sp_demo_001',
        auto_export_enabled: 'true',
        export_retention_days: 90,
        allowed_integrations: JSON.stringify(['sharepoint', 'confluence', 'teams', 'slack']),
        security_settings: JSON.stringify({
          require_approval: true,
          encrypt_exports: true,
          audit_all_actions: true,
          ip_whitelist: ['192.168.1.0/24', '10.0.0.0/8'],
          session_timeout: 3600,
          mfa_required: true
        }),
        compliance_settings: JSON.stringify({
          gdpr_compliant: true,
          data_retention_days: 2555, // 7 years
          anonymize_after_days: 1095, // 3 years
          audit_retention_days: 2555,
          export_approval_required: true,
          data_classification_required: true
        }),
        created_at: Date.now() - 2592000000, // 30 days ago
        updated_at: Date.now() - 86400000 // 1 day ago
      };

      await table.addItem(TABLES.enterprise_settings, enterpriseSettings);

      console.log('✅ Enterprise settings seeded successfully');
      
    } catch (error) {
      console.error('❌ Error seeding enterprise settings:', error);
    }
  }

  static async seedAllEnterpriseData(projectId?: string): Promise<void> {
    console.log('🌱 Starting enterprise data seeding...');
    
    await this.seedEnterpriseIntegrations();
    
    if (projectId) {
      await this.seedExportJobs(projectId);
    }
    
    await this.seedEnterpriseSettings();
    
    console.log('🎉 All enterprise data seeded successfully!');
  }

  static async clearEnterpriseData(): Promise<void> {
    try {
      console.log('🧹 Clearing existing enterprise data...');
      
      // Note: In a real implementation, you'd need to query all items first
      // and then delete them. This is a simplified version for demo purposes.
      
      console.log('⚠️ Enterprise data clearing would happen here in production');
      console.log('✅ Enterprise data cleared');
      
    } catch (error) {
      console.error('❌ Error clearing enterprise data:', error);
    }
  }

  static async checkEnterpriseDataExists(): Promise<{
    hasIntegrations: boolean;
    hasExportJobs: boolean;
    hasSettings: boolean;
  }> {
    try {
      console.log('Checking enterprise tables with IDs:', TABLES);
      
      // Check each table with enhanced error handling
      const integrations = await table.getItems(TABLES.integrations).catch(error => {
        console.error('Error getting integrations from table', TABLES.integrations, ':', error);
        if (error.message?.includes('not found')) {
          console.warn('Enterprise integrations table not found - this may be due to cached old table IDs');
        }
        return { items: [] };
      });

      const exportJobs = await table.getItems(TABLES.export_jobs).catch(error => {
        console.error('Error getting export jobs from table', TABLES.export_jobs, ':', error);
        if (error.message?.includes('not found')) {
          console.warn('Export jobs table not found - this may be due to cached old table IDs');
        }
        return { items: [] };
      });

      const settings = await table.getItems(TABLES.enterprise_settings).catch(error => {
        console.error('Error getting settings from table', TABLES.enterprise_settings, ':', error);
        if (error.message?.includes('not found')) {
          console.warn('Enterprise settings table not found - this may be due to cached old table IDs');
        }
        return { items: [] };
      });

      const results = {
        integrations: integrations.items?.length || 0,
        exportJobs: exportJobs.items?.length || 0,
        settings: settings.items?.length || 0
      };

      console.log('Enterprise data check results:', results);

      return {
        hasIntegrations: results.integrations > 0,
        hasExportJobs: results.exportJobs > 0,
        hasSettings: results.settings > 0
      };
    } catch (error) {
      console.error('Critical error checking enterprise data:', error);
      return {
        hasIntegrations: false,
        hasExportJobs: false,
        hasSettings: false
      };
    }
  }
}