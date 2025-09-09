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
import { unifiedAI } from './unified-ai-service';

// Base API configuration
const API_BASE_URL = 'http://localhost:4000/api';

// Get auth token from auth store
const getAuthToken = (): string => {
  // Try to get from new simple auth store first
  try {
    const authData = localStorage.getItem('kairos-auth-user');
    if (authData) {
      const user = JSON.parse(authData);
      if (user?.uid) {
        console.log('✅ HTTP API: Found token from kairos-auth-user');
        return user.uid;
      }
    }
  } catch (e) {
    console.warn('Failed to parse new auth data:', e);
  }
  
  // Try to get from old auth store
  try {
    const authData = localStorage.getItem('mvp-auth-storage');
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed.state?.user?.uid) {
        console.log('✅ HTTP API: Found token from mvp-auth-storage');
        return parsed.state.user.uid;
      }
    }
  } catch (e) {
    console.warn('Failed to parse old auth data:', e);
  }
  
  // Fallback: try legacy storage methods
  const token = localStorage.getItem('auth-token');
  if (token) {
    console.log('✅ HTTP API: Found token from legacy auth-token');
    return token;
  }
  
  const userData = localStorage.getItem('kairos-user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.uid) {
        console.log('✅ HTTP API: Found token from legacy kairos-user');
        return user.uid;
      }
    } catch (e) {
      console.warn('Failed to parse user data:', e);
    }
  }
  
  // Demo fallback for HTTP API
  console.log('🎭 HTTP API: Using demo token (no user logged in)');
  return 'demo-http-token';
};

