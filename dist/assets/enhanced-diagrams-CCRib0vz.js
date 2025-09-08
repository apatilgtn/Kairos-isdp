var f=Object.defineProperty;var y=(c,e,t)=>e in c?f(c,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):c[e]=t;var h=(c,e,t)=>y(c,typeof e!="symbol"?e+"":e,t);import{h as w}from"./index--Ct_i1hN.js";const l={roadmap:{preferredTypes:["gantt","flowchart","user_journey"],templates:{gantt:`
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
      `,flowchart:`
flowchart TD
    A[Problem Identification] --> B[Solution Design]
    B --> C[MVP Development]
    C --> D[User Testing]
    D --> E{Feedback Positive?}
    E -->|Yes| F[Scale & Launch]
    E -->|No| G[Iterate & Improve]
    G --> D
    F --> H[Market Expansion]
      `}},business_case:{preferredTypes:["flowchart","user_journey"],templates:{flowchart:`
flowchart LR
    A[Current State] --> B[Problem Analysis]
    B --> C[Solution Options]
    C --> D[Cost-Benefit Analysis]
    D --> E[Recommendation]
    E --> F[Implementation Plan]
    F --> G[Expected Outcome]
      `}},feasibility_study:{preferredTypes:["flowchart","class"],templates:{flowchart:`
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
      `}},project_charter:{preferredTypes:["flowchart","class"],templates:{flowchart:`
flowchart TD
    A[Project Initiation] --> B[Stakeholder Identification]
    B --> C[Scope Definition]
    C --> D[Success Criteria]
    D --> E[Resource Allocation]
    E --> F[Timeline Planning]
    F --> G[Risk Assessment]
    G --> H[Project Authorization]
      `}},scope_statement:{preferredTypes:["flowchart","class"],templates:{flowchart:`
flowchart LR
    A[Project Scope] --> B[Deliverables]
    A --> C[Acceptance Criteria]
    A --> D[Constraints]
    A --> E[Assumptions]
    B --> F[Work Breakdown]
    C --> G[Quality Standards]
    D --> H[Resource Limits]
    E --> I[External Dependencies]
      `}},rfp:{preferredTypes:["sequence","flowchart"],templates:{sequence:`
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
      `}}};class D{constructor(){h(this,"ai");this.ai=new w.DevvAI}async generateDiagramFromDocument(e){var p,d;const{documentType:t,documentContent:n,project:r,diagramType:s,complexity:i="detailed"}=e,o=l[t]||l.roadmap,a=s||o.preferredTypes[0],m=this.buildDiagramPrompt(t,n,r,a,i);try{const g=((d=(p=(await this.ai.chat.completions.create({model:"kimi-k2-0711-preview",messages:[{role:"system",content:`You are an expert in creating clear, professional Mermaid.js diagrams that visualize complex information. You specialize in ${a} diagrams and understand how to represent ${t} content visually. Always return valid Mermaid syntax that renders correctly.`},{role:"user",content:m}],temperature:.2,max_tokens:2e3})).choices[0])==null?void 0:p.message)==null?void 0:d.content)||"";if(!g.trim())throw new Error("AI returned empty diagram code");return this.validateAndCleanDiagramCode(g,a)}catch(u){return console.error("Enhanced diagram generation failed:",u),this.generateFromTemplate(t,a,r)}}async generateDiagramVariations(e){const{documentType:t,documentContent:n,project:r}=e,s=l[t]||l.roadmap;return(await Promise.allSettled(s.preferredTypes.map(async o=>{const a=await this.generateDiagramFromDocument({...e,diagramType:o});return{type:o,code:a,title:`${r.name} - ${this.getDiagramTypeLabel(o)}`}}))).filter(o=>o.status==="fulfilled").map(o=>o.value)}async optimizeDiagram(e,t){var r,s;const n=`
Analyze and optimize this Mermaid.js diagram for clarity, visual appeal, and information density:

\`\`\`mermaid
${e}
\`\`\`

**PROJECT CONTEXT:**
- Name: ${t.name}
- Industry: ${t.industry}
- Problem: ${t.problem_statement}

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
`;try{const o=((s=(r=(await this.ai.chat.completions.create({model:"kimi-k2-0711-preview",messages:[{role:"system",content:"You are an expert in diagram optimization and visual design. You understand Mermaid.js syntax and can improve diagrams for clarity and professional appearance."},{role:"user",content:n}],temperature:.3,max_tokens:2e3})).choices[0])==null?void 0:r.message)==null?void 0:s.content)||"";try{const a=JSON.parse(o);return{suggestions:a.suggestions||[],optimizedCode:a.optimizedCode||e,qualityScore:a.qualityScore||70,improvements:a.improvements||[]}}catch{return{suggestions:["Unable to parse AI response","Consider manual optimization"],optimizedCode:e,qualityScore:60,improvements:[]}}}catch(i){return console.error("Diagram optimization failed:",i),{suggestions:["Optimization service unavailable"],optimizedCode:e,qualityScore:50,improvements:[]}}}async generateDiagramSuggestions(e,t){var r,s;const n=`
Analyze this ${t} content and suggest the most effective diagram types to visualize the information:

**CONTENT:**
${e.substring(0,2e3)}...

**SUGGEST:**
- 3-5 specific diagram types that would best represent this content
- For each suggestion, explain why it would be effective
- Consider the audience and use case

Return as a simple list of suggestions.
`;try{return(((s=(r=(await this.ai.chat.completions.create({model:"default",messages:[{role:"system",content:"You are an expert in data visualization and information design. You understand how to match content types with appropriate diagram formats."},{role:"user",content:n}],temperature:.4,max_tokens:1e3})).choices[0])==null?void 0:r.message)==null?void 0:s.content)||"").split(`
`).filter(a=>a.trim().length>0)}catch(i){return console.error("Diagram suggestions failed:",i),["Consider a flowchart to show process steps","Use a timeline diagram for chronological content","Try a hierarchical diagram for structured information"]}}buildDiagramPrompt(e,t,n,r,s){var m;const i=l[e],o=(m=i==null?void 0:i.templates)==null?void 0:m[r];let a=`
Create a professional ${r} diagram that visualizes the key concepts from this ${e} document.

**PROJECT:** ${n.name} (${n.industry})
**PROBLEM:** ${n.problem_statement}

**DOCUMENT CONTENT:**
${t.substring(0,3e3)}...

**DIAGRAM REQUIREMENTS:**
- Type: ${r}
- Complexity: ${s}
- Professional appearance suitable for stakeholders
- Clear labels and logical flow
- Include key elements from the document content

**SPECIFIC GUIDELINES:**
`;switch(e){case"roadmap":a+=`
- Show development phases and timelines
- Include major milestones and deliverables
- Represent dependencies between tasks
- Highlight critical path items
`;break;case"business_case":a+=`
- Show the decision-making process
- Represent cost-benefit analysis flow
- Include stakeholder perspectives
- Highlight value proposition
`;break;case"feasibility_study":a+=`
- Show different feasibility dimensions
- Represent analysis methodology
- Include decision points and criteria
- Show interdependencies between factors
`;break;default:a+=`
- Focus on the main process or workflow
- Show key decision points
- Include important stakeholders or components
- Represent the logical flow of information
`}return a+=`
**OUTPUT:** Return ONLY valid Mermaid.js code. No explanations or additional text.
`,o&&s==="simple"&&(a+=`
**REFERENCE TEMPLATE:**
${o}`),a}validateAndCleanDiagramCode(e,t){let n=e.replace(/```mermaid\n?/g,"").replace(/```\n?/g,"");const s={flowchart:"flowchart",sequence:"sequenceDiagram",gantt:"gantt",user_journey:"journey",class:"classDiagram",state:"stateDiagram"}[t];return s&&!n.trim().startsWith(s)&&(n=`${s} TD
${n}`),n.trim()}generateFromTemplate(e,t,n){var i;const r=l[e];let s=(i=r==null?void 0:r.templates)==null?void 0:i[t];return s||(s=`
flowchart TD
    A[${n.name}] --> B[Problem Analysis]
    B --> C[Solution Design]
    C --> D[Implementation]
    D --> E[Validation]
    E --> F[Success]
      `),s.replace(/\{project\.name\}/g,n.name).replace(/\{project\.industry\}/g,n.industry).trim()}getDiagramTypeLabel(e){return{flowchart:"Process Flow",sequence:"Sequence Diagram",gantt:"Timeline Chart",user_journey:"User Journey",class:"System Architecture",state:"State Diagram"}[e]||e}}const v=new D;export{D as EnhancedDiagramService,v as enhancedDiagrams};
