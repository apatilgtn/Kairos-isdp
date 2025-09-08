/**
 * Sample Data Initializer
 * Creates sample projects and documents for demonstration and testing
 */

import { APIService } from './api';
import type { MVPProject, RoadmapDocument } from '@/types';

interface SampleProjectData {
  name: string;
  industry: string;
  problem_statement: string;
  status: 'draft' | 'active' | 'completed';
  documents: Array<{
    document_type: string;
    title: string;
    content: string;
  }>;
}

const SAMPLE_PROJECTS: SampleProjectData[] = [
  {
    name: 'EcoTrack Carbon Footprint Platform',
    industry: 'Environmental Technology',
    problem_statement: 'Organizations struggle to accurately measure, track, and reduce their carbon footprint across complex supply chains and operations.',
    status: 'active',
    documents: [
      {
        document_type: 'roadmap',
        title: 'EcoTrack - MVP Development Roadmap',
        content: `# EcoTrack Carbon Footprint Platform - MVP Roadmap

## Executive Summary
EcoTrack is a comprehensive carbon footprint tracking platform designed to help organizations measure, monitor, and reduce their environmental impact across their entire value chain.

## Phase 1: Core Tracking System (Months 1-3)
### Key Features
- Carbon footprint calculator for Scope 1, 2, and 3 emissions
- Data integration with utility providers and supply chain partners
- Real-time dashboard with emissions visualization
- Basic reporting and analytics

### Success Metrics
- Track 80% of direct emissions (Scope 1 & 2)
- Connect to 5 major utility providers
- Generate first comprehensive carbon report

## Phase 2: Supply Chain Integration (Months 4-6)
### Key Features
- Supplier emission data collection
- Supply chain mapping and visualization
- Automated data validation and quality checks
- Collaborative supplier portal

### Success Metrics
- Map 70% of supply chain emissions
- Onboard 50+ suppliers to the platform
- Achieve 95% data accuracy

## Phase 3: Reduction & Optimization (Months 7-9)
### Key Features
- AI-powered reduction recommendations
- Carbon offset marketplace integration
- Goal setting and progress tracking
- Sustainability reporting automation

### Success Metrics
- Generate 100+ actionable reduction recommendations
- Enable 20% average emission reduction
- Automate regulatory compliance reporting`
      },
      {
        document_type: 'business_case',
        title: 'EcoTrack - Business Case Analysis',
        content: `# Business Case: EcoTrack Carbon Footprint Platform

## Market Opportunity
The global carbon management software market is projected to reach $12.4 billion by 2026, growing at 15.2% CAGR.

## Financial Projections
- Year 1 Revenue: $2.5M
- Year 2 Revenue: $8.2M  
- Year 3 Revenue: $22.1M
- Break-even: Month 18

## Competitive Advantage
- Real-time supply chain integration
- AI-powered reduction recommendations
- Regulatory compliance automation
- 70% faster implementation than competitors

## Investment Requirements
- Initial funding: $3.2M
- Technology development: $1.8M
- Market entry: $1.4M`
      }
    ]
  },
  {
    name: 'MediConnect Telemedicine Platform',
    industry: 'Healthcare Technology',
    problem_statement: 'Rural communities lack access to specialized healthcare services, resulting in delayed diagnoses and inadequate treatment outcomes.',
    status: 'active',
    documents: [
      {
        document_type: 'feasibility_study',
        title: 'MediConnect - Technical Feasibility Study',
        content: `# MediConnect Telemedicine Platform - Feasibility Study

## Technical Architecture
- HIPAA-compliant cloud infrastructure
- End-to-end encryption for all communications
- AI-powered diagnostic assistance
- Integration with major EMR systems

## Regulatory Compliance
- FDA approval pathway for diagnostic tools
- State licensing requirements for telemedicine
- GDPR compliance for international expansion
- Medicare/Medicaid reimbursement eligibility

## Market Analysis
- Target: 2,100 rural hospitals in the US
- Addressable market: $8.3B
- Competition: 12 major players, fragmented market
- Differentiation: AI diagnostics + specialist network

## Financial Viability
- Development cost: $4.2M over 18 months
- Revenue model: SaaS + transaction fees
- Break-even: 850 healthcare facilities
- 5-year ROI: 340%`
      }
    ]
  },
  {
    name: 'FinTech Credit Scoring Revolution',
    industry: 'Financial Technology',
    problem_statement: 'Traditional credit scoring methods exclude millions of creditworthy individuals who lack conventional credit history, particularly affecting underbanked populations.',
    status: 'draft',
    documents: [
      {
        document_type: 'project_charter',
        title: 'FinTech Credit Scoring - Project Charter',
        content: `# Project Charter: Alternative Credit Scoring Platform

## Project Scope
Develop an AI-powered alternative credit scoring system that uses non-traditional data sources to assess creditworthiness for underbanked populations.

## Business Objectives
- Expand credit access to 15M underbanked individuals
- Achieve 85% accuracy in default prediction
- Reduce processing time from days to minutes
- Generate $50M in annual revenue by year 3

## Key Stakeholders
- Project Sponsor: CEO, Sarah Chen
- Product Owner: VP Product, Mike Rodriguez
- Technical Lead: CTO, Dr. Emily Watson
- Compliance Officer: Legal, Robert Kim

## Success Criteria
- Model accuracy > 85% with 99.5% uptime
- Regulatory approval in 5 major states
- Partnership with 3 major lenders
- Process 100K+ applications monthly

## Timeline
- Phase 1: Research & Development (6 months)
- Phase 2: Pilot Testing (3 months)
- Phase 3: Market Launch (3 months)

## Budget: $6.8M`
      }
    ]
  },
  {
    name: 'RetailIQ Inventory Optimization',
    industry: 'Retail Technology',
    problem_statement: 'Retail businesses lose $1.1 trillion annually due to overstocking and stockouts, with 43% of small retailers lacking adequate inventory management systems.',
    status: 'completed',
    documents: [
      {
        document_type: 'scope_statement',
        title: 'RetailIQ - Project Scope Statement',
        content: `# Project Scope Statement: RetailIQ Inventory Optimization Platform

## Project Description
RetailIQ is an AI-powered inventory optimization platform that predicts demand, optimizes stock levels, and automates purchasing decisions for retail businesses.

## In Scope
- Demand forecasting using machine learning
- Automated reorder point calculations
- Supplier integration and procurement automation
- Real-time inventory tracking and alerts
- Performance analytics and reporting
- Mobile app for store managers
- Integration with 15+ POS systems

## Out of Scope
- Point-of-sale hardware
- Warehouse management systems
- Employee scheduling
- Customer relationship management
- Financial accounting features

## Deliverables
- Web-based dashboard application
- Mobile iOS and Android apps
- API integrations with POS systems
- Machine learning prediction engine
- Automated reporting system
- User training materials

## Assumptions
- Clients have existing POS systems
- Internet connectivity available at all locations
- Basic computer literacy among users
- Access to 12+ months of historical sales data

## Constraints
- Must comply with PCI-DSS requirements
- Limited to English language initially
- Budget cap of $2.8M
- 12-month development timeline`
      },
      {
        document_type: 'rfp',
        title: 'RetailIQ - Technology Vendor RFP',
        content: `# Request for Proposal: RetailIQ Technology Development

## Project Overview
Seeking qualified technology partners to develop RetailIQ, an AI-powered inventory optimization platform for retail businesses.

## Technical Requirements
- Cloud-native architecture (AWS/Azure/GCP)
- Machine learning capabilities for demand forecasting
- Real-time data processing and analytics
- Mobile application development (iOS/Android)
- API development and third-party integrations
- GDPR and PCI-DSS compliance

## Functional Requirements
- Support for 10,000+ concurrent users
- 99.9% uptime SLA requirement
- Sub-second response times
- Multi-tenant architecture
- Role-based access control
- Automated backup and disaster recovery

## Proposal Requirements
- Company profile and relevant experience
- Technical approach and architecture
- Project timeline and milestones
- Team composition and qualifications
- Pricing structure and payment terms
- References from similar projects

## Evaluation Criteria
- Technical expertise (30%)
- Relevant experience (25%)
- Cost competitiveness (20%)
- Timeline feasibility (15%)
- Innovation and approach (10%)

## Submission Deadline: March 15, 2024
## Project Start Date: April 1, 2024
## Budget Range: $2.0M - $2.8M`
      }
    ]
  },
  {
    name: 'EduFlow Learning Management System',
    industry: 'Education Technology',
    problem_statement: 'Educational institutions struggle with fragmented learning tools, poor student engagement tracking, and lack of personalized learning paths.',
    status: 'active',
    documents: [
      {
        document_type: 'roadmap',
        title: 'EduFlow - Product Development Roadmap',
        content: `# EduFlow Learning Management System - Product Roadmap

## Vision Statement
Transform education through personalized, AI-driven learning experiences that adapt to each student's unique needs and learning style.

## Quarter 1: Foundation Platform
### Core Features
- User management (students, teachers, administrators)
- Course creation and content management
- Basic assignment and grading system
- Video conferencing integration
- Mobile-responsive design

### Success Metrics
- 500+ educators registered
- 95% uptime achievement
- 4.2+ app store rating

## Quarter 2: AI-Powered Personalization
### Advanced Features
- Adaptive learning algorithms
- Personalized study recommendations
- Learning analytics dashboard
- Automated content curation
- Performance prediction models

### Success Metrics
- 15% improvement in student engagement
- 20% increase in course completion rates
- AI recommendations accuracy > 80%

## Quarter 3: Collaboration & Assessment
### Enhanced Features
- Peer-to-peer learning tools
- Advanced assessment builder
- Plagiarism detection system
- Group project management
- Real-time collaboration spaces

### Success Metrics
- 50,000+ active students
- 25% reduction in grading time
- 90% user satisfaction score

## Quarter 4: Enterprise & Analytics
### Enterprise Features
- Single sign-on (SSO) integration
- Advanced reporting and analytics
- Custom branding and white-labeling
- API for third-party integrations
- Enterprise security compliance

### Success Metrics
- 100+ institutional clients
- $5M ARR achievement
- 99.95% security compliance audit`
      }
    ]
  }
];

