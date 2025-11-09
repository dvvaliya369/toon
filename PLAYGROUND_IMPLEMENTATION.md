# TOON Playground Implementation

## Overview

This document describes the implementation of the online playground for the TOON (Token-Oriented Object Notation) format, addressing GitHub Issue #32.

## What Was Built

A fully-featured, interactive web-based playground that allows users to quickly test and explore the TOON format without any installation.

### Location

- **Package**: `packages/playground`
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **Dependencies**: `@toon-format/toon`, `gpt-tokenizer`

## Features Implemented

### 1. Bidirectional Conversion
- **JSON → TOON**: Convert JSON input to TOON format
- **TOON → JSON**: Convert TOON format back to JSON
- **Mode Toggle**: Easy switching between conversion modes with automatic input/output swapping

### 2. Live Editing
- Real-time conversion as you type
- Instant feedback on syntax errors
- No manual refresh needed

### 3. Encoding Options
- **Delimiter Selection**: Choose between comma (`,`), tab (`\t`), or pipe (`|`)
- **Indent Control**: Adjustable indentation from 2 to 8 spaces via slider
- **Length Marker**: Toggle `#` prefix for array lengths (e.g., `[#2]` vs `[2]`)
- **Token Statistics**: Optional display of token comparison metrics

### 4. Token Statistics
When enabled, displays:
- JSON token count
- TOON token count
- Tokens saved
- Percentage reduction

Uses the GPT-5 `o200k_base` tokenizer via `gpt-tokenizer` library for accurate measurements.

### 5. Example Datasets
Pre-loaded examples for quick testing:
1. Simple Users
2. E-commerce Orders
3. Time-series Data
4. Nested Objects
5. Mixed Array
6. Employee Records
7. GitHub Repositories
8. Product Inventory

### 6. User Experience
- **Copy to Clipboard**: One-click copying for both input and output
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Automatic dark mode support based on system preferences
- **Clean UI**: Modern, minimalist interface with clear visual hierarchy
- **Error Handling**: Clear error messages for invalid input

## Technical Architecture

### File Structure

```
packages/playground/
├── app/
│   ├── globals.css          # Tailwind CSS styles
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main page (renders Playground component)
├── components/
│   └── Playground.tsx       # Main playground component
├── lib/
│   └── examples.ts          # Example datasets
├── public/                  # Static assets
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Package dependencies
├── README.md                # Playground documentation
├── DEPLOYMENT.md            # Deployment guide
└── .gitignore              # Git ignore rules
```

### Key Components

#### Playground Component (`components/Playground.tsx`)
- Main interactive component
- Manages state for mode, input, output, and options
- Handles encoding/decoding with error handling
- Calculates token statistics
- Provides UI for all controls and panels

#### Examples Library (`lib/examples.ts`)
- Contains 8 pre-configured example datasets
- Each example includes both JSON and TOON representations
- Covers various data structures (uniform, nested, mixed)

### State Management
Uses React hooks for state management:
- `useState` for mode, input, output, options, and errors
- `useEffect` for automatic conversion on input/option changes
- `useMemo` for optimized token statistics calculation

## Integration with Monorepo

### Package Scripts
Added to root `package.json`:
```json
{
  "playground": "pnpm --filter @toon-format/playground dev",
  "playground:build": "pnpm --filter @toon-format/playground build"
}
```

### Build Process
1. Builds `@toon-format/toon` package first
2. Builds playground with workspace dependency
3. Transpiles `@toon-format/toon` for Next.js compatibility

### Running Locally

```bash
# From monorepo root
pnpm install
pnpm build
pnpm playground

# Direct access
cd packages/playground
pnpm dev
```

## Deployment

### Vercel (Recommended)
- Zero-configuration deployment
- Automatic builds on git push
- Edge network for global performance
- See `DEPLOYMENT.md` for detailed instructions

### Other Platforms
- Netlify
- Docker
- Static export for GitHub Pages
- Any Node.js hosting platform

## Testing Results

### Browser Testing
✅ All features tested and working:
- JSON to TOON conversion
- TOON to JSON conversion
- Mode toggle functionality
- Length marker option
- Token statistics display
- Example selection
- Copy to clipboard
- Responsive layout
- Dark mode support

### Build Testing
✅ Production build successful:
- No TypeScript errors
- No linting errors
- Optimized bundle size
- Static page generation working

## Performance

### Bundle Size
- First Load JS: ~547 KB (includes React, Next.js, and dependencies)
- Page-specific: ~445 KB
- Shared chunks: ~102 KB

### Optimizations
- Code splitting for optimal loading
- Server-side rendering for initial page
- Automatic static optimization
- Tailwind CSS purging for minimal CSS

## Future Enhancements

Potential improvements for future versions:
1. **Syntax Highlighting**: Add Monaco Editor or CodeMirror for better code editing
2. **Share Links**: Generate shareable URLs with encoded data
3. **Download Files**: Export JSON/TOON as downloadable files
4. **Format Validation**: More detailed validation messages
5. **Diff View**: Show differences between JSON and TOON side-by-side
6. **Custom Examples**: Allow users to save their own examples
7. **API Integration**: Provide API endpoint for programmatic conversion
8. **Keyboard Shortcuts**: Add shortcuts for common actions
9. **Theme Customization**: Allow users to choose color themes
10. **Multi-file Support**: Handle multiple files at once

## Documentation Updates

### README.md
Added playground section with:
- Link to playground (placeholder for hosted version)
- Feature list
- Quick description

### New Documentation Files
1. `packages/playground/README.md` - Playground-specific documentation
2. `packages/playground/DEPLOYMENT.md` - Comprehensive deployment guide
3. `PLAYGROUND_IMPLEMENTATION.md` - This implementation summary

## Conclusion

The TOON Playground successfully addresses GitHub Issue #32 by providing a fully-featured, user-friendly online tool for testing the TOON format. It offers:

- ✅ Quick testing without installation
- ✅ Bidirectional conversion
- ✅ Real-time feedback
- ✅ Token comparison
- ✅ Multiple examples
- ✅ Production-ready deployment
- ✅ Comprehensive documentation

The playground is ready for deployment and will significantly improve the developer experience for users exploring the TOON format.
