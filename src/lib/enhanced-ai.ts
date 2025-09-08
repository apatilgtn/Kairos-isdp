import { DevvAI } from '@devvai/devv-code-backend';
import type { MVPProject, AIGenerationResponse } from '@/types';

// Industry-specific persona and template system
export interface IndustryPersona {
  id: string;
  name: string;
  description: string;
  expertise: string[];
  industries: string[];
  systemPrompt: string;
  temperature: number;
  model: 'kimi-k2-0711-preview' | 'default';
}

export interface AITemplate {
  id: string;
  name: string;
  description: string;
  documentType: string;
  industries: string[];
  persona: string;
  promptTemplate: string;
  qualityMetrics: string[];
}

// Industry-specific AI personas
export const AI_PERSONAS: IndustryPersona[] = [
  {
    id: 'tech_strategist',
    name: 'Technology Strategist',
    description: 'Expert in tech product strategy, development methodologies, and scaling',
    expertise: ['MVP Development', 'Tech Architecture', 'Product Strategy', 'Agile Methods'],
    industries: ['Technology', 'Software', 'AI/ML', 'SaaS', 'Mobile Apps'],
    systemPrompt: `You are a senior technology strategist with 15+ years of experience building successful tech products. You specialize in MVP development, technical architecture, and scaling strategies. Your approach combines deep technical knowledge with business acumen, focusing on practical implementation and measurable outcomes. You understand modern development frameworks, cloud infrastructure, and emerging technologies. Always provide specific technical recommendations with realistic timelines and resource estimates.`,
    temperature: 0.3,
    model: 'kimi-k2-0711-preview'
  },
  {
    id: 'healthcare_consultant',
    name: 'Healthcare Innovation Consultant',
    description: 'Specialist in healthcare technology, compliance, and patient-centered solutions',
    expertise: ['Healthcare Tech', 'HIPAA Compliance', 'Patient Experience', 'Medical Workflows'],
    industries: ['Healthcare', 'MedTech', 'Digital Health', 'Telemedicine'],
    systemPrompt: `You are a healthcare innovation consultant with extensive experience in digital health solutions. You understand healthcare regulations (HIPAA, FDA), patient safety requirements, and clinical workflows. Your expertise includes telemedicine, electronic health records, patient engagement, and healthcare analytics. You prioritize patient outcomes, regulatory compliance, and clinical efficiency. Always consider privacy, security, and accessibility in your recommendations.`,
    temperature: 0.2,
    model: 'kimi-k2-0711-preview'
  },
  {
    id: 'fintech_advisor',
    name: 'Financial Technology Advisor',
    description: 'Expert in financial services, regulatory compliance, and fintech innovation',
    expertise: ['Financial Services', 'Regulatory Compliance', 'Payment Systems', 'Risk Management'],
    industries: ['FinTech', 'Banking', 'Insurance', 'Investment', 'Cryptocurrency'],
    systemPrompt: `You are a fintech advisor with deep expertise in financial services and regulatory requirements. You understand banking regulations, payment processing, risk management, and financial compliance (PCI DSS, KYC, AML). Your experience spans traditional banking, digital payments, investment platforms, and emerging technologies like blockchain. You focus on security, compliance, user trust, and financial accuracy. Always address regulatory requirements and risk mitigation in your recommendations.`,
    temperature: 0.2,
    model: 'kimi-k2-0711-preview'
  },
  {
    id: 'retail_commerce_expert',
    name: 'Retail & E-commerce Expert',
    description: 'Specialist in retail operations, customer experience, and omnichannel strategies',
    expertise: ['E-commerce', 'Customer Experience', 'Supply Chain', 'Retail Operations'],
    industries: ['E-commerce', 'Retail', 'Consumer Goods', 'Fashion', 'Food & Beverage'],
    systemPrompt: `You are a retail and e-commerce expert with comprehensive experience in customer journey optimization, inventory management, and omnichannel strategies. You understand consumer behavior, seasonal trends, supply chain logistics, and digital marketing. Your expertise includes conversion optimization, customer retention, and operational efficiency. You focus on customer experience, profitability, and scalable growth strategies. Always consider customer acquisition costs, lifetime value, and operational complexity.`,
    temperature: 0.4,
    model: 'default'
  },
  {
    id: 'education_innovator',
    name: 'Education Technology Innovator',
    description: 'Expert in educational methodology, learning systems, and student engagement',
    expertise: ['Learning Design', 'Student Engagement', 'Educational Technology', 'Assessment'],
    industries: ['Education', 'EdTech', 'Training', 'Corporate Learning'],
    systemPrompt: `You are an education technology innovator with extensive experience in learning design, student engagement, and educational outcomes. You understand learning theories, assessment methodologies, accessibility requirements, and diverse learning styles. Your expertise includes online learning platforms, educational content, and student analytics. You prioritize learning effectiveness, accessibility, and measurable educational outcomes. Always consider different learning styles, age groups, and educational contexts.`,
    temperature: 0.4,
    model: 'default'
  },
  {
    id: 'sustainability_consultant',
    name: 'Sustainability & ESG Consultant',
    description: 'Specialist in environmental impact, sustainability metrics, and ESG reporting',
    expertise: ['Environmental Impact', 'Sustainability Metrics', 'ESG Reporting', 'Green Technology'],
    industries: ['Environmental', 'Sustainability', 'Clean Energy', 'Agriculture', 'Manufacturing'],
    systemPrompt: `You are a sustainability and ESG consultant with deep expertise in environmental impact assessment, carbon footprint analysis, and sustainable business practices. You understand ESG reporting standards, environmental regulations, and green technology solutions. Your focus is on measurable environmental impact, sustainability metrics, and long-term ecological benefits. You prioritize environmental responsibility, regulatory compliance, and stakeholder value. Always include specific sustainability metrics and environmental impact assessments.`,
    temperature: 0.3,
    model: 'kimi-k2-0711-preview'
  }
];

