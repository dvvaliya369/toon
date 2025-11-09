# TOON Benchmarks

Benchmarks measuring TOON's **token efficiency** and **retrieval accuracy** compared to JSON, XML, YAML, and CSV.

> [!NOTE]
> Results are automatically embedded in the [main README](../README.md#benchmarks). This guide focuses on running the benchmarks locally.

## Quick Start

```bash
# Run token efficiency benchmark
pnpm benchmark:tokens

# Run retrieval accuracy benchmark (requires API keys)
pnpm benchmark:accuracy

# Run structured output benchmark (requires API keys)
pnpm benchmark:structured
```

## Token Efficiency Benchmark

Measures token count reduction across JSON, XML, YAML, CSV, and TOON:

1. Generate datasets (GitHub repos, analytics, orders)
2. Convert to all formats (TOON, JSON, XML, YAML, CSV)
3. Tokenize using `gpt-tokenizer` (`o200k_base` encoding)
4. Calculate savings and generate report

```bash
pnpm benchmark:tokens
```

Results are saved to `results/token-efficiency.md`.

## Retrieval Accuracy Benchmark

Tests how well LLMs can answer questions about data in different formats (TOON, JSON, JSON compact, XML, YAML, CSV):

1. Generate 209 questions across 11 datasets (6 primary + 5 structural validation; CSV only included for datasets with flat/tabular structure)
2. Convert each dataset to all supported formats
3. Query each LLM with formatted data + question
4. Validate answers deterministically using type-aware comparison (no LLM judge needed)
5. Aggregate metrics and generate report

### Setup

1. Edit [`src/evaluate.ts`](./src/evaluate.ts) and add models to the exported `models` array:
   ```ts
   export const models: LanguageModelV2[] = [
     openai('gpt-5-nano'),
     anthropic('claude-haiku-4-5-20251001'),
     google('gemini-2.5-flash'),
     xai('grok-4-fast-non-reasoning'),
     // Add your models here
   ]
   ```
2. Duplicate `.env.example` to `.env` and add your API keys:
   ```bash
   cp .env.example .env
   ```

### Usage

```bash
# Full benchmark
pnpm benchmark:accuracy

# Dry run (10 questions only, for testing setup)
DRY_RUN=true pnpm benchmark:accuracy
```

Running the script will:

1. Prompt you to select which models to test.
2. Skip models with existing results (rerun to overwrite).
3. Show progress with rate limiting.
4. Save results to `results/accuracy/models/{model-id}.json`.
5. Generate report at `results/retrieval-accuracy.md`.

### Configuration

Edit [`src/constants.ts`](./src/constants.ts) to adjust:

- `MODEL_RPM_LIMITS` – Rate limits per model
- `DEFAULT_CONCURRENCY` – Parallel tasks (default: 10)
- `DRY_RUN_LIMITS` – Questions per dry run (default: 10)

## Structured Output Benchmark

Tests LLM provider **structured output endpoints** (JSON mode, schema-constrained responses) to compare token efficiency and accuracy when using TOON vs other formats with guaranteed valid JSON output.

### What It Tests

This benchmark compares two modes:

1. **Text Mode**: Standard `generateText()` with free-form responses
2. **Structured Mode**: `generateObject()` with Zod schemas for type-safe JSON responses

The key question: **Does TOON's token efficiency advantage persist when using structured output endpoints?**

### Setup

Same as retrieval accuracy benchmark:

1. Edit [`src/evaluate.ts`](./src/evaluate.ts) and add models to the `models` array
2. Copy `.env.example` to `.env` and add your API keys

### Usage

```bash
# Full benchmark (compares text vs structured output modes)
pnpm benchmark:structured

# Dry run (10 questions only)
DRY_RUN=true pnpm benchmark:structured
```

### What This Shows

**Structured output endpoints** (like OpenAI's JSON mode, Anthropic's structured outputs) guarantee valid JSON responses conforming to a schema. This benchmark demonstrates:

1. **TOON's token efficiency is preserved**: Input format token savings remain regardless of output mode
2. **Improved reliability**: Schema validation reduces parsing errors and improves accuracy
3. **Format flexibility**: You can use TOON for input and get structured JSON output, combining benefits of both

### Results

Results are saved to:
- `results/structured-output-comparison.md` – Markdown report with comparison tables
- `results/structured-output-results.json` – Raw results for further analysis

## Project Structure

```
scripts/
├── accuracy-benchmark.ts         # Retrieval accuracy benchmark
├── structured-output-benchmark.ts # Structured output comparison
├── token-efficiency-benchmark.ts # Token counting benchmark
└── fetch-github-repos.ts         # Update GitHub dataset
src/
├── constants.ts                  # Configuration
├── datasets.ts                   # Test data generators
├── evaluate.ts                   # LLM evaluation (text & structured)
├── formatters.ts                 # Format converters
├── normalize.ts                  # Answer normalization
├── report.ts                     # Markdown reports
├── storage.ts                    # Result caching
├── types.ts                      # Type definitions
├── utils.ts                      # Helpers
└── questions/                    # Question generators
    ├── analytics.ts
    ├── event-logs.ts
    ├── github.ts
    ├── index.ts
    ├── nested-config.ts
    ├── nested.ts
    ├── structural-validation.ts
    ├── structure.ts
    ├── tabular.ts
    └── utils.ts
data/
└── github-repos.json             # Top 100 GitHub repos
results/
├── token-efficiency.md           # Token savings report
├── retrieval-accuracy.md         # Accuracy report
├── structured-output-comparison.md # Structured output comparison
├── structured-output-results.json  # Raw structured output results
└── accuracy/models/              # Per-model results (JSON)
```
