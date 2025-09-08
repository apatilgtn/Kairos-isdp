import { DiagramGenerationRequest } from '@/services/ai-diagram-service';

export const AI_DIAGRAM_DEMO_TEMPLATES: DiagramGenerationRequest[] = [
  {
    title: "User Authentication Flow",
    description: "Complete user authentication system showing login, registration, password reset, and multi-factor authentication flow with error handling and security measures",
    diagramType: "flowchart",
    complexity: "moderate",
    style: "professional",
    projectContext: "Web Application Security"
  },
  {
    title: "Microservices Architecture",
    description: "Modern microservices architecture with API gateway, service mesh, database per service, message queues, and monitoring infrastructure",
    diagramType: "architecture",
    complexity: "complex",
    style: "technical",
    projectContext: "Enterprise System Design"
  },
  {
    title: "E-commerce Customer Journey",
    description: "Complete customer journey from product discovery through purchase, including touchpoints, pain points, emotions, and optimization opportunities",
    diagramType: "user_journey",
    complexity: "moderate",
    style: "colorful",
    projectContext: "E-commerce Platform"
  },
  {
    title: "Data Processing Pipeline",
    description: "Real-time data processing pipeline with data ingestion, transformation, validation, storage, and analytics components with error handling",
    diagramType: "data_flow",
    complexity: "complex",
    style: "modern",
    projectContext: "Big Data Analytics"
  },
  {
    title: "Product Development Timeline",
    description: "Comprehensive product development timeline showing research, design, development, testing, and launch phases with dependencies and milestones",
    diagramType: "timeline",
    complexity: "moderate",
    style: "minimal",
    projectContext: "Product Management"
  },
  {
    title: "Network Infrastructure Design",
    description: "Enterprise network infrastructure with DMZ, internal networks, security zones, load balancers, firewalls, and monitoring systems",
    diagramType: "network",
    complexity: "complex",
    style: "technical",
    projectContext: "IT Infrastructure"
  },
  {
    title: "Database Schema Design",
    description: "Comprehensive database schema for e-commerce platform with user management, product catalog, orders, inventory, and analytics tables",
    diagramType: "database_schema",
    complexity: "moderate",
    style: "professional",
    projectContext: "E-commerce Database"
  },
  {
    title: "Agile Development Process",
    description: "Complete agile development process flow including sprint planning, daily standups, development, testing, review, and retrospective phases",
    diagramType: "process_flow",
    complexity: "moderate",
    style: "hand_drawn",
    projectContext: "Software Development"
  },
  {
    title: "Cloud Migration Strategy",
    description: "Step-by-step cloud migration strategy showing assessment, planning, migration phases, validation, and optimization with risk mitigation",
    diagramType: "flowchart",
    complexity: "complex",
    style: "modern",
    projectContext: "Cloud Transformation"
  },
  {
    title: "Organizational Structure",
    description: "Modern organizational hierarchy with cross-functional teams, reporting relationships, communication channels, and decision-making authority",
    diagramType: "organization",
    complexity: "moderate",
    style: "professional",
    projectContext: "Human Resources"
  }
];

export const AI_DIAGRAM_STYLE_EXAMPLES = {
  professional: {
    description: "Clean, corporate design with blue and gray colors, professional typography, and business-ready presentation",
    useCases: ["Business presentations", "Executive reports", "Client deliverables"]
  },
  modern: {
    description: "Sleek, contemporary design with vibrant colors, modern flat design principles, and engaging visual hierarchy",
    useCases: ["Tech startups", "Digital products", "Innovation projects"]
  },
  minimal: {
    description: "Clean, simple design with monochrome colors, accent highlights, and lots of white space for clarity",
    useCases: ["Documentation", "Technical specifications", "Process guides"]
  },
  colorful: {
    description: "Bright, engaging colors with visual appeal, distinct color coding, and attention-grabbing elements",
    useCases: ["Marketing materials", "User experience flows", "Training content"]
  },
  technical: {
    description: "Detailed, engineering-style design with precise elements, technical annotations, and comprehensive detail",
    useCases: ["System documentation", "Technical architecture", "Engineering specs"]
  },
  hand_drawn: {
    description: "Sketch-like appearance with organic lines, creative styling, and approachable visual aesthetic",
    useCases: ["Brainstorming sessions", "Creative workshops", "Informal documentation"]
  }
};

export const AI_DIAGRAM_TYPE_EXAMPLES = {
  flowchart: {
    description: "Process flow diagrams with decision points, start/end nodes, and clear directional arrows",
    bestFor: ["Business processes", "Decision trees", "Workflow automation", "User interactions"]
  },
  architecture: {
    description: "System architecture diagrams showing components, layers, connections, and relationships",
    bestFor: ["Software architecture", "Infrastructure design", "System integration", "Technology stack"]
  },
  system_design: {
    description: "Technical system design with modules, interfaces, data flow, and component interactions",
    bestFor: ["Software design", "API architecture", "Database design", "Integration patterns"]
  },
  user_journey: {
    description: "User experience flows showing touchpoints, emotions, interactions, and improvement opportunities",
    bestFor: ["UX design", "Customer experience", "Service design", "Product optimization"]
  },
  process_flow: {
    description: "Business process diagrams with roles, activities, decision points, and workflow sequences",
    bestFor: ["Business analysis", "Process improvement", "Operations management", "Compliance documentation"]
  },
  data_flow: {
    description: "Data flow diagrams showing data stores, processes, external entities, and information movement",
    bestFor: ["Data architecture", "Analytics pipelines", "Integration design", "Information systems"]
  },
  organization: {
    description: "Organizational hierarchy charts with roles, reporting structures, and team relationships",
    bestFor: ["HR documentation", "Team structure", "Reporting relationships", "Organizational design"]
  },
  timeline: {
    description: "Timeline diagrams showing events, milestones, chronological progression, and dependencies",
    bestFor: ["Project planning", "Roadmaps", "Historical analysis", "Development phases"]
  },
  network: {
    description: "Network topology diagrams with devices, connections, protocols, and infrastructure components",
    bestFor: ["IT infrastructure", "Network design", "Security architecture", "System administration"]
  },
  database_schema: {
    description: "Database entity relationship diagrams with tables, relationships, keys, and data structures",
    bestFor: ["Database design", "Data modeling", "Schema documentation", "Development planning"]
  }
};

export const generateDemoRequest = (template: DiagramGenerationRequest): DiagramGenerationRequest => {
  return {
    ...template,
    projectContext: `Demo: ${template.projectContext}`
  };
};

export const getRandomDemoTemplate = (): DiagramGenerationRequest => {
  const randomIndex = Math.floor(Math.random() * AI_DIAGRAM_DEMO_TEMPLATES.length);
  return generateDemoRequest(AI_DIAGRAM_DEMO_TEMPLATES[randomIndex]);
};