export class SampleDataInitializer {
  private static instance: SampleDataInitializer;
  
  public static getInstance(): SampleDataInitializer {
    if (!SampleDataInitializer.instance) {
      SampleDataInitializer.instance = new SampleDataInitializer();
    }
    return SampleDataInitializer.instance;
  }

  /**
   * Initialize sample data if no projects exist
   */
  async initializeSampleData(): Promise<void> {
    try {
      console.log('🎯 Checking for existing projects...');
      const existingProjects = await APIService.getProjects();
      
      if (existingProjects.length > 0) {
        console.log(`✅ Found ${existingProjects.length} existing projects, skipping initialization`);
        return;
      }

      console.log('🚀 No projects found, initializing sample data...');
      
      for (const projectData of SAMPLE_PROJECTS) {
        await this.createSampleProject(projectData);
      }

      console.log(`✅ Successfully initialized ${SAMPLE_PROJECTS.length} sample projects with documents`);
    } catch (error) {
      console.error('❌ Failed to initialize sample data:', error);
    }
  }

  /**
   * Force create sample data (for testing)
   */
  async forceSampleDataCreation(): Promise<void> {
    try {
      console.log('🔄 Force creating sample data...');
      
      for (const projectData of SAMPLE_PROJECTS) {
        await this.createSampleProject(projectData);
      }

      console.log(`✅ Force created ${SAMPLE_PROJECTS.length} sample projects`);
    } catch (error) {
      console.error('❌ Failed to force create sample data:', error);
      throw error;
    }
  }

