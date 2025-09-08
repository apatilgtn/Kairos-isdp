import { DevvAI, DevvImageGen } from '@devvai/devv-code-backend';

export interface DiagramGenerationRequest {
  title: string;
  description: string;
  diagramType: 'flowchart' | 'architecture' | 'system_design' | 'user_journey' | 'process_flow' | 'data_flow' | 'organization' | 'timeline' | 'network' | 'database_schema';
  complexity: 'simple' | 'moderate' | 'complex';
  style: 'professional' | 'modern' | 'minimal' | 'colorful' | 'technical' | 'hand_drawn';
  projectContext?: string;
}

export interface DiagramGenerationResult {
  visualDiagram: string; // Generated image URL
  mermaidCode: string;   // Fallback Mermaid code
  description: string;   // AI-generated description
  suggestions: string[]; // Improvement suggestions
}

export class AIDiagramService {
  private ai: DevvAI;
  private imageGen: DevvImageGen;

  constructor() {
    this.ai = new DevvAI();
    this.imageGen = new DevvImageGen();
  }

  /**
   * Generate a visual diagram using AI
   */
  async generateDiagram(request: DiagramGenerationRequest): Promise<DiagramGenerationResult> {
    try {
      // Step 1: Generate diagram concept and Mermaid code using AI
      const conceptPrompt = this.buildConceptPrompt(request);
      
      const conceptResponse = await this.ai.chat.completions.create({
        model: 'kimi-k2-0711-preview', // Use Kimi for technical analysis
        messages: [
          {
            role: 'system',
            content: `You are an expert technical architect and diagram designer. You create comprehensive diagrams and provide detailed Mermaid code.
            
            Respond in JSON format:
            {
              "mermaidCode": "string - Complete Mermaid diagram code",
              "description": "string - Detailed description of the diagram",
              "visualPrompt": "string - Detailed prompt for AI image generation",
              "suggestions": ["string array - 3-5 improvement suggestions"]
            }`
          },
          {
            role: 'user',
            content: conceptPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      let conceptData;
      try {
        conceptData = JSON.parse(conceptResponse.choices[0].message.content || '{}');
      } catch {
        // Fallback if JSON parsing fails
        conceptData = {
          mermaidCode: this.generateFallbackMermaid(request),
          description: `${request.diagramType} diagram for ${request.title}`,
          visualPrompt: this.buildVisualPrompt(request),
          suggestions: ['Consider adding more detail', 'Review data flow', 'Add error handling']
        };
      }

      // Step 2: Generate actual visual diagram using AI image generation
      const visualPrompt = this.enhanceVisualPrompt(conceptData.visualPrompt, request);
      
      const imageResponse = await this.imageGen.textToImage({
        prompt: visualPrompt,
        model: 'google/gemini-2.5-flash-image',
        aspect_ratio: '16:9',
        output_format: 'png'
      });

      return {
        visualDiagram: imageResponse.images[0],
        mermaidCode: conceptData.mermaidCode,
        description: conceptData.description,
        suggestions: conceptData.suggestions || []
      };

    } catch (error) {
      console.error('AI diagram generation failed:', error);
      
      // Fallback to basic generation
      return this.generateFallbackDiagram(request);
    }
  }

  /**
   * Generate diagram variations from existing diagram
   */
  async generateVariations(
    originalDiagramUrl: string, 
    request: DiagramGenerationRequest,
    variationType: 'style_change' | 'complexity_change' | 'format_change' | 'color_scheme'
  ): Promise<DiagramGenerationResult> {
    try {
      const variationPrompt = this.buildVariationPrompt(request, variationType);

      const imageResponse = await this.imageGen.textToImage({
        prompt: variationPrompt,
        model: 'google/gemini-2.5-flash-image',
        image_urls: [originalDiagramUrl],
        output_format: 'png'
      });

      // Generate updated description
      const descriptionResponse = await this.ai.chat.completions.create({
        model: 'default',
        messages: [
          {
            role: 'system',
            content: 'Describe the diagram variation and provide improvement suggestions.'
          },
          {
            role: 'user',
            content: `Describe this ${variationType.replace('_', ' ')} variation of a ${request.diagramType} diagram for ${request.title}.`
          }
        ],
        temperature: 0.5,
        max_tokens: 500
      });

      return {
        visualDiagram: imageResponse.images[0],
        mermaidCode: this.generateFallbackMermaid(request),
        description: descriptionResponse.choices[0].message.content || `${variationType} variation of ${request.title}`,
        suggestions: ['Compare with original', 'Consider hybrid approach', 'Gather stakeholder feedback']
      };

    } catch (error) {
      console.error('Variation generation failed:', error);
      throw new Error('Failed to generate diagram variation');
    }
  }

  /**
   * Analyze existing diagram and suggest improvements
   */
  async analyzeDiagram(diagramUrl: string, context: string): Promise<{
    analysis: string;
    improvements: string[];
    alternativeApproaches: string[];
  }> {
    try {
      const analysisResponse = await this.ai.chat.completions.create({
        model: 'kimi-k2-0711-preview',
        messages: [
          {
            role: 'system',
            content: `You are a technical diagram expert. Analyze diagrams and provide constructive feedback.
            
            Respond in JSON format:
            {
              "analysis": "string - Detailed analysis of the diagram",
              "improvements": ["string array - Specific improvement suggestions"],
              "alternativeApproaches": ["string array - Alternative design approaches"]
            }`
          },
          {
            role: 'user',
            content: `Analyze this diagram in the context of: ${context}. The diagram should be evaluated for clarity, completeness, and technical accuracy.`
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      });

      const analysisData = JSON.parse(analysisResponse.choices[0].message.content || '{}');
      
      return {
        analysis: analysisData.analysis || 'Technical diagram with good structure',
        improvements: analysisData.improvements || ['Consider adding labels', 'Review flow logic'],
        alternativeApproaches: analysisData.alternativeApproaches || ['Modular approach', 'Layered architecture']
      };

    } catch (error) {
      console.error('Diagram analysis failed:', error);
      return {
        analysis: 'Unable to analyze diagram at this time',
        improvements: ['Manual review recommended'],
        alternativeApproaches: ['Consult with technical team']
      };
    }
  }

  private buildConceptPrompt(request: DiagramGenerationRequest): string {
    return `Create a comprehensive ${request.diagramType} diagram for "${request.title}".

Details:
- Description: ${request.description}
- Complexity: ${request.complexity}
- Style: ${request.style}
${request.projectContext ? `- Project Context: ${request.projectContext}` : ''}

Requirements:
1. Generate complete Mermaid diagram code that accurately represents the concept
2. Create a detailed visual description suitable for AI image generation
3. Provide specific improvement suggestions
4. Ensure the diagram is technically accurate and follows best practices

Focus on clarity, completeness, and professional presentation.`;
  }

  private buildVisualPrompt(request: DiagramGenerationRequest): string {
    const styleDescriptions = {
      professional: 'clean, corporate, blue and gray color scheme, professional typography',
      modern: 'sleek, contemporary, vibrant colors, modern flat design',
      minimal: 'clean, simple, monochrome with accent colors, lots of white space',
      colorful: 'bright, engaging colors, visually appealing, distinct color coding',
      technical: 'detailed, engineering-style, precise, with technical annotations',
      hand_drawn: 'sketch-like, hand-drawn appearance, organic lines, creative'
    };

    const typeDescriptions = {
      flowchart: 'process flow diagram with decision points, start/end nodes, and clear directional arrows',
      architecture: 'system architecture diagram showing components, layers, and connections',
      system_design: 'technical system design with modules, interfaces, and data flow',
      user_journey: 'user experience flow showing touchpoints, emotions, and interactions',
      process_flow: 'business process diagram with roles, activities, and decision points',
      data_flow: 'data flow diagram showing data stores, processes, and external entities',
      organization: 'organizational hierarchy chart with roles and reporting structures',
      timeline: 'timeline diagram showing events, milestones, and chronological progression',
      network: 'network topology diagram with devices, connections, and protocols',
      database_schema: 'database entity relationship diagram with tables and relationships'
    };

    return `Create a professional ${request.diagramType} diagram: ${typeDescriptions[request.diagramType]}.
    
Title: "${request.title}"
Style: ${styleDescriptions[request.style]}
Complexity: ${request.complexity} level with appropriate detail
    
The diagram should be clear, well-organized, properly labeled, and suitable for business/technical presentation. Include professional styling with clean lines, appropriate icons, and logical layout.`;
  }

  private enhanceVisualPrompt(basePrompt: string, request: DiagramGenerationRequest): string {
    return `${basePrompt}

Additional requirements:
- High-quality, professional diagram suitable for presentations
- Clear, readable text and labels
- Consistent color scheme and styling
- Proper spacing and alignment
- Vector-style appearance with crisp lines
- Business/technical documentation quality
- ${request.style} aesthetic with appropriate visual hierarchy`;
  }

  private buildVariationPrompt(request: DiagramGenerationRequest, variationType: string): string {
    const variations = {
      style_change: `Transform this diagram to ${request.style} style while maintaining the same structure and information`,
      complexity_change: `Adjust the diagram complexity to ${request.complexity} level - add or simplify details accordingly`,
      format_change: `Convert this diagram to a different visual format while preserving all information`,
      color_scheme: `Apply a new professional color scheme suitable for ${request.diagramType} diagrams`
    };

    return variations[variationType] || 'Improve the visual presentation of this diagram';
  }

  private generateFallbackMermaid(request: DiagramGenerationRequest): string {
    const templates = {
      flowchart: `graph TD
    A[Start: ${request.title}] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[Action 1]
    C -->|No| E[Action 2]
    D --> F[End]
    E --> F`,
      
      architecture: `graph TB
    subgraph "Frontend"
        UI[User Interface]
        API[API Layer]
    end
    subgraph "Backend"
        BL[Business Logic]
        DB[(Database)]
    end
    UI --> API
    API --> BL
    BL --> DB`,
      
      system_design: `graph LR
    User --> System[${request.title}]
    System --> Process[Processing]
    Process --> Output[Output]`,
      
      user_journey: `journey
    title ${request.title}
    section Discovery
        Awareness: 5: User
        Research: 4: User
    section Engagement
        Trial: 3: User
        Adoption: 5: User`,
      
      process_flow: `graph TD
    Start([Start Process]) --> Step1[Initial Step]
    Step1 --> Step2[${request.title}]
    Step2 --> End([Complete])`,
      
      data_flow: `graph LR
    Input[Data Input] --> Process[${request.title}]
    Process --> Output[Data Output]
    Process --> Store[(Data Store)]`,
      
      organization: `graph TD
    CEO[Chief Executive]
    CEO --> CTO[Chief Technology Officer]
    CEO --> CMO[Chief Marketing Officer]
    CTO --> Dev[Development Team]
    CMO --> Marketing[Marketing Team]`,
      
      timeline: `gantt
    title ${request.title}
    dateFormat YYYY-MM-DD
    section Phase 1
        Planning: 2024-01-01, 30d
    section Phase 2
        Implementation: after planning, 60d`,
      
      network: `graph TB
    Internet((Internet))
    Router[Router]
    Switch[Switch]
    Device1[Device 1]
    Device2[Device 2]
    
    Internet --> Router
    Router --> Switch
    Switch --> Device1
    Switch --> Device2`,
      
      database_schema: `erDiagram
    USER {
        int id PK
        string name
        string email
    }
    PROJECT {
        int id PK
        string title
        string description
        int user_id FK
    }
    USER ||--o{ PROJECT : creates`
    };

    return templates[request.diagramType] || templates.flowchart;
  }

  private async generateFallbackDiagram(request: DiagramGenerationRequest): Promise<DiagramGenerationResult> {
    // Generate a simple visual diagram using basic prompt
    try {
      const basicPrompt = this.buildVisualPrompt(request);
      
      const imageResponse = await this.imageGen.textToImage({
        prompt: basicPrompt,
        aspect_ratio: '16:9',
        output_format: 'png'
      });

      return {
        visualDiagram: imageResponse.images[0],
        mermaidCode: this.generateFallbackMermaid(request),
        description: `AI-generated ${request.diagramType} diagram for ${request.title}`,
        suggestions: [
          'Review diagram accuracy',
          'Consider manual refinements',
          'Validate with stakeholders'
        ]
      };
    } catch (error) {
      console.error('Fallback diagram generation failed:', error);
      throw new Error('Unable to generate diagram at this time');
    }
  }
}

export const aiDiagramService = new AIDiagramService();