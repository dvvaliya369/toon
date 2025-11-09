# TOON Playground Quick Start Guide

## Getting Started

The TOON Playground is an interactive web application for testing and exploring the Token-Oriented Object Notation (TOON) format.

## Running Locally

### Prerequisites
- Node.js 18 or higher
- pnpm package manager

### Installation & Launch

```bash
# Clone the repository
git clone https://github.com/toon-format/toon.git
cd toon

# Install dependencies
pnpm install

# Build packages
pnpm build

# Start the playground
pnpm playground
```

The playground will open at `http://localhost:3000`

## Using the Playground

### 1. Choose Your Mode

Click the **Mode** button to toggle between:
- **JSON → TOON**: Convert JSON to TOON format
- **TOON → JSON**: Convert TOON back to JSON

### 2. Select an Example

Use the **Examples** dropdown to load pre-configured datasets:
- Simple Users
- E-commerce Orders
- Time-series Data
- Nested Objects
- Mixed Array
- Employee Records
- GitHub Repositories
- Product Inventory

### 3. Adjust Encoding Options

**Delimiter** (JSON → TOON mode only):
- Comma (`,`) - Default, most readable
- Tab (`\t`) - More token-efficient
- Pipe (`|`) - Alternative separator

**Indent**:
- Adjust the slider to change indentation (2-8 spaces)
- Default: 2 spaces

**Length Marker**:
- Check to add `#` prefix to array lengths
- Example: `users[#2]` instead of `users[2]`

**Show Token Stats**:
- Check to display token comparison metrics
- Shows JSON tokens, TOON tokens, savings, and percentage reduction

### 4. Edit Your Data

Type or paste your data in the input panel:
- **JSON Input**: When in JSON → TOON mode
- **TOON Input**: When in TOON → JSON mode

The output updates automatically as you type!

### 5. View Results

The output panel shows:
- Converted format (TOON or JSON)
- Error messages if input is invalid
- Syntax-highlighted output

### 6. Copy Results

Click the **Copy** button in either panel to copy the content to your clipboard.

## Understanding Token Statistics

When enabled, the Token Statistics panel shows:

- **JSON Tokens**: Number of tokens in the JSON representation
- **TOON Tokens**: Number of tokens in the TOON representation
- **Tokens Saved**: Difference between JSON and TOON
- **Reduction**: Percentage of tokens saved

Token counts use the GPT-5 `o200k_base` tokenizer for accuracy.

## Tips & Tricks

### Best Practices

1. **Start with Examples**: Load an example to understand the format
2. **Use Tab Delimiter**: For maximum token efficiency
3. **Enable Length Markers**: Helps LLMs validate array lengths
4. **Check Token Stats**: See real-time savings

### Common Use Cases

**Testing Your Data**:
1. Paste your JSON in the input panel
2. Adjust encoding options
3. Copy the TOON output for use in LLM prompts

**Learning TOON**:
1. Select different examples
2. Toggle between modes to see both representations
3. Experiment with encoding options

**Comparing Formats**:
1. Enable token statistics
2. Try different delimiters
3. Compare token savings

## Keyboard Shortcuts

- `Ctrl/Cmd + A`: Select all in active panel
- `Ctrl/Cmd + C`: Copy selected text
- `Ctrl/Cmd + V`: Paste into active panel

## Troubleshooting

### Invalid JSON Error
- Check for missing commas, brackets, or quotes
- Use a JSON validator to verify your input
- Try one of the examples to see correct format

### Invalid TOON Error
- Verify array length markers match actual count
- Check delimiter consistency
- Ensure proper indentation

### Output Not Updating
- Check for syntax errors in input
- Refresh the page if needed
- Clear browser cache

## Examples Explained

### Simple Users
Basic tabular data - perfect for understanding TOON's efficiency with uniform arrays.

### E-commerce Orders
Demonstrates TOON with multiple fields and realistic data.

### Time-series Data
Shows how TOON handles numeric data and dates.

### Nested Objects
Illustrates TOON's indentation-based structure for nested data.

### Mixed Array
Combines tabular arrays with primitive arrays.

### Employee Records
Larger dataset with boolean values and multiple data types.

### GitHub Repositories
Real-world data from GitHub's API.

### Product Inventory
E-commerce product data with categories and pricing.

## Next Steps

- Read the [Full Specification](https://github.com/toon-format/spec/blob/main/SPEC.md)
- Check out the [Main README](../../README.md)
- Explore [Other Implementations](../../README.md#other-implementations)
- Try the [CLI Tool](../cli/README.md)

## Support

- **Issues**: [GitHub Issues](https://github.com/toon-format/toon/issues)
- **Documentation**: [toonformat.dev](https://toonformat.dev)
- **Specification**: [TOON Spec](https://github.com/toon-format/spec)

## Contributing

Found a bug or have a feature request? Please open an issue on GitHub!

---

Happy testing! 🎮
