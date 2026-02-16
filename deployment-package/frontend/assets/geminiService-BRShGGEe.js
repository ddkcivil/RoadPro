import{f as L}from"./exportUtils-B5u6ZY-6.js";import{g as M}from"./currencyUtils-RmnVW5tT.js";var A;(function(e){e.STRING="string",e.NUMBER="number",e.INTEGER="integer",e.BOOLEAN="boolean",e.ARRAY="array",e.OBJECT="object"})(A||(A={}));/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var d;(function(e){e.LANGUAGE_UNSPECIFIED="language_unspecified",e.PYTHON="python"})(d||(d={}));var O;(function(e){e.OUTCOME_UNSPECIFIED="outcome_unspecified",e.OUTCOME_OK="outcome_ok",e.OUTCOME_FAILED="outcome_failed",e.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded"})(O||(O={}));var _;(function(e){e.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",e.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",e.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",e.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",e.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT"})(_||(_={}));var N;(function(e){e.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",e.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",e.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",e.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",e.BLOCK_NONE="BLOCK_NONE"})(N||(N={}));var T;(function(e){e.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",e.NEGLIGIBLE="NEGLIGIBLE",e.LOW="LOW",e.MEDIUM="MEDIUM",e.HIGH="HIGH"})(T||(T={}));var S;(function(e){e.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",e.SAFETY="SAFETY",e.OTHER="OTHER"})(S||(S={}));var o;(function(e){e.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",e.STOP="STOP",e.MAX_TOKENS="MAX_TOKENS",e.SAFETY="SAFETY",e.RECITATION="RECITATION",e.LANGUAGE="LANGUAGE",e.OTHER="OTHER"})(o||(o={}));var R;(function(e){e.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",e.RETRIEVAL_QUERY="RETRIEVAL_QUERY",e.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",e.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",e.CLASSIFICATION="CLASSIFICATION",e.CLUSTERING="CLUSTERING"})(R||(R={}));var g;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.AUTO="AUTO",e.ANY="ANY",e.NONE="NONE"})(g||(g={}));var C;(function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.MODE_DYNAMIC="MODE_DYNAMIC"})(C||(C={}));var m;(function(e){e.GENERATE_CONTENT="generateContent",e.STREAM_GENERATE_CONTENT="streamGenerateContent",e.COUNT_TOKENS="countTokens",e.EMBED_CONTENT="embedContent",e.BATCH_EMBED_CONTENTS="batchEmbedContents"})(m||(m={}));o.RECITATION,o.SAFETY,o.LANGUAGE;const f=()=>(console.warn("VITE_GEMINI_API_KEY is missing in environment variables. Please add it to your .env file as VITE_GEMINI_API_KEY=your_api_key"),null),Y=async(e,i)=>{const t=f();if(!t)return"AI Service Unavailable.";const r=t.getGenerativeModel({model:"gemini-pro"}),E=`You are a construction site auditor.
    Analyze this site photo from a road project. The photo is categorized as "${i}".

    Tasks:
    1. Identify the current stage of construction shown.
    2. Spot any immediate safety hazards or deviations from standard engineering practices.
    3. Estimate physical progress if it's a structural component or pavement layer.
    4. List machinery or plant equipment visible.

    Keep the analysis professional, technical, and concise.`;if(!e||e.length===0)throw new Error("Invalid image data provided");try{return(await r.generateContent({contents:[{role:"user",parts:[{inlineData:{mimeType:"image/jpeg",data:e}},{text:E}]}]})).response.text()||"No analysis generated."}catch(a){return console.error("Site Photo Analysis Error:",a),"Could not perform automated analysis at this time."}},G=async(e,i,t,r,E=!1)=>{var u,I;const a=f();if(!a)return"AI Service Unavailable.";let l="gemini-pro";!E&&!r&&(l="gemini-pro");const p=a.getGenerativeModel({model:l}),D=`You are RoadMaster AI, a helpful construction management assistant.
  
  APPLICATION CONTEXT:
  - You are part of RoadMaster Pro, a comprehensive construction project management application
  - You assist with BOQ ledger, scheduling, inspections (RFIs), variations, billing, and project documentation
  - You integrate with Google Sheets for live synchronization
  - You support field teams with daily reporting, site photos, and progress tracking
    
  PROJECT CONTEXT:
  - Project: ${t.name} (${t.code})
  - Location: ${t.location}
  - Contractor: ${t.contractor}
  - Client: ${t.client}
  - Start Date: ${t.startDate}
  - End Date: ${t.endDate}
  - Contract Number: ${t.contractNo||"N/A"}
  
  PROJECT DATA AVAILABLE:
  - BOQ Items Count: ${(t.boq||[]).length}
  - RFI Count: ${(t.rfis||[]).length}
  - Schedule Tasks Count: ${(t.schedule||[]).length}
  - Structures Count: ${(t.structures||[]).length}
  - Lab Tests Count: ${(t.labTests||[]).length}
  - Subcontractors Count: ${(t.subcontractors||[]).length}
  - Vehicles Count: ${(t.vehicles||[]).length}
  - Site Photos Count: ${(t.sitePhotos||[]).length}
  - Daily Reports Count: ${(t.dailyReports||[]).length}
  - Variation Orders Count: ${(t.variationOrders||[]).length}
  - Contract Bills Count: ${(t.contractBills||[]).length}
    
  YOUR CAPABILITIES:
  1. Answer detailed questions about project schedule, BOQ items, costs, progress, and status
  2. Analyze uploaded documents (PDFs, Images) such as RFIs, Invoices, Drawings, and Reports
  3. Analyze site photos and videos for progress assessment, safety compliance, and quality checks
  4. Provide insights on project delays, bottlenecks, and critical path analysis
  5. Assist with cost estimation, budget tracking, and financial progress
  6. Generate formal construction correspondence and documentation
  7. Interpret technical drawings and specifications
  8. Identify potential issues and suggest mitigation strategies
    
  RESPONSE GUIDELINES:
  - Provide specific, actionable insights based on the project data
  - Reference specific BOQ items, RFI numbers, or schedule tasks when relevant
  - Use professional construction industry terminology
  - When analyzing progress, relate to chainages, quantities, and completion percentages
  - For cost-related queries, use the currency specified in the project settings: ${M((u=t.settings)==null?void 0:u.currency)}
  - Maintain FIDIC-style professional communication standards
  
  SPECIFIC INSTRUCTIONS FOR DOCUMENT ANALYSIS:
  - If the user asks to analyze an RFI (Request for Inspection) document:
    Please extract the following details and present them in a Markdown Table:
    | Field | Value |
    |---|---|
    | RFI Number | ... |
    | Location/Chainage | ... |
    | Date of Inspection | ... |
    | Work Description | (Brief summary of work) |
    | Inspection Status | (Open/Approved/Rejected) |
  
    Then, list any "Key Observations" or engineering remarks found in the document below the table.
  
  - If the user uploads an Invoice or Bill:
    Extract Bill No, Vendor, Date, and Total Amount.
  
  - For Site Photos/Videos:
    Describe progress, identify machinery, or spot safety hazards.`,h=`
PROJECT SUMMARY:
- Total BOQ Value: ${L((t.boq||[]).reduce((n,s)=>n+s.quantity*s.rate,0)||0,t.settings)}
- Overall Progress: ${(I=t.boq)!=null&&I.length?(t.boq.reduce((n,s)=>n+s.completedQuantity,0)/t.boq.reduce((n,s)=>n+s.quantity,0)*100).toFixed(2):"0"}%
- Active RFIs: ${(t.rfis||[]).filter(n=>n.status==="Open").length} open of ${(t.rfis||[]).length} total
- Upcoming Milestones: ${(t.schedule||[]).filter(n=>n.status==="Not Started"&&new Date(n.startDate)<=new Date(Date.now()+10080*60*1e3)).length} upcoming
- Completed Tasks: ${(t.schedule||[]).filter(n=>n.status==="Completed").length} of ${(t.schedule||[]).length} total
`;try{const n=i.map(c=>({role:c.role==="model"?"model":"user",parts:[{text:c.text}]}));i.length===0&&n.push({role:"user",parts:[{text:h}]});const s=[{text:e}];return r&&s.push({inlineData:{mimeType:r.mimeType,data:r.data}}),n.push({role:"user",parts:s}),(await p.generateContent({contents:n,systemInstruction:D})).response.text()||"I couldn't generate a response."}catch(n){return console.error("Chat Error:",n),"Sorry, I encountered an error. Please try again."}};export{Y as a,G as c};
