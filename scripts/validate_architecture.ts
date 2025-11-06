#!/usr/bin/env bun
/**
 * Architecture Validator for Three-Layer Modular Monolith
 *
 * Validates:
 * - c1 (Foundation) imports only stdlib + external packages
 * - c2 (Services) imports c1 + stdlib + external packages
 * - c3 (Applications) imports c1 + c2 + stdlib + external packages
 * - No circular dependencies
 * - All packages follow flat structure at src/ level
 * - Package naming follows c{N}_{noun}_{function} pattern
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalFiles: number;
    c1Files: number;
    c2Files: number;
    c3Files: number;
    violations: number;
  };
}

interface ImportInfo {
  file: string;
  layer: 'c1' | 'c2' | 'c3' | 'unknown';
  imports: string[];
  internalImports: string[];
  externalImports: string[];
}

// External packages (allowed in all layers)
const EXTERNAL_PACKAGES = new Set([
  'groq-sdk',
  'bun:sqlite',
  'dotenv',
  'fs',
  'path',
  'os',
  'child_process',
  'crypto',
  'http',
  'https',
  'util',
  'events',
  'stream',
]);

// Node.js stdlib patterns
const STDLIB_PATTERNS = [
  /^node:/,
  /^fs$/,
  /^path$/,
  /^os$/,
  /^crypto$/,
  /^http$/,
  /^https$/,
  /^util$/,
  /^events$/,
  /^stream$/,
  /^child_process$/,
];

/**
 * Determines the layer (c1, c2, c3) from a file path
 */
function getLayerFromPath(filePath: string): 'c1' | 'c2' | 'c3' | 'unknown' {
  const match = filePath.match(/\/c([123])_/);
  if (match) {
    return `c${match[1]}` as 'c1' | 'c2' | 'c3';
  }
  return 'unknown';
}

/**
 * Checks if an import is from stdlib or external package
 */
function isExternalImport(importPath: string): boolean {
  // Check stdlib patterns
  for (const pattern of STDLIB_PATTERNS) {
    if (pattern.test(importPath)) {
      return true;
    }
  }

  // Check external packages
  if (EXTERNAL_PACKAGES.has(importPath)) {
    return true;
  }

  // Check if it starts with an external package name
  const firstPart = importPath.split('/')[0];
  if (EXTERNAL_PACKAGES.has(firstPart)) {
    return true;
  }

  // Relative imports are internal
  if (importPath.startsWith('.') || importPath.startsWith('../')) {
    return false;
  }

  // Absolute src/ imports are internal
  if (importPath.startsWith('src/')) {
    return false;
  }

  // Everything else is external
  return true;
}

/**
 * Extracts import statements from TypeScript file
 */
function extractImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports: string[] = [];

  // Match: import ... from '...'
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // Match: import('...')
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * Resolves a relative import to absolute src/ path
 */
function resolveImport(fromFile: string, importPath: string): string {
  if (!importPath.startsWith('.')) {
    return importPath;
  }

  const fromDir = path.dirname(fromFile);
  const resolved = path.resolve(fromDir, importPath);
  const srcIndex = resolved.indexOf('/src/');
  if (srcIndex >= 0) {
    return resolved.substring(srcIndex + 1);
  }
  return resolved;
}

/**
 * Collects all TypeScript files and their imports
 */
function collectImportInfo(srcDir: string): ImportInfo[] {
  const result: ImportInfo[] = [];

  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        const relativePath = path.relative(process.cwd(), fullPath);
        const layer = getLayerFromPath(relativePath);
        const imports = extractImports(fullPath);

        const internalImports: string[] = [];
        const externalImports: string[] = [];

        for (const imp of imports) {
          if (isExternalImport(imp)) {
            externalImports.push(imp);
          } else {
            const resolved = resolveImport(relativePath, imp);
            internalImports.push(resolved);
          }
        }

        result.push({
          file: relativePath,
          layer,
          imports,
          internalImports,
          externalImports,
        });
      }
    }
  }

  walkDir(srcDir);
  return result;
}

/**
 * Validates layer dependency rules
 */
