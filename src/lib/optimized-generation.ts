import { openSourceLLM } from './open-source-llm';
import type { MVPProject, AIGenerationResponse } from '@/types';

// Initialize AI client
const ai = openSourceLLM;

// Optimized generation templates with concise, focused prompts
const GENERATION_TEMPLATES = {
  roadmap: {
    systemPrompt: "You are a senior product strategist specializing in MVP roadmaps. Create actionable, realistic roadmaps with specific timelines and measurable outcomes.",
    userPrompt: (project: MVPProject) => `DOCUMENT GENERATION REQUEST: Create a comprehensive business roadmap for a mobile banking application.

Project Details:
- Name: ${project.name}
- Industry: ${project.industry}  
- Problem Statement: ${project.problem_statement}

GENERATE A DETAILED ROADMAP DOCUMENT WITH:

# ${project.name} MVP Roadmap

## Executive Summary
Write 2-3 paragraphs covering:
- Clear value proposition and target market definition
- 12-month business outcomes and competitive advantages
- Market opportunity size and validation

## Core MVP Features (Maximum 6 Features)
For each feature provide:
1. Feature Name and detailed user story
2. Priority ranking (Critical/High/Medium)
3. Development effort estimate (1-4 weeks)
4. Specific success metrics and KPIs

## 16-Week Development Timeline
Phase 1 (Weeks 1-6): Foundation Development
- Technical architecture setup
- Core infrastructure and security
- Basic user authentication

Phase 2 (Weeks 7-12): Core Feature Development  
- Primary feature implementation
- Integration with banking APIs
- Initial user testing

Phase 3 (Weeks 13-16): Launch Preparation
- Performance optimization
- Security audits and compliance
- Marketing launch preparation

## Risk Analysis & Mitigation
Identify and address:
- Top 3 technical implementation risks
- Top 3 market/competitive risks  
- Resource and timeline risk factors
- Specific mitigation strategies for each

## Go-to-Market Strategy
Define:
- Primary target customer segments with demographics
- Marketing channel strategy with budget allocation
- User acquisition targets for first 6 months
- Revenue projections and business metrics

IMPORTANT: Generate substantial detailed content for each section. This should be a comprehensive business document suitable for stakeholder presentation.`,
    temperature: 0.3,
    maxTokens: 2500
  },

  elevatorPitch: {
    systemPrompt: "You are an expert pitch coach creating compelling, investor-ready elevator pitches.",
    userPrompt: (project: MVPProject) => `Create a 60-90 second elevator pitch for "${project.name}" in ${project.industry}.

Problem: ${project.problem_statement}

Structure (150-200 words total):
## The Hook (10-15s)
Surprising statistic or bold statement

## The Problem (15-20s)
Who faces it, how widespread, why current solutions fail

## The Solution (20-25s)
Your unique approach and key differentiator

## The Market (10-15s)
Market size, growth rate, ideal customer

## The Traction (10-15s)
Concrete progress, validation, team credentials

## The Ask (5-10s)
Specific funding/partnership request

Make it conversational, memorable, and action-oriented.`,
    temperature: 0.7,
    maxTokens: 600
  },

  modelAdvice: {
    systemPrompt: "You are an expert ML engineer providing practical AI/ML recommendations with specific tools and implementation steps.",
    userPrompt: (project: MVPProject, useCase: string) => `Provide AI/ML recommendations for "${useCase}" in ${project.name} (${project.industry}).

Problem: ${project.problem_statement}

Structure:
## Recommended Models (Top 3)
For each: Name, source, model ID, use case, cost, integration example

## Datasets & Training
- Public datasets (name, size, source, relevance)
- Data collection strategy and preprocessing

## Implementation Approach
- Tech stack recommendation
- API vs self-hosted decision
- Infrastructure requirements & costs

## Performance & Timeline
- Accuracy targets, speed requirements
- Week-by-week implementation roadmap

## Cost & Resources
- Development costs, team requirements, tools budget

Focus on actionable advice with real model names and specific implementation steps.`,
    temperature: 0.2,
    maxTokens: 1200
  },

  businessCase: {
    systemPrompt: "You are an expert business analyst creating investor-ready business cases with MBA-level financial analysis.",
    userPrompt: (project: MVPProject) => `Create a business case for "${project.name}" in ${project.industry}.

Problem: ${project.problem_statement}

Structure:
## Executive Summary
Investment required, expected ROI, payback period, strategic alignment

## Problem & Market Opportunity
Current situation, market size (TAM/SAM), competitive landscape

## Proposed Solution
Solution description, key capabilities, success criteria

## Financial Analysis
Investment breakdown, 3-year revenue projections, ROI/NPV/payback, cost-benefit

## Risk Assessment
High-impact risks (market/technical/resource) with probability, impact, mitigation

## Implementation Timeline
3-phase approach with months, deliverables, investment per phase

## Recommendation & Next Steps
Proceed/conditions, rationale, immediate actions, approval requirements

Use specific numbers and realistic estimates. Professional markdown formatting.`,
    temperature: 0.2,
    maxTokens: 1800
  },

  feasibilityStudy: {
    systemPrompt: "You are an expert project feasibility analyst evaluating technical, financial, market, and operational viability.",
    userPrompt: (project: MVPProject) => `Create a feasibility study for "${project.name}" in ${project.industry}.

Problem: ${project.problem_statement}

Structure:
## Executive Summary
Overall feasibility (HIGH/MEDIUM/LOW), key findings per dimension, recommendation

## Technical Feasibility
Technology requirements, risks, infrastructure needs, team assessment

## Financial Feasibility  
Cost analysis, revenue model viability, projections, financial risks

## Market Feasibility
Market size/opportunity, competitive analysis, customer validation, market risks

## Operational Feasibility
Resource requirements, organizational impact, operational risks

## Legal & Regulatory
Regulatory environment, IP strategy, legal risks

## Risk Summary & Recommendations
Critical success factors, high-priority risks, monitoring plan, next steps

Rate each dimension HIGH/MEDIUM/LOW with specific rationale.`,
    temperature: 0.2,
    maxTokens: 2000
  },

  projectCharter: {
    systemPrompt: "You are a PMP-certified project management professional creating formal project charters.",
    userPrompt: (project: MVPProject) => `Create a project charter for "${project.name}" in ${project.industry}.

Problem: ${project.problem_statement}

Structure:
## Project Information
Name, PM, sponsor, date, version, classification

## Business Case Summary
Business need, problem statement, expected value

## Objectives & Success Criteria
SMART objectives, success metrics, acceptance criteria

## Scope Definition
In-scope deliverables, out-of-scope items, assumptions, constraints

## Stakeholder Identification
Key stakeholders with roles, responsibilities, influence levels

## High-Level Timeline & Budget
Major milestones, resource requirements, budget estimate

## Project Risks & Assumptions
Top risks, key assumptions, initial mitigation strategies

## Authority & Approval
PM authority levels, approval requirements, governance structure

Professional project management format with clear accountability.`,
    temperature: 0.2,
    maxTokens: 1500
  },

  scopeStatement: {
    systemPrompt: "You are an expert project manager creating detailed scope statements that prevent scope creep.",
    userPrompt: (project: MVPProject) => `Create a scope statement for "${project.name}" in ${project.industry}.

Problem: ${project.problem_statement}

Structure:
## Product Scope Description
What the project will deliver, product characteristics, requirements

## Project Scope Description
Work required to deliver the product, management activities

## Major Deliverables
Specific, measurable outputs with acceptance criteria

## Project Acceptance Criteria
Conditions that must be met for project acceptance

## Project Boundaries (In/Out of Scope)
Clear boundaries, what's included/excluded, interfaces

## Project Constraints & Assumptions
Time, budget, resource, quality constraints, key assumptions

## Work Breakdown Structure (High-Level)
Major work packages with estimated effort

Be specific and measurable to prevent scope creep. Professional PM format.`,
    temperature: 0.2,
    maxTokens: 1200
  },

  rfp: {
    systemPrompt: "You are an expert procurement specialist creating comprehensive RFPs that attract qualified vendors and facilitate effective vendor selection.",
    userPrompt: (project: MVPProject) => `Create a Request for Proposal (RFP) for "${project.name}" in ${project.industry}.

Problem: ${project.problem_statement}

Structure:
## Executive Summary
Project overview, objectives, timeline, budget range, key success factors

## Project Requirements
- Functional requirements and specifications
- Technical requirements and standards
- Performance and security requirements
- Integration and compatibility needs

## Vendor Requirements
- Minimum qualifications and experience
- Required certifications and credentials
- Portfolio and reference requirements
- Team composition and expertise

## Evaluation Criteria
- Technical approach and methodology (40%)
- Vendor qualifications and experience (25%)
- Cost and pricing structure (20%)
- Timeline and project management (15%)

## Proposal Format
- Required sections and structure
- Submission guidelines and deadlines
- Q&A process and timeline
- Contract terms and conditions

Create a professional RFP that enables fair vendor evaluation and selection.`,
    temperature: 0.2,
    maxTokens: 2000
  }
};