// Document templates with industry-specific variations
export const AI_TEMPLATES: AITemplate[] = [
  {
    id: 'tech_roadmap',
    name: 'Technology Product Roadmap',
    description: 'Comprehensive roadmap for tech products with development phases',
    documentType: 'roadmap',
    industries: ['Technology', 'Software', 'SaaS'],
    persona: 'tech_strategist',
    promptTemplate: `
Create a comprehensive MVP roadmap for this technology product with specific focus on:

**TECHNICAL ARCHITECTURE:**
- Core technology stack recommendations with justification
- Scalability considerations and future-proofing strategies
- Integration points and API design
- Security and performance requirements

**DEVELOPMENT PHASES:**
- Phase 1: Core MVP (8-12 weeks) - Essential user journey
- Phase 2: Enhanced Features (6-8 weeks) - User engagement features
- Phase 3: Scale & Optimize (4-6 weeks) - Performance and analytics

**TECHNICAL METRICS:**
- Performance benchmarks (load time, throughput, uptime)
- User experience metrics (conversion, retention, engagement)
- Technical debt management and code quality metrics
- Security and compliance checkpoints

**RESOURCE PLANNING:**
- Development team structure and roles
- Technology infrastructure costs
- Third-party service dependencies
- Timeline and milestone dependencies

Focus on practical implementation details, realistic timelines, and measurable technical outcomes.
`,
    qualityMetrics: [
      'Technical specificity and accuracy',
      'Realistic development timelines',
      'Scalability considerations',
      'Security and performance focus',
      'Clear implementation steps'
    ]
  },
  {
    id: 'healthcare_business_case',
    name: 'Healthcare Solution Business Case',
    description: 'Business case template focused on healthcare compliance and patient outcomes',
    documentType: 'business_case',
    industries: ['Healthcare', 'MedTech', 'Digital Health'],
    persona: 'healthcare_consultant',
    promptTemplate: `
Develop a comprehensive business case for this healthcare solution with emphasis on:

**CLINICAL VALUE PROPOSITION:**
- Patient outcome improvements with measurable metrics
- Clinical workflow efficiency gains
- Healthcare provider benefits and adoption drivers
- Cost reduction potential for healthcare systems

**REGULATORY & COMPLIANCE:**
- HIPAA compliance requirements and implementation
- FDA regulatory pathway (if applicable)
- State and federal healthcare regulations
- Data privacy and security standards

**FINANCIAL ANALYSIS:**
- Healthcare ROI calculations and payback period
- Cost per patient/procedure/outcome analysis
- Insurance reimbursement considerations
- Total cost of ownership for healthcare providers

**IMPLEMENTATION STRATEGY:**
- Clinical pilot program design
- Healthcare provider onboarding process
- Training and change management for clinical staff
- Risk mitigation for patient safety and data security

Ensure all recommendations address patient safety, clinical efficacy, and regulatory compliance.
`,
    qualityMetrics: [
      'Clinical outcome focus',
      'Regulatory compliance coverage',
      'Patient safety considerations',
      'Healthcare ROI analysis',
      'Implementation feasibility'
    ]
  },
  {
    id: 'fintech_feasibility',
    name: 'Financial Technology Feasibility Study',
    description: 'Feasibility analysis for fintech solutions with regulatory focus',
    documentType: 'feasibility_study',
    industries: ['FinTech', 'Banking', 'Insurance'],
    persona: 'fintech_advisor',
    promptTemplate: `
Conduct a thorough feasibility analysis for this financial technology solution covering:

**REGULATORY FEASIBILITY:**
- Applicable financial regulations (PCI DSS, KYC, AML, etc.)
- Licensing requirements and regulatory approval process
- Compliance costs and ongoing regulatory obligations
- Risk assessment and mitigation strategies

**TECHNICAL FEASIBILITY:**
- Financial data security and encryption requirements
- Payment processing integration capabilities
- Scalability for financial transaction volumes
- Disaster recovery and business continuity planning

**MARKET FEASIBILITY:**
- Competitive landscape analysis in financial services
- Customer acquisition strategies for financial products
- Trust and credibility building for financial brand
- Partnership opportunities with financial institutions

**FINANCIAL FEASIBILITY:**
- Revenue model analysis and projection
- Customer acquisition cost in financial services
- Regulatory compliance costs
- Insurance and liability considerations

Prioritize security, compliance, and customer trust in all recommendations.
`,
    qualityMetrics: [
      'Regulatory compliance thoroughness',
      'Security and risk focus',
      'Financial market understanding',
      'Trust and credibility factors',
      'Realistic financial projections'
    ]
  },
  {
    id: 'ecommerce_scope',
    name: 'E-commerce Platform Scope Statement',
    description: 'Detailed scope for e-commerce solutions with customer journey focus',
    documentType: 'scope_statement',
    industries: ['E-commerce', 'Retail', 'Consumer Goods'],
    persona: 'retail_commerce_expert',
    promptTemplate: `
Define comprehensive project scope for this e-commerce solution with focus on:

**CUSTOMER EXPERIENCE SCOPE:**
- Complete customer journey mapping (awareness to advocacy)
- User interface and user experience requirements
- Mobile-first design and responsive experience
- Accessibility and internationalization requirements

**FUNCTIONAL SCOPE:**
- Core e-commerce functionality (catalog, cart, checkout, payments)
- Inventory management and order fulfillment
- Customer account management and personalization
- Marketing and promotional capabilities

**TECHNICAL SCOPE:**
- E-commerce platform selection and customization
- Payment gateway integrations and security
- Third-party service integrations (shipping, analytics, etc.)
- Performance requirements and scalability planning

**BUSINESS SCOPE:**
- Product catalog management and content strategy
- Order management and customer service workflows
- Analytics and reporting requirements
- Multi-channel integration (online, mobile, social)

**OUT OF SCOPE:**
- Clearly define what is excluded from initial implementation
- Future phase considerations and roadmap items
- Third-party responsibilities and dependencies

Emphasize customer experience, conversion optimization, and operational efficiency.
`,
    qualityMetrics: [
      'Customer journey completeness',
      'Technical specification clarity',
      'Operational workflow definition',
      'Clear scope boundaries',
      'Scalability considerations'
    ]
  }
];