function validateLayerDependencies(importInfos: ImportInfo[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let violations = 0;

  const stats = {
    totalFiles: importInfos.length,
    c1Files: 0,
    c2Files: 0,
    c3Files: 0,
    violations: 0,
  };

  for (const info of importInfos) {
    // Count files by layer
    if (info.layer === 'c1') stats.c1Files++;
    if (info.layer === 'c2') stats.c2Files++;
    if (info.layer === 'c3') stats.c3Files++;

    // Check for unknown layer
    if (info.layer === 'unknown') {
      warnings.push(`${info.file}: File not in c1/c2/c3 package (old structure?)`);
      continue;
    }

    // Validate c1 imports (should only import external packages)
    if (info.layer === 'c1') {
      for (const imp of info.internalImports) {
        const importLayer = getLayerFromPath(imp);
        if (importLayer !== 'unknown' && importLayer !== 'c1') {
          errors.push(`${info.file}: c1 layer imports ${importLayer} layer (${imp})`);
          violations++;
        }
      }
    }

    // Validate c2 imports (should only import c1 + external)
    if (info.layer === 'c2') {
      for (const imp of info.internalImports) {
        const importLayer = getLayerFromPath(imp);
        if (importLayer === 'c3') {
          errors.push(`${info.file}: c2 layer imports c3 layer (${imp})`);
          violations++;
        }
      }
    }

    // c3 can import from any layer (no restrictions)
  }

  stats.violations = violations;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}

/**
 * Detects circular dependencies using depth-first search
 */
function detectCircularDependencies(importInfos: ImportInfo[]): string[] {
  const cycles: string[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  // Build adjacency list
  const graph = new Map<string, string[]>();
  for (const info of importInfos) {
    graph.set(info.file, info.internalImports);
  }

  function dfs(file: string, path: string[]): void {
    if (recursionStack.has(file)) {
      // Found a cycle
      const cycleStart = path.indexOf(file);
      const cycle = path.slice(cycleStart).concat(file).join(' → ');
      cycles.push(cycle);
      return;
    }

    if (visited.has(file)) {
      return;
    }

    visited.add(file);
    recursionStack.add(file);
    path.push(file);

    const imports = graph.get(file) || [];
    for (const imp of imports) {
      dfs(imp, path.slice());
    }

    recursionStack.delete(file);
  }

  for (const info of importInfos) {
    if (!visited.has(info.file)) {
      dfs(info.file, []);
    }
  }

  return cycles;
}

/**
 * Validates package naming convention: c{N}_{noun}_{function}
 */
function validatePackageNaming(srcDir: string): string[] {
  const errors: string[] = [];

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const dirName = entry.name;

      // Should match c{N}_{noun}_{function} or be a special case
      const validPattern = /^c[123]_[a-z]+(_[a-z]+)*$/;

      if (!validPattern.test(dirName)) {
        errors.push(`Invalid package name: ${dirName} (should match c{N}_{noun}_{function})`);
      }
    }
  }

  return errors;
}

/**
 * Main validation function
 */
function validateArchitecture(): void {
  console.log('================================================================================');
  console.log('THREE-LAYER ARCHITECTURE VALIDATOR');
  console.log('================================================================================\n');

  const srcDir = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcDir)) {
    console.error('❌ ERROR: src/ directory not found');
    process.exit(1);
  }

  console.log('Collecting import information...');
  const importInfos = collectImportInfo(srcDir);
  console.log(`Found ${importInfos.length} TypeScript files\n`);

  // Validate package naming
  console.log('Validating package naming convention...');
  const namingErrors = validatePackageNaming(srcDir);
  if (namingErrors.length > 0) {
    console.log('❌ Package Naming Violations:');
    for (const error of namingErrors) {
      console.log(`   ${error}`);
    }
    console.log();
  } else {
    console.log('✅ Package naming is correct\n');
  }

  // Validate layer dependencies
  console.log('Validating layer dependencies...');
  const result = validateLayerDependencies(importInfos);

  console.log(`Statistics:`);
  console.log(`   Total files: ${result.stats.totalFiles}`);
  console.log(`   c1 (Foundation) files: ${result.stats.c1Files}`);
  console.log(`   c2 (Services) files: ${result.stats.c2Files}`);
  console.log(`   c3 (Applications) files: ${result.stats.c3Files}`);
  console.log(`   Files in old structure: ${result.stats.totalFiles - result.stats.c1Files - result.stats.c2Files - result.stats.c3Files}\n`);

  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    for (const warning of result.warnings) {
      console.log(`   ${warning}`);
    }
    console.log();
  }

  if (result.errors.length > 0) {
    console.log('❌ Layer Dependency Violations:');
    for (const error of result.errors) {
      console.log(`   ${error}`);
    }
    console.log();
  } else {
    console.log('✅ Layer dependencies are correct\n');
  }

  // Detect circular dependencies
  console.log('Detecting circular dependencies...');
  const cycles = detectCircularDependencies(importInfos);

  if (cycles.length > 0) {
    console.log('❌ Circular Dependencies:');
    for (const cycle of cycles) {
      console.log(`   ${cycle}`);
    }
    console.log();
  } else {
    console.log('✅ No circular dependencies detected\n');
  }

  // Summary
  console.log('================================================================================');
  console.log('VALIDATION SUMMARY');
  console.log('================================================================================\n');

  const allValid = result.valid && cycles.length === 0 && namingErrors.length === 0;

  if (allValid) {
    console.log('✅ ARCHITECTURE VALIDATION PASSED');
    console.log('\nAll layer dependency rules are satisfied.');
    console.log('No circular dependencies detected.');
    console.log('Package naming follows convention.\n');
    process.exit(0);
  } else {
    console.log('❌ ARCHITECTURE VALIDATION FAILED');
    console.log(`\n${namingErrors.length + result.errors.length} error(s), ${result.warnings.length} warning(s)\n`);
    process.exit(1);
  }
}

// Run validation
validateArchitecture();
