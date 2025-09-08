import { openSourceLLM } from './open-source-llm';
import type { RoadmapDocument, MVPProject, UserDiagram } from '@/types';

export interface DiagramGenerationRequest {
  documentType: string;
  documentContent: string;
  project: MVPProject;
  diagramType?: 'flowchart' | 'sequence' | 'gantt' | 'user_journey' | 'class' | 'state';
  complexity?: 'simple' | 'detailed' | 'comprehensive';
}

export interface DiagramOptimization {
  suggestions: string[];
  optimizedCode: string;
  qualityScore: number;
  improvements: string[];
}

// Document-specific diagram templates and strategies
const DIAGRAM_STRATEGIES: Record<string, any> = {
  roadmap: {
    preferredTypes: ['gantt', 'flowchart', 'user_journey'],
    templates: {
      gantt: `
gantt
    title {project.name} Development Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Foundation        :a1, 2024-01-01, 6w
    Core Features     :a2, after a1, 6w
    section Phase 2
    Enhancement       :b1, after a2, 4w
    Testing           :b2, after b1, 2w
    section Launch
    Go-to-Market      :c1, after b2, 2w
    Post-Launch       :c2, after c1, 4w
      `,
      flowchart: `
flowchart TD
    A[Problem Identification] --> B[Solution Design]
    B --> C[MVP Development]
    C --> D[User Testing]
    D --> E{Feedback Positive?}
    E -->|Yes| F[Scale & Launch]
    E -->|No| G[Iterate & Improve]
    G --> D
    F --> H[Market Expansion]
      `
    }
  },
  business_case: {
    preferredTypes: ['flowchart', 'user_journey'],
    templates: {
      flowchart: `
flowchart LR
    A[Current State] --> B[Problem Analysis]
    B --> C[Solution Options]
    C --> D[Cost-Benefit Analysis]
    D --> E[Recommendation]
    E --> F[Implementation Plan]
    F --> G[Expected Outcome]
      `
    }
  },
  feasibility_study: {
    preferredTypes: ['flowchart', 'class'],
    templates: {
      flowchart: `
flowchart TD
    A[Feasibility Assessment] --> B[Technical Analysis]
    A --> C[Financial Analysis]
    A --> D[Market Analysis]
    A --> E[Operational Analysis]
    B --> F{Technical Feasible?}
    C --> G{Financially Viable?}
    D --> H{Market Ready?}
    E --> I{Operationally Sound?}
    F --> J[Final Assessment]
    G --> J
    H --> J
    I --> J
      `
    }
  },
  project_charter: {
    preferredTypes: ['flowchart', 'class'],
    templates: {
      flowchart: `
flowchart TD
    A[Project Initiation] --> B[Stakeholder Identification]
    B --> C[Scope Definition]
    C --> D[Success Criteria]
    D --> E[Resource Allocation]
    E --> F[Timeline Planning]
    F --> G[Risk Assessment]
    G --> H[Project Authorization]
      `
    }
  },
  scope_statement: {
    preferredTypes: ['flowchart', 'class'],
    templates: {
      flowchart: `
flowchart LR
    A[Project Scope] --> B[Deliverables]
    A --> C[Acceptance Criteria]
    A --> D[Constraints]
    A --> E[Assumptions]
    B --> F[Work Breakdown]
    C --> G[Quality Standards]
    D --> H[Resource Limits]
    E --> I[External Dependencies]
      `
    }
  },
  rfp: {
    preferredTypes: ['sequence', 'flowchart'],
    templates: {
      sequence: `
sequenceDiagram
    participant C as Client
    participant V as Vendor
    participant E as Evaluator
    
    C->>V: RFP Release
    V->>V: Proposal Development
    V->>C: Proposal Submission
    C->>E: Evaluation Process
    E->>E: Scoring & Analysis
    E->>C: Recommendation
    C->>V: Vendor Selection
    V->>C: Contract Negotiation
      `
    }
  }
};

export class EnhancedDiagramService {
  private ai: any;

  constructor() {
    this.ai = openSourceLLM;
  }

