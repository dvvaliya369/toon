# Error Message Improvements

This document summarizes the improvements made to execution logs and error messages in the TOON format library and CLI.

## Overview

The error messages have been significantly enhanced to provide:
- **Line numbers** - Exact location of errors in the input
- **Code context** - Display of the problematic line
- **Helpful suggestions** - Actionable advice on how to fix the error
- **Clear formatting** - Multi-line messages with visual separators

## Changes Made

### 1. New Error Formatting Utilities (`packages/toon/src/shared/error-utils.ts`)

Created a comprehensive set of error formatting functions:

- `formatParseError()` - General parsing errors with line numbers and suggestions
- `formatValidationError()` - Validation errors with expected vs actual comparisons
- `formatUnterminatedStringError()` - Specific formatting for unterminated strings
- `formatInvalidEscapeError()` - Escape sequence errors with valid examples
- `formatIndentationError()` - Indentation issues with expected values
- `formatMissingElementError()` - Missing structural elements (colons, quotes, etc.)
- `formatArrayLengthMismatchError()` - Array length validation errors

### 2. Enhanced Decoder Error Messages

#### Validation Errors (`packages/toon/src/decode/validation.ts`)

**Before:**
```
Expected 2 tabular rows, but got 3
```

**After:**
```
Line 4: Tabular array length mismatch: header declares [2] rows, but more rows found
  | 3,Charlie
  → Remove extra rows or update the array length in the header (line 2) to match the actual count
```

#### Parser Errors (`packages/toon/src/decode/parser.ts`)

**Before:**
```
Unterminated string: missing closing quote
```

**After:**
```
Unterminated string: missing closing quote
  | "John
  → Add a closing double quote (") at the end of the string
```

**Before:**
```
Missing colon after key
```

**After:**
```
Missing colon after key
  | name "John"
  → Add a colon (:) after the key name
```

#### Scanner Errors (`packages/toon/src/decode/scanner.ts`)

**Before:**
```
Line 2: Indentation must be exact multiple of 2, but found 3 spaces
```

**After:**
```
Line 2: Incorrect indentation
  → Expected 2 or 4 spaces, but found 3 spaces. Indentation must be a multiple of 2
```

**Before:**
```
Line 2: Tabs are not allowed in indentation in strict mode
```

**After:**
```
Line 2: Tabs are not allowed in indentation in strict mode
  |   name: Alice
  → Replace tabs with spaces. Use 2 spaces per indentation level, or use --no-strict mode
```

#### String Utility Errors (`packages/toon/src/shared/string-utils.ts`)

**Before:**
```
Invalid escape sequence: \x
```

**After:**
```
Invalid escape sequence: \x
  | hello\xworld
  → Valid escape sequences are: \n, \t, \r, \\, \"
```

### 3. Improved CLI Error Handling (`packages/cli/src/`)

#### JSON Parsing Errors (`conversion.ts`)

**Before:**
```
Failed to parse JSON: Expected ',' or '}' after property value in JSON at position 21
```

**After:**
```
Failed to parse JSON from test-invalid.json

Error: Expected ',' or '}' after property value in JSON at position 21 (line 3 column 3)

→ Ensure the input is valid JSON format
```

#### TOON Decoding Errors (`conversion.ts`)

**Before:**
```
Failed to decode TOON: Expected 2 list array items, but got 3
```

**After:**
```
Failed to decode TOON from test-invalid.toon

Line 4: Array length mismatch: header declares [2] items, but more items found
  | - third
  → Remove extra items or update the array length in the header (line 2) to match the actual count

→ Try using --no-strict mode to skip validation checks
```

#### CLI Validation Errors (`index.ts`)

**Before:**
```
Invalid delimiter ";". Valid delimiters are: comma (,), tab (\t), pipe (|)
```

**After:**
```
Invalid delimiter: ";"

→ Valid delimiters are:
   , (comma)    - default, most common
   \t (tab)     - often more token-efficient
   | (pipe)     - alternative separator

   Example: --delimiter "\t"
```

**Before:**
```
Invalid indent value: abc
```

**After:**
```
Invalid indent value: "abc"

→ Indent must be a positive number (e.g., 2, 4)
   Example: --indent 4
```

## Benefits

1. **Faster Debugging** - Users can immediately see where the error occurred and what went wrong
2. **Better Learning Experience** - Suggestions help users understand the TOON format better
3. **Reduced Support Burden** - Clear error messages reduce the need for external help
4. **Professional Quality** - Error messages match the quality of modern developer tools
5. **Accessibility** - Multi-line formatting makes errors easier to read and understand

## Testing

All existing tests pass without modification:
- ✅ 341 tests in `packages/toon`
- ✅ 7 tests in `packages/cli`
- ✅ TypeScript compilation successful
- ✅ Build successful

## Examples

### Array Length Mismatch
```
Line 4: Tabular array length mismatch: header declares [2] rows, but more rows found
  | 3,Charlie
  → Remove extra rows or update the array length in the header (line 2) to match the actual count
```

### Invalid Indentation
```
Line 2: Incorrect indentation
  → Expected 2 or 4 spaces, but found 3 spaces. Indentation must be a multiple of 2
```

### Invalid Escape Sequence
```
Invalid escape sequence: \x
  | hello\xworld
  → Valid escape sequences are: \n, \t, \r, \\, \"
```

### Blank Line in Array
```
Line 3: Blank lines inside list array are not allowed in strict mode
  → Remove the blank line, or use --no-strict mode to allow blank lines
```

## Backward Compatibility

All changes are backward compatible:
- Error types remain the same (SyntaxError, RangeError, TypeError, ReferenceError)
- Error detection logic unchanged
- Only error message formatting improved
- All existing tests pass without modification
