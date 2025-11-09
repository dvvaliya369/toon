import type { LanguageModelV2 } from '@ai-sdk/provider'
import type { EvaluationResult, Question, StructuredEvaluationResult } from './types'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { xai } from '@ai-sdk/xai'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { compareAnswers } from './normalize'

/**
 * Models used for evaluation
 */
export const models: LanguageModelV2[] = [
  anthropic('claude-haiku-4-5-20251001'),
  google('gemini-2.5-flash'),
  openai('gpt-5-nano'),
  xai('grok-4-fast-non-reasoning'),
]

/**
 * Format primers
 *
 * @remarks
 * Neutral descriptions to help models parse each format.
 */
export const PRIMERS: Record<string, string> = {
  'toon': 'TOON: Indentation-based. Arrays declare length and fields (e.g., items[N]{f1,f2}:). Rows use single delimiter. Values may be quoted.',
  'json-pretty': 'JSON: Strict JSON objects/arrays with repeated keys per row.',
  'json-compact': 'JSON (compact): Strict JSON without extra whitespace.',
  'yaml': 'YAML: Indentation-based key/value and lists (- items).',
  'xml': 'XML: Tag-based tree structure with nested elements.',
  'csv': 'CSV: Header row, comma-separated values. First row contains field names.',
}

/**
 * Code fence language tags for proper syntax highlighting
 */
export const FENCE: Record<string, string> = {
  'toon': 'toon',
  'json-pretty': 'json',
  'json-compact': 'json',
  'yaml': 'yaml',
  'xml': 'xml',
  'csv': 'csv',
}

/**
 * Zod schemas for structured output responses
 */
export const answerSchemas = {
  simple: z.object({
    answer: z.string().describe('The answer to the question as a string value'),
  }) as z.ZodObject<{ answer: z.ZodString }>,
  list: z.object({
    items: z.array(z.string()).describe('List of answer items'),
  }) as z.ZodObject<{ items: z.ZodArray<z.ZodString> }>,
  validation: z.object({
    isValid: z.boolean().describe('Whether the data is valid and complete'),
    reason: z.string().optional().describe('Reason if data is invalid'),
  }) as z.ZodObject<{ isValid: z.ZodBoolean, reason: z.ZodOptional<z.ZodString> }>,
}

/**
 * Evaluate a single question with a specific format and model
 */
export async function evaluateQuestion(
  {
    question,
    formatName,
    formattedData,
    model,
  }:
  {
    question: Question
    formatName: string
    formattedData: string
    model: LanguageModelV2
  },
): Promise<EvaluationResult> {
  const primer = PRIMERS[formatName] ?? ''
  const fence = FENCE[formatName] ?? ''

  const prompt = `
${primer}

Given the following data in ${formatName} format:

\`\`\`${fence}
${formattedData}
\`\`\`

Question: ${question.prompt}

Answer format requirements:
- Provide only the value itself, no explanation
- For numbers: output digits only (no commas, currency symbols, or units)
- For dates/field names: use the exact string from the data
- For lists: output comma-separated values with no spaces

Answer:
`.trim()

  const startTime = performance.now()
  const { text, usage } = await generateText({ model, prompt })

  const actual = text.trim()
  const latencyMs = performance.now() - startTime

  const comparisonResult = compareAnswers(
    actual,
    question.groundTruth,
    question.answerType ?? 'string',
    question.normalizationOptions,
  )
  const isCorrect = comparisonResult.match

  return {
    questionId: question.id,
    format: formatName,
    model: model.modelId,
    expected: question.groundTruth,
    actual,
    isCorrect,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    latencyMs,
  }
}

/**
 * Evaluate a single question using structured output mode
 *
 * @remarks
 * Uses the AI SDK's `generateObject()` to get schema-constrained JSON responses.
 * This tests LLM provider structured output endpoints (JSON mode, schema validation).
 */
export async function evaluateQuestionStructured(
  {
    question,
    formatName,
    formattedData,
    model,
  }:
  {
    question: Question
    formatName: string
    formattedData: string
    model: LanguageModelV2
  },
): Promise<StructuredEvaluationResult> {
  const primer = PRIMERS[formatName] ?? ''
  const fence = FENCE[formatName] ?? ''

  // Select appropriate schema based on question type
  const schema = question.type === 'structural-validation'
    ? answerSchemas.validation
    : answerSchemas.simple

  const prompt = `
${primer}

Given the following data in ${formatName} format:

\`\`\`${fence}
${formattedData}
\`\`\`

Question: ${question.prompt}

Answer requirements:
- For numbers: provide digits only (no commas, currency symbols, or units)
- For dates/field names: use the exact string from the data
- For lists: provide comma-separated values with no spaces
- For validation questions: indicate if data is valid and complete
`.trim()

  const startTime = performance.now()
  const { object, usage } = await generateObject({
    model,
    schema,
    prompt,
  })

  const latencyMs = performance.now() - startTime

  // Extract answer from structured response
  let actual: string
  if ('isValid' in object && typeof object.isValid === 'boolean') {
    // Validation question
    actual = object.isValid ? 'YES' : 'NO'
  }
  else if ('items' in object && Array.isArray(object.items)) {
    // List question
    actual = (object.items as string[]).join(',')
  }
  else if ('answer' in object && typeof object.answer === 'string') {
    // Simple answer
    actual = object.answer
  }
  else {
    // Fallback
    actual = String(object)
  }

  const comparisonResult = compareAnswers(
    actual,
    question.groundTruth,
    question.answerType ?? 'string',
    question.normalizationOptions,
  )
  const isCorrect = comparisonResult.match

  return {
    questionId: question.id,
    format: formatName,
    model: model.modelId,
    expected: question.groundTruth,
    actual,
    isCorrect,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    latencyMs,
    structuredOutput: true,
    rawObject: object,
  }
}
