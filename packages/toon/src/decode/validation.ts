import type { ArrayHeaderInfo, BlankLineInfo, Delimiter, Depth, ResolvedDecodeOptions } from '../types'
import type { LineCursor } from './scanner'
import { COLON, LIST_ITEM_PREFIX } from '../constants'
import { formatParseError, formatValidationError } from '../shared/error-utils'

/**
 * Asserts that the actual count matches the expected count in strict mode.
 *
 * @param actual The actual count
 * @param expected The expected count
 * @param itemType The type of items being counted (e.g., `list array items`, `tabular rows`)
 * @param options Decode options
 * @param startLine Optional line number where the array starts
 * @throws RangeError if counts don't match in strict mode
 */
export function assertExpectedCount(
  actual: number,
  expected: number,
  itemType: string,
  options: ResolvedDecodeOptions,
  startLine?: number,
): void {
  if (options.strict && actual !== expected) {
    const diff = actual - expected
    const diffText = diff > 0 ? `${diff} too many` : `${Math.abs(diff)} too few`
    const suggestion = `Found ${diffText} items. Update the array length in the header to [${actual}], or adjust the number of items to match [${expected}]`

    throw new RangeError(
      formatValidationError(expected, actual, itemType, startLine, suggestion),
    )
  }
}

/**
 * Validates that there are no extra list items beyond the expected count.
 *
 * @param cursor The line cursor
 * @param itemDepth The expected depth of items
 * @param expectedCount The expected number of items
 * @param startLine The line number where the array header is defined
 * @throws RangeError if extra items are found
 */
export function validateNoExtraListItems(
  cursor: LineCursor,
  itemDepth: Depth,
  expectedCount: number,
  startLine: number,
): void {
  if (cursor.atEnd())
    return

  const nextLine = cursor.peek()
  if (nextLine && nextLine.depth === itemDepth && nextLine.content.startsWith(LIST_ITEM_PREFIX)) {
    const message = formatParseError(
      `Array length mismatch: header declares [${expectedCount}] items, but more items found`,
      nextLine.lineNumber,
      nextLine.content,
      `Remove extra items or update the array length in the header (line ${startLine}) to match the actual count`,
    )
    throw new RangeError(message)
  }
}

/**
 * Validates that there are no extra tabular rows beyond the expected count.
 *
 * @param cursor The line cursor
 * @param rowDepth The expected depth of rows
 * @param header The array header info containing length and delimiter
 * @param startLine The line number where the array header is defined
 * @throws RangeError if extra rows are found
 */
export function validateNoExtraTabularRows(
  cursor: LineCursor,
  rowDepth: Depth,
  header: ArrayHeaderInfo,
  startLine: number,
): void {
  if (cursor.atEnd())
    return

  const nextLine = cursor.peek()
  if (
    nextLine
    && nextLine.depth === rowDepth
    && !nextLine.content.startsWith(LIST_ITEM_PREFIX)
    && isDataRow(nextLine.content, header.delimiter)
  ) {
    const message = formatParseError(
      `Tabular array length mismatch: header declares [${header.length}] rows, but more rows found`,
      nextLine.lineNumber,
      nextLine.content,
      `Remove extra rows or update the array length in the header (line ${startLine}) to match the actual count`,
    )
    throw new RangeError(message)
  }
}

/**
 * Validates that there are no blank lines within a specific line range and depth.
 *
 * @remarks
 * In strict mode, blank lines inside arrays/tabular rows are not allowed.
 *
 * @param startLine The starting line number (inclusive)
 * @param endLine The ending line number (inclusive)
 * @param blankLines Array of blank line information
 * @param strict Whether strict mode is enabled
 * @param context Description of the context (e.g., "list array", "tabular array")
 * @throws SyntaxError if blank lines are found in strict mode
 */
export function validateNoBlankLinesInRange(
  startLine: number,
  endLine: number,
  blankLines: BlankLineInfo[],
  strict: boolean,
  context: string,
): void {
  if (!strict)
    return

  // Find blank lines within the range
  // Note: We don't filter by depth because ANY blank line between array items is an error,
  // regardless of its indentation level
  const blanksInRange = blankLines.filter(
    blank => blank.lineNumber > startLine
      && blank.lineNumber < endLine,
  )

  if (blanksInRange.length > 0) {
    const blankLine = blanksInRange[0]!
    const message = formatParseError(
      `Blank lines inside ${context} are not allowed in strict mode`,
      blankLine.lineNumber,
      undefined,
      `Remove the blank line, or use --no-strict mode to allow blank lines`,
    )
    throw new SyntaxError(message)
  }
}

/**
 * Checks if a line represents a data row (as opposed to a key-value pair) in a tabular array.
 *
 * @param content The line content
 * @param delimiter The delimiter used in the table
 * @returns true if the line is a data row, false if it's a key-value pair
 */
function isDataRow(content: string, delimiter: Delimiter): boolean {
  const colonPos = content.indexOf(COLON)
  const delimiterPos = content.indexOf(delimiter)

  // No colon = definitely a data row
  if (colonPos === -1) {
    return true
  }

  // Has delimiter and it comes before colon = data row
  if (delimiterPos !== -1 && delimiterPos < colonPos) {
    return true
  }

  // Colon before delimiter or no delimiter = key-value pair
  return false
}
