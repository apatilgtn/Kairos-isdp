import { DevvAI } from '@devvai/devv-code-backend';
import type { 
  RoadmapDocument, 
  MVPProject, 
  ExportJob, 
  EnterpriseIntegration,
  ExportFormat,
  IntegrationType 
} from '@/types';

const ai = new DevvAI();

export interface SharePointConfig {
  site_url: string;
  library_name: string;
  client_id: string;
  tenant_id: string;
  client_secret?: string;
  use_managed_identity?: boolean;
  default_folder?: string;
  permissions?: {
    read: string[];
    write: string[];
    admin: string[];
  };
}

export interface ConfluenceConfig {
  base_url: string;
  space_key: string;
  username: string;
  api_token?: string;
  cloud_id?: string;
  parent_page_id?: string;
  template_id?: string;
  labels?: string[];
  permissions?: {
    view: string[];
    edit: string[];
    admin: string[];
  };
}

export interface BatchExportOptions {
  documents: RoadmapDocument[];
  project: MVPProject;
  integration: EnterpriseIntegration;
  format: ExportFormat;
  options: {
    include_attachments: boolean;
    preserve_formatting: boolean;
    add_metadata: boolean;
    create_index_page: boolean;
    organize_by_type: boolean;
    enable_comments: boolean;
    set_permissions: boolean;
  };
}

export interface CollaborationOptions {
  enable_real_time_editing: boolean;
  allow_comments: boolean;
  notification_settings: {
    email_updates: boolean;
    mention_notifications: boolean;
    workflow_alerts: boolean;
  };
  approval_workflow?: {
    required: boolean;
    approvers: string[];
    auto_approve_minor: boolean;
  };
}

export class EnterpriseIntegrationService {
  
  // ==================== SHAREPOINT INTEGRATION ====================
  
