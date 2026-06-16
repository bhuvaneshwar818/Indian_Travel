import fs from 'fs';
import path from 'path';

const contentPath = 'C:\\Users\\Bhuvanesh\\.gemini\\antigravity\\brain\\0ea002ee-5fdb-4175-b4ff-1d2f5d30168a\\.system_generated\\steps\\487\\content.md';
const outputPath = 'x:\\project1\\frontend\\src\\components\\indiaMapData.js';

try {
  let content = fs.readFileSync(contentPath, 'utf8');
  
  // Find where export default starts
  const startIdx = content.indexOf('export default');
  if (startIdx === -1) {
    throw new Error('Could not find export default in file');
  }
  
  let jsonString = content.substring(startIdx + 'export default '.length).trim();
  
  // Clean up any trailing text if there is any
  // Note: the file has export default {...}
  // Let's write it out as a JS file
  const outCode = `// High-clarity accurate India SVG State Paths
export const indiaMapData = ${jsonString};
`;
  
  fs.writeFileSync(outputPath, outCode, 'utf8');
  console.log('Successfully extracted India map data to indiaMapData.js!');
} catch (e) {
  console.error('Error during extraction:', e);
}
