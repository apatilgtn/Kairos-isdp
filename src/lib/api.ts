import { table, DevvAI, auth } from '@devvai/devv-code-backend';
import type {
  MVPProject,
  RoadmapDocument,
  UserDiagram,
  AIGenerationRequest,
  AIGenerationResponse,
  GetItemsResponse,
  Team,
  TeamMember,
  TeamInvitation,
  TeamActivity,
  TeamRole,
  ActivityType
} from '@/types';
import { OptimizedGenerationService } from './optimized-generation';

// Table IDs (from table creation)
const TABLES = {
  MVP_PROJECTS: 'ex9bhte55mv4',
  ROADMAP_DOCUMENTS: 'ex9bi39apqf4',
  USER_DIAGRAMS: 'ex9bic0ue58g',
  TEAMS: 'exb304aazgg0',
  TEAM_MEMBERS: 'exb30djqxbsw',
  TEAM_INVITATIONS: 'exb30nx7qz9c',
  TEAM_ACTIVITIES: 'exb30y9ulo8w',
  ENTERPRISE_INTEGRATIONS: 'exba4zzl3bwg',
  EXPORT_JOBS: 'exba5dujb01s',
  ENTERPRISE_SETTINGS: 'exba5nrpai9s'
};

// Initialize AI client
const ai = new DevvAI();

export class APIService {
  // Project Management
  static async createProject(projectData: Omit<MVPProject, '_id' | '_uid' | '_tid' | 'created_at' | 'updated_at'>): Promise<void> {
    const now = Date.now();
    await table.addItem(TABLES.MVP_PROJECTS, {
      ...projectData,
      created_at: now,
      updated_at: now
    });
  }

  static async getProjects(): Promise<MVPProject[]> {
    const response = await table.getItems(TABLES.MVP_PROJECTS, {
      sort: '_id',
      order: 'desc',
      limit: 50
    });
    return response.items as MVPProject[];
  }

  static async updateProject(project: Partial<MVPProject> & { _uid: string; _id: string }): Promise<void> {
    await table.updateItem(TABLES.MVP_PROJECTS, {
      ...project,
      updated_at: Date.now()
    });
  }

  static async deleteProject(uid: string, projectId: string): Promise<void> {
    await table.deleteItem(TABLES.MVP_PROJECTS, {
      _uid: uid,
      _id: projectId
    });
  }

  // Document Management
  static async saveDocument(documentData: Omit<RoadmapDocument, '_id' | '_uid' | '_tid' | 'generated_at' | 'status'>): Promise<void> {
    await table.addItem(TABLES.ROADMAP_DOCUMENTS, {
      ...documentData,
      generated_at: Date.now(),
      status: 'generated'
    });
  }

  static async updateRoadmapDocument(documentId: string, updates: Partial<Pick<RoadmapDocument, 'content' | 'title' | 'status'>>): Promise<void> {
    await table.updateItem(TABLES.ROADMAP_DOCUMENTS, {
      _uid: '', // Will be set by the system
      _id: documentId,
      ...updates
    });
  }

  static async getDocuments(projectId?: string): Promise<RoadmapDocument[]> {
    const options: any = {
      sort: '_id',
      order: 'desc',
      limit: 100
    };
    
    if (projectId) {
      options.query = { project_id: projectId };
    }
    
    const response = await table.getItems(TABLES.ROADMAP_DOCUMENTS, options);
    return response.items as RoadmapDocument[];
  }

  static async deleteDocument(uid: string, documentId: string): Promise<void> {
    await table.deleteItem(TABLES.ROADMAP_DOCUMENTS, {
      _uid: uid,
      _id: documentId
    });
  }

  // Diagram Management
  static async saveDiagram(diagramData: Omit<UserDiagram, '_id' | '_uid' | '_tid' | 'created_at'>): Promise<void> {
    await table.addItem(TABLES.USER_DIAGRAMS, {
      ...diagramData,
      created_at: Date.now()
    });
  }

  static async getDiagrams(projectId?: string): Promise<UserDiagram[]> {
    const options: any = {
      sort: '_id',
      order: 'desc',
      limit: 50
    };
    
    if (projectId) {
      options.query = { project_id: projectId };
    }
    
    const response = await table.getItems(TABLES.USER_DIAGRAMS, options);
    return response.items as UserDiagram[];
  }

  static async updateDiagram(diagram: Partial<UserDiagram> & { _uid: string; _id: string }): Promise<void> {
    await table.updateItem(TABLES.USER_DIAGRAMS, diagram);
  }

  static async deleteDiagram(uid: string, diagramId: string): Promise<void> {
    await table.deleteItem(TABLES.USER_DIAGRAMS, {
      _uid: uid,
      _id: diagramId
    });
  }

