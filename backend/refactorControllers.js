import fs from 'fs';
import path from 'path';

const controllersDir = path.join(process.cwd(), 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  if (file === 'authController.js') return; // already refactored manually
  
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  let hasChanges = false;
  
  // Basic regex to find "export const functionName = async (req, res, next) => { try { ... } catch (err) { next(err); } };"
  // It's safer to just inject asyncHandler and let ESLint format it later, but doing AST transformations is complex here.
  // A simpler regex strategy for the common pattern:
  
  // Replace: export const myFunc = async (req, res, next) => {
  // With: export const myFunc = asyncHandler(async (req, res, next) => {
  if (!content.includes('import asyncHandler')) {
    content = "import asyncHandler from 'express-async-handler';\n" + content;
    hasChanges = true;
  }
  
  // Let's replace the signature
  const replaced = content.replace(/export\s+const\s+(\w+)\s*=\s*async\s*\(([^)]*)\)\s*=>\s*\{/g, (match, name, args) => {
    hasChanges = true;
    return `export const ${name} = asyncHandler(async (${args}) => {`;
  });
  
  if (hasChanges && replaced !== content) {
    // We must also append '});' where the original '}' was, but this is extremely error-prone with regex.
    // Instead of messing up the code, let's log the files that need manual intervention.
    console.log(`Needs refactoring: ${file}`);
  }
});
