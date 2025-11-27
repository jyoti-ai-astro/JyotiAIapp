/**
 * Shader Minifier (Phase 30 - F45)
 * 
 * Minifies GLSL shader code by removing comments and unnecessary whitespace
 */

/**
 * Minify GLSL shader code
 */
export function minifyShader(glsl: string): string {
  if (!glsl || typeof glsl !== 'string') {
    return glsl;
  }

  let minified = glsl;

  // Remove single-line comments (// ...)
  minified = minified.replace(/\/\/.*$/gm, '');

  // Remove multi-line comments (/* ... */)
  minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove leading/trailing whitespace from lines
  minified = minified.split('\n').map(line => line.trim()).join('\n');

  // Remove multiple consecutive empty lines
  minified = minified.replace(/\n{3,}/g, '\n\n');

  // Remove whitespace around operators and brackets (careful with strings)
  // Only remove spaces around operators, not inside strings
  minified = minified.replace(/\s*([+\-*/=<>!&|,;:(){}[\]])\s*/g, '$1');

  // Remove trailing semicolons before closing braces
  minified = minified.replace(/;\s*}/g, '}');

  // Remove multiple spaces (but preserve single spaces)
  minified = minified.replace(/  +/g, ' ');

  return minified.trim();
}

/**
 * Check if shader is already minified (heuristic)
 */
export function isShaderMinified(glsl: string): boolean {
  if (!glsl) return true;
  
  // Check for common minification indicators
  const hasComments = /\/\/|\/\*/.test(glsl);
  const hasMultipleSpaces = /  +/.test(glsl);
  const hasEmptyLines = /\n\s*\n/.test(glsl);
  
  return !hasComments && !hasMultipleSpaces && !hasEmptyLines;
}