export class EnhancedAIService {
  private ai: DevvAI;

  constructor() {
    this.ai = new DevvAI();
  }

  // Get appropriate persona for project industry
  getPersonaForProject(project: MVPProject): IndustryPersona {
    const matchingPersona = AI_PERSONAS.find(persona => 
      persona.industries.some(industry => 
        project.industry.toLowerCase().includes(industry.toLowerCase())
      )
    );
    return matchingPersona || AI_PERSONAS[0]; // Default to tech strategist
  }

  // Get appropriate template for document type and industry
  getTemplateForDocument(documentType: string, project: MVPProject): AITemplate | null {
    return AI_TEMPLATES.find(template => 
      template.documentType === documentType &&
      template.industries.some(industry => 
        project.industry.toLowerCase().includes(industry.toLowerCase())
      )
    );
  }

  // Enhanced generation with persona and template selection
  async generateWithPersona(
    documentType: string, 
    project: MVPProject, 
    additionalContext?: string
  ): Promise<AIGenerationResponse> {
    const persona = this.getPersonaForProject(project);
    const template = this.getTemplateForDocument(documentType, project);
    
    const basePrompt = template?.promptTemplate || this.getDefaultPrompt(documentType);
    
    const contextualPrompt = this.buildContextualPrompt(basePrompt, project, additionalContext);
    
    try {
      console.log(`Using persona: ${persona.name} for ${documentType} generation`);
      
      const response = await this.ai.chat.completions.create({
        model: persona.model,
        messages: [
          {
            role: 'system',
            content: persona.systemPrompt
          },
          {
            role: 'user',
            content: contextualPrompt
          }
        ],
        temperature: persona.temperature,
        max_tokens: 4000
      });

      const content = response.choices[0]?.message?.content || '';
      
      if (!content.trim()) {
        throw new Error('AI returned empty content');
      }

      // Calculate quality score based on template metrics
      const qualityScore = template ? this.calculateQualityScore(content, template) : 85;

      return {
        success: true,
        content,
        model_used: persona.model,
        persona_used: persona.name,
        quality_score: qualityScore,
        generation_time: Date.now(),
        token_count: response.usage?.total_tokens || 0
      };

    } catch (error) {
      console.error(`Enhanced AI generation failed for ${documentType}:`, error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Enhanced AI generation failed'
      };
    }
  }