  static async exportToSharePoint(options: BatchExportOptions): Promise<ExportJob> {
    const jobId = `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const config = options.integration.configuration as SharePointConfig;
    
    const exportJob: ExportJob = {
      _id: jobId,
      _uid: '', // Will be set by system
      _tid: '', // Will be set by system
      project_id: options.project._id,
      document_ids: options.documents.map(d => d._id),
      integration_id: options.integration.id,
      integration_type: 'sharepoint',
      export_format: options.format,
      status: 'pending',
      progress: 0,
      total_documents: options.documents.length,
      processed_documents: 0,
      export_results: [],
      started_at: Date.now(),
      settings: {
        site_url: config.site_url,
        library_name: config.library_name,
        folder_structure: options.options.organize_by_type ? 'by_type' : 'flat',
        include_metadata: options.options.add_metadata,
        preserve_formatting: options.options.preserve_formatting,
        enable_versioning: true,
        set_permissions: options.options.set_permissions
      }
    };

    // Start export process
    setTimeout(() => {
      this.processSharePointExport(exportJob, options);
    }, 1000);

    return exportJob;
  }

  private static async processSharePointExport(
    exportJob: ExportJob, 
    options: BatchExportOptions
  ): Promise<void> {
    try {
      const config = options.integration.configuration as SharePointConfig;
      const results: any[] = [];
      
      // Create project folder structure
      if (options.options.organize_by_type) {
        await this.createSharePointFolderStructure(config, options.project);
      }
      
      // Create index page if requested
      if (options.options.create_index_page) {
        await this.createSharePointIndexPage(config, options.project, options.documents);
      }

      // Process each document
      for (let i = 0; i < options.documents.length; i++) {
        const document = options.documents[i];
        const progress = Math.round(((i + 1) / options.documents.length) * 100);
        
        // Simulate processing time based on document complexity
        const processingTime = this.calculateProcessingTime(document, options.format);
        await new Promise(resolve => setTimeout(resolve, processingTime));
        
        try {
          const result = await this.exportDocumentToSharePoint(
            document,
            options.project,
            config,
            options.format,
            options.options
          );
          
          results.push({
            document_id: document._id,
            document_type: document.document_type,
            status: 'success',
            exported_url: result.url,
            file_size: result.size,
            export_time: Date.now(),
            version_id: result.version_id,
            permissions_set: options.options.set_permissions,
            collaboration_enabled: options.options.enable_comments
          });

          // Set up real-time collaboration features
          if (options.options.enable_comments) {
            await this.enableSharePointCollaboration(config, result.file_id, document);
          }

        } catch (error) {
          results.push({
            document_id: document._id,
            document_type: document.document_type,
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Export failed',
            export_time: Date.now()
          });
        }
        
        // Update job progress
        exportJob.progress = progress;
        exportJob.processed_documents = i + 1;
        exportJob.export_results = results;
        exportJob.status = i === options.documents.length - 1 ? 'completed' : 'processing';
      }
      
      // Finalize export job
      exportJob.status = 'completed';
      exportJob.completed_at = Date.now();
      exportJob.exported_urls = results
        .filter(r => r.status === 'success')
        .map(r => r.exported_url);
      
      // Generate export summary
      const summary = await this.generateExportSummary(options.project, results, 'sharepoint');
      exportJob.summary = summary;
      
    } catch (error) {
      exportJob.status = 'failed';
      exportJob.error_message = error instanceof Error ? error.message : 'Export process failed';
      exportJob.completed_at = Date.now();
    }
  }

  private static async exportDocumentToSharePoint(
    document: RoadmapDocument,
    project: MVPProject,
    config: SharePointConfig,
    format: ExportFormat,
    options: any
  ): Promise<{ url: string; size: number; version_id: string; file_id: string }> {
    
    // Convert document content based on format
    const convertedContent = await this.convertDocumentContent(document, format, options);
    
    // Generate SharePoint-specific metadata
    const metadata = {
      title: document.title,
      document_type: document.document_type,
      project_name: project.name,
      project_industry: project.industry,
      generated_date: new Date(document.generated_at).toISOString(),
      status: document.status,
      word_count: document.content.split(' ').length,
      kairos_project_id: project._id,
      kairos_document_id: document._id,
      content_hash: this.generateContentHash(document.content),
      collaboration_settings: {
        allow_comments: options.enable_comments,
        track_changes: true,
        version_control: true
      }
    };

    // Simulate SharePoint upload with realistic timing
    const fileSize = Math.floor(Math.random() * 800000) + 200000;
    const uploadTime = Math.max(1000, fileSize / 1000); // Realistic upload time
    await new Promise(resolve => setTimeout(resolve, uploadTime));
    
    // Simulate occasional failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error('SharePoint server error: Unable to upload file');
    }
    
    const fileId = `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const versionId = `v${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 10)}`;
    
    // Determine folder path based on organization settings
    const folderPath = options.organize_by_type 
      ? `${project.name}/${this.getDocumentTypeFolder(document.document_type)}`
      : project.name;
    
    const fileName = this.generateFileName(document, format);
    const sharePointUrl = `${config.site_url}/sites/${config.library_name}/${folderPath}/${fileName}`;
    
    return {
      url: sharePointUrl,
      size: fileSize,
      version_id: versionId,
      file_id: fileId
    };
  }

  private static async createSharePointFolderStructure(
    config: SharePointConfig,
    project: MVPProject
  ): Promise<void> {
    // Simulate folder creation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const folders = [
      'Business Cases',
      'Feasibility Studies', 
      'Project Charters',
      'MVP Roadmaps',
      'Elevator Pitches',
      'AI Model Advice',
      'Scope Statements',
      'RFP Documents',
      'Diagrams',
      'Templates'
    ];
    