// Optimized generation service with caching and batch processing
export class OptimizedGenerationService {
  // Cache for recently generated content
  private static cache = new Map<string, { content: string; timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Generate document with optimized prompts and caching
  static async generateDocument(
    type: keyof typeof GENERATION_TEMPLATES,
    project: MVPProject,
    useCase?: string
  ): Promise<AIGenerationResponse> {
    try {
      // Create cache key
      const cacheKey = `${type}-${project.name}-${project.industry}-${useCase || ''}`;
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
        console.log(`Cache hit for ${type} generation`);
        return {
          success: true,
          content: cached.content
        };
      }

      console.log(`Starting optimized ${type} generation for project:`, project.name);

      const template = GENERATION_TEMPLATES[type];
      let userPrompt: string;

      // Handle different prompt signatures
      if (type === 'modelAdvice' && useCase) {
        userPrompt = (template.userPrompt as (project: MVPProject, useCase: string) => string)(project, useCase);
      } else {
        userPrompt = (template.userPrompt as (project: MVPProject) => string)(project);
      }

      // Try Kimi model first for technical content, default for creative
      const modelToUse = ['modelAdvice', 'feasibilityStudy', 'businessCase'].includes(type) 
        ? 'kimi-k2-0711-preview' 
        : 'default';

      let response;
      try {
        response = await ai.createChatCompletion({
          model: modelToUse === 'kimi-k2-0711-preview' ? 'default' : modelToUse, // Use default model instead of kimi
          messages: [
            {
              role: 'system',
              content: template.systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: template.temperature,
          max_tokens: template.maxTokens
        });
      } catch (modelError) {
        if (modelToUse === 'kimi-k2-0711-preview') {
          console.log('Kimi model failed, falling back to default model:', modelError);
          response = await ai.createChatCompletion({
            model: 'default',
            messages: [
              {
                role: 'system',
                content: template.systemPrompt
              },
              {
                role: 'user',
                content: userPrompt
              }
            ],
            temperature: template.temperature,
            max_tokens: template.maxTokens
          });
        } else {
          throw modelError;
        }
      }

      const content = response.choices[0]?.message?.content || '';
      
      if (!content.trim()) {
        throw new Error('AI returned empty content');
      }

      // Cache the result
      this.cache.set(cacheKey, {
        content,
        timestamp: Date.now()
      });

      // Clean old cache entries
      this.cleanCache();

      console.log(`Optimized ${type} generation successful, content length:`, content.length);

      return {
        success: true,
        content
      };
    } catch (error) {
      console.error(`Failed to generate ${type}:`, error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('authentication')) {
        return {
          success: false,
          content: '',
          error: 'Authentication required. Please log in again.'
        };
      }
      
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : `Unknown error occurred while generating ${type}`
      };
    }
  }

  // Batch generation for multiple documents
  static async generateBatch(
    requests: Array<{
      type: keyof typeof GENERATION_TEMPLATES;
      project: MVPProject;
      useCase?: string;
    }>
  ): Promise<Array<AIGenerationResponse & { type: keyof typeof GENERATION_TEMPLATES }>> {
    console.log(`Starting batch generation for ${requests.length} documents`);
    
    // Process requests in parallel with a concurrency limit
    const BATCH_SIZE = 3; // Process 3 at a time to avoid rate limits
    const results: Array<AIGenerationResponse & { type: keyof typeof GENERATION_TEMPLATES }> = [];
    
    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
      const batch = requests.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (request) => {
        const result = await this.generateDocument(request.type, request.project, request.useCase);
        return { ...result, type: request.type };
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches to respect rate limits
      if (i + BATCH_SIZE < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`Batch generation completed: ${results.filter(r => r.success).length}/${requests.length} successful`);
    return results;
  }

  // Enhanced document enhancement with faster processing
  static async enhanceDocument(
    document: any,
    userInput: string,
    currentContent: string,
    project: MVPProject
  ): Promise<AIGenerationResponse & { enhancedContent?: string }> {
    try {
      const prompt = `Enhance this ${document.document_type.replace('_', ' ')} for "${project.name}" in ${project.industry}.

Current content: ${currentContent.slice(0, 1000)}...

User request: "${userInput}"

Provide both:
RESPONSE: [Conversational explanation of changes]
ENHANCED_CONTENT: [Complete enhanced document OR "NONE" if no changes needed]

Focus on: specificity, actionability, professional formatting, measurable outcomes.`;

      const response = await ai.createChatCompletion({
        model: 'default', // Use default model instead of kimi
        messages: [
          {
            role: 'system',
            content: 'You are an expert consultant providing document enhancements. Be concise but thorough.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500 // Reduced from 2000
      });

      const fullResponse = response.choices[0]?.message?.content || '';
      const responseParts = fullResponse.split('ENHANCED_CONTENT:');
      const conversationalResponse = responseParts[0].replace('RESPONSE:', '').trim();
      const enhancedContent = responseParts[1]?.trim();

      return {
        success: true,
        content: conversationalResponse,
        enhancedContent: enhancedContent && enhancedContent !== 'NONE' ? enhancedContent : undefined
      };
    } catch (error) {
      console.error('Failed to enhance document:', error);
      return {
        success: false,
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Clean old cache entries
  private static cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  // Clear cache manually
  static clearCache(): void {
    this.cache.clear();
    console.log('Generation cache cleared');
  }

  // Get cache statistics
  static getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}