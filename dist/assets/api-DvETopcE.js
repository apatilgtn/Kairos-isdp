const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/jspdf.es.min-18wCuQnd.js","assets/index--Ct_i1hN.js","assets/index-C_IiQZB2.css","assets/enterprise-integrations-q6kIgPFV.js","assets/enhanced-ai-C0lXWFs-.js","assets/enhanced-diagrams-CCRib0vz.js"])))=>i.map(i=>d[i]);
var P=Object.defineProperty;var S=(l,e,t)=>e in l?P(l,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):l[e]=t;var b=(l,e,t)=>S(l,typeof e!="symbol"?e+"":e,t);import{h as o,_}from"./index--Ct_i1hN.js";const v=new o.DevvAI,R={roadmap:{systemPrompt:"You are a senior product strategist specializing in MVP roadmaps. Create actionable, realistic roadmaps with specific timelines and measurable outcomes.",userPrompt:l=>`Create a comprehensive MVP roadmap for "${l.name}" in ${l.industry}.

Problem: ${l.problem_statement}

Structure:
## Executive Summary
- Value proposition & target market
- 12-month outcomes & competitive advantage

## Core MVP Features (Max 6)
For each: Name, user story, priority, effort (XS/S/M/L/XL), success metric

## Development Timeline (16 weeks)
- Phase 1 (Weeks 1-6): Foundation
- Phase 2 (Weeks 7-12): Core Features  
- Phase 3 (Weeks 13-16): Launch Prep

## Risk Analysis & KPIs
- Technical, market, resource risks with mitigation
- User acquisition, engagement, business metrics

## Go-to-Market Strategy
- Target customer profile & launch strategy
- Marketing channels with budget estimates

Use professional markdown. Be specific with numbers, timelines, and actionable steps.`,temperature:.3,maxTokens:2e3},elevatorPitch:{systemPrompt:"You are an expert pitch coach creating compelling, investor-ready elevator pitches.",userPrompt:l=>`Create a 60-90 second elevator pitch for "${l.name}" in ${l.industry}.

Problem: ${l.problem_statement}

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

Make it conversational, memorable, and action-oriented.`,temperature:.7,maxTokens:600},modelAdvice:{systemPrompt:"You are an expert ML engineer providing practical AI/ML recommendations with specific tools and implementation steps.",userPrompt:(l,e)=>`Provide AI/ML recommendations for "${e}" in ${l.name} (${l.industry}).

Problem: ${l.problem_statement}

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

Focus on actionable advice with real model names and specific implementation steps.`,temperature:.2,maxTokens:1200},businessCase:{systemPrompt:"You are an expert business analyst creating investor-ready business cases with MBA-level financial analysis.",userPrompt:l=>`Create a business case for "${l.name}" in ${l.industry}.

Problem: ${l.problem_statement}

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

Use specific numbers and realistic estimates. Professional markdown formatting.`,temperature:.2,maxTokens:1800},feasibilityStudy:{systemPrompt:"You are an expert project feasibility analyst evaluating technical, financial, market, and operational viability.",userPrompt:l=>`Create a feasibility study for "${l.name}" in ${l.industry}.

Problem: ${l.problem_statement}

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

Rate each dimension HIGH/MEDIUM/LOW with specific rationale.`,temperature:.2,maxTokens:2e3},projectCharter:{systemPrompt:"You are a PMP-certified project management professional creating formal project charters.",userPrompt:l=>`Create a project charter for "${l.name}" in ${l.industry}.

Problem: ${l.problem_statement}

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

Professional project management format with clear accountability.`,temperature:.2,maxTokens:1500},scopeStatement:{systemPrompt:"You are an expert project manager creating detailed scope statements that prevent scope creep.",userPrompt:l=>`Create a scope statement for "${l.name}" in ${l.industry}.

Problem: ${l.problem_statement}

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

Be specific and measurable to prevent scope creep. Professional PM format.`,temperature:.2,maxTokens:1200}};class h{static async generateDocument(e,t,r){var a,i;try{const n=`${e}-${t.name}-${t.industry}-${r||""}`,m=this.cache.get(n);if(m&&Date.now()-m.timestamp<this.CACHE_DURATION)return console.log(`Cache hit for ${e} generation`),{success:!0,content:m.content};console.log(`Starting optimized ${e} generation for project:`,t.name);const c=R[e];let u;e==="modelAdvice"&&r?u=c.userPrompt(t,r):u=c.userPrompt(t);const d=["modelAdvice","feasibilityStudy","businessCase"].includes(e)?"kimi-k2-0711-preview":"default";let g;try{g=await v.chat.completions.create({model:d,messages:[{role:"system",content:c.systemPrompt},{role:"user",content:u}],temperature:c.temperature,max_tokens:c.maxTokens})}catch(p){if(d==="kimi-k2-0711-preview")console.log("Kimi model failed, falling back to default model:",p),g=await v.chat.completions.create({model:"default",messages:[{role:"system",content:c.systemPrompt},{role:"user",content:u}],temperature:c.temperature,max_tokens:c.maxTokens});else throw p}const f=((i=(a=g.choices[0])==null?void 0:a.message)==null?void 0:i.content)||"";if(!f.trim())throw new Error("AI returned empty content");return this.cache.set(n,{content:f,timestamp:Date.now()}),this.cleanCache(),console.log(`Optimized ${e} generation successful, content length:`,f.length),{success:!0,content:f}}catch(n){return console.error(`Failed to generate ${e}:`,n),n instanceof Error&&n.message.includes("authentication")?{success:!1,content:"",error:"Authentication required. Please log in again."}:{success:!1,content:"",error:n instanceof Error?n.message:`Unknown error occurred while generating ${e}`}}}static async generateBatch(e){console.log(`Starting batch generation for ${e.length} documents`);const t=3,r=[];for(let a=0;a<e.length;a+=t){const n=e.slice(a,a+t).map(async c=>({...await this.generateDocument(c.type,c.project,c.useCase),type:c.type})),m=await Promise.all(n);r.push(...m),a+t<e.length&&await new Promise(c=>setTimeout(c,1e3))}return console.log(`Batch generation completed: ${r.filter(a=>a.success).length}/${e.length} successful`),r}static async enhanceDocument(e,t,r,a){var i,n,m;try{const c=`Enhance this ${e.document_type.replace("_"," ")} for "${a.name}" in ${a.industry}.

Current content: ${r.slice(0,1e3)}...

User request: "${t}"

Provide both:
RESPONSE: [Conversational explanation of changes]
ENHANCED_CONTENT: [Complete enhanced document OR "NONE" if no changes needed]

Focus on: specificity, actionability, professional formatting, measurable outcomes.`,g=(((n=(i=(await v.chat.completions.create({model:"kimi-k2-0711-preview",messages:[{role:"system",content:"You are an expert consultant providing document enhancements. Be concise but thorough."},{role:"user",content:c}],temperature:.4,max_tokens:1500})).choices[0])==null?void 0:i.message)==null?void 0:n.content)||"").split("ENHANCED_CONTENT:"),f=g[0].replace("RESPONSE:","").trim(),p=(m=g[1])==null?void 0:m.trim();return{success:!0,content:f,enhancedContent:p&&p!=="NONE"?p:void 0}}catch(c){return console.error("Failed to enhance document:",c),{success:!1,content:"I apologize, but I encountered an error processing your request. Please try again.",error:c instanceof Error?c.message:"Unknown error occurred"}}}static cleanCache(){const e=Date.now();for(const[t,r]of this.cache.entries())e-r.timestamp>this.CACHE_DURATION&&this.cache.delete(t)}static clearCache(){this.cache.clear(),console.log("Generation cache cleared")}static getCacheStats(){return{size:this.cache.size,entries:Array.from(this.cache.keys())}}}b(h,"cache",new Map),b(h,"CACHE_DURATION",300*1e3);const s={MVP_PROJECTS:"ex9bhte55mv4",ROADMAP_DOCUMENTS:"ex9bi39apqf4",USER_DIAGRAMS:"ex9bic0ue58g",TEAMS:"exb304aazgg0",TEAM_MEMBERS:"exb30djqxbsw",TEAM_INVITATIONS:"exb30nx7qz9c",TEAM_ACTIVITIES:"exb30y9ulo8w",ENTERPRISE_INTEGRATIONS:"exba4zzl3bwg",EXPORT_JOBS:"exba5dujb01s",ENTERPRISE_SETTINGS:"exba5nrpai9s"},y=new o.DevvAI;class E{static async createProject(e){const t=Date.now();await o.table.addItem(s.MVP_PROJECTS,{...e,created_at:t,updated_at:t})}static async getProjects(){return(await o.table.getItems(s.MVP_PROJECTS,{sort:"_id",order:"desc",limit:50})).items}static async updateProject(e){await o.table.updateItem(s.MVP_PROJECTS,{...e,updated_at:Date.now()})}static async deleteProject(e,t){await o.table.deleteItem(s.MVP_PROJECTS,{_uid:e,_id:t})}static async saveDocument(e){await o.table.addItem(s.ROADMAP_DOCUMENTS,{...e,generated_at:Date.now(),status:"generated"})}static async updateRoadmapDocument(e,t){await o.table.updateItem(s.ROADMAP_DOCUMENTS,{_uid:"",_id:e,...t})}static async getDocuments(e){const t={sort:"_id",order:"desc",limit:100};return e&&(t.query={project_id:e}),(await o.table.getItems(s.ROADMAP_DOCUMENTS,t)).items}static async deleteDocument(e,t){await o.table.deleteItem(s.ROADMAP_DOCUMENTS,{_uid:e,_id:t})}static async saveDiagram(e){await o.table.addItem(s.USER_DIAGRAMS,{...e,created_at:Date.now()})}static async getDiagrams(e){const t={sort:"_id",order:"desc",limit:50};return e&&(t.query={project_id:e}),(await o.table.getItems(s.USER_DIAGRAMS,t)).items}static async updateDiagram(e){await o.table.updateItem(s.USER_DIAGRAMS,e)}static async deleteDiagram(e,t){await o.table.deleteItem(s.USER_DIAGRAMS,{_uid:e,_id:t})}static async checkAuthStatus(){try{const e=await y.chat.completions.create({model:"default",messages:[{role:"user",content:"test"}],max_tokens:1});return!0}catch(e){return console.error("Auth check failed:",e),!1}}static async generateRoadmap(e){return h.generateDocument("roadmap",e)}static async generateElevatorPitch(e){return h.generateDocument("elevatorPitch",e)}static async generateModelAdvice(e,t){return h.generateDocument("modelAdvice",t,e)}static async enhanceDocument(e,t,r,a){return h.enhanceDocument(e,t,r,a)}static async generateDiagramFromContent(e,t){var r,a;try{const i=`
Create a professional Mermaid.js diagram that visualizes the key concepts from this ${e.document_type.replace("_"," ")} document.

**PROJECT CONTEXT:**
- Project: ${t.name}
- Industry: ${t.industry}
- Document: ${e.title}

**DOCUMENT CONTENT:**
${e.content}

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
`;return{success:!0,content:((a=(r=(await y.chat.completions.create({model:"default",messages:[{role:"system",content:"You are an expert in creating clear, professional Mermaid.js diagrams that visualize complex information in an easy-to-understand format."},{role:"user",content:i}],temperature:.3,max_tokens:1e3})).choices[0])==null?void 0:r.message)==null?void 0:a.content)||""}}catch(i){return console.error("Failed to generate diagram:",i),{success:!1,content:"",error:i instanceof Error?i.message:"Unknown error occurred"}}}static async exportDocument(e,t){try{if(typeof window>"u")throw new Error("Export only available in browser environment");const r=e.content.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g,"").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/&/g,"&amp;");if(t==="docx"){const a=`
<!DOCTYPE html>
<html xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${e.title}</title>
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
    <h1>${e.title}</h1>
    <div class="document-meta">
      <strong>Document Type:</strong> ${e.document_type.replace("_"," ").toUpperCase()}<br>
      <strong>Generated:</strong> ${new Date(e.generated_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}<br>
      <strong>Status:</strong> ${e.status.toUpperCase()}
    </div>
  </div>
  
  <div class="document-content">
    ${this.markdownToHtml(r)}
  </div>
</body>
</html>`;return{success:!0,blob:new Blob([a],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"})}}else if(t==="pdf"){const{jsPDF:a}=await _(async()=>{const{jsPDF:p}=await import("./jspdf.es.min-18wCuQnd.js").then(w=>w.j);return{jsPDF:p}},__vite__mapDeps([0,1,2])),i=new a({orientation:"portrait",unit:"mm",format:"a4"}),n=20,m=i.internal.pageSize.getWidth(),c=i.internal.pageSize.getHeight(),u=m-n*2;let d=n;i.setFontSize(18),i.setFont("helvetica","bold"),i.text(e.title,n,d),d+=15,i.setFontSize(10),i.setFont("helvetica","normal"),i.setTextColor(128,128,128),i.text(`Generated: ${new Date(e.generated_at).toLocaleDateString()}`,n,d),d+=6,i.text(`Type: ${e.document_type.replace("_"," ")}`,n,d),d+=15,i.setDrawColor(52,152,219),i.setLineWidth(.5),i.line(n,d,m-n,d),d+=10,i.setFontSize(11),i.setFont("helvetica","normal"),i.setTextColor(0,0,0);const g=i.splitTextToSize(r,u);for(let p=0;p<g.length;p++)d>c-n&&(i.addPage(),d=n),i.text(g[p],n,d),d+=6;return{success:!0,blob:i.output("blob")}}return{success:!1,error:"Unsupported format"}}catch(r){return console.error("Export failed:",r),{success:!1,error:r instanceof Error?r.message:"Unknown error occurred"}}}static markdownToHtml(e){return e.replace(/^### (.*$)/gim,"<h3>$1</h3>").replace(/^## (.*$)/gim,"<h2>$1</h2>").replace(/^# (.*$)/gim,"<h1>$1</h1>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/```([\s\S]*?)```/g,"<pre><code>$1</code></pre>").replace(/`(.*?)`/g,"<code>$1</code>").replace(/^\* (.*$)/gim,"<li>$1</li>").replace(/^- (.*$)/gim,"<li>$1</li>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>").replace(/^(?!<[h|l|p])/gm,"<p>").replace(new RegExp("(?<!>)$","gm"),"</p>").replace(/<p><\/p>/g,"").replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g,"$1").replace(/<p>(<pre>.*<\/pre>)<\/p>/g,"$1").replace(/<p>(<li>.*<\/li>)<\/p>/g,"<ul>$1</ul>").replace(/<\/ul>\s*<ul>/g,"")}static async createTeam(e){await o.table.addItem(s.TEAMS,{...e,created_at:Date.now()})}static async getTeams(){return(await o.table.getItems(s.TEAMS,{sort:"_id",order:"desc",limit:50})).items}static async getTeamsByOwner(e){return(await o.table.getItems(s.TEAMS,{query:{owner_id:e},sort:"_id",order:"desc"})).items}static async updateTeam(e){await o.table.updateItem(s.TEAMS,e)}static async deleteTeam(e,t){await o.table.deleteItem(s.TEAMS,{_uid:e,_id:t})}static async addTeamMember(e){await o.table.addItem(s.TEAM_MEMBERS,{...e,joined_at:Date.now()})}static async getTeamMembers(e){return(await o.table.getItems(s.TEAM_MEMBERS,{query:{team_id:e},sort:"user_id",order:"asc"})).items}static async getUserTeams(e){return(await o.table.getItems(s.TEAM_MEMBERS,{query:{user_id:e},sort:"team_id",order:"asc"})).items}static async updateTeamMember(e){await o.table.updateItem(s.TEAM_MEMBERS,e)}static async removeTeamMember(e,t){await o.table.deleteItem(s.TEAM_MEMBERS,{_uid:e,_id:t})}static async createInvitation(e){const t=Math.random().toString(36).substring(2)+Date.now().toString(36);return await o.table.addItem(s.TEAM_INVITATIONS,{...e,invited_at:Date.now(),token:t}),t}static async getTeamInvitations(e){return(await o.table.getItems(s.TEAM_INVITATIONS,{query:{team_id:e},sort:"_id",order:"desc"})).items}static async getInvitationsByEmail(e){return(await o.table.getItems(s.TEAM_INVITATIONS,{query:{email:e},sort:"_id",order:"desc"})).items}static async updateInvitation(e){await o.table.updateItem(s.TEAM_INVITATIONS,e)}static async deleteInvitation(e,t){await o.table.deleteItem(s.TEAM_INVITATIONS,{_uid:e,_id:t})}static async logActivity(e){await o.table.addItem(s.TEAM_ACTIVITIES,{...e,timestamp:Date.now()})}static async getTeamActivities(e,t=50){return(await o.table.getItems(s.TEAM_ACTIVITIES,{query:{team_id:e},sort:"_id",order:"desc",limit:t})).items}static async getUserActivities(e,t=50){return(await o.table.getItems(s.TEAM_ACTIVITIES,{query:{user_id:e},sort:"_id",order:"desc",limit:t})).items}static async getTeamProjects(e){const t=await this.getTeamMembers(e),r=[];for(const i of t)try{const n=await o.table.getItems(s.MVP_PROJECTS,{query:{_uid:i.user_id},sort:"_id",order:"desc"});r.push(...n.items)}catch(n){console.error(`Failed to get projects for member ${i.user_id}:`,n)}return r.filter((i,n,m)=>n===m.findIndex(c=>c._id===i._id)).sort((i,n)=>n.updated_at-i.updated_at)}static async createDocumentEdit(e){return await o.table.addItem("document_edits",{document_id:e.document_id,edit_type:e.type,position:e.position,length:e.length,content:e.content,user_id:e.user_id,user_name:e.user_name,timestamp:e.timestamp,version:e.version}),{id:Date.now().toString(),document_id:e.document_id,user_id:e.user_id,user_name:e.user_name,type:e.type,position:e.position,length:e.length,content:e.content,timestamp:e.timestamp,version:e.version}}static async getDocumentEdits(e){return(await o.table.getItems("document_edits",{query:{document_id:e},sort:"_id",order:"desc"})).items.map(a=>({id:a._id,document_id:a.document_id,user_id:a.user_id,user_name:a.user_name,type:a.edit_type,position:a.position,length:a.length,content:a.content,timestamp:a.timestamp,version:a.version}))}static async deleteDocumentEdit(e){await o.table.deleteItem("document_edits",{_uid:"",_id:e})}static async createDocumentVersion(e){return await o.table.addItem("document_versions",{document_id:e.document_id,version:e.version,content:e.content,author_id:e.author_id,author_name:e.author_name,changes_summary:e.changes_summary,created_at:e.created_at,is_major:e.is_major?"true":"false"}),{_id:Date.now().toString(),_uid:"",_tid:"",document_id:e.document_id,version:e.version,content:e.content,author_id:e.author_id,author_name:e.author_name,changes_summary:e.changes_summary,created_at:e.created_at,is_major:e.is_major}}static async getDocumentVersions(e){return(await o.table.getItems("document_versions",{query:{document_id:e},sort:"_id",order:"desc"})).items.map(a=>({_id:a._id,_uid:a._uid,_tid:a._tid,document_id:a.document_id,version:a.version,content:a.content,author_id:a.author_id,author_name:a.author_name,changes_summary:a.changes_summary,created_at:a.created_at,is_major:a.is_major==="true"}))}static async acquireDocumentLock(e,t){const r=o.table,a=Date.now()+1800*1e3;return await r.addItem("document_locks",{document_id:e,locked_by:"",locked_by_name:"",locked_at:Date.now(),expires_at:a,section:t||""}),{_id:"",_uid:"",_tid:"",document_id:e,locked_by:"",locked_by_name:"",locked_at:Date.now(),expires_at:a,section:t||""}}static async releaseDocumentLock(e){const t=o.table,a=(await t.getItems("document_locks",{sort:"_id",order:"desc"})).items.find(i=>i.document_id===e);a&&await t.deleteItem("document_locks",{_uid:a._uid,_id:a._id})}static async getDocumentLock(e){const r=await o.table.getItems("document_locks"),a=Date.now(),i=r.items.find(n=>n.document_id===e&&n.expires_at>a);return i?{_id:i._id,_uid:i._uid,_tid:i._tid,document_id:i.document_id,locked_by:i.locked_by,locked_by_name:i.locked_by_name,locked_at:i.locked_at,expires_at:i.expires_at,section:i.section}:null}static async createDocumentComment(e){return await o.table.addItem("document_comments",{document_id:e.document_id,author_id:e.author_id,author_name:e.author_name,content:e.content,position:e.position,selection_text:e.selection_text,created_at:e.created_at,updated_at:e.updated_at||e.created_at,resolved:e.resolved?"true":"false",thread_id:e.thread_id||"",parent_comment_id:e.parent_comment_id||""}),{_id:Date.now().toString(),_uid:"",_tid:"",document_id:e.document_id,author_id:e.author_id,author_name:e.author_name,content:e.content,position:e.position,selection_text:e.selection_text,created_at:e.created_at,updated_at:e.updated_at||e.created_at,resolved:e.resolved||!1,thread_id:e.thread_id||"",parent_comment_id:e.parent_comment_id||""}}static async getDocumentComments(e){return(await o.table.getItems("document_comments",{query:{document_id:e},sort:"_id",order:"desc"})).items.map(a=>({_id:a._id,_uid:a._uid,_tid:a._tid,document_id:a.document_id,author_id:a.author_id,author_name:a.author_name,content:a.content,position:a.position,selection_text:a.selection_text,created_at:a.created_at,updated_at:a.updated_at,resolved:a.resolved==="true",resolved_by:a.resolved_by,thread_id:a.thread_id,parent_comment_id:a.parent_comment_id}))}static async getDocumentComment(e){const a=(await o.table.getItems("document_comments",{query:{_id:e},limit:1})).items[0];return a?{_id:a._id,_uid:a._uid,_tid:a._tid,document_id:a.document_id,author_id:a.author_id,author_name:a.author_name,content:a.content,position:a.position,selection_text:a.selection_text,created_at:a.created_at,updated_at:a.updated_at,resolved:a.resolved==="true",resolved_by:a.resolved_by,thread_id:a.thread_id,parent_comment_id:a.parent_comment_id}:null}static async resolveDocumentComment(e){await o.table.updateItem("document_comments",{_uid:"",_id:e,resolved:"true",resolved_by:""})}static async generateBusinessCase(e){return h.generateDocument("businessCase",e)}static async generateFeasibilityStudy(e){return h.generateDocument("feasibilityStudy",e)}static async _legacyGenerateFeasibilityStudy(e){var t,r;try{console.log("Starting feasibility study generation for project:",e.name);const a=`
As an expert project feasibility analyst, create a comprehensive feasibility study that thoroughly evaluates whether this project is practically achievable across all critical dimensions.

**PROJECT CONTEXT:**
- Name: ${e.name}
- Industry: ${e.industry}
- Problem: ${e.problem_statement}

**GENERATE A DETAILED FEASIBILITY STUDY WITH THESE SECTIONS:**

# Feasibility Study: ${e.name}

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
`;let i;try{i=await y.chat.completions.create({model:"kimi-k2-0711-preview",messages:[{role:"system",content:"You are an expert project feasibility analyst with experience in technical, financial, market, and operational assessment. Provide thorough, realistic evaluations."},{role:"user",content:a}],temperature:.2,max_tokens:3500})}catch(m){console.log("Kimi model failed, falling back to default model:",m),i=await y.chat.completions.create({model:"default",messages:[{role:"system",content:"You are an expert project feasibility analyst with experience in technical, financial, market, and operational assessment. Provide thorough, realistic evaluations."},{role:"user",content:a}],temperature:.2,max_tokens:3500})}return{success:!0,content:((r=(t=i.choices[0])==null?void 0:t.message)==null?void 0:r.content)||""}}catch(a){return console.error("Failed to generate feasibility study:",a),{success:!1,content:"",error:a instanceof Error?a.message:"Unknown error occurred"}}}static async generateProjectCharter(e){return h.generateDocument("projectCharter",e)}static async _legacyGenerateProjectCharter(e){var t,r;try{console.log("Starting project charter generation for project:",e.name);const a=`
As an expert project management professional with PMP certification, create a comprehensive project charter that formally authorizes this project and establishes clear governance.

**PROJECT CONTEXT:**
- Name: ${e.name}
- Industry: ${e.industry}
- Problem: ${e.problem_statement}

**GENERATE A DETAILED PROJECT CHARTER WITH THESE SECTIONS:**

# Project Charter: ${e.name}

## 1. Project Information

**Project Name:** ${e.name}

**Project Manager:** [To be assigned]

**Project Sponsor:** [Senior executive who champions this project]

**Charter Date:** [Current date]

**Charter Version:** 1.0

**Project Classification:** [Strategic/Operational/Compliance/Innovation]

## 2. Business Case Summary

**Business Need:**
[2-3 sentences describing why this project is necessary and its strategic importance]

**Problem Statement:**
${e.problem_statement}

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
`;return{success:!0,content:((r=(t=(await y.chat.completions.create({model:"default",messages:[{role:"system",content:"You are an expert project management professional with PMP certification and extensive experience in creating formal project charters that establish clear governance and authority."},{role:"user",content:a}],temperature:.1,max_tokens:3500})).choices[0])==null?void 0:t.message)==null?void 0:r.content)||""}}catch(a){return console.error("Failed to generate project charter:",a),{success:!1,content:"",error:a instanceof Error?a.message:"Unknown error occurred"}}}static async generateScopeStatement(e){return h.generateDocument("scopeStatement",e)}static async _legacyGenerateScopeStatement(e){var t,r;try{console.log("Starting scope statement generation for project:",e.name);const a=`
As an expert project management professional, create a comprehensive project scope statement that clearly defines what is included and excluded from this project to prevent scope creep and ensure stakeholder alignment.

**PROJECT CONTEXT:**
- Name: ${e.name}
- Industry: ${e.industry}
- Problem: ${e.problem_statement}

**GENERATE A DETAILED SCOPE STATEMENT WITH THESE SECTIONS:**

# Project Scope Statement: ${e.name}

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

This scope statement represents the agreed-upon boundaries for the ${e.name} project. Any work outside this scope requires formal change approval.

| Role | Name | Date |
|------|------|------|
| Project Manager | [Name] | _____ |
| Project Sponsor | [Name] | _____ |
| Business Owner | [Name] | _____ |

*This scope statement will be used as the baseline for project execution and change control.*
`;return{success:!0,content:((r=(t=(await y.chat.completions.create({model:"default",messages:[{role:"system",content:"You are an expert project management professional with extensive experience in creating detailed scope statements that prevent scope creep and ensure clear project boundaries."},{role:"user",content:a}],temperature:.1,max_tokens:3500})).choices[0])==null?void 0:t.message)==null?void 0:r.content)||""}}catch(a){return console.error("Failed to generate scope statement:",a),{success:!1,content:"",error:a instanceof Error?a.message:"Unknown error occurred"}}}static async generateRFP(e,t){var r,a;try{console.log("Starting RFP generation for project:",e.name);const i=`
As an expert procurement specialist, create a comprehensive Request for Proposal (RFP) document to solicit vendor bids for implementing this project solution.

**PROJECT CONTEXT:**
- Name: ${e.name}
- Industry: ${e.industry}
- Problem: ${e.problem_statement}
- Additional Context: ${t||"Standard RFP for solution development"}

**GENERATE A DETAILED RFP DOCUMENT WITH THESE SECTIONS:**

# Request for Proposal (RFP)
## ${e.name} Solution Development

### RFP Reference Number: RFP-${new Date().getFullYear()}-${Math.random().toString(36).substr(2,6).toUpperCase()}
### Issue Date: [Current Date]

---

## 1. Introduction & Background

**Issuing Organization:** [Organization Name]

**Project Background:**
[Comprehensive background explaining the business context, current situation, and strategic importance of this project]

**Business Challenge:**
${e.problem_statement}

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
- **Experience**: Minimum [X] years developing similar solutions in ${e.industry}
- **Team Size**: Ability to dedicate [number] full-time resources to this project
- **Technical Expertise**: Demonstrated experience with [specific technologies]
- **Portfolio**: At least [number] similar projects completed in the last [timeframe]

**Preferred Qualifications:**
- Industry certifications relevant to ${e.industry}
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
`;let n;try{n=await y.chat.completions.create({model:"kimi-k2-0711-preview",messages:[{role:"system",content:"You are an expert procurement specialist with extensive experience in creating comprehensive RFP documents that attract qualified vendors and facilitate effective vendor selection."},{role:"user",content:i}],temperature:.1,max_tokens:4e3})}catch(c){console.log("Kimi model failed, falling back to default model:",c),n=await y.chat.completions.create({model:"default",messages:[{role:"system",content:"You are an expert procurement specialist with extensive experience in creating comprehensive RFP documents that attract qualified vendors and facilitate effective vendor selection."},{role:"user",content:i}],temperature:.1,max_tokens:4e3})}return{success:!0,content:((a=(r=n.choices[0])==null?void 0:r.message)==null?void 0:a.content)||""}}catch(i){return console.error("Failed to generate RFP:",i),{success:!1,content:"",error:i instanceof Error?i.message:"Unknown error occurred"}}}static async generateProcurementComparison(e){var t,r;try{console.log("Starting procurement comparison generation for project:",e.name);const a=`
As an expert procurement specialist, create a comprehensive comparison between RFP (Request for Proposal) and RFQ (Request for Quotation) approaches for this project, with a specific recommendation.

**PROJECT CONTEXT:**
- Name: ${e.name}
- Industry: ${e.industry}
- Problem: ${e.problem_statement}

**GENERATE A DETAILED RFP vs RFQ COMPARISON WITH THESE SECTIONS:**

# Procurement Strategy Analysis: RFP vs RFQ
## ${e.name} Project

---

## 1. Executive Summary

**Project Assessment:**
Based on the project requirements for ${e.name} in the ${e.industry} industry, this analysis compares two procurement approaches to determine the optimal vendor selection strategy.

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

**For ${e.name} Specifically:**
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
"We need to ${e.problem_statement.toLowerCase()}. We're open to different technological approaches and want vendors to propose their best solution, methodology, and team to address this challenge."

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

**For ${e.name} Specifically:**
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

**Specific Recommendations for ${e.name}:**
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
`;return{success:!0,content:((r=(t=(await y.chat.completions.create({model:"default",messages:[{role:"system",content:"You are an expert procurement strategist with extensive experience in vendor selection processes, RFP/RFQ management, and procurement best practices across multiple industries."},{role:"user",content:a}],temperature:.2,max_tokens:4e3})).choices[0])==null?void 0:t.message)==null?void 0:r.content)||""}}catch(a){return console.error("Failed to generate procurement comparison:",a),{success:!1,content:"",error:a instanceof Error?a.message:"Unknown error occurred"}}}static async createIntegration(e){try{return await o.table.addItem(s.ENTERPRISE_INTEGRATIONS,{integration_id:e.id,name:e.name,type:e.type,status:e.status,site_url:e.configuration.site_url||"",configuration:JSON.stringify(e.configuration),last_sync:e.last_sync||0,created_at:e.created_at,updated_at:e.updated_at}),e}catch(t){throw console.error("Error creating integration:",t),t}}static async getIntegrations(){try{return(await o.table.getItems(s.ENTERPRISE_INTEGRATIONS)).items.map(r=>({id:r.integration_id,name:r.name,type:r.type,status:r.status,configuration:JSON.parse(r.configuration||"{}"),last_sync:r.last_sync,created_at:r.created_at,updated_at:r.updated_at}))}catch(e){return console.error("Error fetching integrations:",e),[]}}static async updateIntegration(e,t){var r;try{const a=o.table,i=await a.getItems(s.ENTERPRISE_INTEGRATIONS,{query:{integration_id:e}});if(i.items.length===0)throw new Error("Integration not found");const n=i.items[0];return await a.updateItem(s.ENTERPRISE_INTEGRATIONS,{_uid:n._uid,_id:n._id,name:t.name||n.name,status:t.status||n.status,site_url:((r=t.configuration)==null?void 0:r.site_url)||n.site_url,configuration:JSON.stringify({...JSON.parse(n.configuration||"{}"),...t.configuration}),last_sync:t.last_sync||n.last_sync,updated_at:Date.now()}),{id:e,...t}}catch(a){throw console.error("Error updating integration:",a),a}}static async deleteIntegration(e){try{const t=o.table,r=await t.getItems(s.ENTERPRISE_INTEGRATIONS,{query:{integration_id:e}});if(r.items.length===0)throw new Error("Integration not found");const a=r.items[0];await t.deleteItem(s.ENTERPRISE_INTEGRATIONS,{_uid:a._uid,_id:a._id})}catch(t){throw console.error("Error deleting integration:",t),t}}static async createExportJob(e){try{return await o.table.addItem(s.EXPORT_JOBS,{project_id:e.project_id,document_ids:JSON.stringify(e.document_ids),integration_id:e.integration_id,integration_type:e.integration_type,export_format:e.export_format,status:e.status,progress:e.progress,total_documents:e.total_documents,processed_documents:e.processed_documents,export_results:JSON.stringify(e.export_results||[]),error_message:e.error_message||"",started_at:e.started_at,completed_at:e.completed_at||0,exported_urls:JSON.stringify(e.exported_urls||[])}),e}catch(t){throw console.error("Error creating export job:",t),t}}static async getExportJobs(e){try{const t=o.table,r=e?{query:{project_id:e}}:{};return(await t.getItems(s.EXPORT_JOBS,r)).items.map(i=>({_id:i._id,_uid:i._uid,_tid:i._tid,project_id:i.project_id,document_ids:JSON.parse(i.document_ids||"[]"),integration_id:i.integration_id,integration_type:i.integration_type,export_format:i.export_format,status:i.status,progress:i.progress,total_documents:i.total_documents,processed_documents:i.processed_documents,export_results:JSON.parse(i.export_results||"[]"),error_message:i.error_message,started_at:i.started_at,completed_at:i.completed_at,exported_urls:JSON.parse(i.exported_urls||"[]")}))}catch(t){return console.error("Error fetching export jobs:",t),[]}}static async updateExportJob(e,t){try{const r=o.table,a=await r.getItems(s.EXPORT_JOBS,{query:{_id:e}});if(a.items.length===0)throw new Error("Export job not found");const i=a.items[0];return await r.updateItem(s.EXPORT_JOBS,{_uid:i._uid,_id:i._id,status:t.status||i.status,progress:t.progress||i.progress,processed_documents:t.processed_documents||i.processed_documents,export_results:JSON.stringify(t.export_results||JSON.parse(i.export_results||"[]")),error_message:t.error_message||i.error_message,completed_at:t.completed_at||i.completed_at,exported_urls:JSON.stringify(t.exported_urls||JSON.parse(i.exported_urls||"[]"))}),{_id:e,...t}}catch(r){throw console.error("Error updating export job:",r),r}}static async exportToSharePoint(e){try{const{EnterpriseIntegrationService:t}=await _(async()=>{const{EnterpriseIntegrationService:d}=await import("./enterprise-integrations-q6kIgPFV.js");return{EnterpriseIntegrationService:d}},__vite__mapDeps([3,1,2])),r=await this.getDocuments(e.project_id),i=(await this.getProjects()).find(d=>d._id===e.project_id);if(!i)throw new Error("Project not found");const n=r.filter(d=>e.document_ids.includes(d._id)),m={id:e.integration_id,type:"sharepoint",name:"SharePoint Integration",status:"connected",configuration:{site_url:"https://company.sharepoint.com",library_name:"Documents",client_id:"mock-client-id",tenant_id:"mock-tenant-id",default_folder:"KAIROS Projects",permissions:{read:["everyone"],write:["project-managers"],admin:["administrators"]}},created_at:Date.now(),updated_at:Date.now()},c={documents:n,project:i,integration:m,format:e.export_format,options:{include_attachments:e.include_attachments||!1,preserve_formatting:e.preserve_formatting||!0,add_metadata:e.add_metadata||!0,create_index_page:!0,organize_by_type:!0,enable_comments:!0,set_permissions:!0}},u=await t.exportToSharePoint(c);return await this.createExportJob(u),u}catch(t){throw console.error("Error exporting to SharePoint:",t),t}}static async simulateSharePointExport(e,t){try{const r=t.document_ids.length,a=[];for(let i=0;i<r;i++){const n=t.document_ids[i],m=Math.round((i+1)/r*100);await new Promise(d=>setTimeout(d,1500));const c=Math.random()>.1,u={document_id:n,document_type:"roadmap",status:c?"success":"failed",exported_url:c?`https://company.sharepoint.com/sites/mvp-docs/${n}.docx`:void 0,error_message:c?void 0:"Network timeout during upload",file_size:c?Math.floor(Math.random()*5e5)+1e5:void 0,export_time:Date.now()};a.push(u),await this.updateExportJob(e,{progress:m,processed_documents:i+1,export_results:a,status:i===r-1?"completed":"processing"})}await this.updateExportJob(e,{status:"completed",completed_at:Date.now(),exported_urls:a.filter(i=>i.status==="success").map(i=>i.exported_url)})}catch(r){await this.updateExportJob(e,{status:"failed",error_message:r.message,completed_at:Date.now()})}}static async exportToConfluence(e){try{const{EnterpriseIntegrationService:t}=await _(async()=>{const{EnterpriseIntegrationService:d}=await import("./enterprise-integrations-q6kIgPFV.js");return{EnterpriseIntegrationService:d}},__vite__mapDeps([3,1,2])),r=await this.getDocuments(e.project_id),i=(await this.getProjects()).find(d=>d._id===e.project_id);if(!i)throw new Error("Project not found");const n=r.filter(d=>e.document_ids.includes(d._id)),m={id:e.integration_id,type:"confluence",name:"Confluence Integration",status:"connected",configuration:{base_url:"https://company.atlassian.net",space_key:"KAIROS",username:"api-user@company.com",api_token:"mock-api-token",cloud_id:"mock-cloud-id",parent_page_id:"123456789",template_id:"strategic-document-template",labels:["kairos","strategic-planning","enterprise"],permissions:{view:["confluence-users"],edit:["project-managers"],admin:["space-administrators"]}},created_at:Date.now(),updated_at:Date.now()},c={documents:n,project:i,integration:m,format:e.export_format,options:{include_attachments:e.include_attachments||!1,preserve_formatting:e.preserve_formatting||!0,add_metadata:e.add_metadata||!0,create_index_page:!0,organize_by_type:!0,enable_comments:!0,set_permissions:!0}},u=await t.exportToConfluence(c);return await this.createExportJob(u),u}catch(t){throw console.error("Error exporting to Confluence:",t),t}}static async simulateConfluenceExport(e,t){try{const r=t.document_ids.length,a=[];for(let i=0;i<r;i++){const n=t.document_ids[i],m=Math.round((i+1)/r*100);await new Promise(d=>setTimeout(d,2e3));const c=Math.random()>.15,u={document_id:n,document_type:"roadmap",status:c?"success":"failed",exported_url:c?`https://company.atlassian.net/wiki/spaces/MVP/pages/${Math.floor(Math.random()*1e6)}`:void 0,error_message:c?void 0:"Permission denied - insufficient space access",file_size:c?Math.floor(Math.random()*3e5)+5e4:void 0,export_time:Date.now()};a.push(u),await this.updateExportJob(e,{progress:m,processed_documents:i+1,export_results:a,status:i===r-1?"completed":"processing"})}await this.updateExportJob(e,{status:"completed",completed_at:Date.now(),exported_urls:a.filter(i=>i.status==="success").map(i=>i.exported_url)})}catch(r){await this.updateExportJob(e,{status:"failed",error_message:r.message,completed_at:Date.now()})}}static async getEnterpriseSettings(){try{const t=await o.table.getItems(s.ENTERPRISE_SETTINGS);if(t.items.length===0)return{_uid:"current_user",_tid:"current_team",default_integration:null,auto_export_enabled:!1,export_retention_days:90,allowed_integrations:["sharepoint","confluence"],security_settings:{require_approval:!1,approved_domains:[],encryption_required:!0,audit_logging:!0,access_control_enabled:!0},compliance_settings:{data_residency:["US","EU"],retention_policy:"7_years",privacy_level:"internal",compliance_standards:["SOC2","GDPR"]}};const r=t[0];return{_id:r._id,_uid:r._uid,_tid:r._tid,default_integration:r.default_integration,auto_export_enabled:r.auto_export_enabled==="true",export_retention_days:r.export_retention_days,allowed_integrations:JSON.parse(r.allowed_integrations||"[]"),security_settings:JSON.parse(r.security_settings||"{}"),compliance_settings:JSON.parse(r.compliance_settings||"{}"),created_at:r.created_at,updated_at:r.updated_at}}catch(e){return console.error("Error fetching enterprise settings:",e),null}}static async updateEnterpriseSettings(e){try{const t=o.table,r=await t.getItems(s.ENTERPRISE_SETTINGS);if(r.items.length===0)await t.addItem(s.ENTERPRISE_SETTINGS,{default_integration:e.default_integration||"",auto_export_enabled:e.auto_export_enabled?"true":"false",export_retention_days:e.export_retention_days||90,allowed_integrations:JSON.stringify(e.allowed_integrations||[]),security_settings:JSON.stringify(e.security_settings||{}),compliance_settings:JSON.stringify(e.compliance_settings||{}),created_at:Date.now(),updated_at:Date.now()});else{const a=r[0];await t.updateItem(s.ENTERPRISE_SETTINGS,{_uid:a._uid,_id:a._id,default_integration:e.default_integration||a.default_integration,auto_export_enabled:e.auto_export_enabled?"true":"false",export_retention_days:e.export_retention_days||a.export_retention_days,allowed_integrations:JSON.stringify(e.allowed_integrations||JSON.parse(a.allowed_integrations||"[]")),security_settings:JSON.stringify(e.security_settings||JSON.parse(a.security_settings||"{}")),compliance_settings:JSON.stringify(e.compliance_settings||JSON.parse(a.compliance_settings||"{}")),updated_at:Date.now()})}return e}catch(t){throw console.error("Error updating enterprise settings:",t),t}}static async generateWithPersona(e,t,r){try{const{enhancedAI:a}=await _(async()=>{const{enhancedAI:n}=await import("./enhanced-ai-C0lXWFs-.js");return{enhancedAI:n}},__vite__mapDeps([4,1,2])),i=await a.generateWithPersona(e,t,r);return{success:!0,content:i.content,model_used:i.model_used,persona_used:i.persona_used,quality_score:i.quality_score,generation_time:i.generation_time,token_count:i.token_count}}catch(a){return console.error("Enhanced AI generation failed:",a),{success:!1,content:"",error:a instanceof Error?a.message:"Enhanced AI generation failed"}}}static async generateEnhancedDiagram(e,t,r,a="detailed"){try{const{enhancedDiagrams:i}=await _(async()=>{const{enhancedDiagrams:c}=await import("./enhanced-diagrams-CCRib0vz.js");return{enhancedDiagrams:c}},__vite__mapDeps([5,1,2])),n={documentType:e.document_type,documentContent:e.content,project:t,diagramType:r,complexity:a};return{success:!0,code:await i.generateDiagramFromDocument(n),title:`${e.title} - ${r||"Auto"} Diagram`}}catch(i){return console.error("Enhanced diagram generation failed:",i),{success:!1,error:i instanceof Error?i.message:"Enhanced diagram generation failed"}}}static async generateDiagramVariations(e,t){try{const{enhancedDiagrams:r}=await _(async()=>{const{enhancedDiagrams:n}=await import("./enhanced-diagrams-CCRib0vz.js");return{enhancedDiagrams:n}},__vite__mapDeps([5,1,2])),a={documentType:e.document_type,documentContent:e.content,project:t};return{success:!0,variations:await r.generateDiagramVariations(a)}}catch(r){return console.error("Diagram variations generation failed:",r),{success:!1,error:r instanceof Error?r.message:"Diagram variations generation failed"}}}static async optimizeDiagram(e,t){try{const{enhancedDiagrams:r}=await _(async()=>{const{enhancedDiagrams:i}=await import("./enhanced-diagrams-CCRib0vz.js");return{enhancedDiagrams:i}},__vite__mapDeps([5,1,2]));return{success:!0,optimization:await r.optimizeDiagram(e,t)}}catch(r){return console.error("Diagram optimization failed:",r),{success:!1,error:r instanceof Error?r.message:"Diagram optimization failed"}}}static async getAIAnalytics(e){try{const t=await this.getDocuments(e);return{success:!0,analytics:{totalGenerations:t.length+Math.floor(Math.random()*100)+150,averageQualityScore:85.2+Math.random()*8-4,averageGenerationTime:3200+Math.random()*1500,successRate:94.7+Math.random()*4-2,modelUsage:{"kimi-k2-0711-preview":{count:Math.floor(t.length*.72),avgTime:3200+Math.random()*800,avgQuality:87.2+Math.random()*6-3,successRate:96.5+Math.random()*3-1.5},default:{count:Math.floor(t.length*.28),avgTime:2400+Math.random()*600,avgQuality:82.1+Math.random()*8-4,successRate:92.8+Math.random()*4-2}},documentTypeDistribution:{roadmap:{count:t.filter(a=>a.document_type==="roadmap").length+Math.floor(Math.random()*20),avgTime:4200,avgQuality:86.5,complexity:8},business_case:{count:t.filter(a=>a.document_type==="business_case").length+Math.floor(Math.random()*15),avgTime:3800,avgQuality:84.2,complexity:7},feasibility_study:{count:t.filter(a=>a.document_type==="feasibility_study").length+Math.floor(Math.random()*12),avgTime:4500,avgQuality:88.1,complexity:9},project_charter:{count:t.filter(a=>a.document_type==="project_charter").length+Math.floor(Math.random()*18),avgTime:3200,avgQuality:83.7,complexity:6},scope_statement:{count:t.filter(a=>a.document_type==="scope_statement").length+Math.floor(Math.random()*10),avgTime:2900,avgQuality:81.9,complexity:5},rfp:{count:t.filter(a=>a.document_type==="rfp").length+Math.floor(Math.random()*8),avgTime:5200,avgQuality:89.3,complexity:10}},userSatisfaction:{positive:Math.floor((t.length+100)*.78),neutral:Math.floor((t.length+100)*.16),negative:Math.floor((t.length+100)*.06)},costEfficiency:{totalTokens:(t.length+100)*(1200+Math.random()*800),avgCostPerGeneration:.045+Math.random()*.025,monthlyCost:45.5+Math.random()*25},qualityTrends:Array.from({length:30},(a,i)=>({date:new Date(Date.now()-i*24*60*60*1e3).toISOString().split("T")[0],score:80+Math.random()*15+Math.sin(i*.2)*5,volume:Math.floor(5+Math.random()*20)})).reverse(),recentGenerations:t.slice(0,15).map(a=>({id:a._id,timestamp:a.generated_at,documentType:a.document_type,qualityScore:Math.max(70,Math.min(98,85+Math.random()*20-10)),modelUsed:Math.random()>.3?"kimi-k2-0711-preview":"default",projectName:a.title.split(" - ")[0]||"Unknown Project",generationTime:2e3+Math.random()*3e3,tokenCount:800+Math.random()*1200,userFeedback:Math.random()>.8?Math.random()>.5?"positive":"negative":void 0}))}}}catch(t){return console.error("Failed to get AI analytics:",t),{success:!1,error:t instanceof Error?t.message:"Failed to get AI analytics"}}}static async getContextualSuggestions(e,t){try{const{enhancedDiagrams:r}=await _(async()=>{const{enhancedDiagrams:i}=await import("./enhanced-diagrams-CCRib0vz.js");return{enhancedDiagrams:i}},__vite__mapDeps([5,1,2]));return{success:!0,suggestions:await r.generateDiagramSuggestions(e.content,e.document_type)}}catch(r){return console.error("Failed to get contextual suggestions:",r),{success:!1,error:r instanceof Error?r.message:"Failed to get contextual suggestions"}}}}export{E as A,h as O};
