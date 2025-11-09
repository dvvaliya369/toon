# TOON Playground

Interactive web-based playground for testing and exploring the Token-Oriented Object Notation (TOON) format.

## Features

- **Bidirectional Conversion**: Convert between JSON and TOON formats in real-time
- **Live Editing**: See results as you type
- **Encoding Options**:
  - Choose delimiter (comma, tab, or pipe)
  - Adjust indentation (2-8 spaces)
  - Toggle length markers
- **Token Statistics**: Compare token usage between JSON and TOON
- **Example Datasets**: Pre-loaded examples to quickly test different data structures
- **Copy to Clipboard**: Easy copying of input and output
- **Dark Mode**: Automatic dark mode support

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Deployment

This playground is built with Next.js and can be deployed to Vercel, Netlify, or any platform that supports Next.js applications.

### Deploy to Vercel

```bash
vercel
```

## Usage

1. **Select Mode**: Choose between JSON → TOON or TOON → JSON conversion
2. **Choose Example**: Select from pre-loaded examples or paste your own data
3. **Adjust Options**: Configure delimiter, indentation, and other encoding options
4. **View Results**: See the converted output and token statistics in real-time
5. **Copy Output**: Click the copy button to copy the result to your clipboard

## Learn More

- [TOON Format Specification](https://github.com/toon-format/spec)
- [TOON JavaScript Implementation](https://github.com/toon-format/toon)
- [TOON Documentation](https://toonformat.dev)
