import type { BlankLineInfo, Depth, ParsedLine } from '../types'
import { SPACE, TAB } from '../constants'
import { formatIndentationError, formatParseError } from '../shared/error-utils'

export interface ScanResult {
  lines: ParsedLine[]
  blankLines: BlankLineInfo[]
}

export class LineCursor {
  private lines: ParsedLine[]
  private index: number
  private blankLines: BlankLineInfo[]

  constructor(lines: ParsedLine[], blankLines: BlankLineInfo[] = []) {
    this.lines = lines
    this.index = 0
    this.blankLines = blankLines
  }

  getBlankLines(): BlankLineInfo[] {
    return this.blankLines
  }

  peek(): ParsedLine | undefined {
    return this.lines[this.index]
  }

  next(): ParsedLine | undefined {
    return this.lines[this.index++]
  }

  current(): ParsedLine | undefined {
    return this.index > 0 ? this.lines[this.index - 1] : undefined
  }

  advance(): void {
    this.index++
  }

  atEnd(): boolean {
    return this.index >= this.lines.length
  }

  get length(): number {
    return this.lines.length
  }

  peekAtDepth(targetDepth: Depth): ParsedLine | undefined {
    const line = this.peek()
    if (!line || line.depth < targetDepth) {
      return undefined
    }
    if (line.depth === targetDepth) {
      return line
    }
    return undefined
  }

  hasMoreAtDepth(targetDepth: Depth): boolean {
    return this.peekAtDepth(targetDepth) !== undefined
  }
}

export function toParsedLines(source: string, indentSize: number, strict: boolean): ScanResult {
  if (!source.trim()) {
    return { lines: [], blankLines: [] }
  }

  const lines = source.split('\n')
  const parsed: ParsedLine[] = []
  const blankLines: BlankLineInfo[] = []

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!
    const lineNumber = i + 1
    let indent = 0
    while (indent < raw.length && raw[indent] === SPACE) {
      indent++
    }

    const content = raw.slice(indent)

    // Track blank lines
    if (!content.trim()) {
      const depth = computeDepthFromIndent(indent, indentSize)
      blankLines.push({ lineNumber, indent, depth })
      continue
    }

    const depth = computeDepthFromIndent(indent, indentSize)

    // Strict mode validation
    if (strict) {
      // Find the full leading whitespace region (spaces and tabs)
      let wsEnd = 0
      while (wsEnd < raw.length && (raw[wsEnd] === SPACE || raw[wsEnd] === TAB)) {
        wsEnd++
      }

      // Check for tabs in leading whitespace (before actual content)
      if (raw.slice(0, wsEnd).includes(TAB)) {
        const message = formatParseError(
          'Tabs are not allowed in indentation in strict mode',
          lineNumber,
          raw,
          `Replace tabs with spaces. Use ${indentSize} spaces per indentation level, or use --no-strict mode`,
        )
        throw new SyntaxError(message)
      }

      // Check for exact multiples of indentSize
      if (indent > 0 && indent % indentSize !== 0) {
        const expectedIndent = `${Math.floor(indent / indentSize) * indentSize} or ${Math.ceil(indent / indentSize) * indentSize} spaces`
        const message = formatIndentationError(lineNumber, expectedIndent, indent, indentSize)
        throw new SyntaxError(message)
      }
    }

    parsed.push({ raw, indent, content, depth, lineNumber })
  }

  return { lines: parsed, blankLines }
}

function computeDepthFromIndent(indentSpaces: number, indentSize: number): Depth {
  return Math.floor(indentSpaces / indentSize)
}