  // AI Generation Services
  static async checkAuthStatus(): Promise<boolean> {
    try {
      // Try a simple AI request to check if user is authenticated
      const response = await ai.chat.completions.create({
        model: 'default',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      });
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }

  static async generateRoadmap(project: MVPProject): Promise<AIGenerationResponse> {
    return OptimizedGenerationService.generateDocument('roadmap', project);
  }

  static async generateElevatorPitch(project: MVPProject): Promise<AIGenerationResponse> {
    return OptimizedGenerationService.generateDocument('elevatorPitch', project);
  }

  static async generateModelAdvice(useCase: string, project: MVPProject): Promise<AIGenerationResponse> {
    return OptimizedGenerationService.generateDocument('modelAdvice', project, useCase);
  }

  // Document Enhancement via AI Chat
  static async enhanceDocument(
    document: RoadmapDocument,
    userInput: string,
    currentContent: string,
    project: MVPProject
  ): Promise<AIGenerationResponse & { enhancedContent?: string }> {
    return OptimizedGenerationService.enhanceDocument(document, userInput, currentContent, project);
  }

  // Generate Diagram from Document Content
  static async generateDiagramFromContent(
    document: RoadmapDocument,
    project: MVPProject
  ): Promise<AIGenerationResponse> {
    try {
      const prompt = `
Create a professional Mermaid.js diagram that visualizes the key concepts from this ${document.document_type.replace('_', ' ')} document.

**PROJECT CONTEXT:**
- Project: ${project.name}
- Industry: ${project.industry}
- Document: ${document.title}

**DOCUMENT CONTENT:**
${document.content}

**DIAGRAM REQUIREMENTS:**

For **Roadmap Documents**, create a Gantt chart or flowchart showing:
- Development phases with timelines
- Feature dependencies and relationships
- Milestones and deliverables
- Critical path visualization

For **Elevator Pitch Documents**, create a user journey diagram showing:
- Customer pain points and journey stages
- Value proposition flow
- Solution touchpoints
- Market opportunity visualization

For **Model Advice Documents**, create a technical architecture showing:
- Data flow and processing pipeline
- Model training and inference workflow
- System components and integrations
- Deployment architecture

**QUALITY REQUIREMENTS:**
1. **Professional Styling**: Use consistent colors, proper spacing, and clear labels
2. **Logical Flow**: Information should flow logically from left to right or top to bottom
3. **Clear Hierarchy**: Use different colors/shapes to show different types of elements
4. **Comprehensive**: Include all major elements from the document
5. **Actionable**: Diagram should help viewers understand the content better

**STYLING GUIDELINES:**
- Use professional color palette (blues, greens, purples)
- Add descriptive labels, not just keywords
- Include timeline information where relevant
- Use appropriate Mermaid diagram type (flowchart, gantt, sequence, etc.)
- Add styling with fill colors and stroke colors for visual hierarchy

**OUTPUT FORMAT:**
Return ONLY valid Mermaid.js code with proper syntax. Include:
- Appropriate diagram type declaration
- All nodes and connections
- Professional styling with colors
- Clear, descriptive labels
- No additional explanation or markdown formatting

Example styling to include:
\`\`\`
style A fill:#e1f5fe,stroke:#01579b,stroke-width:2px
style B fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
\`\`\`

Generate a diagram that would be valuable for stakeholders to understand the project visually.
`;

      const response = await ai.chat.completions.create({
        model: 'default',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in creating clear, professional Mermaid.js diagrams that visualize complex information in an easy-to-understand format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content || '';
      return {
        success: true,
        content
      };
    } catch (error) {
      console.error('Failed to generate diagram:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Export Document to DOCX/PDF
  static async exportDocument(
    document: RoadmapDocument,
    format: 'docx' | 'pdf'
  ): Promise<{ success: boolean; blob?: Blob; error?: string }> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Export only available in browser environment');
      }

      const sanitizedContent = document.content
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&/g, '&amp;');

      if (format === 'docx') {
        // Create a proper HTML document for DOCX conversion
        const htmlContent = `
<!DOCTYPE html>
<html xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>90</w:Zoom>
      <w:DoNotPromptForConvert/>
      <w:DoNotShowInsertionsAndDeletions/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page { margin: 1in; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333;
      font-size: 11pt;
    }
    h1 { 
      color: #2c3e50; 
      font-size: 18pt; 
      margin-bottom: 20px;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    h2 { 
      color: #34495e; 
      font-size: 14pt; 
      margin-top: 20px;
      margin-bottom: 10px;
    }
    h3 { 
      color: #34495e; 
      font-size: 12pt; 
      margin-top: 15px;
      margin-bottom: 8px;
    }
    p { margin-bottom: 8pt; }
    ul, ol { margin-bottom: 8pt; }
    li { margin-bottom: 4pt; }
    strong { font-weight: 600; }
    em { font-style: italic; }
    code { 
      background-color: #f8f9fa; 
      padding: 2px 4px; 
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre { 
      background-color: #f8f9fa; 
      padding: 12px; 
      border-radius: 6px;
      border: 1px solid #e9ecef;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 10pt;
    }
    .document-header {
      margin-bottom: 30px;
      padding: 20px;
      background-color: #f8f9fa;
      border-left: 4px solid #3498db;
    }
    .document-meta {
      color: #6c757d;
      font-size: 9pt;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="document-header">
    <h1>${document.title}</h1>
    <div class="document-meta">
      <strong>Document Type:</strong> ${document.document_type.replace('_', ' ').toUpperCase()}<br>
      <strong>Generated:</strong> ${new Date(document.generated_at).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      })}<br>
      <strong>Status:</strong> ${document.status.toUpperCase()}
    </div>
  </div>
  
  <div class="document-content">
    ${this.markdownToHtml(sanitizedContent)}
  </div>
</body>
</html>`;
        
        const blob = new Blob([htmlContent], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        return { success: true, blob };
      } else if (format === 'pdf') {
        // For PDF export, we'll use jsPDF with better formatting
        const { jsPDF } = await import('jspdf');
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Set margins
        const margin = 20;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const contentWidth = pageWidth - (margin * 2);
        
        let yPosition = margin;
        
        // Add title
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(document.title, margin, yPosition);
        yPosition += 15;
        
        // Add metadata
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Generated: ${new Date(document.generated_at).toLocaleDateString()}`, margin, yPosition);
        yPosition += 6;
        pdf.text(`Type: ${document.document_type.replace('_', ' ')}`, margin, yPosition);
        yPosition += 15;
        
        // Add separator line
        pdf.setDrawColor(52, 152, 219);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
        
        // Add content
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        const lines = pdf.splitTextToSize(sanitizedContent, contentWidth);
        
        for (let i = 0; i < lines.length; i++) {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(lines[i], margin, yPosition);
          yPosition += 6;
        }
        
        const pdfBlob = pdf.output('blob');
        return { success: true, blob: pdfBlob };
      }
      
      return { success: false, error: 'Unsupported format' };
    } catch (error) {
      console.error('Export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  // Helper method to convert simple markdown to HTML
  private static markdownToHtml(markdown: string): string {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      // Wrap in paragraphs
      .replace(/^(?!<[h|l|p])/gm, '<p>')
      .replace(/(?<!>)$/gm, '</p>')
      // Clean up
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<pre>.*<\/pre>)<\/p>/g, '$1')
      .replace(/<p>(<li>.*<\/li>)<\/p>/g, '<ul>$1</ul>')
      .replace(/<\/ul>\s*<ul>/g, '');
  }

  // Team Management
  static async createTeam(teamData: Omit<Team, '_id' | '_uid' | '_tid' | 'created_at'>): Promise<void> {
    await table.addItem(TABLES.TEAMS, {
      ...teamData,
      created_at: Date.now()
    });
  }

  static async getTeams(): Promise<Team[]> {
    const response = await table.getItems(TABLES.TEAMS, {
      sort: '_id',
      order: 'desc',
      limit: 50
    });
    return response.items as Team[];
  }

  static async getTeamsByOwner(ownerId: string): Promise<Team[]> {
    const response = await table.getItems(TABLES.TEAMS, {
      query: { owner_id: ownerId },
      sort: '_id',
      order: 'desc'
    });
    return response.items as Team[];
  }

  static async updateTeam(team: Partial<Team> & { _uid: string; _id: string }): Promise<void> {
    await table.updateItem(TABLES.TEAMS, team);
  }

  static async deleteTeam(uid: string, teamId: string): Promise<void> {
    await table.deleteItem(TABLES.TEAMS, {
      _uid: uid,
      _id: teamId
    });
  }

  // Team Member Management
  static async addTeamMember(memberData: Omit<TeamMember, '_id' | '_uid' | '_tid' | 'joined_at'>): Promise<void> {
    await table.addItem(TABLES.TEAM_MEMBERS, {
      ...memberData,
      joined_at: Date.now()
    });
  }

  static async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const response = await table.getItems(TABLES.TEAM_MEMBERS, {
      query: { team_id: teamId },
      sort: 'user_id',
      order: 'asc'
    });
    return response.items as TeamMember[];
  }

  static async getUserTeams(userId: string): Promise<TeamMember[]> {
    const response = await table.getItems(TABLES.TEAM_MEMBERS, {
      query: { user_id: userId },
      sort: 'team_id',
      order: 'asc'
    });
    return response.items as TeamMember[];
  }

  static async updateTeamMember(member: Partial<TeamMember> & { _uid: string; _id: string }): Promise<void> {
    await table.updateItem(TABLES.TEAM_MEMBERS, member);
  }

  static async removeTeamMember(uid: string, memberId: string): Promise<void> {
    await table.deleteItem(TABLES.TEAM_MEMBERS, {
      _uid: uid,
      _id: memberId
    });
  }

  // Team Invitations
  static async createInvitation(invitationData: Omit<TeamInvitation, '_id' | '_uid' | '_tid' | 'invited_at' | 'token'>): Promise<string> {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    await table.addItem(TABLES.TEAM_INVITATIONS, {
      ...invitationData,
      invited_at: Date.now(),
      token
    });
    return token;
  }

  static async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    const response = await table.getItems(TABLES.TEAM_INVITATIONS, {
      query: { team_id: teamId },
      sort: '_id',
      order: 'desc'
    });
    return response.items as TeamInvitation[];
  }

  static async getInvitationsByEmail(email: string): Promise<TeamInvitation[]> {
    const response = await table.getItems(TABLES.TEAM_INVITATIONS, {
      query: { email },
      sort: '_id',
      order: 'desc'
    });
    return response.items as TeamInvitation[];
  }

  static async updateInvitation(invitation: Partial<TeamInvitation> & { _uid: string; _id: string }): Promise<void> {
    await table.updateItem(TABLES.TEAM_INVITATIONS, invitation);
  }

  static async deleteInvitation(uid: string, invitationId: string): Promise<void> {
    await table.deleteItem(TABLES.TEAM_INVITATIONS, {
      _uid: uid,
      _id: invitationId
    });
  }

  // Team Activities
  static async logActivity(activityData: Omit<TeamActivity, '_id' | '_uid' | '_tid' | 'timestamp'>): Promise<void> {
    await table.addItem(TABLES.TEAM_ACTIVITIES, {
      ...activityData,
      timestamp: Date.now()
    });
  }

  static async getTeamActivities(teamId: string, limit: number = 50): Promise<TeamActivity[]> {
    const response = await table.getItems(TABLES.TEAM_ACTIVITIES, {
      query: { team_id: teamId },
      sort: '_id',
      order: 'desc',
      limit
    });
    return response.items as TeamActivity[];
  }

  static async getUserActivities(userId: string, limit: number = 50): Promise<TeamActivity[]> {
    const response = await table.getItems(TABLES.TEAM_ACTIVITIES, {
      query: { user_id: userId },
      sort: '_id',
      order: 'desc',
      limit
    });
    return response.items as TeamActivity[];
  }

  // Team Project Management
  static async getTeamProjects(teamId: string): Promise<MVPProject[]> {
    // This would require updating the MVP_PROJECTS table to include team_id
    // For now, we'll return projects based on team members
    const members = await this.getTeamMembers(teamId);
    const allProjects: MVPProject[] = [];
    
    for (const member of members) {
      try {
        const memberProjects = await table.getItems(TABLES.MVP_PROJECTS, {
          query: { _uid: member.user_id },
          sort: '_id',
          order: 'desc'
        });
        allProjects.push(...memberProjects.items as MVPProject[]);
      } catch (error) {
        console.error(`Failed to get projects for member ${member.user_id}:`, error);
      }
    }
    
    // Remove duplicates and sort by updated_at
    const uniqueProjects = allProjects.filter((project, index, self) => 
      index === self.findIndex(p => p._id === project._id)
    );
    
    return uniqueProjects.sort((a, b) => b.updated_at - a.updated_at);
  }

  // === Real-time Collaboration Methods ===

  // Document Edits
  static async createDocumentEdit(edit: any): Promise<any> {
    const tableApi = table;
    await tableApi.addItem('document_edits', {
      document_id: edit.document_id,
      edit_type: edit.type,
      position: edit.position,
      length: edit.length,
      content: edit.content,
      user_id: edit.user_id,
      user_name: edit.user_name,
      timestamp: edit.timestamp,
      version: edit.version
    });
    
    return {
      id: Date.now().toString(),
      document_id: edit.document_id,
      user_id: edit.user_id,
      user_name: edit.user_name,
      type: edit.type,
      position: edit.position,
      length: edit.length,
      content: edit.content,
      timestamp: edit.timestamp,
      version: edit.version
    };
  }

  static async getDocumentEdits(documentId: string): Promise<any[]> {
    const tableApi = table;
    const response = await tableApi.getItems('document_edits', {
      query: { document_id: documentId },
      sort: '_id',
      order: 'desc'
    });
    
    return response.items.map((item: any) => ({
      id: item._id,
      document_id: item.document_id,
      user_id: item.user_id,
      user_name: item.user_name,
      type: item.edit_type as any,
      position: item.position,
      length: item.length,
      content: item.content,
      timestamp: item.timestamp,
      version: item.version
    }));
  }

  static async deleteDocumentEdit(editId: string): Promise<void> {
    const tableApi = table;
    await tableApi.deleteItem('document_edits', {
      _uid: '', // Will be determined by auth
      _id: editId
    });
  }

  // Document Versions
  static async createDocumentVersion(version: any): Promise<any> {
    const tableApi = table;
    await tableApi.addItem('document_versions', {
      document_id: version.document_id,
      version: version.version,
      content: version.content,
      author_id: version.author_id,
      author_name: version.author_name,
      changes_summary: version.changes_summary,
      created_at: version.created_at,
      is_major: version.is_major ? 'true' : 'false'
    });
    
    return {
      _id: Date.now().toString(),
      _uid: '',
      _tid: '',
      document_id: version.document_id,
      version: version.version,
      content: version.content,
      author_id: version.author_id,
      author_name: version.author_name,
      changes_summary: version.changes_summary,
      created_at: version.created_at,
      is_major: version.is_major
    };
  }

  static async getDocumentVersions(documentId: string): Promise<any[]> {
    const tableApi = table;
    const response = await tableApi.getItems('document_versions', {
      query: { document_id: documentId },
      sort: '_id',
      order: 'desc'
    });
    
    return response.items.map((item: any) => ({
      _id: item._id,
      _uid: item._uid,
      _tid: item._tid,
      document_id: item.document_id,
      version: item.version,
      content: item.content,
      author_id: item.author_id,
      author_name: item.author_name,
      changes_summary: item.changes_summary,
      created_at: item.created_at,
      is_major: item.is_major === 'true'
    }));
  }

  // Document Locks
  static async acquireDocumentLock(documentId: string, section?: string): Promise<any> {
    const tableApi = table;
    // Authentication is handled automatically by the system

    const expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutes from now
    
    await tableApi.addItem('document_locks', {
      document_id: documentId,
      locked_by: '', // Will be set by system
      locked_by_name: '', // Will be set by system
      locked_at: Date.now(),
      expires_at: expiresAt,
      section: section || ''
    });
    
    return {
      _id: '',
      _uid: '',
      _tid: '',
      document_id: documentId,
      locked_by: '',
      locked_by_name: '',
      locked_at: Date.now(),
      expires_at: expiresAt,
      section: section || ''
    };
  }

  static async releaseDocumentLock(documentId: string): Promise<void> {
    const tableApi = table;
    // Authentication is handled automatically by the system

    // Find and delete the user's lock on this document
    const response = await tableApi.getItems('document_locks', {
      sort: '_id',
      order: 'desc'
    });
    
    const userLock = response.items.find((item: any) => 
      item.document_id === documentId
    );
    
    if (userLock) {
      await tableApi.deleteItem('document_locks', {
        _uid: userLock._uid,
        _id: userLock._id
      });
    }
  }

  static async getDocumentLock(documentId: string): Promise<any | null> {
    const tableApi = table;
    
    // Query all locks and find active ones for this document
    const response = await tableApi.getItems('document_locks');
    const now = Date.now();
    
    const activeLock = response.items.find((item: any) => 
      item.document_id === documentId && item.expires_at > now
    );
    
    if (!activeLock) {
      return null;
    }
    
    return {
      _id: activeLock._id,
      _uid: activeLock._uid,
      _tid: activeLock._tid,
      document_id: activeLock.document_id,
      locked_by: activeLock.locked_by,
      locked_by_name: activeLock.locked_by_name,
      locked_at: activeLock.locked_at,
      expires_at: activeLock.expires_at,
      section: activeLock.section
    };
  }

  // Document Comments
  static async createDocumentComment(comment: any): Promise<any> {
    const tableApi = table;
    // Authentication is handled automatically by the system

    await tableApi.addItem('document_comments', {
      document_id: comment.document_id,
      author_id: comment.author_id,
      author_name: comment.author_name,
      content: comment.content,
      position: comment.position,
      selection_text: comment.selection_text,
      created_at: comment.created_at,
      updated_at: comment.updated_at || comment.created_at,
      resolved: comment.resolved ? 'true' : 'false',
      thread_id: comment.thread_id || '',
      parent_comment_id: comment.parent_comment_id || ''
    });
    
    return {
      _id: Date.now().toString(),
      _uid: '',
      _tid: '',
      document_id: comment.document_id,
      author_id: comment.author_id,
      author_name: comment.author_name,
      content: comment.content,
      position: comment.position,
      selection_text: comment.selection_text,
      created_at: comment.created_at,
      updated_at: comment.updated_at || comment.created_at,
      resolved: comment.resolved || false,
      thread_id: comment.thread_id || '',
      parent_comment_id: comment.parent_comment_id || ''
    };
  }

  static async getDocumentComments(documentId: string): Promise<any[]> {
    const tableApi = table;
    const response = await tableApi.getItems('document_comments', {
      query: { document_id: documentId },
      sort: '_id',
      order: 'desc'
    });
    
    return response.items.map((item: any) => ({
      _id: item._id,
      _uid: item._uid,
      _tid: item._tid,
      document_id: item.document_id,
      author_id: item.author_id,
      author_name: item.author_name,
      content: item.content,
      position: item.position,
      selection_text: item.selection_text,
      created_at: item.created_at,
      updated_at: item.updated_at,
      resolved: item.resolved === 'true',
      resolved_by: item.resolved_by,
      thread_id: item.thread_id,
      parent_comment_id: item.parent_comment_id
    }));
  }

  static async getDocumentComment(commentId: string): Promise<any | null> {
    const tableApi = table;
    const response = await tableApi.getItems('document_comments', {
      query: { _id: commentId },
      limit: 1
    });
    const item = response.items[0];
    
    if (!item) {
      return null;
    }
    
    return {
      _id: item._id,
      _uid: item._uid,
      _tid: item._tid,
      document_id: item.document_id,
      author_id: item.author_id,
      author_name: item.author_name,
      content: item.content,
      position: item.position,
      selection_text: item.selection_text,
      created_at: item.created_at,
      updated_at: item.updated_at,
      resolved: item.resolved === 'true',
      resolved_by: item.resolved_by,
      thread_id: item.thread_id,
      parent_comment_id: item.parent_comment_id
    };
  }

  static async resolveDocumentComment(commentId: string): Promise<void> {
    const tableApi = table;
    // Authentication is handled automatically by the system

    await tableApi.updateItem('document_comments', {
      _uid: '', // Will be set by system
      _id: commentId,
      resolved: 'true',
      resolved_by: '' // Will be set by system
    });
  }

  // Business Case Generation
  static async generateBusinessCase(project: MVPProject): Promise<AIGenerationResponse> {
    return OptimizedGenerationService.generateDocument('businessCase', project);
  }

  // Feasibility Study Generation
  static async generateFeasibilityStudy(project: MVPProject): Promise<AIGenerationResponse> {
    return OptimizedGenerationService.generateDocument('feasibilityStudy', project);
  }

  // Legacy method for backwards compatibility 
  static async _legacyGenerateFeasibilityStudy(project: MVPProject): Promise<AIGenerationResponse> {
    try {
      console.log('Starting feasibility study generation for project:', project.name);
      
      const prompt = `
As an expert project feasibility analyst, create a comprehensive feasibility study that thoroughly evaluates whether this project is practically achievable across all critical dimensions.

**PROJECT CONTEXT:**
- Name: ${project.name}
- Industry: ${project.industry}
- Problem: ${project.problem_statement}

**GENERATE A DETAILED FEASIBILITY STUDY WITH THESE SECTIONS:**

# Feasibility Study: ${project.name}

## 1. Executive Summary

**Overall Feasibility Assessment:** [HIGH/MEDIUM/LOW] feasibility for successful project completion

**Key Findings:**
- Technical Feasibility: [HIGH/MEDIUM/LOW] - [Brief reason]
- Financial Feasibility: [HIGH/MEDIUM/LOW] - [Brief reason]  
- Market Feasibility: [HIGH/MEDIUM/LOW] - [Brief reason]
- Operational Feasibility: [HIGH/MEDIUM/LOW] - [Brief reason]

**Primary Recommendation:** [Proceed/Proceed with modifications/Do not proceed]

## 2. Technical Feasibility Analysis

**Assessment Level: [HIGH/MEDIUM/LOW]**

**Technology Requirements:**
- Core technologies needed: [List with current maturity level]
- Technical expertise required: [Specific skills and availability]
- Development complexity: [Scale 1-10 with justification]

**Technical Risks:**
- **High Risk**: [Specific technical challenge]
  - Impact: [Development delay/cost increase/failure risk]
  - Mitigation: [Specific technical approaches]
  
- **Medium Risk**: [Specific technical challenge]
  - Impact: [Specific impact]
  - Mitigation: [Specific approaches]

**Infrastructure Requirements:**
- Development environment: [Specific tools, platforms, costs]
- Production infrastructure: [Hosting, scaling, security requirements]
- Integration complexity: [APIs, databases, third-party services]

**Technical Team Assessment:**
- Required team size: [Number] developers for [Duration]
- Skills gap analysis: [Missing skills and acquisition plan]
- Estimated development time: [Months] for MVP

## 3. Financial Feasibility Analysis

**Assessment Level: [HIGH/MEDIUM/LOW]**

**Cost Analysis:**
- Development costs: $[Amount] ([breakdown by category])
- Infrastructure costs: $[Amount]/month (scaling projection)
- Marketing/launch costs: $[Amount]
- Operational costs (Year 1): $[Amount]
- **Total investment required**: $[Amount]

**Revenue Model Viability:**
- Revenue streams: [List with validation level]
- Price point analysis: $[Amount] per [unit] (market research basis)
- Customer acquisition cost: $[Amount] per customer
- Customer lifetime value: $[Amount] (calculation basis)

**Financial Projections:**
- Break-even analysis: Month [Number] at [Units/customers]
- Cash flow analysis: [Positive/Negative] by Month [Number]
- ROI timeline: [Percentage] return by [Timeframe]

**Financial Risks:**
- **Funding risk**: [Availability and terms of required capital]
- **Market pricing risk**: [Price sensitivity and competitive pressures]
- **Cost overrun risk**: [Historical overrun rates for similar projects]

## 4. Market Feasibility Analysis

**Assessment Level: [HIGH/MEDIUM/LOW]**

**Market Size & Opportunity:**
- Target market size: [Number] potential customers worth $[Amount]
- Market growth rate: [Percentage] annually
- Market maturity: [Emerging/Growing/Mature/Declining]

**Competitive Analysis:**
- Direct competitors: [Number] with [market share distribution]
- Competitive advantages: [List specific differentiators]
- Barriers to entry: [List with impact assessment]

**Customer Validation:**
- Target customer profile: [Detailed demographics and psychographics]
- Pain point validation: [Evidence of customer willingness to pay]
- Market entry strategy: [Channel effectiveness assessment]

**Market Risks:**
- **Competition risk**: [New entrants or existing player responses]
- **Timing risk**: [Market readiness and adoption cycles]
- **Regulatory risk**: [Industry regulations and compliance requirements]

## 5. Operational Feasibility Analysis

**Assessment Level: [HIGH/MEDIUM/LOW]**

**Resource Requirements:**
- Human resources: [Team structure and hiring feasibility]
- Operational processes: [New processes needed and complexity]
- Management capabilities: [Leadership and execution capacity]

**Organizational Impact:**
- Cultural fit: [Alignment with existing culture and values]
- Change management: [Scale of organizational changes required]
- Stakeholder buy-in: [Level of support from key stakeholders]

**Operational Risks:**
- **Resource availability**: [Key person dependencies and backup plans]
- **Process integration**: [Complexity of integrating with existing operations]
- **Scalability**: [Ability to handle growth and demand fluctuations]

## 6. Legal & Regulatory Feasibility

**Assessment Level: [HIGH/MEDIUM/LOW]**

**Regulatory Environment:**
- Industry regulations: [Key regulations affecting the project]
- Compliance requirements: [Specific standards and certifications needed]
- Legal structure: [Business entity and liability considerations]

**Intellectual Property:**
- IP protection strategy: [Patents, trademarks, trade secrets]
- IP risks: [Potential infringement issues]
- Licensing requirements: [Third-party IP usage]

**Legal Risks:**
- **Regulatory changes**: [Potential impact of changing regulations]
- **Liability exposure**: [Product liability and operational risks]
- **Contract risks**: [Key partnerships and vendor dependencies]

## 7. Risk Summary & Mitigation Strategies

**Critical Success Factors:**
1. [Factor 1]: [Why critical and how to ensure success]
2. [Factor 2]: [Why critical and how to ensure success]
3. [Factor 3]: [Why critical and how to ensure success]

**High-Priority Risks:**
- **Risk 1**: [Description]
  - Probability: [High/Medium/Low]
  - Impact: [Specific consequences]
  - Mitigation: [Detailed action plan]

- **Risk 2**: [Description]
  - Probability: [High/Medium/Low]
  - Impact: [Specific consequences]
  - Mitigation: [Detailed action plan]

**Risk Monitoring Plan:**
- Key risk indicators: [Metrics to track]
- Review frequency: [Schedule for risk assessment updates]
- Escalation procedures: [When and how to escalate concerns]

## 8. Recommendations & Next Steps

**Overall Recommendation:** [PROCEED/PROCEED WITH CONDITIONS/DO NOT PROCEED]

**Rationale:** [Detailed explanation based on feasibility analysis across all dimensions]

**Conditions for Success (if proceeding):**
1. [Specific condition]: [Why necessary and how to achieve]
2. [Specific condition]: [Why necessary and how to achieve]
3. [Specific condition]: [Why necessary and how to achieve]

**Immediate Next Steps:**
1. [Action item] - Owner: [Role] - Due: [Date]
2. [Action item] - Owner: [Role] - Due: [Date]
3. [Action item] - Owner: [Role] - Due: [Date]

**Go/No-Go Decision Points:**
- Decision Point 1: [Milestone] by [Date] - Criteria: [Success measures]
- Decision Point 2: [Milestone] by [Date] - Criteria: [Success measures]

**Alternative Approaches (if applicable):**
- Option 1: [Modified approach] - [Pros/cons]
- Option 2: [Scaled approach] - [Pros/cons]

---
*This feasibility study is based on current market conditions and available information as of [current date]. Should be reviewed if significant changes occur in technology, market, or regulatory environment.*
`;

      // Use Kimi model for technical analysis, fallback to default
      let response;
      try {
        response = await ai.chat.completions.create({
          model: 'kimi-k2-0711-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert project feasibility analyst with experience in technical, financial, market, and operational assessment. Provide thorough, realistic evaluations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 3500
        });
      } catch (kimiError) {
        console.log('Kimi model failed, falling back to default model:', kimiError);
        response = await ai.chat.completions.create({
          model: 'default',
          messages: [
            {
              role: 'system',
              content: 'You are an expert project feasibility analyst with experience in technical, financial, market, and operational assessment. Provide thorough, realistic evaluations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 3500
        });
      }

      const content = response.choices[0]?.message?.content || '';
      return {
        success: true,
        content
      };
    } catch (error) {
      console.error('Failed to generate feasibility study:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Project Charter Generation
  static async generateProjectCharter(project: MVPProject): Promise<AIGenerationResponse> {
    return OptimizedGenerationService.generateDocument('projectCharter', project);
  }

  // Legacy method for backwards compatibility 
  static async _legacyGenerateProjectCharter(project: MVPProject): Promise<AIGenerationResponse> {
    try {
      console.log('Starting project charter generation for project:', project.name);
      
      const prompt = `
As an expert project management professional with PMP certification, create a comprehensive project charter that formally authorizes this project and establishes clear governance.

**PROJECT CONTEXT:**
- Name: ${project.name}
- Industry: ${project.industry}
- Problem: ${project.problem_statement}

**GENERATE A DETAILED PROJECT CHARTER WITH THESE SECTIONS:**

# Project Charter: ${project.name}

## 1. Project Information

**Project Name:** ${project.name}

**Project Manager:** [To be assigned]

**Project Sponsor:** [Senior executive who champions this project]

**Charter Date:** [Current date]

**Charter Version:** 1.0

**Project Classification:** [Strategic/Operational/Compliance/Innovation]

## 2. Business Case Summary

**Business Need:**
[2-3 sentences describing why this project is necessary and its strategic importance]

**Problem Statement:**
${project.problem_statement}

**Expected Business Value:**
- Primary benefit: [Specific, measurable outcome]
- Secondary benefits: [List additional value creation]
- Strategic alignment: [How this supports organizational goals]

## 3. Project Objectives & Success Criteria

**Primary Objectives:**
1. [SMART objective 1]: [Specific, Measurable, Achievable, Relevant, Time-bound]
2. [SMART objective 2]: [Specific, Measurable, Achievable, Relevant, Time-bound]
3. [SMART objective 3]: [Specific, Measurable, Achievable, Relevant, Time-bound]

**Success Criteria:**
- **User Adoption**: [Specific metrics] by [date]
- **Financial Performance**: [Revenue/cost savings] by [date]
- **Quality Standards**: [Performance benchmarks]
- **Timeline Performance**: [Project completion criteria]

**Key Performance Indicators (KPIs):**
- KPI 1: [Metric] - Target: [Value] by [Date]
- KPI 2: [Metric] - Target: [Value] by [Date]
- KPI 3: [Metric] - Target: [Value] by [Date]

## 4. Project Scope

**High-Level Scope Description:**
[What this project will deliver - products, services, results]

**Major Deliverables:**
1. **[Deliverable 1]**: [Description and acceptance criteria]
2. **[Deliverable 2]**: [Description and acceptance criteria]
3. **[Deliverable 3]**: [Description and acceptance criteria]

**Project Boundaries:**

**Included in Project Scope:**
- [Specific functionality/features that are included]
- [Processes that will be addressed]
- [Systems that will be integrated]

**Excluded from Project Scope:**
- [Specific functionality/features that are NOT included]
- [Related projects or work that's out of scope]
- [Future phases or enhancements]

## 5. Assumptions & Constraints

**Key Assumptions:**
- [Assumption 1]: [What we're assuming to be true]
- [Assumption 2]: [What we're assuming to be true]
- [Assumption 3]: [What we're assuming to be true]

**Project Constraints:**
- **Budget**: $[Amount] maximum project investment
- **Timeline**: Must launch by [Date] for [business reason]
- **Resources**: [Team size limitations or skills constraints]
- **Technology**: [Technical limitations or requirements]
- **Regulatory**: [Compliance requirements that must be met]

## 6. High-Level Timeline & Milestones

**Project Duration:** [Start date] to [End date] ([Total months])

**Major Milestones:**
- **M1 - Project Kickoff**: [Date] - Project team assembled and chartered
- **M2 - Requirements Complete**: [Date] - All requirements documented and approved
- **M3 - MVP Development Complete**: [Date] - Core functionality ready for testing
- **M4 - Testing & QA Complete**: [Date] - All quality gates passed
- **M5 - Go-Live**: [Date] - Product launched to market
- **M6 - Post-Launch Review**: [Date] - Success metrics evaluated and documented

**Critical Path Dependencies:**
- [Dependency 1]: [Impact if delayed]
- [Dependency 2]: [Impact if delayed]

## 7. Budget & Resource Authorization

**Budget Summary:**
- **Development**: $[Amount] - [Team costs, tools, infrastructure]
- **Marketing/Launch**: $[Amount] - [Customer acquisition, campaigns]
- **Operations**: $[Amount] - [Ongoing operational costs]
- **Contingency (15%)**: $[Amount] - [Risk buffer]
- **Total Authorized Budget**: $[Amount]

**Resource Requirements:**
- **Project Manager**: [Name/TBD] - [Allocation %] - [Duration]
- **Development Team**: [Size] developers - [Duration]
- **UX/Design**: [Allocation] - [Duration]
- **Marketing**: [Allocation] - [Duration]
- **Subject Matter Experts**: [List roles needed]

## 8. Stakeholder Identification

**Project Sponsor:** [Name/Title] - [Primary responsibilities and authority level]

**Key Stakeholders:**

| Stakeholder | Role | Interest Level | Influence Level | Communication Needs |
|-------------|------|----------------|-----------------|-------------------|
| [Name/Role] | [Responsibility] | High/Med/Low | High/Med/Low | [Frequency/Format] |
| [Name/Role] | [Responsibility] | High/Med/Low | High/Med/Low | [Frequency/Format] |
| [Name/Role] | [Responsibility] | High/Med/Low | High/Med/Low | [Frequency/Format] |

**Stakeholder Engagement Strategy:**
- **Executive Updates**: [Frequency] to [Audience]
- **Team Communications**: [Methods and frequency]
- **Customer Communications**: [Strategy for user engagement]

## 9. High-Level Risks & Risk Response

**Top Project Risks:**

| Risk | Probability | Impact | Risk Response Strategy |
|------|-------------|--------|----------------------|
| [Risk description] | High/Med/Low | High/Med/Low | [Mitigate/Accept/Transfer/Avoid] |
| [Risk description] | High/Med/Low | High/Med/Low | [Mitigate/Accept/Transfer/Avoid] |
| [Risk description] | High/Med/Low | High/Med/Low | [Mitigate/Accept/Transfer/Avoid] |

**Risk Management Approach:**
- Risk assessment frequency: [Schedule]
- Risk escalation criteria: [When to escalate]
- Risk owner assignments: [How risks will be managed]

## 10. Project Manager Authority

**Authorized Decision-Making Authority:**
- **Budget**: Authority to approve expenses up to $[Amount] without additional approval
- **Resources**: Authority to assign and direct team members within approved budget
- **Scope**: Authority to approve minor scope changes that don't impact budget/timeline by more than [X%]
- **Timeline**: Authority to adjust internal milestones to maintain overall project schedule

**Escalation Requirements:**
- **Budget**: Changes >$[Amount] require sponsor approval
- **Scope**: Major scope changes require [approval process]
- **Timeline**: Schedule delays >2 weeks require [escalation path]
- **Quality**: Any compromise on success criteria requires [approval]

## 11. Project Governance

**Steering Committee:**
- **Chair**: [Project Sponsor]
- **Members**: [List key stakeholders and decision makers]
- **Meeting Frequency**: [Schedule]
- **Authority**: [Decision-making scope]

**Project Reporting:**
- **Status Reports**: [Frequency] to [audience]
- **Dashboard Metrics**: [Key metrics tracked and reviewed]
- **Escalation Process**: [How issues are raised and resolved]

**Change Control Process:**
- **Change Request Process**: [How changes are submitted and evaluated]
- **Approval Authority**: [Who can approve different types of changes]
- **Change Impact Assessment**: [Required analysis for all changes]

## 12. Project Approval

**Charter Approval:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Sponsor | [Name] | _________________ | _____ |
| Project Manager | [Name] | _________________ | _____ |
| Business Owner | [Name] | _________________ | _____ |

**This charter authorizes the Project Manager to:**
- Proceed with project planning and execution
- Utilize approved budget and resources
- Make decisions within defined authority limits
- Lead the project team to deliver stated objectives

---
*This project charter serves as the formal authorization to begin project work and will be reviewed at key milestones to ensure continued alignment with business objectives.*
`;

      const response = await ai.chat.completions.create({
        model: 'default',
        messages: [
          {
            role: 'system',
            content: 'You are an expert project management professional with PMP certification and extensive experience in creating formal project charters that establish clear governance and authority.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 3500
      });

      const content = response.choices[0]?.message?.content || '';
      return {
        success: true,
        content
      };
    } catch (error) {
      console.error('Failed to generate project charter:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Scope Statement Generation
  static async generateScopeStatement(project: MVPProject): Promise<AIGenerationResponse> {
    return OptimizedGenerationService.generateDocument('scopeStatement', project);
  }

  // Legacy method for backwards compatibility 
  static async _legacyGenerateScopeStatement(project: MVPProject): Promise<AIGenerationResponse> {
    try {
      console.log('Starting scope statement generation for project:', project.name);
      
      const prompt = `
As an expert project management professional, create a comprehensive project scope statement that clearly defines what is included and excluded from this project to prevent scope creep and ensure stakeholder alignment.

**PROJECT CONTEXT:**
- Name: ${project.name}
- Industry: ${project.industry}
- Problem: ${project.problem_statement}

**GENERATE A DETAILED SCOPE STATEMENT WITH THESE SECTIONS:**

# Project Scope Statement: ${project.name}

## 1. Project Description

**Project Overview:**
[Comprehensive description of what this project will accomplish, the approach that will be taken, and the value it will deliver]

**Project Justification:**
[Why this project is being undertaken and its alignment with business strategy]

**Product/Service Description:**
[Detailed description of the final product or service that will be delivered]

## 2. Project Deliverables

### Major Deliverables

**1. [Deliverable Name]**
- **Description**: [What will be delivered]
- **Acceptance Criteria**: 
  - [Specific, measurable criteria for acceptance]
  - [Quality standards that must be met]
  - [Performance requirements]
- **Due Date**: [Target completion date]
- **Responsible Party**: [Team/role responsible for delivery]

**2. [Deliverable Name]**
- **Description**: [What will be delivered]
- **Acceptance Criteria**: 
  - [Specific, measurable criteria for acceptance]
  - [Quality standards that must be met]
  - [Performance requirements]
- **Due Date**: [Target completion date]
- **Responsible Party**: [Team/role responsible for delivery]

**3. [Deliverable Name]**
- **Description**: [What will be delivered]
- **Acceptance Criteria**: 
  - [Specific, measurable criteria for acceptance]
  - [Quality standards that must be met]
  - [Performance requirements]
- **Due Date**: [Target completion date]
- **Responsible Party**: [Team/role responsible for delivery]

### Supporting Deliverables

- **Project Documentation**: [Technical specs, user guides, training materials]
- **Testing & Quality Assurance**: [Test plans, test results, quality reports]
- **Deployment & Launch**: [Deployment guides, launch plans, go-live support]

## 3. Project Acceptance Criteria

**Overall Project Success Criteria:**
1. **Functional Requirements**: [All specified functionality works as designed]
2. **Performance Requirements**: [System performance meets specified benchmarks]
3. **Quality Requirements**: [Quality standards and testing criteria are met]
4. **User Acceptance**: [End users can successfully complete intended tasks]
5. **Business Requirements**: [Project delivers intended business value]

**Acceptance Process:**
- **Testing Phase**: [Duration and scope of testing]
- **User Acceptance Testing**: [Who conducts UAT and success criteria]
- **Final Acceptance**: [Who provides final project acceptance]
- **Documentation Requirements**: [Required deliverable documentation]

## 4. Project Boundaries - What's Included

**Functional Scope - IN SCOPE:**
- [Specific functionality that WILL be included]
- [Features that WILL be developed]
- [Processes that WILL be addressed]
- [Systems that WILL be integrated]
- [User groups that WILL be served]

**Geographic Scope:**
- [Locations/regions where solution will be deployed]
- [Market segments that will be addressed]

**Organizational Scope:**
- [Business units/departments involved]
- [User groups that will have access]
- [Stakeholder groups that will be impacted]

**Technical Scope:**
- [Technologies that will be used]
- [Platforms that will be supported]
- [Integration points that will be implemented]

## 5. Project Boundaries - What's Excluded

**Functional Scope - OUT OF SCOPE:**
- [Specific functionality that will NOT be included]
- [Features that will NOT be developed in this phase]
- [Processes that will NOT be changed]
- [Systems that will NOT be integrated]
- [Advanced features reserved for future phases]

**Exclusions with Rationale:**
- **[Excluded item]**: [Reason for exclusion - budget/timeline/complexity]
- **[Excluded item]**: [Reason for exclusion - out of scope/future phase]
- **[Excluded item]**: [Reason for exclusion - technical constraints]

**Future Phase Considerations:**
- [Features planned for Phase 2]
- [Enhancements that may be considered later]
- [Scalability features for future implementation]

## 6. Project Assumptions

**Technical Assumptions:**
- [Technology platforms and tools will be available as planned]
- [Integration points will function as documented]
- [Performance requirements are achievable with selected architecture]

**Resource Assumptions:**
- [Required team members will be available when needed]
- [Necessary skills and expertise exist within the team or can be acquired]
- [Budget will be available as planned throughout project duration]

**Business Assumptions:**
- [Market conditions will remain stable during development]
- [Business requirements will not change significantly during project]
- [Stakeholder availability for reviews and approvals]

**External Assumptions:**
- [Third-party services will be available and perform as expected]
- [Regulatory environment will remain stable]
- [Market demand will exist when product launches]

## 7. Project Constraints

**Time Constraints:**
- **Project Duration**: [Start date] to [End date]
- **Critical Deadlines**: [Market launch dates, regulatory deadlines]
- **Resource Availability**: [Team member availability windows]

**Budget Constraints:**
- **Total Budget**: $[Amount]
- **Budget Allocation**: [Breakdown by category]
- **Funding Schedule**: [When funds will be available]

**Resource Constraints:**
- **Team Size**: Limited to [number] full-time equivalent resources
- **Skill Availability**: [Specific expertise limitations]
- **Technology Constraints**: [Platform limitations or requirements]

**Quality Constraints:**
- **Performance Standards**: [Minimum acceptable performance levels]
- **Compliance Requirements**: [Regulatory or industry standards]
- **Security Requirements**: [Security standards that must be met]

## 8. Work Breakdown Structure (High-Level)

**1.0 Project Management**
- 1.1 Project Planning & Setup
- 1.2 Project Monitoring & Control
- 1.3 Stakeholder Communication
- 1.4 Project Closure

**2.0 Requirements & Design**
- 2.1 Requirements Gathering
- 2.2 System Design & Architecture
- 2.3 User Experience Design
- 2.4 Technical Specifications

**3.0 Development & Implementation**
- 3.1 Core Feature Development
- 3.2 Integration Development
- 3.3 Testing & Quality Assurance
- 3.4 Documentation Creation

**4.0 Deployment & Launch**
- 4.1 Production Environment Setup
- 4.2 Deployment & Configuration
- 4.3 User Training & Support
- 4.4 Go-Live & Launch Activities

## 9. Risk Considerations

**Scope-Related Risks:**
- **Scope Creep**: [Risk of uncontrolled scope expansion]
  - **Mitigation**: [Formal change control process]
  
- **Requirement Changes**: [Risk of changing business requirements]
  - **Mitigation**: [Regular stakeholder reviews and approval gates]

- **Technical Complexity**: [Risk that technical challenges exceed estimates]
  - **Mitigation**: [Technical proof-of-concepts and expert consultation]

## 10. Change Control Process

**Scope Change Management:**
- **Change Request Process**: [How changes are submitted and documented]
- **Impact Assessment**: [Analysis required for all change requests]
- **Approval Authority**: 
  - Minor changes (< $[amount] or [X] days): Project Manager
  - Major changes: Project Sponsor approval required
  - Critical changes: Steering Committee approval required

**Change Documentation:**
- All approved changes will be documented and communicated
- Scope baseline will be updated for approved changes
- Impact on timeline, budget, and resources will be tracked

---

**Scope Statement Approval:**

This scope statement represents the agreed-upon boundaries for the ${project.name} project. Any work outside this scope requires formal change approval.

| Role | Name | Date |
|------|------|------|
| Project Manager | [Name] | _____ |
| Project Sponsor | [Name] | _____ |
| Business Owner | [Name] | _____ |

*This scope statement will be used as the baseline for project execution and change control.*
`;

      const response = await ai.chat.completions.create({
        model: 'default',
        messages: [
          {
            role: 'system',
            content: 'You are an expert project management professional with extensive experience in creating detailed scope statements that prevent scope creep and ensure clear project boundaries.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 3500
      });

      const content = response.choices[0]?.message?.content || '';
      return {
        success: true,
        content
      };
    } catch (error) {
      console.error('Failed to generate scope statement:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // RFP Generation
  static async generateRFP(project: MVPProject, context?: string): Promise<AIGenerationResponse> {
    try {
      console.log('Starting RFP generation for project:', project.name);
      
      const prompt = `
As an expert procurement specialist, create a comprehensive Request for Proposal (RFP) document to solicit vendor bids for implementing this project solution.

**PROJECT CONTEXT:**
- Name: ${project.name}
- Industry: ${project.industry}
- Problem: ${project.problem_statement}
- Additional Context: ${context || 'Standard RFP for solution development'}

**GENERATE A DETAILED RFP DOCUMENT WITH THESE SECTIONS:**

# Request for Proposal (RFP)
## ${project.name} Solution Development

### RFP Reference Number: RFP-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}
### Issue Date: [Current Date]

---

## 1. Introduction & Background

**Issuing Organization:** [Organization Name]

**Project Background:**
[Comprehensive background explaining the business context, current situation, and strategic importance of this project]

**Business Challenge:**
${project.problem_statement}

**Strategic Objectives:**
- [Primary objective aligned with business strategy]
- [Secondary objective that supports growth]
- [Operational objective for efficiency]

## 2. Project Overview & Scope

**Project Description:**
[Detailed description of what we want to accomplish with this project and the expected outcomes]

**Scope of Work:**
The selected vendor will be responsible for:

**Phase 1: Analysis & Planning (Weeks 1-4)**
- Conduct detailed requirements analysis
- Create technical architecture design  
- Develop project implementation plan
- Define success metrics and KPIs

**Phase 2: Solution Development (Weeks 5-16)**
- Develop core functionality and features
- Implement user interface and user experience
- Conduct integration with existing systems
- Perform comprehensive testing

**Phase 3: Deployment & Support (Weeks 17-20)**
- Deploy solution to production environment
- Provide user training and documentation
- Execute go-live and launch activities
- Provide post-launch support and optimization

**Expected Project Duration:** 20 weeks from contract award

## 3. Detailed Requirements

### 3.1 Functional Requirements

**Must-Have Requirements (Priority 1):**
1. **[Requirement Category]**: [Detailed description of functionality]
   - Acceptance Criteria: [Specific, measurable criteria]
   - Success Metrics: [How success will be measured]

2. **[Requirement Category]**: [Detailed description of functionality]
   - Acceptance Criteria: [Specific, measurable criteria]
   - Success Metrics: [How success will be measured]

3. **[Requirement Category]**: [Detailed description of functionality]
   - Acceptance Criteria: [Specific, measurable criteria]
   - Success Metrics: [How success will be measured]

**Should-Have Requirements (Priority 2):**
- [Feature/functionality that would add significant value]
- [Integration or capability that enhances the solution]
- [User experience enhancement]

**Nice-to-Have Requirements (Priority 3):**
- [Advanced features for future consideration]
- [Optional integrations or capabilities]

### 3.2 Technical Requirements

**Platform Requirements:**
- [Operating system requirements]
- [Browser compatibility requirements]
- [Mobile device support requirements]

**Performance Requirements:**
- **Response Time**: [Maximum acceptable response times]
- **Concurrent Users**: Support for [number] simultaneous users
- **Uptime**: [Percentage] availability requirement
- **Scalability**: Ability to scale to [growth projections]

**Security Requirements:**
- [Data encryption standards]
- [Authentication and authorization requirements]
- [Compliance requirements (GDPR, HIPAA, etc.)]
- [Security testing and audit requirements]

**Integration Requirements:**
- [Existing systems that must be integrated]
- [APIs that must be supported]
- [Data migration requirements]

## 4. Vendor Qualifications

**Minimum Qualifications:**
- **Experience**: Minimum [X] years developing similar solutions in ${project.industry}
- **Team Size**: Ability to dedicate [number] full-time resources to this project
- **Technical Expertise**: Demonstrated experience with [specific technologies]
- **Portfolio**: At least [number] similar projects completed in the last [timeframe]

**Preferred Qualifications:**
- Industry certifications relevant to ${project.industry}
- Experience with [specific tools/platforms]
- Local presence or ability to provide on-site support
- References from similar-sized organizations

**Required Vendor Information:**
- Company overview and history
- Project team member profiles and experience
- Project methodology and approach
- References from last 3 similar projects
- Financial stability documentation

## 5. Proposal Requirements

### 5.1 Technical Proposal

**Technical Approach:**
- Detailed solution architecture and design approach
- Development methodology (Agile, Waterfall, hybrid)
- Technology stack and rationale for choices
- Integration strategy with existing systems
- Data migration and conversion approach

**Project Plan:**
- Detailed work breakdown structure
- Project timeline with key milestones
- Resource allocation and team structure
- Risk management approach
- Quality assurance and testing strategy

**Deliverables:**
- Complete list of project deliverables
- Acceptance criteria for each deliverable
- Documentation and training materials included

### 5.2 Management Proposal

**Project Team:**
- Project manager qualifications and experience
- Key team member profiles and roles
- Organizational chart for project team
- Communication and reporting structure

**Project Management Approach:**
- Project management methodology
- Communication plan and reporting frequency
- Change management process
- Issue escalation procedures

### 5.3 Commercial Proposal

**Cost Structure:**
- Fixed price for complete solution (preferred)
- OR detailed breakdown by project phase
- Any assumptions included in pricing
- Payment terms and schedule

**Cost Breakdown:**
- Development costs
- Project management costs
- Testing and quality assurance
- Documentation and training
- Post-launch support (first 90 days)

**Optional Services:**
- Extended support and maintenance
- Additional training or consulting
- Future enhancement services

## 6. Evaluation Criteria

**Proposals will be evaluated based on the following weighted criteria:**

| Criteria | Weight | Evaluation Factors |
|----------|--------|-------------------|
| Technical Approach | 35% | Solution quality, innovation, feasibility |
| Team Qualifications | 25% | Experience, expertise, references |
| Project Management | 20% | Methodology, timeline, risk management |
| Cost | 15% | Total cost, value for money |
| Company Qualifications | 5% | Stability, local presence, culture fit |

**Evaluation Process:**
1. **Initial Review**: Compliance with RFP requirements
2. **Technical Evaluation**: Assessment of technical merit
3. **Vendor Presentations**: Top 3 vendors present to evaluation committee
4. **Reference Checks**: Contact provided references
5. **Final Selection**: Vendor selection and contract negotiation

## 7. RFP Timeline

| Milestone | Date | Description |
|-----------|------|-------------|
| RFP Issue Date | [Date] | RFP published and distributed |
| Vendor Questions Due | [Date + 1 week] | Last date for vendor questions |
| Answers Published | [Date + 2 weeks] | Responses to vendor questions |
| Proposals Due | [Date + 4 weeks] | Final proposal submission deadline |
| Vendor Presentations | [Date + 5-6 weeks] | Top vendors present solutions |
| Vendor Selection | [Date + 7 weeks] | Final vendor selection announced |
| Contract Award | [Date + 8 weeks] | Contract signed and project begins |

## 8. Submission Requirements

**Proposal Format:**
- Maximum 50 pages for main proposal
- Additional appendices as needed
- PDF format required
- Clearly labeled sections matching RFP structure

**Submission Details:**
- **Due Date**: [Date and time]
- **Submission Method**: [Email/portal/physical delivery]
- **Contact Person**: [Name, title, email, phone]
- **Required Copies**: [Number] hard copies + [Number] electronic copies

**Mandatory Documents:**
- Signed proposal cover letter
- Company information and qualifications
- Project team resumes
- Client references (minimum 3)
- Sample work or portfolio examples
- Financial statements or capability documentation

## 9. Terms & Conditions

**Contract Terms:**
- Contract duration: [Project timeline + support period]
- Payment terms: [Payment schedule]
- Intellectual property: [IP ownership arrangements]
- Confidentiality requirements
- Liability and insurance requirements

**Vendor Responsibilities:**
- All development and implementation work
- Project management and coordination
- Testing and quality assurance
- User training and documentation
- Post-launch support as specified

**Client Responsibilities:**
- Timely review and approval of deliverables
- Access to subject matter experts
- Necessary approvals and decisions
- Testing participation and feedback

## 10. Contact Information

**Primary Contact:**
[Name]
[Title]
[Organization]
[Email]
[Phone]

**Questions & Clarifications:**
All questions must be submitted in writing by [date]. Responses will be provided to all vendors by [date].

**RFP Administration:**
[Name]
[Title]
[Email]
[Phone]

---

**This RFP represents a significant opportunity to partner with [Organization] on an important strategic initiative. We look forward to receiving your proposal and learning how your team can help us achieve our project objectives.**

*This RFP is confidential and proprietary. Vendors may not share this document or project information with third parties without written consent.*
`;

      // Use Kimi model for detailed procurement analysis, fallback to default
      let response;
      try {
        response = await ai.chat.completions.create({
          model: 'kimi-k2-0711-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert procurement specialist with extensive experience in creating comprehensive RFP documents that attract qualified vendors and facilitate effective vendor selection.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        });
      } catch (kimiError) {
        console.log('Kimi model failed, falling back to default model:', kimiError);
        response = await ai.chat.completions.create({
          model: 'default',
          messages: [
            {
              role: 'system',
              content: 'You are an expert procurement specialist with extensive experience in creating comprehensive RFP documents that attract qualified vendors and facilitate effective vendor selection.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        });
      }

      const content = response.choices[0]?.message?.content || '';
      return {
        success: true,
        content
      };
    } catch (error) {
      console.error('Failed to generate RFP:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // RFP vs RFQ Comparison Generator
  static async generateProcurementComparison(project: MVPProject): Promise<AIGenerationResponse> {
    try {
      console.log('Starting procurement comparison generation for project:', project.name);
      
      const prompt = `
As an expert procurement specialist, create a comprehensive comparison between RFP (Request for Proposal) and RFQ (Request for Quotation) approaches for this project, with a specific recommendation.

**PROJECT CONTEXT:**
- Name: ${project.name}
- Industry: ${project.industry}
- Problem: ${project.problem_statement}

**GENERATE A DETAILED RFP vs RFQ COMPARISON WITH THESE SECTIONS:**

# Procurement Strategy Analysis: RFP vs RFQ
## ${project.name} Project

---

## 1. Executive Summary

**Project Assessment:**
Based on the project requirements for ${project.name} in the ${project.industry} industry, this analysis compares two procurement approaches to determine the optimal vendor selection strategy.

**Quick Recommendation:** [RFP/RFQ/Hybrid Approach] is recommended for this project.

**Key Reasoning:** [Brief explanation of why this approach is best suited]

---

## 2. RFP (Request for Proposal) Analysis

### 2.1 RFP Overview
**Primary Focus:** Solution & Value 💡

**When RFP is Most Appropriate:**
- You know the problem you have, but are open to different solutions
- Complex projects requiring creative problem-solving
- When vendor expertise and approach are as important as price
- Multiple solution paths are possible
- Long-term partnerships are desired

**For ${project.name} Specifically:**
[Analysis of how RFP approach would work for this specific project]

### 2.2 RFP Process Details

**Vendor's Role in RFP:**
- Propose comprehensive solutions including methodology, team, and pricing
- Demonstrate understanding of business challenges
- Provide creative and innovative approaches
- Show relevant experience and case studies
- Present detailed project plans and timelines

**Decision Criteria:**
A combination of factors including:
- **Technical Solution Quality** (35%): Innovation, feasibility, completeness
- **Vendor Experience & Team** (25%): Track record, expertise, references  
- **Project Approach** (20%): Methodology, timeline, risk management
- **Cost** (15%): Total value for money, not just lowest price
- **Company Qualifications** (5%): Stability, cultural fit, support

**Typical RFP Timeline:**
- RFP Development: 2-3 weeks
- Vendor Response Period: 4-6 weeks
- Evaluation & Selection: 3-4 weeks
- **Total Timeline**: 9-13 weeks

**Example RFP Scenario for This Project:**
"We need to ${project.problem_statement.toLowerCase()}. We're open to different technological approaches and want vendors to propose their best solution, methodology, and team to address this challenge."

### 2.3 RFP Advantages for This Project

**Pros:**
- ✅ Allows for innovative and creative solutions
- ✅ Vendors compete on value, not just price
- ✅ Comprehensive evaluation of vendor capabilities
- ✅ Better long-term partnership potential
- ✅ Detailed project planning before selection
- ✅ Risk mitigation through thorough vendor vetting

**Cons:**
- ❌ Longer procurement timeline
- ❌ More complex evaluation process
- ❌ Higher administrative burden
- ❌ May result in higher costs
- ❌ Requires detailed RFP document creation

---

## 3. RFQ (Request for Quotation) Analysis

### 3.1 RFQ Overview
**Primary Focus:** Price 💲

**When RFQ is Most Appropriate:**
- You know exactly what you need with specific, clear requirements
- Solution approach is well-defined and standardized
- Price is the primary selection criterion
- Minimal customization required
- Quick procurement timeline needed

**For ${project.name} Specifically:**
[Analysis of how RFQ approach would work for this specific project]

### 3.2 RFQ Process Details

**Vendor's Role in RFQ:**
- Provide competitive pricing for predefined specifications
- Confirm ability to deliver exactly what's specified
- Meet minimum qualification requirements
- Provide delivery timeline and terms
- Limited scope for proposing alternatives

**Decision Criteria:**
- **Price** (60-80%): Lowest price meeting all requirements
- **Delivery Timeline** (15-20%): Speed and reliability of delivery
- **Vendor Qualifications** (10-15%): Basic capability confirmation
- **Terms & Conditions** (5-10%): Payment terms, warranties

**Typical RFQ Timeline:**
- RFQ Development: 1-2 weeks
- Vendor Response Period: 2-3 weeks
- Evaluation & Selection: 1-2 weeks
- **Total Timeline**: 4-7 weeks

**Example RFQ Scenario for This Project:**
"We need exactly [specific solution specification] delivered by [date]. Please provide your best price for this exact scope of work with minimal variations."

### 3.3 RFQ Advantages for This Project

**Pros:**
- ✅ Fast procurement process
- ✅ Clear price comparison
- ✅ Simple evaluation criteria
- ✅ Lower administrative overhead
- ✅ Competitive pricing pressure
- ✅ Quick vendor selection

**Cons:**
- ❌ Limited innovation and creativity
- ❌ May miss better solution approaches
- ❌ Price-focused rather than value-focused
- ❌ Less vendor engagement in problem-solving
- ❌ Minimal partnership development
- ❌ Higher risk if requirements are incomplete

---

## 4. Project-Specific Analysis

### 4.1 Requirements Clarity Assessment

**Current Requirement Definition Level:** [High/Medium/Low]

**Analysis:**
- **Well-Defined Aspects**: [List what's clearly specified]
- **Areas Needing Exploration**: [List what needs vendor input]
- **Technical Complexity**: [Assessment of complexity level]

**Implication for Procurement Approach:**
[How the requirement clarity impacts RFP vs RFQ choice]

### 4.2 Solution Complexity Assessment

**Technical Complexity:** [High/Medium/Low]
- Custom development required: [Yes/No - explanation]
- Integration complexity: [Assessment]
- Innovation requirements: [Level of creativity needed]

**Business Complexity:** [High/Medium/Low]
- Stakeholder alignment needed: [Assessment]
- Change management required: [Level]
- Multiple solution paths possible: [Yes/No]

**Implication for Vendor Selection:**
[How complexity impacts the need for vendor expertise vs. standardized delivery]

### 4.3 Timeline & Budget Considerations

**Project Urgency:** [High/Medium/Low]
- Target completion date: [Assessment of timeline pressure]
- Market timing factors: [Any time-sensitive considerations]

**Budget Approach:**
- Fixed budget available: [Yes/No]
- Cost vs. value priority: [Which is more important]
- Long-term investment considerations: [ROI timeline]

---

## 5. Comparative Analysis

### 5.1 Side-by-Side Comparison

| Factor | RFP Approach | RFQ Approach | Best for This Project |
|--------|--------------|--------------|----------------------|
| **Timeline** | 9-13 weeks | 4-7 weeks | [RFP/RFQ] - [Reasoning] |
| **Innovation** | High | Low | [RFP/RFQ] - [Reasoning] |
| **Cost Control** | Moderate | High | [RFP/RFQ] - [Reasoning] |
| **Vendor Partnership** | Strong | Limited | [RFP/RFQ] - [Reasoning] |
| **Risk Management** | Comprehensive | Basic | [RFP/RFQ] - [Reasoning] |
| **Quality Assurance** | High | Standard | [RFP/RFQ] - [Reasoning] |

### 5.2 Scenario-Based Recommendations

**Scenario 1: If Timeline is Critical**
- **Recommendation**: [RFP/RFQ]
- **Rationale**: [Explanation]
- **Modifications**: [Any adjustments needed]

**Scenario 2: If Budget is Primary Concern**
- **Recommendation**: [RFP/RFQ]  
- **Rationale**: [Explanation]
- **Risk Mitigation**: [How to manage risks]

**Scenario 3: If Innovation is Essential**
- **Recommendation**: [RFP/RFQ]
- **Rationale**: [Explanation]
- **Success Factors**: [What to emphasize]

---

## 6. Final Recommendation

### 6.1 Recommended Approach: [RFP/RFQ/Hybrid]

**Primary Reasoning:**
[Detailed explanation of why this approach is best for this specific project, considering all factors analyzed above]

**Specific Recommendations for ${project.name}:**
1. **[Specific recommendation 1]**: [Why this is important for this project]
2. **[Specific recommendation 2]**: [How this addresses project needs]
3. **[Specific recommendation 3]**: [What this will achieve]

### 6.2 Implementation Strategy

**Phase 1: Preparation (Weeks 1-2)**
- [ ] Define detailed requirements and specifications
- [ ] Identify qualified vendor pool
- [ ] Develop evaluation criteria and scoring methodology
- [ ] Create [RFP/RFQ] document with legal review

**Phase 2: Vendor Engagement (Weeks 3-6)**
- [ ] Issue [RFP/RFQ] to qualified vendors
- [ ] Conduct vendor Q&A session
- [ ] Receive and log vendor responses
- [ ] Initial compliance and qualification review

**Phase 3: Evaluation & Selection (Weeks 7-9)**
- [ ] Detailed proposal evaluation
- [ ] Vendor presentations (if RFP approach)
- [ ] Reference checks and due diligence
- [ ] Final vendor selection and negotiation

### 6.3 Success Factors

**Critical Success Factors:**
1. **[Factor 1]**: [Why critical and how to ensure]
2. **[Factor 2]**: [Why critical and how to ensure]
3. **[Factor 3]**: [Why critical and how to ensure]

**Key Performance Indicators:**
- **Vendor Response Quality**: [How to measure]
- **Timeline Adherence**: [Milestones to track]
- **Cost Effectiveness**: [Value metrics]

### 6.4 Risk Mitigation

**Top Risks and Mitigation Strategies:**
- **Risk 1**: [Specific risk] → **Mitigation**: [Specific action]
- **Risk 2**: [Specific risk] → **Mitigation**: [Specific action]
- **Risk 3**: [Specific risk] → **Mitigation**: [Specific action]

---

## 7. Next Steps

**Immediate Actions (Next 2 Weeks):**
1. [ ] Stakeholder alignment on procurement approach
2. [ ] Budget and timeline confirmation
3. [ ] Procurement team assembly
4. [ ] Legal and compliance review preparation

**Procurement Preparation (Weeks 3-4):**
1. [ ] [RFP/RFQ] document development
2. [ ] Vendor identification and qualification
3. [ ] Evaluation committee formation
4. [ ] Communication plan development

**Timeline to Contract Award:** [X] weeks from approval

---

*This analysis is based on current project understanding and market conditions. Recommendations should be validated with stakeholders before proceeding with vendor selection process.*
`;

      const response = await ai.chat.completions.create({
        model: 'default',
        messages: [
          {
            role: 'system',
            content: 'You are an expert procurement strategist with extensive experience in vendor selection processes, RFP/RFQ management, and procurement best practices across multiple industries.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
      });

      const content = response.choices[0]?.message?.content || '';
      return {
        success: true,
        content
      };
    } catch (error) {
      console.error('Failed to generate procurement comparison:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Enterprise Integration Methods
  static async createIntegration(integration: any): Promise<any> {
    try {
      const tableApi = table;
      
      await tableApi.addItem(TABLES.ENTERPRISE_INTEGRATIONS, {
        integration_id: integration.id,
        name: integration.name,
        type: integration.type,
        status: integration.status,
        site_url: integration.configuration.site_url || '',
        configuration: JSON.stringify(integration.configuration),
        last_sync: integration.last_sync || 0,
        created_at: integration.created_at,
        updated_at: integration.updated_at
      });

      return integration;
    } catch (error) {
      console.error('Error creating integration:', error);
      throw error;
    }
  }

  static async getIntegrations(): Promise<any[]> {
    try {
      const tableApi = table;
      const items = await tableApi.getItems(TABLES.ENTERPRISE_INTEGRATIONS);
      
      return items.items.map((item: any) => ({
        id: item.integration_id,
        name: item.name,
        type: item.type,
        status: item.status,
        configuration: JSON.parse(item.configuration || '{}'),
        last_sync: item.last_sync,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error fetching integrations:', error);
      return [];
    }
  }

  static async updateIntegration(id: string, updates: any): Promise<any> {
    try {
      const tableApi = table;
      const currentItems = await tableApi.getItems(TABLES.ENTERPRISE_INTEGRATIONS, {
        query: { integration_id: id }
      });

      if (currentItems.items.length === 0) {
        throw new Error('Integration not found');
      }

      const currentItem = currentItems.items[0];
      
      await tableApi.updateItem(TABLES.ENTERPRISE_INTEGRATIONS, {
        _uid: currentItem._uid,
        _id: currentItem._id,
        name: updates.name || currentItem.name,
        status: updates.status || currentItem.status,
        site_url: updates.configuration?.site_url || currentItem.site_url,
        configuration: JSON.stringify({ 
          ...JSON.parse(currentItem.configuration || '{}'), 
          ...updates.configuration 
        }),
        last_sync: updates.last_sync || currentItem.last_sync,
        updated_at: Date.now()
      });

      return { id, ...updates };
    } catch (error) {
      console.error('Error updating integration:', error);
      throw error;
    }
  }

  static async deleteIntegration(id: string): Promise<void> {
    try {
      const tableApi = table;
      const items = await tableApi.getItems(TABLES.ENTERPRISE_INTEGRATIONS, {
        query: { integration_id: id }
      });

      if (items.items.length === 0) {
        throw new Error('Integration not found');
      }

      const item = items.items[0];
      await tableApi.deleteItem(TABLES.ENTERPRISE_INTEGRATIONS, {
        _uid: item._uid,
        _id: item._id
      });
    } catch (error) {
      console.error('Error deleting integration:', error);
      throw error;
    }
  }

  // Export Job Methods
  static async createExportJob(job: any): Promise<any> {
    try {
      const tableApi = table;
      
      await tableApi.addItem(TABLES.EXPORT_JOBS, {
        project_id: job.project_id,
        document_ids: JSON.stringify(job.document_ids),
        integration_id: job.integration_id,
        integration_type: job.integration_type,
        export_format: job.export_format,
        status: job.status,
        progress: job.progress,
        total_documents: job.total_documents,
        processed_documents: job.processed_documents,
        export_results: JSON.stringify(job.export_results || []),
        error_message: job.error_message || '',
        started_at: job.started_at,
        completed_at: job.completed_at || 0,
        exported_urls: JSON.stringify(job.exported_urls || [])
      });

      return job;
    } catch (error) {
      console.error('Error creating export job:', error);
      throw error;
    }
  }

  static async getExportJobs(projectId?: string): Promise<any[]> {
    try {
      const tableApi = table;
      const options = projectId ? { query: { project_id: projectId } } : {};
      const items = await tableApi.getItems(TABLES.EXPORT_JOBS, options);
      
      return items.items.map((item: any) => ({
        _id: item._id,
        _uid: item._uid,
        _tid: item._tid,
        project_id: item.project_id,
        document_ids: JSON.parse(item.document_ids || '[]'),
        integration_id: item.integration_id,
        integration_type: item.integration_type,
        export_format: item.export_format,
        status: item.status,
        progress: item.progress,
        total_documents: item.total_documents,
        processed_documents: item.processed_documents,
        export_results: JSON.parse(item.export_results || '[]'),
        error_message: item.error_message,
        started_at: item.started_at,
        completed_at: item.completed_at,
        exported_urls: JSON.parse(item.exported_urls || '[]')
      }));
    } catch (error) {
      console.error('Error fetching export jobs:', error);
      return [];
    }
  }

  static async updateExportJob(jobId: string, updates: any): Promise<any> {
    try {
      const tableApi = table;
      const items = await tableApi.getItems(TABLES.EXPORT_JOBS, {
        query: { _id: jobId }
      });

      if (items.items.length === 0) {
        throw new Error('Export job not found');
      }

      const currentItem = items.items[0];
      
      await tableApi.updateItem(TABLES.EXPORT_JOBS, {
        _uid: currentItem._uid,
        _id: currentItem._id,
        status: updates.status || currentItem.status,
        progress: updates.progress || currentItem.progress,
        processed_documents: updates.processed_documents || currentItem.processed_documents,
        export_results: JSON.stringify(updates.export_results || JSON.parse(currentItem.export_results || '[]')),
        error_message: updates.error_message || currentItem.error_message,
        completed_at: updates.completed_at || currentItem.completed_at,
        exported_urls: JSON.stringify(updates.exported_urls || JSON.parse(currentItem.exported_urls || '[]'))
      });

      return { _id: jobId, ...updates };
    } catch (error) {
      console.error('Error updating export job:', error);
      throw error;
    }
  }

  // SharePoint Export Methods
  static async exportToSharePoint(options: any): Promise<any> {
    try {
      // Import the enhanced enterprise integration service
      const { EnterpriseIntegrationService } = await import('./enterprise-integrations');
      
      // Get the documents and project data
      const documents = await this.getDocuments(options.project_id);
      const projects = await this.getProjects();
      const project = projects.find(p => p._id === options.project_id);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Filter documents based on selected IDs
      const selectedDocuments = documents.filter(doc => 
        options.document_ids.includes(doc._id)
      );
      
      // Get integration configuration (mock for now)
      const integration = {
        id: options.integration_id,
        type: 'sharepoint' as const,
        name: 'SharePoint Integration',
        status: 'connected' as const,
        configuration: {
          site_url: 'https://company.sharepoint.com',
          library_name: 'Documents',
          client_id: 'mock-client-id',
          tenant_id: 'mock-tenant-id',
          default_folder: 'KAIROS Projects',
          permissions: {
            read: ['everyone'],
            write: ['project-managers'],
            admin: ['administrators']
          }
        },
        created_at: Date.now(),
        updated_at: Date.now()
      };
      
      // Prepare batch export options
      const batchOptions = {
        documents: selectedDocuments,
        project,
        integration,
        format: options.export_format,
        options: {
          include_attachments: options.include_attachments || false,
          preserve_formatting: options.preserve_formatting || true,
          add_metadata: options.add_metadata || true,
          create_index_page: true,
          organize_by_type: true,
          enable_comments: true,
          set_permissions: true
        }
      };
      
      // Use the enhanced export service
      const exportJob = await EnterpriseIntegrationService.exportToSharePoint(batchOptions);
      await this.createExportJob(exportJob);
      
      return exportJob;
    } catch (error) {
      console.error('Error exporting to SharePoint:', error);
      throw error;
    }
  }

  static async simulateSharePointExport(jobId: string, options: any): Promise<void> {
    try {
      const totalDocs = options.document_ids.length;
      const results: any[] = [];
      
      for (let i = 0; i < totalDocs; i++) {
        const documentId = options.document_ids[i];
        const progress = Math.round(((i + 1) / totalDocs) * 100);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const success = Math.random() > 0.1;
        
        const result = {
          document_id: documentId,
          document_type: 'roadmap',
          status: success ? 'success' : 'failed',
          exported_url: success ? `https://company.sharepoint.com/sites/mvp-docs/${documentId}.docx` : undefined,
          error_message: success ? undefined : 'Network timeout during upload',
          file_size: success ? Math.floor(Math.random() * 500000) + 100000 : undefined,
          export_time: Date.now()
        };
        
        results.push(result);
        
        await this.updateExportJob(jobId, {
          progress,
          processed_documents: i + 1,
          export_results: results,
          status: i === totalDocs - 1 ? 'completed' : 'processing'
        });
      }
      
      await this.updateExportJob(jobId, {
        status: 'completed',
        completed_at: Date.now(),
        exported_urls: results
          .filter(r => r.status === 'success')
          .map(r => r.exported_url)
      });
      
    } catch (error) {
      await this.updateExportJob(jobId, {
        status: 'failed',
        error_message: error.message,
        completed_at: Date.now()
      });
    }
  }

  // Confluence Export Methods
  static async exportToConfluence(options: any): Promise<any> {
    try {
      // Import the enhanced enterprise integration service
      const { EnterpriseIntegrationService } = await import('./enterprise-integrations');
      
      // Get the documents and project data
      const documents = await this.getDocuments(options.project_id);
      const projects = await this.getProjects();
      const project = projects.find(p => p._id === options.project_id);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Filter documents based on selected IDs
      const selectedDocuments = documents.filter(doc => 
        options.document_ids.includes(doc._id)
      );
      
      // Get integration configuration (mock for now)
      const integration = {
        id: options.integration_id,
        type: 'confluence' as const,
        name: 'Confluence Integration',
        status: 'connected' as const,
        configuration: {
          base_url: 'https://company.atlassian.net',
          space_key: 'KAIROS',
          username: 'api-user@company.com',
          api_token: 'mock-api-token',
          cloud_id: 'mock-cloud-id',
          parent_page_id: '123456789',
          template_id: 'strategic-document-template',
          labels: ['kairos', 'strategic-planning', 'enterprise'],
          permissions: {
            view: ['confluence-users'],
            edit: ['project-managers'],
            admin: ['space-administrators']
          }
        },
        created_at: Date.now(),
        updated_at: Date.now()
      };
      
      // Prepare batch export options
      const batchOptions = {
        documents: selectedDocuments,
        project,
        integration,
        format: options.export_format,
        options: {
          include_attachments: options.include_attachments || false,
          preserve_formatting: options.preserve_formatting || true,
          add_metadata: options.add_metadata || true,
          create_index_page: true,
          organize_by_type: true,
          enable_comments: true,
          set_permissions: true
        }
      };
      
      // Use the enhanced export service
      const exportJob = await EnterpriseIntegrationService.exportToConfluence(batchOptions);
      await this.createExportJob(exportJob);
      
      return exportJob;
    } catch (error) {
      console.error('Error exporting to Confluence:', error);
      throw error;
    }
  }

  static async simulateConfluenceExport(jobId: string, options: any): Promise<void> {
    try {
      const totalDocs = options.document_ids.length;
      const results: any[] = [];
      
      for (let i = 0; i < totalDocs; i++) {
        const documentId = options.document_ids[i];
        const progress = Math.round(((i + 1) / totalDocs) * 100);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const success = Math.random() > 0.15;
        
        const result = {
          document_id: documentId,
          document_type: 'roadmap',
          status: success ? 'success' : 'failed',
          exported_url: success ? `https://company.atlassian.net/wiki/spaces/MVP/pages/${Math.floor(Math.random() * 1000000)}` : undefined,
          error_message: success ? undefined : 'Permission denied - insufficient space access',
          file_size: success ? Math.floor(Math.random() * 300000) + 50000 : undefined,
          export_time: Date.now()
        };
        
        results.push(result);
        
        await this.updateExportJob(jobId, {
          progress,
          processed_documents: i + 1,
          export_results: results,
          status: i === totalDocs - 1 ? 'completed' : 'processing'
        });
      }
      
      await this.updateExportJob(jobId, {
        status: 'completed',
        completed_at: Date.now(),
        exported_urls: results
          .filter(r => r.status === 'success')
          .map(r => r.exported_url)
      });
      
    } catch (error) {
      await this.updateExportJob(jobId, {
        status: 'failed',
        error_message: error.message,
        completed_at: Date.now()
      });
    }
  }

  // Enterprise Settings Methods
  static async getEnterpriseSettings(): Promise<any> {
    try {
      const tableApi = table;
      const items = await tableApi.getItems(TABLES.ENTERPRISE_SETTINGS);
      
      if (items.items.length === 0) {
        return {
          _uid: 'current_user',
          _tid: 'current_team',
          default_integration: null,
          auto_export_enabled: false,
          export_retention_days: 90,
          allowed_integrations: ['sharepoint', 'confluence'],
          security_settings: {
            require_approval: false,
            approved_domains: [],
            encryption_required: true,
            audit_logging: true,
            access_control_enabled: true
          },
          compliance_settings: {
            data_residency: ['US', 'EU'],
            retention_policy: '7_years',
            privacy_level: 'internal',
            compliance_standards: ['SOC2', 'GDPR']
          }
        };
      }
      
      const item = items[0];
      return {
        _id: item._id,
        _uid: item._uid,
        _tid: item._tid,
        default_integration: item.default_integration,
        auto_export_enabled: item.auto_export_enabled === 'true',
        export_retention_days: item.export_retention_days,
        allowed_integrations: JSON.parse(item.allowed_integrations || '[]'),
        security_settings: JSON.parse(item.security_settings || '{}'),
        compliance_settings: JSON.parse(item.compliance_settings || '{}'),
        created_at: item.created_at,
        updated_at: item.updated_at
      };
    } catch (error) {
      console.error('Error fetching enterprise settings:', error);
      return null;
    }
  }

  static async updateEnterpriseSettings(settings: any): Promise<any> {
    try {
      const tableApi = table;
      const existingItems = await tableApi.getItems(TABLES.ENTERPRISE_SETTINGS);
      
      if (existingItems.items.length === 0) {
        await tableApi.addItem(TABLES.ENTERPRISE_SETTINGS, {
          default_integration: settings.default_integration || '',
          auto_export_enabled: settings.auto_export_enabled ? 'true' : 'false',
          export_retention_days: settings.export_retention_days || 90,
          allowed_integrations: JSON.stringify(settings.allowed_integrations || []),
          security_settings: JSON.stringify(settings.security_settings || {}),
          compliance_settings: JSON.stringify(settings.compliance_settings || {}),
          created_at: Date.now(),
          updated_at: Date.now()
        });
      } else {
        const existingItem = existingItems[0];
        await tableApi.updateItem(TABLES.ENTERPRISE_SETTINGS, {
          _uid: existingItem._uid,
          _id: existingItem._id,
          default_integration: settings.default_integration || existingItem.default_integration,
          auto_export_enabled: settings.auto_export_enabled ? 'true' : 'false',
          export_retention_days: settings.export_retention_days || existingItem.export_retention_days,
          allowed_integrations: JSON.stringify(settings.allowed_integrations || JSON.parse(existingItem.allowed_integrations || '[]')),
          security_settings: JSON.stringify(settings.security_settings || JSON.parse(existingItem.security_settings || '{}')),
          compliance_settings: JSON.stringify(settings.compliance_settings || JSON.parse(existingItem.compliance_settings || '{}')),
          updated_at: Date.now()
        });
      }
      
      return settings;
    } catch (error) {
      console.error('Error updating enterprise settings:', error);
      throw error;
    }
  }
  // Enhanced AI Generation Methods
  static async generateWithPersona(
    documentType: string,
    project: MVPProject,
    additionalContext?: string
  ): Promise<AIGenerationResponse> {
    try {
      // Import enhanced AI service dynamically to avoid circular imports
      const { enhancedAI } = await import('@/lib/enhanced-ai');
      
      const response = await enhancedAI.generateWithPersona(documentType, project, additionalContext);
      
      return {
        success: true,
        content: response.content,
        model_used: response.model_used,
        persona_used: response.persona_used,
        quality_score: response.quality_score,
        generation_time: response.generation_time,
        token_count: response.token_count
      };
    } catch (error) {
      console.error('Enhanced AI generation failed:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Enhanced AI generation failed'
      };
    }
  }

  // Enhanced Diagram Generation Methods
  static async generateEnhancedDiagram(
    document: RoadmapDocument,
    project: MVPProject,
    diagramType?: string,
    complexity: 'simple' | 'detailed' | 'comprehensive' = 'detailed'
  ): Promise<{ success: boolean; code?: string; title?: string; error?: string }> {
    try {
      // Import enhanced diagram service dynamically
      const { enhancedDiagrams } = await import('@/lib/enhanced-diagrams');
      
      const request = {
        documentType: document.document_type,
        documentContent: document.content,
        project: project,
        diagramType: diagramType as any,
        complexity
      };
      
      const diagramCode = await enhancedDiagrams.generateDiagramFromDocument(request);
      
      return {
        success: true,
        code: diagramCode,
        title: `${document.title} - ${diagramType || 'Auto'} Diagram`
      };
    } catch (error) {
      console.error('Enhanced diagram generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Enhanced diagram generation failed'
      };
    }
  }

  static async generateDiagramVariations(
    document: RoadmapDocument,
    project: MVPProject
  ): Promise<{ success: boolean; variations?: Array<{ type: string; code: string; title: string }>; error?: string }> {
    try {
      const { enhancedDiagrams } = await import('@/lib/enhanced-diagrams');
      
      const request = {
        documentType: document.document_type,
        documentContent: document.content,
        project: project
      };
      
      const variations = await enhancedDiagrams.generateDiagramVariations(request);
      
      return {
        success: true,
        variations
      };
    } catch (error) {
      console.error('Diagram variations generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Diagram variations generation failed'
      };
    }
  }

  static async optimizeDiagram(
    diagramCode: string,
    project: MVPProject
  ): Promise<{ success: boolean; optimization?: any; error?: string }> {
    try {
      const { enhancedDiagrams } = await import('@/lib/enhanced-diagrams');
      
      const optimization = await enhancedDiagrams.optimizeDiagram(diagramCode, project);
      
      return {
        success: true,
        optimization
      };
    } catch (error) {
      console.error('Diagram optimization failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Diagram optimization failed'
      };
    }
  }

  // AI Analytics Methods
  static async getAIAnalytics(projectId?: string): Promise<{ 
    success: boolean; 
    analytics?: any; 
    error?: string 
  }> {
    try {
      // In a real implementation, this would query dedicated analytics tables
      // For now, we'll return enhanced mock data based on existing documents
      const documents = await this.getDocuments(projectId);
      
      const analytics = {
        totalGenerations: documents.length + Math.floor(Math.random() * 100) + 150,
        averageQualityScore: 85.2 + Math.random() * 8 - 4,
        averageGenerationTime: 3200 + Math.random() * 1500,
        successRate: 94.7 + Math.random() * 4 - 2,
        modelUsage: {
          'kimi-k2-0711-preview': {
            count: Math.floor(documents.length * 0.72),
            avgTime: 3200 + Math.random() * 800,
            avgQuality: 87.2 + Math.random() * 6 - 3,
            successRate: 96.5 + Math.random() * 3 - 1.5
          },
          'default': {
            count: Math.floor(documents.length * 0.28),
            avgTime: 2400 + Math.random() * 600,
            avgQuality: 82.1 + Math.random() * 8 - 4,
            successRate: 92.8 + Math.random() * 4 - 2
          }
        },
        documentTypeDistribution: {
          roadmap: { 
            count: documents.filter(d => d.document_type === 'roadmap').length + Math.floor(Math.random() * 20),
            avgTime: 4200, avgQuality: 86.5, complexity: 8 
          },
          business_case: { 
            count: documents.filter(d => d.document_type === 'business_case').length + Math.floor(Math.random() * 15),
            avgTime: 3800, avgQuality: 84.2, complexity: 7 
          },
          feasibility_study: { 
            count: documents.filter(d => d.document_type === 'feasibility_study').length + Math.floor(Math.random() * 12),
            avgTime: 4500, avgQuality: 88.1, complexity: 9 
          },
          project_charter: { 
            count: documents.filter(d => d.document_type === 'project_charter').length + Math.floor(Math.random() * 18),
            avgTime: 3200, avgQuality: 83.7, complexity: 6 
          },
          scope_statement: { 
            count: documents.filter(d => d.document_type === 'scope_statement').length + Math.floor(Math.random() * 10),
            avgTime: 2900, avgQuality: 81.9, complexity: 5 
          },
          rfp: { 
            count: documents.filter(d => d.document_type === 'rfp').length + Math.floor(Math.random() * 8),
            avgTime: 5200, avgQuality: 89.3, complexity: 10 
          }
        },
        userSatisfaction: {
          positive: Math.floor((documents.length + 100) * 0.78),
          neutral: Math.floor((documents.length + 100) * 0.16),
          negative: Math.floor((documents.length + 100) * 0.06)
        },
        costEfficiency: {
          totalTokens: (documents.length + 100) * (1200 + Math.random() * 800),
          avgCostPerGeneration: 0.045 + Math.random() * 0.025,
          monthlyCost: 45.50 + Math.random() * 25
        },
        qualityTrends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          score: 80 + Math.random() * 15 + Math.sin(i * 0.2) * 5,
          volume: Math.floor(5 + Math.random() * 20)
        })).reverse(),
        recentGenerations: documents.slice(0, 15).map(doc => ({
          id: doc._id,
          timestamp: doc.generated_at,
          documentType: doc.document_type,
          qualityScore: Math.max(70, Math.min(98, 85 + Math.random() * 20 - 10)),
          modelUsed: Math.random() > 0.3 ? 'kimi-k2-0711-preview' : 'default',
          projectName: doc.title.split(' - ')[0] || 'Unknown Project',
          generationTime: 2000 + Math.random() * 3000,
          tokenCount: 800 + Math.random() * 1200,
          userFeedback: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'positive' : 'negative') : undefined
        }))
      };
      
      return {
        success: true,
        analytics
      };
    } catch (error) {
      console.error('Failed to get AI analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get AI analytics'
      };
    }
  }

  // Contextual AI Assistance Methods
  static async getContextualSuggestions(
    document: RoadmapDocument,
    project: MVPProject
  ): Promise<{ success: boolean; suggestions?: string[]; error?: string }> {
    try {
      const { enhancedDiagrams } = await import('@/lib/enhanced-diagrams');
      
      const suggestions = await enhancedDiagrams.generateDiagramSuggestions(
        document.content,
        document.document_type
      );
      
      return {
        success: true,
        suggestions
      };
    } catch (error) {
      console.error('Failed to get contextual suggestions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get contextual suggestions'
      };
    }
  }
}

// Export diagram templates
export const DIAGRAM_TEMPLATES = [
  {
    id: 'user_journey',
    name: 'User Journey Map',
    type: 'user_journey' as const,
    description: 'Map user interactions and touchpoints',
    template: `journey
    title User Journey for MVP
    section Discovery
      User discovers problem: 3: User
      Searches for solutions: 4: User
      Finds our product: 5: User
    section Onboarding
      Signs up: 4: User
      Completes setup: 3: User
      First success: 5: User
    section Usage
      Regular usage: 5: User
      Advanced features: 4: User
      Becomes advocate: 5: User`
  },
  {
    id: 'system_architecture',
    name: 'System Architecture',
    type: 'flowchart' as const,
    description: 'High-level system architecture diagram',
    template: `flowchart TD
    A[User] --> B[Frontend App]
    B --> C[API Gateway]
    C --> D[Authentication Service]
    C --> E[Business Logic]
    E --> F[Database]
    E --> G[External APIs]
    B --> H[CDN/Static Assets]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#f1f8e9
    style G fill:#e0f2f1
    style H fill:#f9fbe7`
  },
  {
    id: 'development_timeline',
    name: 'Development Timeline',
    type: 'gantt' as const,
    description: 'Project development timeline with milestones',
    template: `gantt
    title MVP Development Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1 - Core Features
    User Authentication    :2024-01-01, 1w
    Basic UI/UX           :2024-01-08, 2w
    Core Functionality    :2024-01-15, 3w
    section Phase 2 - Enhancement
    Advanced Features     :2024-02-05, 2w
    Integration          :2024-02-19, 1w
    section Phase 3 - Launch
    Testing & QA         :2024-02-26, 1w
    Deployment           :2024-03-05, 3d
    Launch               :milestone, 2024-03-08, 0d`
  },
  {
    id: 'data_flow',
    name: 'Data Flow Diagram',
    type: 'flowchart' as const,
    description: 'How data flows through the system',
    template: `flowchart LR
    A[User Input] --> B[Validation]
    B --> C[Processing]
    C --> D[Storage]
    C --> E[Analytics]
    D --> F[API Response]
    E --> G[Insights Dashboard]
    F --> H[User Interface]
    
    style A fill:#ffebee
    style B fill:#e8eaf6
    style C fill:#e1f5fe
    style D fill:#e8f5e8
    style E fill:#fff3e0
    style F fill:#f3e5f5
    style G fill:#fce4ec
    style H fill:#f1f8e9`
  },
  {
    id: 'user_flow',
    name: 'User Flow',
    type: 'flowchart' as const,
    description: 'Step-by-step user interaction flow',
    template: `flowchart TD
    Start([User Visits App]) --> Auth{Authenticated?}
    Auth -->|No| Login[Login/Register]
    Auth -->|Yes| Dashboard[Dashboard]
    Login --> Dashboard
    Dashboard --> Action{User Action}
    Action --> Create[Create New]
    Action --> Edit[Edit Existing]
    Action --> View[View Details]
    Create --> Save[Save Changes]
    Edit --> Save
    View --> Action
    Save --> Success[Success Message]
    Success --> Dashboard
    
    style Start fill:#e8f5e8
    style Dashboard fill:#e1f5fe
    style Success fill:#f1f8e9`
  },
  {
    id: 'sequence_diagram',
    name: 'API Sequence Diagram',
    type: 'sequence' as const,
    description: 'API interaction sequence',
    template: `sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database
    
    U->>F: Enter data
    F->>A: POST /api/create
    A->>D: INSERT query
    D-->>A: Success response
    A-->>F: Created resource
    F-->>U: Success message
    
    Note over U,D: Successful creation flow
    
    U->>F: Request data
    F->>A: GET /api/resource
    A->>D: SELECT query
    D-->>A: Data results
    A-->>F: JSON response
    F-->>U: Display data`
  }
];