// HTTP client with authentication
const httpClient = {
  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Always include authorization header (demo token if not logged in)
    headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return response.json();
  },
  
  get(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'GET' });
  },
  
  post(endpoint: string, data: any): Promise<any> {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  put(endpoint: string, data: any): Promise<any> {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

export class HTTPAPIService {
  // Project Management
  static async createProject(projectData: Omit<MVPProject, '_id' | '_uid' | '_tid' | 'created_at' | 'updated_at'>): Promise<void> {
    await httpClient.post('/projects', projectData);
  }

  static async getProjects(): Promise<MVPProject[]> {
    const response = await httpClient.get('/projects');
    return response.items as MVPProject[];
  }

  static async updateProject(project: Partial<MVPProject> & { _id: string }): Promise<void> {
    const { _id, _uid, _tid, created_at, updated_at, ...updateData } = project;
    await httpClient.put(`/projects/${_id}`, updateData);
  }

  static async deleteProject(uid: string, projectId: string): Promise<void> {
    await httpClient.delete(`/projects/${projectId}`);
  }

  // Document Management
  static async saveDocument(documentData: Omit<RoadmapDocument, '_id' | '_uid' | '_tid' | 'generated_at' | 'status'>): Promise<void> {
    await httpClient.post('/documents', documentData);
  }

  static async updateRoadmapDocument(documentId: string, updates: Partial<Pick<RoadmapDocument, 'content' | 'title' | 'status'>>): Promise<void> {
    await httpClient.put(`/documents/${documentId}`, updates);
  }

  static async getDocuments(projectId?: string): Promise<RoadmapDocument[]> {
    const endpoint = projectId ? `/documents?project_id=${projectId}` : '/documents';
    const response = await httpClient.get(endpoint);
    return response.items as RoadmapDocument[];
  }

  static async deleteDocument(uid: string, documentId: string): Promise<void> {
    await httpClient.delete(`/documents/${documentId}`);
  }

  // Diagram Management
  static async saveDiagram(diagramData: Omit<UserDiagram, '_id' | '_uid' | '_tid' | 'created_at'>): Promise<void> {
    await httpClient.post('/diagrams', diagramData);
  }

  static async getDiagrams(projectId?: string): Promise<UserDiagram[]> {
    const endpoint = projectId ? `/diagrams?project_id=${projectId}` : '/diagrams';
    const response = await httpClient.get(endpoint);
    return response.items as UserDiagram[];
  }

  static async updateDiagram(diagram: Partial<UserDiagram> & { _id: string }): Promise<void> {
    const { _id, _uid, _tid, created_at, ...updateData } = diagram;
    await httpClient.put(`/diagrams/${_id}`, updateData);
  }

  static async deleteDiagram(uid: string, diagramId: string): Promise<void> {
    await httpClient.delete(`/diagrams/${diagramId}`);
  }

  // AI Generation Services (same as before, since these use LLM backend)
  static async checkAuthStatus(): Promise<boolean> {
    try {
      const token = getAuthToken();
      return !!token;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }
  
  // Chat with AI using the unified AI service
  static async chat(message: string, history: any[] = []): Promise<any> {
    try {
      // Simple chat functionality using the unified AI service
      const response = await fetch('http://localhost:4001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify({
          model: 'default',
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant for business planning and project management.' },
            ...history,
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Chat API failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || 'I apologize, but I cannot provide a response at this time.';

      return {
        success: true,
        content: content.trim(),
        id: Date.now().toString()
      };
    } catch (error) {
      console.error('Chat failed:', error);
      return {
        success: true,
        content: 'I apologize for the technical difficulty. I\'m here to help with your business planning and project management questions. Please try rephrasing your question.',
        error: error instanceof Error ? error.message : 'Chat request failed'
      };
    }
  }

  static async generateRoadmap(project: MVPProject): Promise<AIGenerationResponse> {
    return unifiedAI.generateDocument('roadmap', project);
  }

  static async generateElevatorPitch(project: MVPProject): Promise<AIGenerationResponse> {
    return unifiedAI.generateDocument('elevator_pitch', project);
  }

  static async generateModelAdvice(useCase: string, project: MVPProject): Promise<AIGenerationResponse> {
    return unifiedAI.generateDocument('model_advice', project, useCase);
  }

  // Document Enhancement via AI Chat
  static async enhanceDocument(
    document: RoadmapDocument,
    userInput: string,
    currentContent: string,
    project: MVPProject
  ): Promise<AIGenerationResponse & { enhancedContent?: string }> {
    return unifiedAI.enhanceDocument(document, userInput, currentContent, project);
  }

  // Generate Diagram from Document Content
  static async generateDiagramFromContent(
    document: RoadmapDocument,
    project: MVPProject
  ): Promise<AIGenerationResponse> {
    try {
      const { openSourceLLM } = await import('./open-source-llm');
      
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

      const response = await openSourceLLM.createChatCompletion({
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

  // Export Document to DOCX/PDF (same as before, client-side)
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

  // Business Case Generation
  static async generateBusinessCase(project: MVPProject): Promise<AIGenerationResponse> {
    return unifiedAI.generateDocument('business_case', project);
  }

  // Feasibility Study Generation
  static async generateFeasibilityStudy(project: MVPProject): Promise<AIGenerationResponse> {
    return unifiedAI.generateDocument('feasibility_study', project);
  }

  // Project Charter Generation
  static async generateProjectCharter(project: MVPProject): Promise<AIGenerationResponse> {
    return unifiedAI.generateDocument('project_charter', project);
  }

  // Scope Statement Generation
  static async generateScopeStatement(project: MVPProject): Promise<AIGenerationResponse> {
    return unifiedAI.generateDocument('scope_statement', project);
  }

  // RFP Generation
  static async generateRFP(project: MVPProject): Promise<AIGenerationResponse> {
    return unifiedAI.generateDocument('rfp', project);
  }

  // Team management (for future implementation)
  static async createTeam(teamData: Omit<Team, '_id' | '_uid' | '_tid' | 'created_at'>): Promise<void> {
    throw new Error('Team management not yet implemented');
  }

  static async getTeams(): Promise<Team[]> {
    return [];
  }

  // Note: Additional methods for teams, collaboration, etc. can be added here
  // They would follow the same pattern as the implemented methods above
}