    // Create folder structure (simulated)
    console.log(`Created SharePoint folder structure for ${project.name}:`, folders);
  }

  private static async createSharePointIndexPage(
    config: SharePointConfig,
    project: MVPProject,
    documents: RoadmapDocument[]
  ): Promise<void> {
    // Generate comprehensive index page content
    const indexContent = await this.generateProjectIndexPage(project, documents, 'sharepoint');
    
    // Simulate index page creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Created SharePoint index page for ${project.name}`);
  }

  private static async enableSharePointCollaboration(
    config: SharePointConfig,
    fileId: string,
    document: RoadmapDocument
  ): Promise<void> {
    // Simulate enabling collaboration features
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const collaborationFeatures = {
      comments_enabled: true,
      co_authoring: true,
      version_history: true,
      workflow_integration: true,
      notification_settings: {
        on_edit: true,
        on_comment: true,
        on_share: true
      }
    };
    
    console.log(`Enabled SharePoint collaboration for document ${document.title}:`, collaborationFeatures);
  }

  // ==================== CONFLUENCE INTEGRATION ====================
  
  static async exportToConfluence(options: BatchExportOptions): Promise<ExportJob> {
    const jobId = `cf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const config = options.integration.configuration as ConfluenceConfig;
    
    const exportJob: ExportJob = {
      _id: jobId,
      _uid: '', // Will be set by system
      _tid: '', // Will be set by system
      project_id: options.project._id,
      document_ids: options.documents.map(d => d._id),
      integration_id: options.integration.id,
      integration_type: 'confluence',
      export_format: options.format,
      status: 'pending',
      progress: 0,
      total_documents: options.documents.length,
      processed_documents: 0,
      export_results: [],
      started_at: Date.now(),
      settings: {
        base_url: config.base_url,
        space_key: config.space_key,
        parent_page_id: config.parent_page_id,
        create_child_pages: options.options.organize_by_type,
        enable_comments: options.options.enable_comments,
        add_labels: config.labels?.length ? true : false,
        template_id: config.template_id
      }
    };

    // Start export process
    setTimeout(() => {
      this.processConfluenceExport(exportJob, options);
    }, 1000);

    return exportJob;
  }

  private static async processConfluenceExport(
    exportJob: ExportJob,
    options: BatchExportOptions
  ): Promise<void> {
    try {
      const config = options.integration.configuration as ConfluenceConfig;
      const results: any[] = [];
      
      // Create parent page for project
      const parentPageId = await this.createConfluenceProjectPage(config, options.project);
      
      // Create index page if requested
      if (options.options.create_index_page) {
        await this.createConfluenceIndexPage(config, options.project, options.documents, parentPageId);
      }

      // Process each document
      for (let i = 0; i < options.documents.length; i++) {
        const document = options.documents[i];
        const progress = Math.round(((i + 1) / options.documents.length) * 100);
        
        // Simulate processing time
        const processingTime = this.calculateProcessingTime(document, options.format);
        await new Promise(resolve => setTimeout(resolve, processingTime));
        
        try {
          const result = await this.exportDocumentToConfluence(
            document,
            options.project,
            config,
            parentPageId,
            options.options
          );
          
          results.push({
            document_id: document._id,
            document_type: document.document_type,
            status: 'success',
            exported_url: result.url,
            page_id: result.page_id,
            export_time: Date.now(),
            word_count: result.word_count,
            labels_added: result.labels,
            collaboration_enabled: options.options.enable_comments
          });

          // Set up Confluence collaboration features
          if (options.options.enable_comments) {
            await this.enableConfluenceCollaboration(config, result.page_id, document);
          }

        } catch (error) {
          results.push({
            document_id: document._id,
            document_type: document.document_type,
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Export failed',
            export_time: Date.now()
          });
        }
        
        // Update job progress
        exportJob.progress = progress;
        exportJob.processed_documents = i + 1;
        exportJob.export_results = results;
        exportJob.status = i === options.documents.length - 1 ? 'completed' : 'processing';
      }
      
      // Finalize export job
      exportJob.status = 'completed';
      exportJob.completed_at = Date.now();
      exportJob.exported_urls = results
        .filter(r => r.status === 'success')
        .map(r => r.exported_url);
      
      // Generate export summary
      const summary = await this.generateExportSummary(options.project, results, 'confluence');
      exportJob.summary = summary;
      
    } catch (error) {
      exportJob.status = 'failed';
      exportJob.error_message = error instanceof Error ? error.message : 'Export process failed';
      exportJob.completed_at = Date.now();
    }
  }

  private static async exportDocumentToConfluence(
    document: RoadmapDocument,
    project: MVPProject,
    config: ConfluenceConfig,
    parentPageId: string,
    options: any
  ): Promise<{ url: string; page_id: string; word_count: number; labels: string[] }> {
    
    // Convert document content to Confluence format
    const confluenceContent = await this.convertToConfluenceFormat(document, project, options);
    
    // Generate Confluence-specific labels
    const labels = [
      'kairos-export',
      `project-${project.name.toLowerCase().replace(/\s+/g, '-')}`,
      `document-${document.document_type}`,
      `industry-${project.industry.toLowerCase().replace(/\s+/g, '-')}`,
      ...(config.labels || [])
    ];
    
    // Simulate Confluence page creation
    const processingTime = Math.max(1500, confluenceContent.length / 100);
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate occasional failures (8% failure rate)
    if (Math.random() < 0.08) {
      throw new Error('Confluence API error: Space permissions insufficient');
    }
    
    const pageId = `${Math.floor(Math.random() * 9000000) + 1000000}`;
    const pageUrl = `${config.base_url}/wiki/spaces/${config.space_key}/pages/${pageId}`;
    
    return {
      url: pageUrl,
      page_id: pageId,
      word_count: confluenceContent.split(' ').length,
      labels
    };
  }

  private static async createConfluenceProjectPage(
    config: ConfluenceConfig,
    project: MVPProject
  ): Promise<string> {
    // Simulate project page creation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const pageId = `${Math.floor(Math.random() * 9000000) + 1000000}`;
    console.log(`Created Confluence project page for ${project.name}: Page ID ${pageId}`);
    
    return pageId;
  }

  private static async createConfluenceIndexPage(
    config: ConfluenceConfig,
    project: MVPProject,
    documents: RoadmapDocument[],
    parentPageId: string
  ): Promise<void> {
    // Generate comprehensive index page content
    const indexContent = await this.generateProjectIndexPage(project, documents, 'confluence');
    
    // Simulate index page creation
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    console.log(`Created Confluence index page for ${project.name}`);
  }

  private static async enableConfluenceCollaboration(
    config: ConfluenceConfig,
    pageId: string,
    document: RoadmapDocument
  ): Promise<void> {
    // Simulate enabling collaboration features
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const collaborationFeatures = {
      inline_comments: true,
      page_comments: true,
      watch_notifications: true,
      mention_notifications: true,
      edit_notifications: true,
      workflow_integration: config.template_id ? true : false
    };
    
    console.log(`Enabled Confluence collaboration for document ${document.title}:`, collaborationFeatures);
  }

  // ==================== REAL-TIME COLLABORATION ====================
  
  static async enableRealTimeCollaboration(
    integration: EnterpriseIntegration,
    documentId: string,
    options: CollaborationOptions
  ): Promise<{ success: boolean; collaboration_id?: string; error?: string }> {
    try {
      const collaborationId = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate enabling real-time features
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (integration.type === 'sharepoint') {
        await this.enableSharePointRealTimeFeatures(integration, documentId, options);
      } else if (integration.type === 'confluence') {
        await this.enableConfluenceRealTimeFeatures(integration, documentId, options);
      }
      
      return { success: true, collaboration_id: collaborationId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enable collaboration'
      };
    }
  }

  private static async enableSharePointRealTimeFeatures(
    integration: EnterpriseIntegration,
    documentId: string,
    options: CollaborationOptions
  ): Promise<void> {
    const features = {
      co_authoring: options.enable_real_time_editing,
      comments: options.allow_comments,
      version_control: true,
      change_tracking: true,
      approval_workflow: options.approval_workflow?.required || false,
      notifications: {
        email: options.notification_settings.email_updates,
        teams: options.notification_settings.mention_notifications,
        workflow: options.notification_settings.workflow_alerts
      }
    };
    
    console.log(`Enabled SharePoint real-time collaboration:`, features);
  }

  private static async enableConfluenceRealTimeFeatures(
    integration: EnterpriseIntegration,
    documentId: string,
    options: CollaborationOptions
  ): Promise<void> {
    const features = {
      collaborative_editing: options.enable_real_time_editing,
      inline_comments: options.allow_comments,
      page_comments: options.allow_comments,
      watch_notifications: options.notification_settings.email_updates,
      mention_notifications: options.notification_settings.mention_notifications,
      approval_workflow: options.approval_workflow?.required || false
    };
    
    console.log(`Enabled Confluence real-time collaboration:`, features);
  }

  // ==================== UTILITY METHODS ====================
  
  private static async convertDocumentContent(
    document: RoadmapDocument,
    format: ExportFormat,
    options: any
  ): Promise<string> {
    let content = document.content;
    
    // Add metadata header if requested
    if (options.add_metadata) {
      const metadata = `
---
Title: ${document.title}
Type: ${document.document_type}
Status: ${document.status}
Generated: ${new Date(document.generated_at).toISOString()}
---

`;
      content = metadata + content;
    }
    
    // Apply format-specific conversions
    switch (format) {
      case 'word':
        return this.convertToWordFormat(content);
      case 'pdf':
        return this.convertToPDFFormat(content);
      case 'html':
        return this.convertToHTMLFormat(content);
      case 'markdown':
        return content; // Already in markdown
      default:
        return content;
    }
  }

  private static async convertToConfluenceFormat(
    document: RoadmapDocument,
    project: MVPProject,
    options: any
  ): Promise<string> {
    // Convert markdown to Confluence storage format
    let content = document.content;
    
    // Add project context
    const header = `
<ac:structured-macro ac:name="info">
  <ac:parameter ac:name="title">Project Information</ac:parameter>
  <ac:rich-text-body>
    <p><strong>Project:</strong> ${project.name}</p>
    <p><strong>Industry:</strong> ${project.industry}</p>
    <p><strong>Document Type:</strong> ${document.document_type.replace('_', ' ')}</p>
    <p><strong>Generated:</strong> ${new Date(document.generated_at).toLocaleDateString()}</p>
  </ac:rich-text-body>
</ac:structured-macro>

`;
    
    // Convert markdown to Confluence format
    content = content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/g, '<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[$1]]></ac:plain-text-body></ac:structured-macro>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>')
      .replace(/^(?!<)/gm, '<p>')
      .replace(/(?<!>)$/gm, '</p>');
    
    return header + content;
  }

  private static convertToWordFormat(content: string): string {
    // Convert markdown to Word-compatible HTML
    return content
      .replace(/^# (.*$)/gim, '<h1 style="color: #2c3e50; border-bottom: 2px solid #3498db;">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 style="color: #34495e; margin-top: 20px;">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 style="color: #34495e;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/g, '<pre style="background: #f8f9fa; padding: 10px; border-radius: 5px;"><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code style="background: #f8f9fa; padding: 2px 4px; border-radius: 3px;">$1</code>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(?!<)/gm, '<p>')
      .replace(/(?<!>)$/gm, '</p>');
  }

  private static convertToPDFFormat(content: string): string {
    // Simplified format for PDF generation
    return content
      .replace(/```([\s\S]*?)```/g, '--- CODE BLOCK ---\n$1\n--- END CODE ---')
      .replace(/`(.*?)`/g, '[CODE: $1]')
      .replace(/\*\*(.*?)\*\*/g, '$1 (BOLD)')
      .replace(/\*(.*?)\*/g, '$1 (ITALIC)');
  }

  private static convertToHTMLFormat(content: string): string {
    return content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(?!<)/gm, '<p>')
      .replace(/(?<!>)$/gm, '</p>');
  }

  private static calculateProcessingTime(document: RoadmapDocument, format: ExportFormat): number {
    const baseTime = 1000;
    const contentMultiplier = Math.max(1, document.content.length / 1000);
    const formatMultiplier = {
      native: 1,
      markdown: 1.2,
      html: 1.5,
      word: 2,
      pdf: 2.5
    }[format] || 1;
    
    return Math.round(baseTime * contentMultiplier * formatMultiplier);
  }

  private static generateFileName(document: RoadmapDocument, format: ExportFormat): string {
    const cleanTitle = document.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const extension = {
      native: 'txt',
      markdown: 'md',
      html: 'html',
      word: 'docx',
      pdf: 'pdf'
    }[format] || 'txt';
    
    return `${cleanTitle}.${extension}`;
  }

  private static getDocumentTypeFolder(documentType: string): string {
    const folderMap: Record<string, string> = {
      roadmap: 'MVP Roadmaps',
      elevator_pitch: 'Elevator Pitches',
      model_advice: 'AI Model Advice',
      business_case: 'Business Cases',
      feasibility_study: 'Feasibility Studies',
      project_charter: 'Project Charters',
      scope_statement: 'Scope Statements',
      rfp: 'RFP Documents'
    };
    
    return folderMap[documentType] || 'Other Documents';
  }

  private static generateContentHash(content: string): string {
    // Simple hash function for content integrity
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private static async generateProjectIndexPage(
    project: MVPProject,
    documents: RoadmapDocument[],
    platform: 'sharepoint' | 'confluence'
  ): Promise<string> {
    const docsByType = documents.reduce((acc, doc) => {
      if (!acc[doc.document_type]) acc[doc.document_type] = [];
      acc[doc.document_type].push(doc);
      return acc;
    }, {} as Record<string, RoadmapDocument[]>);

    let indexContent = `# ${project.name} - Project Documentation\n\n`;
    indexContent += `**Industry:** ${project.industry}\n`;
    indexContent += `**Created:** ${new Date().toLocaleDateString()}\n`;
    indexContent += `**Total Documents:** ${documents.length}\n\n`;
    
    indexContent += `## Project Overview\n\n`;
    indexContent += `${project.problem_statement}\n\n`;
    
    indexContent += `## Document Index\n\n`;
    
    for (const [type, docs] of Object.entries(docsByType)) {
      const typeLabel = type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      indexContent += `### ${typeLabel}\n\n`;
      
      docs.forEach(doc => {
        const docName = doc.title || `${typeLabel} Document`;
        const fileName = this.generateFileName(doc, 'native');
        
        if (platform === 'confluence') {
          indexContent += `- [${docName}](${fileName})\n`;
        } else {
          indexContent += `- ${docName} (${fileName})\n`;
        }
      });
      
      indexContent += '\n';
    }
    
    indexContent += `## Export Information\n\n`;
    indexContent += `- **Exported from:** KAIROS - Intelligent Strategic Document Platform\n`;
    indexContent += `- **Export Date:** ${new Date().toISOString()}\n`;
    indexContent += `- **Platform:** ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n`;
    
    return indexContent;
  }

  private static async generateExportSummary(
    project: MVPProject,
    results: any[],
    platform: 'sharepoint' | 'confluence'
  ): Promise<string> {
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const totalSize = results.reduce((sum, r) => sum + (r.file_size || 0), 0);
    
    return `Export completed for ${project.name}:
- Platform: ${platform.charAt(0).toUpperCase() + platform.slice(1)}
- Total Documents: ${results.length}
- Successful: ${successful}
- Failed: ${failed}
- Total Size: ${Math.round(totalSize / 1024 / 1024 * 100) / 100} MB
- Export Date: ${new Date().toISOString()}`;
  }
}