  /**
   * Create a single sample project with its documents
   */
  private async createSampleProject(projectData: SampleProjectData): Promise<void> {
    try {
      // Create the project
      await APIService.createProject({
        name: projectData.name,
        industry: projectData.industry,
        problem_statement: projectData.problem_statement,
        status: projectData.status
      });

      console.log(`📁 Created project: ${projectData.name}`);

      // Get the created project to get its ID
      const projects = await APIService.getProjects();
      const project = projects.find(p => p.name === projectData.name);
      
      if (!project) {
        throw new Error(`Could not find created project: ${projectData.name}`);
      }

      // Create documents for the project
      for (const docData of projectData.documents) {
        await APIService.saveDocument({
          project_id: project._id,
          document_type: docData.document_type as any,
          title: docData.title,
          content: docData.content
        });

        console.log(`📄 Created document: ${docData.title}`);
      }

      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to create project ${projectData.name}:`, error);
      throw error;
    }
  }

  /**
   * Clear all sample data (for testing)
   */
  async clearAllData(): Promise<void> {
    try {
      console.log('🗑️ Clearing all data...');
      
      const projects = await APIService.getProjects();
      
      for (const project of projects) {
        // Get and delete all documents for this project
        const documents = await APIService.getDocuments(project._id);
        for (const doc of documents) {
          await APIService.deleteDocument(project._uid, doc._id);
        }
        
        // Delete the project
        await APIService.deleteProject(project._uid, project._id);
      }

      console.log(`✅ Cleared ${projects.length} projects and their documents`);
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
      throw error;
    }
  }

  /**
   * Get statistics about current data
   */
  async getDataStatistics(): Promise<{
    projectCount: number;
    documentCount: number;
    projectsByStatus: Record<string, number>;
    documentsByType: Record<string, number>;
  }> {
    try {
      const projects = await APIService.getProjects();
      let totalDocuments = 0;
      const projectsByStatus: Record<string, number> = {};
      const documentsByType: Record<string, number> = {};

      for (const project of projects) {
        // Count projects by status
        projectsByStatus[project.status] = (projectsByStatus[project.status] || 0) + 1;

        // Count documents
        const documents = await APIService.getDocuments(project._id);
        totalDocuments += documents.length;

        // Count documents by type
        documents.forEach(doc => {
          documentsByType[doc.document_type] = (documentsByType[doc.document_type] || 0) + 1;
        });
      }

      return {
        projectCount: projects.length,
        documentCount: totalDocuments,
        projectsByStatus,
        documentsByType
      };
    } catch (error) {
      console.error('Failed to get data statistics:', error);
      return {
        projectCount: 0,
        documentCount: 0,
        projectsByStatus: {},
        documentsByType: {}
      };
    }
  }
}

// Export singleton instance
export const sampleDataInitializer = SampleDataInitializer.getInstance();