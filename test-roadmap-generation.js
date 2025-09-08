// Test script for MVP Roadmap AI generation with real project data
// This will help us test and refine the AI prompts

const testProjects = [
  {
    name: "EcoTrack",
    industry: "Environmental Technology",
    problem_statement: "Individuals and businesses struggle to track and reduce their carbon footprint due to lack of accessible, accurate, and actionable tools. Current solutions are either too complex for everyday users or too expensive for small businesses."
  },
  {
    name: "StudyBuddy AI",
    industry: "Education Technology",
    problem_statement: "Students struggle with personalized learning and often lack immediate feedback on their progress. Traditional study methods don't adapt to individual learning styles, leading to inefficient study sessions and poor retention rates."
  },
  {
    name: "LocalMart Connect",
    industry: "E-commerce/Local Business",
    problem_statement: "Small local businesses struggle to compete with large online retailers due to limited digital presence and customer reach. Customers want to support local businesses but find it difficult to discover and purchase from them conveniently."
  },
  {
    name: "MindfulnessAI",
    industry: "Mental Health & Wellness",
    problem_statement: "People experiencing stress and anxiety lack personalized, accessible mental health support that adapts to their daily routines and emotional states. Generic mindfulness apps don't provide the personalized guidance needed for effective stress management."
  },
  {
    name: "CodeReview Pro",
    industry: "Developer Tools",
    problem_statement: "Software development teams spend too much time on manual code reviews, missing critical bugs and security vulnerabilities. Junior developers lack proper guidance during code reviews, while senior developers are overwhelmed with review requests."
  }
];

// Expected AI generation outputs we want to test for quality:
const expectedRoadmapSections = [
  "Executive Summary",
  "Core Features", 
  "Risk Analysis & Mitigation",
  "Success Metrics & KPIs",
  "Development Milestones",
  "Go-to-Market Strategy"
];

const expectedElevatorPitchElements = [
  "Hook - attention-grabbing opening",
  "Problem - clearly define the pain point", 
  "Solution - unique approach",
  "Market - target audience and size",
  "Traction - progress made",
  "Ask - what you need to succeed"
];

const expectedModelAdviceElements = [
  "Recommended Pre-trained Models",
  "Datasets for Training/Fine-tuning", 
  "Implementation Approach",
  "Performance Expectations",
  "Fine-tuning Strategy"
];

// This is for manual testing - the actual API calls would be made through the React app
console.log("Test project data ready for AI generation testing:");
console.log(JSON.stringify(testProjects, null, 2));