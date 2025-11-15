/**
 * Utilities for creating readable, context-rich error messages.
 */

/**
 * Creates a formatted error message with line number and code context.
 *
 * @param message The main error message
 * @param lineNumber The line number where the error occurred (1-indexed)
 * @param lineContent The content of the problematic line
 * @param suggestion Optional suggestion for fixing the error
 * @returns A formatted error message string
 */
export function formatParseError(
  message: string,
  lineNumber?: number,
  lineContent?: string,
  suggestion?: string,
): string {
  const parts: string[] = []

  // Main error message
  if (lineNumber !== undefined) {
    parts.push(`Line ${lineNumber}: ${message}`)
  }
  else {
    parts.push(message)
  }

  // Show the problematic line
  if (lineContent !== undefined) {
    parts.push(`  | ${lineContent}`)
  }

  // Add suggestion if provided
  if (suggestion) {
    parts.push(`  → ${suggestion}`)
  }

  return parts.join('\n')
}

/**
 * Creates a validation error message with expected vs actual comparison.
 *
 * @param expected The expected value or count
 * @param actual The actual value or count
 * @param itemType Description of what's being validated
 * @param lineNumber Optional line number where the issue was detected
 * @param suggestion Optional suggestion for fixing
 * @returns A formatted error message string
 */
export function formatValidationError(
  expected: number | string,
  actual: number | string,
  itemType: string,
  lineNumber?: number,
  suggestion?: string,
): string {
  const parts: string[] = []

  const prefix = lineNumber !== undefined ? `Line ${lineNumber}: ` : ''
  parts.push(`${prefix}Expected ${expected} ${itemType}, but found ${actual}`)

  if (suggestion) {
    parts.push(`  → ${suggestion}`)
  }

  return parts.join('\n')
}

/**
 * Creates an error message for unterminated strings with context.
 *
 * @param lineNumber The line number where the string starts
 * @param lineContent The content of the line
 * @returns A formatted error message string
 */
export function formatUnterminatedStringError(
  lineNumber: number,
  lineContent: string,
): string {
  return formatParseError(
    'Unterminated string: missing closing quote',
    lineNumber,
    lineContent,
    'Add a closing double quote (") at the end of the string',
  )
}

/**
 * Creates an error message for invalid escape sequences.
 *
 * @param sequence The invalid escape sequence
 * @param lineNumber Optional line number
 * @param lineContent Optional line content
 * @returns A formatted error message string
 */
export function formatInvalidEscapeError(
  sequence: string,
  lineNumber?: number,
  lineContent?: string,
): string {
  const validEscapes = '\\n, \\t, \\r, \\\\, \\"'
  return formatParseError(
    `Invalid escape sequence: ${sequence}`,
    lineNumber,
    lineContent,
    `Valid escape sequences are: ${validEscapes}`,
  )
}

/**
 * Creates an error message for indentation issues.
 *
 * @param lineNumber The line number with incorrect indentation
 * @param expected The expected indentation
 * @param actual The actual indentation
 * @param indentSize The configured indent size
 * @returns A formatted error message string
 */
export function formatIndentationError(
  lineNumber: number,
  expected: string,
  actual: number,
  indentSize: number,
): string {
  return formatParseError(
    `Incorrect indentation`,
    lineNumber,
    undefined,
    `Expected ${expected}, but found ${actual} spaces. Indentation must be a multiple of ${indentSize}`,
  )
}

/**
 * Creates an error message for missing structural elements.
 *
 * @param element The missing element (e.g., "colon", "closing bracket")
 * @param lineNumber The line number
 * @param lineContent The line content
 * @returns A formatted error message string
 */
export function formatMissingElementError(
  element: string,
  lineNumber: number,
  lineContent: string,
): string {
  const suggestions: Record<string, string> = {
    'colon': 'Add a colon (:) after the key',
    'closing quote': 'Add a closing double quote (") to end the string',
    'closing bracket': 'Add a closing bracket (]) to complete the array header',
    'closing brace': 'Add a closing brace (}) to complete the field list',
  }

  return formatParseError(
    `Missing ${element}`,
    lineNumber,
    lineContent,
    suggestions[element] || `Add the missing ${element}`,
  )
}

/**
 * Creates an error message for array length mismatches.
 *
 * @param declared The declared array length
 * @param actual The actual number of items found
 * @param arrayType The type of array (e.g., "list array", "tabular array")
 * @param startLine The line where the array starts
 * @returns A formatted error message string
 */
export function formatArrayLengthMismatchError(
  declared: number,
  actual: number,
  arrayType: string,
  startLine: number,
): string {
  const diff = actual - declared
  const diffText = diff > 0 ? `${diff} too many` : `${Math.abs(diff)} too few`

  return formatValidationError(
    declared,
    actual,
    `${arrayType} items`,
    startLine,
    `Found ${diffText} items. Update the array length in the header [${declared}] to [${actual}], or adjust the number of items`,
  )
}
