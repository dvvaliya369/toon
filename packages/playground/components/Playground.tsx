'use client'

import { decode, encode } from '@toon-format/toon'
import { encode as encodeTokens } from 'gpt-tokenizer'
import { useEffect, useMemo, useState } from 'react'
import { examples } from '@/lib/examples'

type Mode = 'encode' | 'decode'
type Delimiter = ',' | '\t' | '|'

export default function Playground() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState(examples[0].json)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  // Encoding options
  const [delimiter, setDelimiter] = useState<Delimiter>(',')
  const [indent, setIndent] = useState(2)
  const [lengthMarker, setLengthMarker] = useState(false)
  const [showStats, setShowStats] = useState(true)

  // Convert input to output
  useEffect(() => {
    try {
      setError('')
      if (mode === 'encode') {
        const parsed = JSON.parse(input)
        const encoded = encode(parsed, {
          delimiter,
          indent,
          lengthMarker: lengthMarker ? '#' : false,
        })
        setOutput(encoded)
      }
      else {
        const decoded = decode(input, { indent })
        setOutput(JSON.stringify(decoded, null, 2))
      }
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid input')
      setOutput('')
    }
  }, [input, mode, delimiter, indent, lengthMarker])

  // Token statistics
  const stats = useMemo(() => {
    if (!showStats || mode !== 'encode' || !output)
      return null

    try {
      const jsonTokens = encodeTokens(input).length
      const toonTokens = encodeTokens(output).length
      const savings = jsonTokens - toonTokens
      const savingsPercent = ((savings / jsonTokens) * 100).toFixed(1)

      return {
        jsonTokens,
        toonTokens,
        savings,
        savingsPercent,
      }
    }
    catch {
      return null
    }
  }, [input, output, showStats, mode])

  const handleExampleSelect = (exampleIndex: number) => {
    const example = examples[exampleIndex]
    setInput(mode === 'encode' ? example.json : example.toon)
    setMode(mode)
  }

  const handleModeToggle = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)
    // Swap input and output
    if (output) {
      setInput(output)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                TOON Playground
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Interactive playground for Token-Oriented Object Notation
              </p>
            </div>
            <a
              href="https://github.com/toon-format/toon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mode
              </label>
              <button
                onClick={handleModeToggle}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {mode === 'encode' ? 'JSON → TOON' : 'TOON → JSON'}
              </button>
            </div>

            {/* Example Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Examples
              </label>
              <select
                onChange={e => handleExampleSelect(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {examples.map((example, index) => (
                  <option key={index} value={index}>
                    {example.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Delimiter (encode only) */}
            {mode === 'encode' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delimiter
                </label>
                <select
                  value={delimiter}
                  onChange={e => setDelimiter(e.target.value as Delimiter)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value=",">Comma (,)</option>
                  <option value="\t">Tab (\t)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
            )}

            {/* Indent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Indent:
                {' '}
                {indent}
              </label>
              <input
                type="range"
                min="2"
                max="8"
                step="2"
                value={indent}
                onChange={e => setIndent(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Additional Options */}
          {mode === 'encode' && (
            <div className="mt-4 flex flex-wrap gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={lengthMarker}
                  onChange={e => setLengthMarker(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Length Marker (#)
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showStats}
                  onChange={e => setShowStats(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Show Token Stats
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Token Statistics */}
        {stats && (
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Token Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.jsonTokens}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">JSON Tokens</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.toonTokens}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">TOON Tokens</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.savings}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Tokens Saved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.savingsPercent}
                  %
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Reduction</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Panels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === 'encode' ? 'JSON Input' : 'TOON Input'}
              </h3>
              <button
                onClick={() => copyToClipboard(input)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Copy
              </button>
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              className="w-full h-96 p-4 font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>

          {/* Output Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === 'encode' ? 'TOON Output' : 'JSON Output'}
              </h3>
              <button
                onClick={() => copyToClipboard(output)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                disabled={!output}
              >
                Copy
              </button>
            </div>
            {error
              ? (
                  <div className="p-4 text-red-600 dark:text-red-400 text-sm font-mono">
                    {error}
                  </div>
                )
              : (
                  <pre className="w-full h-96 p-4 font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white overflow-auto">
                    {output}
                  </pre>
                )}
          </div>
        </div>
      </div>
    </div>
  )
}
