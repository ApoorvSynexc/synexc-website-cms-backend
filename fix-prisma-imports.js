#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function fixImportsInFile(filePath) {
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // Fix relative imports without .js extension (but not node_modules imports)
  // Match: from "./something" or from "./path/to/something"
  // But not: from "node:" or from "@..."
  content = content.replace(
    /from ["'](\.[./\w-]+)["']/g,
    (match, importPath) => {
      if (!importPath.endsWith('.js') && !importPath.endsWith('.ts') && !importPath.includes('node:')) {
        return `from "${importPath}.js"`;
      }
      return match;
    }
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

// Fix both source and compiled files
const sourceDir = path.join(__dirname, 'generated/prisma');
const compiledDir = path.join(__dirname, 'dist/generated/prisma');

let fixed = false;

// Fix all .ts files in source
if (fs.existsSync(sourceDir)) {
  for (const file of fs.readdirSync(sourceDir)) {
    if (file.endsWith('.ts')) {
      if (fixImportsInFile(path.join(sourceDir, file))) {
        fixed = true;
      }
    }
  }
}

// Fix all .js files in compiled output
if (fs.existsSync(compiledDir)) {
  for (const file of fs.readdirSync(compiledDir)) {
    if (file.endsWith('.js')) {
      if (fixImportsInFile(path.join(compiledDir, file))) {
        fixed = true;
      }
    }
  }
  // Recursively fix nested directories
  for (const dir of fs.readdirSync(compiledDir)) {
    const fullPath = path.join(compiledDir, dir);
    if (fs.statSync(fullPath).isDirectory()) {
      for (const file of fs.readdirSync(fullPath)) {
        if (file.endsWith('.js')) {
          if (fixImportsInFile(path.join(fullPath, file))) {
            fixed = true;
          }
        }
      }
    }
  }
}

if (fixed) {
  console.log('✓ Fixed Prisma imports');
} else if (fs.existsSync(sourceDir) || fs.existsSync(compiledDir)) {
  console.log('⚠ No import fixes needed');
}