  // Build contextual prompt with project information
  private buildContextualPrompt(basePrompt: string, project: MVPProject, additionalContext?: string): string {
    let prompt = basePrompt;
    
    // Replace template variables
    prompt = prompt.replace(/\{project\.name\}/g, project.name);
    prompt = prompt.replace(/\{project\.industry\}/g, project.industry);
    prompt = prompt.replace(/\{project\.problem_statement\}/g, project.problem_statement);
    
    // Add project context section
    prompt += `\n\n**PROJECT CONTEXT:**\n`;
    prompt += `- Name: ${project.name}\n`;
    prompt += `- Industry: ${project.industry}\n`;
    prompt += `- Problem Statement: ${project.problem_statement}\n`;
    
    if (additionalContext) {
      prompt += `\n**ADDITIONAL CONTEXT:**\n${additionalContext}\n`;
    }
    
    return prompt;
  }

  // Calculate quality score based on template metrics
  private calculateQualityScore(content: string, template: AITemplate): number {
    let score = 70; // Base score
    
    // Check for key quality indicators
    const contentLower = content.toLowerCase();
    
    // Length and structure check
    if (content.length > 2000) score += 5;
    if (content.includes('##') || content.includes('**')) score += 5; // Proper formatting
    
    // Industry-specific quality checks
    template.qualityMetrics.forEach(metric => {
      if (this.checkMetricInContent(contentLower, metric)) {
        score += 4;
      }
    });
    
    // Cap at 100
    return Math.min(score, 100);
  }

  // Check if quality metric is addressed in content
  private checkMetricInContent(content: string, metric: string): boolean {
    const keywords = metric.toLowerCase().split(' ');
    return keywords.some(keyword => content.includes(keyword));
  }

  // Default prompts for document types without specific templates
  private getDefaultPrompt(documentType: string): string {
    const prompts: Record<string, string> = {
      roadmap: `Create a comprehensive MVP roadmap with specific timelines, features, and success metrics. Include technical requirements, market analysis, and implementation phases.`,
      business_case: `Develop a compelling business case with financial analysis, risk assessment, and strategic value proposition. Include ROI calculations and implementation strategy.`,
      feasibility_study: `Conduct thorough feasibility analysis covering technical, financial, market, and operational aspects. Provide specific recommendations and risk mitigation strategies.`,
      project_charter: `Create a formal project charter with clear objectives, scope, stakeholders, and governance structure. Define success criteria and project constraints.`,
      scope_statement: `Define detailed project scope with specific deliverables, acceptance criteria, and boundaries. Include assumptions, constraints, and exclusions.`,
      rfp: `Develop comprehensive RFP documentation with clear requirements, evaluation criteria, and vendor expectations. Include project background and success metrics.`
    };
    
    return prompts[documentType] || prompts.roadmap;
  }
}

// Export singleton instance
export const enhancedAI = new EnhancedAIService();