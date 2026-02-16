class Z{constructor(){this.initialized=!1}async initialize(){console.log("Initializing Chandra OCR Engine..."),await new Promise(t=>setTimeout(t,500)),this.initialized=!0,console.log("Chandra OCR Engine initialized successfully")}async extractTextFromImage(t){if(!this.initialized)throw new Error("OCR Service not initialized. Call initialize() first.");return t.type==="application/pdf"?await this.extractTextFromPDF(t):await this.extractTextFromImageFile(t)}async extractTextFromPDF(t){await new Promise(a=>setTimeout(a,1500));const s=`PDF Document Analysis Result:

Document Title: ${t.name.replace(/\.[^/.]+$/,"")}
File Size: ${(t.size/1024).toFixed(2)} KB
Page Count: ${Math.floor(Math.random()*10)+1}

BOQ Item 1: Earthwork Excavation - 150.00 CuM @ Rs. 450.00/CuM
BOQ Item 2: Plain Cement Concrete - 75.50 CuM @ Rs. 3200.00/CuM
BOQ Item 3: Reinforced Cement Concrete - 42.75 CuM @ Rs. 5200.00/CuM

Contractor: ABC Construction Pvt Ltd
Project Code: RD-2023-001
Invoice No: INV-2023-0123
Amount: Rs. 1,250,000.00
Date: 15/06/2023

Contact: info@abcconstruction.com
Phone: +977-1-4567890

Additional Notes: Material certification required for RCC works.`,o=Math.floor(Math.random()*15)+85,r=[{x:50,y:50,width:200,height:25,text:"Document Title"},{x:50,y:80,width:150,height:20,text:t.name.replace(/\.[^/.]+$/,"")},{x:50,y:120,width:300,height:20,text:"Earthwork Excavation - 150.00 CuM @ Rs. 450.00/CuM"},{x:50,y:150,width:300,height:20,text:"Plain Cement Concrete - 75.50 CuM @ Rs. 3200.00/CuM"},{x:50,y:180,width:300,height:20,text:"Reinforced Cement Concrete - 42.75 CuM @ Rs. 5200.00/CuM"},{x:50,y:220,width:250,height:20,text:"ABC Construction Pvt Ltd"},{x:50,y:250,width:150,height:20,text:"RD-2023-001"},{x:50,y:280,width:150,height:20,text:"INV-2023-0123"},{x:50,y:310,width:150,height:20,text:"Rs. 1,250,000.00"},{x:50,y:340,width:100,height:20,text:"15/06/2023"}];return{text:s,confidence:o,boundingBoxes:r}}async extractTextFromImageFile(t){await new Promise(a=>setTimeout(a,1e3));const s=`Image Document Analysis Result:

Filename: ${t.name}
BOQ Item: Sub-base Course - 200.00 SqM @ Rs. 180.00/SqM
Measurement: 25.00m x 8.00m
Contractor: XYZ Enterprises
Date: 2023-07-22
Signature: Ramesh Shrestha
Witness: Manoj KC

Additional Details: Work completed as per specification.
Quality: Satisfactory
Quantity: 200.00 SqM
Rate: Rs. 180.00/SqM
Amount: Rs. 36,000.00`,o=Math.floor(Math.random()*30)+70;return{text:s,confidence:o,boundingBoxes:[{x:30,y:30,width:150,height:20,text:"XYZ Enterprises"},{x:30,y:60,width:200,height:20,text:"Sub-base Course - 200.00 SqM @ Rs. 180.00/SqM"},{x:30,y:90,width:100,height:20,text:"2023-07-22"},{x:30,y:120,width:120,height:20,text:"Ramesh Shrestha"},{x:30,y:150,width:80,height:20,text:"200.00 SqM"},{x:30,y:180,width:100,height:20,text:"Rs. 180.00/SqM"},{x:30,y:210,width:100,height:20,text:"Rs. 36,000.00"}]}}async extractStructuredData(t){const s={},o=[/(?:Subject:|SUBJECT|Title:|TITLE)[:\s]*([\w\s\-&(),.'"/]+)/i,/(?:Document[:\s]*|Document\s+Type)[:\s]*([\w\s\-&(),.'"/]+)/i,/(?:Letter[:\s]*|Regarding[:\s]*|RE[:\s]*)[\w\s\-&(),.'"/:]*?([\w\s\-&(),.'"/]+)/i];for(const e of o){const n=t.match(e);if(n&&n[1]){s.subjects=s.subjects||[],s.subjects.push(n[1].trim());break}}const r=[/(?:Ref[:\s]*|Reference[:\s]*|Ref[:\s]*No\.?|Reference\s+No\.?|Ref\.?\s+No\.?)\s*([A-Z0-9\/-]+[A-Z0-9\/-\s]*)/gi,/(?:No[:\s]*|Number[:\s]*)\s*([A-Z0-9\/-]+[A-Z0-9\/-\s]*)/gi,/(RFP-[A-Z0-9\/-]+)/gi,/(RFC-[A-Z0-9\/-]+)/gi,/(RFI-[A-Z0-9\/-]+)/gi],a=[];for(const e of r)[...t.matchAll(e)].forEach(i=>{i[1]&&a.push(i[1].trim())});a.length>0&&(s.refs=[...new Set(a)]);const x=[/(?:From:|FROM|Sender:|Sent\s+by|By)[:\s]*([A-Z][A-Za-z\s&,.'-]+(?:Pvt Ltd|Ltd|Co|Group|Enterprise|Company|Department|Division|Office)?)/gi,/(?:Signed\s+by|Signature[:\s]*)([A-Z][A-Za-z\s&,.'-]+)/gi,/(?:Prepared\s+by|Compiled\s+by)[:\s]*([A-Z][A-Za-z\s&,.'-]+)/gi],c=[];for(const e of x)[...t.matchAll(e)].forEach(i=>{i[1]&&c.push(i[1].trim())});c.length>0&&(s.senders=[...new Set(c)]);const R=[/(?:To:|TO|Recipient:|For[:\s]*|Addressed\s+to)[:\s]*([A-Z][A-Za-z\s&,.'-]+(?:Pvt Ltd|Ltd|Co|Group|Enterprise|Company|Department|Division|Office)?)/gi,/(?:Dear[:\s]*|Greetings\s+to)[:\s]*([A-Z][A-Za-z\s&,.'-]+)/gi],h=[];for(const e of R)[...t.matchAll(e)].forEach(i=>{i[1]&&h.push(i[1].trim())});h.length>0&&(s.recipients=[...new Set(h)]);const A=/([\d,]+\.?\d*)\s*(?:SqM|CuM|m|km|ton|bag|nos|unit|item)?\s*([A-Za-z\s\-&]+?)\s*(?:@|at|rate|Rs|NPR)\s*[\d,]+\.?\d*/gi,d=[...t.matchAll(A)];d.length>0&&(s.boqItems=d.map(e=>({quantity:parseFloat(e[1].replace(/,/g,"")),description:e[2].trim(),unit:this.extractUnit(e[0])})));const y=/(?:Rs|NPR|Rs\.|NPR\.|\$|USD)\s*([\d,]+\.\d{2})|([\d,]+\.\d{2})\s*(?:Rs|NPR|Rs\.|NPR\.|\$|USD)/gi,m=[...t.matchAll(y)];m.length>0&&(s.amounts=m.map(e=>{const n=(e[1]||e[2]||"").replace(/,/g,"");return parseFloat(n)||0}).filter(e=>e>0));const M=/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/gi,l=[...t.matchAll(M)];l.length>0&&(s.dates=l.map(e=>{let n=e[1];if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(n)){const i=n.split(/[\/-]/);i.length===3&&(n=`${i[2]}-${i[1].padStart(2,"0")}-${i[0].padStart(2,"0")}`)}return n}));const w=/(?:Project|Code|ID)[:\s]*([A-Z]{2,}-?\d+[A-Z0-9-]*)/gi,u=[...t.matchAll(w)];if(u.length>0)s.codes=u.map(e=>e[1]);else{const e=/[A-Z]{2,}-?\d+-?[A-Z0-9]+/g,n=[...t.matchAll(e)];n.length>0&&(s.codes=n.map(i=>i[0]))}const S=/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,g=[...t.matchAll(S)];g.length>0&&(s.emails=g.map(e=>e[0]));const P=/([+\d][\-\s()\d]{7,}\d)/g,p=[...t.matchAll(P)];p.length>0&&(s.phones=p.map(e=>e[1].trim()));const b=/(?:Contractor|Supplier|Vendor)[:\s]*([A-Za-z\s&]+(?:Pvt Ltd|Ltd|Co|Group|Enterprise|Company))/gi,f=[...t.matchAll(b)];f.length>0&&(s.contractors=f.map(e=>e[1].trim()));const D=/(?:Invoice|Bill|Ref)[\s#:]*([A-Z]{2,4}-?\d{3,6}|\d{6,}|INV-?\d+)/gi,C=[...t.matchAll(D)];return C.length>0&&(s.invoices=C.map(e=>e[1].trim())),s}extractUnit(t){const s=["SqM","CuM","m","km","ton","bag","nos","unit","item"];for(const o of s)if(t.toLowerCase().includes(o.toLowerCase()))return o;return"unit"}async processDocument(t){try{console.log(`Processing document: ${t.name} (${t.type})`);const s=await this.extractTextFromImage(t),o=await this.extractStructuredData(s.text);return console.log("Document processing completed successfully"),{rawText:s.text,structuredData:o,confidence:s.confidence}}catch(s){throw console.error("Error processing document:",s),s}}async terminate(){this.initialized=!1,console.log("Chandra OCR Engine terminated")}}const F=new Z;export{F as o};