  // Generate context-aware diagram from any document type
  async generateDiagramFromDocument(request: DiagramGenerationRequest): Promise<string> {
    const { documentType, documentContent, project, diagramType, complexity = 'detailed' } = request;
    
    const strategy = DIAGRAM_STRATEGIES[documentType] || DIAGRAM_STRATEGIES.roadmap;
    const selectedType = diagramType || strategy.preferredTypes[0];
    
    const prompt = this.buildDiagramPrompt(documentType, documentContent, project, selectedType, complexity);
    
    try {
      const response = await this.ai.createChatCompletion({
        model: 'default', // Use available model
        messages: [
          {
            role: 'system',
            content: `You are an expert in creating clear, professional Mermaid.js diagrams that visualize complex information. You specialize in ${selectedType} diagrams and understand how to represent ${documentType} content visually. Always return valid Mermaid syntax that renders correctly.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2, // Lower temperature for consistent diagram syntax
        max_tokens: 2000
      });

      const diagramCode = response.choices[0]?.message?.content || '';
      
      if (!diagramCode.trim()) {
        throw new Error('AI returned empty diagram code');
      }

      // Validate and clean the diagram code
      return this.validateAndCleanDiagramCode(diagramCode, selectedType);

    } catch (error) {
      console.error('Enhanced diagram generation failed:', error);
      
      // Fallback to template-based generation
      return this.generateFromTemplate(documentType, selectedType, project);
    }
  }

  // Generate multiple diagram variations for comparison
  async generateDiagramVariations(request: DiagramGenerationRequest): Promise<{ type: string; code: string; title: string }[]> {
    const { documentType, documentContent, project } = request;
    const strategy = DIAGRAM_STRATEGIES[documentType] || DIAGRAM_STRATEGIES.roadmap;
    
    const variations = await Promise.allSettled(
      strategy.preferredTypes.map(async (type: string) => {
        const code = await this.generateDiagramFromDocument({
          ...request,
          diagramType: type as any
        });
        
        return {
          type,
          code,
          title: `${project.name} - ${this.getDiagramTypeLabel(type)}`
        };
      })
    );

    return variations
      .filter((result): result is PromiseFulfilledResult<{ type: string; code: string; title: string }> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  // Optimize existing diagram with AI suggestions
  async optimizeDiagram(diagramCode: string, project: MVPProject): Promise<DiagramOptimization> {
    const prompt = `
Analyze and optimize this Mermaid.js diagram for clarity, visual appeal, and information density:

\`\`\`mermaid
${diagramCode}
\`\`\`

**PROJECT CONTEXT:**
- Name: ${project.name}
- Industry: ${project.industry}
- Problem: ${project.problem_statement}

**OPTIMIZATION GOALS:**
1. **Clarity**: Improve readability and flow
2. **Visual Appeal**: Better node shapes, colors, and styling
3. **Information Density**: Ensure all important elements are included
4. **Professional Appearance**: Enterprise-grade visualization

**PROVIDE:**
1. **Suggestions**: List of specific improvements
2. **Optimized Code**: The improved Mermaid diagram
3. **Quality Score**: Rate the improvement (1-100)
4. **Improvements**: What was changed and why

Return as JSON format:
{
  "suggestions": ["suggestion 1", "suggestion 2", ...],
  "optimizedCode": "optimized mermaid code here",
  "qualityScore": 85,
  "improvements": ["improvement 1", "improvement 2", ...]
}
`;

    try {
      const response = await this.ai.createChatCompletion({
        model: 'default',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in diagram optimization and visual design. You understand Mermaid.js syntax and can improve diagrams for clarity and professional appearance.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const responseContent = response.choices[0]?.message?.content || '';
      
      try {
        const parsed = JSON.parse(responseContent);
        return {
          suggestions: parsed.suggestions || [],
          optimizedCode: parsed.optimizedCode || diagramCode,
          qualityScore: parsed.qualityScore || 70,
          improvements: parsed.improvements || []
        };
      } catch (parseError) {
        // If JSON parsing fails, provide basic optimization
        return {
          suggestions: ['Unable to parse AI response', 'Consider manual optimization'],
          optimizedCode: diagramCode,
          qualityScore: 60,
          improvements: []
        };
      }
    } catch (error) {
      console.error('Diagram optimization failed:', error);
      return {
        suggestions: ['Optimization service unavailable'],
        optimizedCode: diagramCode,
        qualityScore: 50,
        improvements: []
      };
    }
  }

  // Generate diagram suggestions based on document content
  async generateDiagramSuggestions(documentContent: string, documentType: string): Promise<string[]> {
    const prompt = `
Analyze this ${documentType} content and suggest the most effective diagram types to visualize the information:

**CONTENT:**
${documentContent.substring(0, 2000)}...

**SUGGEST:**
- 3-5 specific diagram types that would best represent this content
- For each suggestion, explain why it would be effective
- Consider the audience and use case

Return as a simple list of suggestions.
`;

    try {
      const response = await this.ai.createChatCompletion({
        model: 'default',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in data visualization and information design. You understand how to match content types with appropriate diagram formats.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1000
      });

      const suggestions = response.choices[0]?.message?.content || '';
      return suggestions.split('\n').filter(s => s.trim().length > 0);

    } catch (error) {
      console.error('Diagram suggestions failed:', error);
      return [
        'Consider a flowchart to show process steps',
        'Use a timeline diagram for chronological content',
        'Try a hierarchical diagram for structured information'
      ];
    }
  }

  // Build comprehensive diagram prompt
  private buildDiagramPrompt(
    documentType: string, 
    documentContent: string, 
    project: MVPProject, 
    diagramType: string, 
    complexity: string
  ): string {
    const strategy = DIAGRAM_STRATEGIES[documentType];
    const template = strategy?.templates?.[diagramType];
    
    let prompt = `
Create a professional ${diagramType} diagram that visualizes the key concepts from this ${documentType} document.

**PROJECT:** ${project.name} (${project.industry})
**PROBLEM:** ${project.problem_statement}

**DOCUMENT CONTENT:**
${documentContent.substring(0, 3000)}...

**DIAGRAM REQUIREMENTS:**
- Type: ${diagramType}
- Complexity: ${complexity}
- Professional appearance suitable for stakeholders
- Clear labels and logical flow
- Include key elements from the document content

**SPECIFIC GUIDELINES:**
`;

    // Add document-type specific guidelines
    switch (documentType) {
      case 'roadmap':
        prompt += `
- Show development phases and timelines
- Include major milestones and deliverables
- Represent dependencies between tasks
- Highlight critical path items
`;
        break;
      case 'business_case':
        prompt += `
- Show the decision-making process
- Represent cost-benefit analysis flow
- Include stakeholder perspectives
- Highlight value proposition
`;
        break;
      case 'feasibility_study':
        prompt += `
- Show different feasibility dimensions
- Represent analysis methodology
- Include decision points and criteria
- Show interdependencies between factors
`;
        break;
      default:
        prompt += `
- Focus on the main process or workflow
- Show key decision points
- Include important stakeholders or components
- Represent the logical flow of information
`;
    }

    prompt += `
**OUTPUT:** Return ONLY valid Mermaid.js code. No explanations or additional text.
`;

    if (template && complexity === 'simple') {
      prompt += `\n**REFERENCE TEMPLATE:**\n${template}`;
    }

    return prompt;
  }

  // Validate and clean diagram code
  private validateAndCleanDiagramCode(code: string, diagramType: string): string {
    // Remove any markdown code blocks
    let cleanCode = code.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '');
    
    // Ensure diagram starts with correct type declaration
    const typeDeclarations: Record<string, string> = {
      flowchart: 'flowchart',
      sequence: 'sequenceDiagram',
      gantt: 'gantt',
      user_journey: 'journey',
      class: 'classDiagram',
      state: 'stateDiagram'
    };
    
    const expectedStart = typeDeclarations[diagramType];
    if (expectedStart && !cleanCode.trim().startsWith(expectedStart)) {
      // Try to add the correct declaration
      cleanCode = `${expectedStart} TD\n${cleanCode}`;
    }
    
    return cleanCode.trim();
  }

  // Generate diagram from template as fallback
  private generateFromTemplate(documentType: string, diagramType: string, project: MVPProject): string {
    const strategy = DIAGRAM_STRATEGIES[documentType];
    let template = strategy?.templates?.[diagramType];
    
    if (!template) {
      // Default flowchart template
      template = `
flowchart TD
    A[${project.name}] --> B[Problem Analysis]
    B --> C[Solution Design]
    C --> D[Implementation]
    D --> E[Validation]
    E --> F[Success]
      `;
    }
    
    // Replace template variables
    return template
      .replace(/\{project\.name\}/g, project.name)
      .replace(/\{project\.industry\}/g, project.industry)
      .trim();
  }

  // Get human-readable label for diagram type
  private getDiagramTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      flowchart: 'Process Flow',
      sequence: 'Sequence Diagram',
      gantt: 'Timeline Chart',
      user_journey: 'User Journey',
      class: 'System Architecture',
      state: 'State Diagram'
    };
    return labels[type] || type;
  }
}

// Export singleton instance
export const enhancedDiagrams = new EnhancedDiagramService();