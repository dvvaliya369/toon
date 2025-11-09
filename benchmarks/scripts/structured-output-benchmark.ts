import type { EvaluationResult, Question, StructuredEvaluationResult } from '../src/types'
import * as fsp from 'node:fs/promises'
import * as path from 'node:path'
import process from 'node:process'
import * as prompts from '@clack/prompts'
import PQueue from 'p-queue'
import { BENCHMARKS_DIR, DEFAULT_CONCURRENCY, DRY_RUN, DRY_RUN_LIMITS, MODEL_RPM_LIMITS, ROOT_DIR } from '../src/constants'
import { ACCURACY_DATASETS } from '../src/datasets'
import { evaluateQuestion, evaluateQuestionStructured, models } from '../src/evaluate'
import { formatters, supportsCSV } from '../src/formatters'
import { generateQuestions } from '../src/questions'
import { calculateTokenCounts, generateStructuredOutputReport } from '../src/report'
import { ensureDir } from '../src/utils'

// Constants
const PROGRESS_UPDATE_INTERVAL = 10
const RATE_LIMIT_INTERVAL_MS = 60_000

prompts.intro('Structured Output Benchmark')

/**
 * Generate evaluation tasks for a model
 */
function generateEvaluationTasks(questions: Question[]): { question: Question, formatName: string }[] {
  const tasks: { question: Question, formatName: string }[] = []

  for (const question of questions) {
    for (const [formatName] of Object.entries(formatters)) {
      // Skip CSV for datasets that don't support it
      const dataset = ACCURACY_DATASETS.find(d => d.name === question.dataset)
      if (formatName === 'csv' && dataset && !supportsCSV(dataset))
        continue

      tasks.push({ question, formatName })
    }
  }

  return tasks
}

/**
 * Create a progress updater function
 */
function createProgressUpdater(spinner: ReturnType<typeof prompts.spinner>, total: number) {
  let completed = 0

  return () => {
    completed++
    if (completed % PROGRESS_UPDATE_INTERVAL === 0 || completed === total) {
      const percent = ((completed / total) * 100).toFixed(1)
      spinner.message(`Progress: ${completed}/${total} (${percent}%)`)
    }
  }
}

/**
 * Create a rate-limited queue for model evaluation
 */
function createEvaluationQueue(modelId: string) {
  const rpmLimit = MODEL_RPM_LIMITS[modelId]

  return new PQueue({
    concurrency: DEFAULT_CONCURRENCY,
    intervalCap: rpmLimit ?? Infinity,
    interval: rpmLimit ? RATE_LIMIT_INTERVAL_MS : 0,
  })
}

// Prompt user to select which models to benchmark
const modelChoices = models.map(({ modelId }) => ({
  value: modelId,
  label: modelId,
}))

const selectedModels = await prompts.multiselect({
  message: 'Select models to benchmark (Space to select, Enter to confirm)',
  options: modelChoices,
  required: true,
})

if (prompts.isCancel(selectedModels)) {
  prompts.cancel('Benchmark cancelled')
  process.exit(0)
}

const activeModels = models.filter(m => selectedModels.includes(m.modelId))

prompts.log.info(`Selected ${activeModels.length} model(s): ${activeModels.map(m => m.modelId).join(', ')}`)

if (DRY_RUN) {
  prompts.log.info('Limiting questions for dry run')
}

let questions = generateQuestions()

// Apply dry run limits if enabled
if (DRY_RUN && DRY_RUN_LIMITS.maxQuestions) {
  questions = questions.slice(0, DRY_RUN_LIMITS.maxQuestions)
}

prompts.log.info(`Evaluating ${questions.length} questions`)
prompts.log.info(`Testing ${Object.keys(formatters).length} formats`)
prompts.log.info('Running both text mode and structured output mode')

// Storage for all results
const allTextResults: EvaluationResult[] = []
const allStructuredResults: StructuredEvaluationResult[] = []

// Evaluate each model separately
for (const model of activeModels) {
  const modelId = model.modelId

  prompts.log.step(`Running benchmark for ${modelId}`)

  // Generate evaluation tasks for this model
  const tasks = generateEvaluationTasks(questions)

  const total = tasks.length * 2 // Both text and structured modes
  const rpmLimit = MODEL_RPM_LIMITS[modelId]
  const queue = createEvaluationQueue(modelId)

  const evalSpinner = prompts.spinner()
  evalSpinner.start(`Running ${total} evaluations (concurrency: ${DEFAULT_CONCURRENCY}, RPM limit: ${rpmLimit ?? 'unlimited'})`)

  const updateProgress = createProgressUpdater(evalSpinner, total)

  // Queue all tasks for both modes
  const textResultPromises = tasks.map(task =>
    queue.add(async () => {
      // Format data on-demand
      const dataset = ACCURACY_DATASETS.find(d => d.name === task.question.dataset)!
      const formatter = formatters[task.formatName]!
      const formattedData = formatter(dataset.data)

      const result = await evaluateQuestion({
        question: task.question,
        formatName: task.formatName,
        formattedData,
        model,
      })

      updateProgress()
      return result
    }),
  )

  const structuredResultPromises = tasks.map(task =>
    queue.add(async () => {
      // Format data on-demand
      const dataset = ACCURACY_DATASETS.find(d => d.name === task.question.dataset)!
      const formatter = formatters[task.formatName]!
      const formattedData = formatter(dataset.data)

      const result = await evaluateQuestionStructured({
        question: task.question,
        formatName: task.formatName,
        formattedData,
        model,
      })

      updateProgress()
      return result
    }),
  )

  // Wait for all tasks to complete
  const [textResults, structuredResults] = await Promise.all([
    Promise.all(textResultPromises),
    Promise.all(structuredResultPromises),
  ])

  allTextResults.push(...textResults)
  allStructuredResults.push(...structuredResults)

  evalSpinner.stop(`Evaluation complete for ${modelId}`)
}

// Generate report
const reportSpinner = prompts.spinner()
reportSpinner.start('Generating structured output comparison report')

const tokenCounts = calculateTokenCounts(formatters)
const report = generateStructuredOutputReport(allTextResults, allStructuredResults, tokenCounts)

const resultsDir = path.join(BENCHMARKS_DIR, 'results')
await ensureDir(resultsDir)

const outputFilePath = path.join(resultsDir, 'structured-output-comparison.md')
await fsp.writeFile(outputFilePath, report)

// Also save raw results as JSON for further analysis
const rawResultsPath = path.join(resultsDir, 'structured-output-results.json')
await fsp.writeFile(rawResultsPath, JSON.stringify({
  textResults: allTextResults,
  structuredResults: allStructuredResults,
  metadata: {
    models: activeModels.map(m => m.modelId),
    totalQuestions: questions.length,
    formats: Object.keys(formatters),
    timestamp: new Date().toISOString(),
  },
}, null, 2))

reportSpinner.stop('Report generation complete!')
prompts.log.info(`Report saved to: \`${path.relative(ROOT_DIR, outputFilePath)}\``)
prompts.log.info(`Raw results saved to: \`${path.relative(ROOT_DIR, rawResultsPath)}\``)

prompts.outro('Structured output benchmark complete!')
