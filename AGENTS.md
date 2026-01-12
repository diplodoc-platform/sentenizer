# AGENTS.md

This file contains instructions for AI agents working with the `@diplodoc/sentenizer` project.

## Common Rules and Standards

**Important**: This package follows common rules and standards defined in the Diplodoc metapackage. When working in metapackage mode, refer to:

- **`.agents/style-and-testing.md`** in the metapackage root for:
  - Code style guidelines
  - Commit message format (Conventional Commits)
  - Pre-commit hooks rules (**CRITICAL**: Never commit with `--no-verify`)
  - Testing standards
  - Documentation requirements
- **`.agents/core.md`** for core concepts
- **`.agents/monorepo.md`** for workspace and dependency management
- **`.agents/dev-infrastructure.md`** for build and CI/CD

**Note**: In standalone mode (when this package is used independently), these rules still apply. If you need to reference the full documentation, check the [Diplodoc metapackage repository](https://github.com/diplodoc-platform/diplodoc).

## Project Description

`@diplodoc/sentenizer` is a rule-based NLP library for sentence segmentation with **Russian language** support. It splits text into sentences using a set of rules that handle Russian-specific cases like abbreviations, initials, and punctuation.

**Key Features**:

- Rule-based sentence segmentation optimized for Russian text
- Handles Russian-specific cases: abbreviations (e.g., "и т. д."), initials (e.g., "И. В. Иванов"), quotations, brackets
- Functional programming approach using Ramda
- Used by `@diplodoc/translation` for text segmentation during translation

**Primary Use Case**: Splits Russian text into sentences for translation and text processing pipelines.

## Project Structure

### Main Directories

- `src/` — source code
  - `index.ts` — main entry point, exports `sentenize` function
  - `constants/` — constants for markers, abbreviations, parameters
    - `markers.ts` — sentence end markers, quotation markers, bracket markers
    - `abbreviations.ts` — Russian abbreviation patterns
    - `parameters.ts` — configuration parameters (e.g., WINDOW_WIDTH)
  - `parsers/` — text parsing utilities
    - `index.ts` — sentence extraction and preprocessing functions
  - `rules/` — rule-based logic for sentence segmentation
    - `base.ts` — base rules (space, delimiters, quotations, brackets)
    - `abbreviations.ts` — abbreviation-specific rules
    - `index.ts` — exports all rules
  - `lenses/` — Ramda lenses for accessing array elements
    - `index.ts` — first, second, last lenses
  - `utilities/` — utility functions
    - `string.ts` — string manipulation utilities
    - `list.ts` — list manipulation utilities
    - `index.ts` — exports utilities
- `lib/` — compiled output (generated)
- `esbuild/` — build configuration

### Configuration Files

- `package.json` — package metadata and dependencies
- `tsconfig.json` — TypeScript configuration
- `tsconfig.types.json` — TypeScript configuration for type definitions
- `vitest.config.mjs` — Vitest test configuration

## Tech Stack

This package follows the standard Diplodoc platform tech stack. See `.agents/dev-infrastructure.md` and `.agents/style-and-testing.md` in the metapackage root for detailed information.

**Package-specific details**:

- **Language**: TypeScript
- **Runtime**: Node.js >=11.5.1 (npm requirement)
- **Testing**: Vitest with coverage
- **Build**: TypeScript compiler + esbuild
- **Dependencies**:
  - `ramda` — functional programming utilities
- **Functional Style**: Uses Ramda for functional composition and data transformation

## Usage Modes

This package can be used in two different contexts:

### 1. As Part of Metapackage (Workspace Mode)

When `@diplodoc/sentenizer` is part of the Diplodoc metapackage:

- Located at `packages/sentenizer/` in the metapackage
- Linked via npm workspaces
- Dependencies are shared from metapackage root `node_modules`
- Can be developed alongside other packages
- Changes are immediately available to other packages via workspace linking

**Development in Metapackage**:

```bash
# From metapackage root
cd packages/sentenizer
npm install  # Uses workspace dependencies

# Build
npm run build

# Test
npm test
```

**Using from Other Packages in Metapackage**:

- `@diplodoc/translation` uses `sentenizer` for text segmentation
- Workspace linking ensures local version is used
- No need to publish to npm for local development

### 2. As Standalone Package (Independent Mode)

When `@diplodoc/sentenizer` is used as a standalone npm package:

- Installed via `npm install @diplodoc/sentenizer`
- Has its own `node_modules` with all dependencies
- Can be cloned and developed independently
- Must be published to npm for others to use

**Development Standalone**:

```bash
# Clone the repository
git clone git@github.com:diplodoc-platform/sentenizer.git
cd sentenizer
npm install  # Installs all dependencies locally

# Build
npm run build

# Test
npm test
```

**Using in External Projects**:

```javascript
const {sentenize} = require('@diplodoc/sentenizer');

const text = 'Он купил фрукты - яблоки, бананы, и т. д. все были очень рады угощению.';
const sentences = sentenize(text);
// ['Он купил фрукты - яблоки, бананы, и т. д. все были очень рады угощению.']
```

### Important Considerations

**Dependency Management**:

- In metapackage: May use dependencies from root `node_modules`
- Standalone: Must have all dependencies in local `node_modules`
- Both modes should work identically from user perspective

**Package Lock Management**:

- When adding/updating dependencies, use `npm i --no-workspaces --package-lock-only` to regenerate `package-lock.json` for standalone mode
- This ensures `package-lock.json` is valid when package is used outside workspace
- Always regenerate after dependency changes to maintain standalone compatibility

**Testing**:

- Test setup works in both modes
- Uses Vitest with coverage reporting
- When testing, ensure dependencies are properly resolved
- Consider testing both modes if making significant changes

## Architecture

### Core Function: `sentenize`

The main entry point is the `sentenize` function:

```typescript
sentenize :: string -> string[]
```

**How it works**:

1. Splits text by double newlines (paragraph boundaries)
2. For each part, extracts potential sentence boundaries using regex
3. Processes sentence chunks in pairs (left, right)
4. Applies rules to determine if chunks should be joined or split:
   - **Join conditions**: abbreviations, initials, quotations, brackets, lowercase continuation
   - **Break conditions**: hard breaks (newlines), uppercase start after sentence end
5. Returns array of segmented sentences

### Rule-Based System

The segmentation uses a rule-based approach with two types of conditions:

**Join Conditions** (chunks should be merged):

Join conditions are exported from `src/rules/base.ts` and `src/rules/abbreviations.ts`. To find all currently used join conditions:

1. **Check `src/index.ts`** — the `joinCondition` array (lines ~28-41) lists all active join conditions imported from rules
2. **Source files**:
   - `src/rules/base.ts` — base join conditions using the `rule()` helper (e.g., `spaceBothSides`, `rightStartsWithLowercase`, `rightQuotationGenericPrefix`)
   - `src/rules/abbreviations.ts` — abbreviation-related join conditions (e.g., `leftAbbreviation`, `pairAbbreviation`, `leftPairsTailAbbreviation`)
3. **Naming patterns**:
   - `right*` — conditions checking the right chunk
   - `left*` — conditions checking the left chunk
   - `*Abbreviation*` — abbreviation-related conditions
   - `*Initials*` — initials-related conditions

**To add a new join condition**: Create a function in `src/rules/base.ts` or `src/rules/abbreviations.ts` using the `rule()` helper, then add it to the `joinCondition` array in `src/index.ts`.

**Break Conditions** (chunks should be split):

Break conditions are exported from `src/rules/base.ts`. To find all currently used break conditions:

1. **Check `src/index.ts`** — the `breakCondition` array (lines ~43-47) lists all active break conditions imported from rules
2. **Source file**: `src/rules/base.ts` — all break conditions are defined here
3. **Naming patterns**: Functions with names containing `Hardbreak` or `Uppercased` (e.g., `leftEndsWithHardbreak`, `rightStartsWithHardbreak`, `rightStartsNewlineUppercased`)

**Important**: Break conditions are the only conditions that force a split (all other conditions are join conditions). They are evaluated first in the rule evaluation order (see `src/index.ts` line 69: `if (!breaks([left, right]) && join([left, right]))`).

**To add a new break condition**: Create a function in `src/rules/base.ts` using the `rule()` helper, then add it to the `breakCondition` array in `src/index.ts`.

### Constants

Constants are organized by category in `src/constants/`:

**Markers** (`src/constants/markers.ts`):

Contains string constants for punctuation and markers:

- `SENTENCE_END_MARKERS` — sentence ending punctuation
- `QUOTATION_GENERIC_MARKERS` — quotation marks
- `QUOTATION_CLOSE_MARKERS` — closing quotation marks
- `BRACKETS_CLOSE_MARKERS` — closing brackets

To see current values, check `src/constants/markers.ts`. These are used by parsers in `src/parsers/` to identify sentence boundaries and punctuation.

**Abbreviations** (`src/constants/abbreviations.ts`):

Contains maps (`StrBoolMap`) for Russian abbreviations organized by category:

- `INITIALS` — initials patterns (e.g., "И. В.", "Дж.")
- `HEAD`, `TAIL`, `OTHER` — single-word abbreviations (head = start, tail = end, other = standalone)
- `HEAD_PAIR`, `TAIL_PAIR`, `OTHER_PAIR` — two-word abbreviation pairs (e.g., "т.е.", "и т.д.")

To see all abbreviations or add new ones, check `src/constants/abbreviations.ts`. Each map is a `StrBoolMap` where keys are lowercase abbreviation patterns and values are `true`.

**Parameters** (`src/constants/parameters.ts`):

Contains configuration parameters:

- `WINDOW_WIDTH` — number of characters to examine on each side of boundary

To see current parameter values, check `src/constants/parameters.ts`. These control algorithm behavior and can be adjusted for performance/accuracy trade-offs.

### Functional Programming

The package uses Ramda for functional programming:

- **Composition**: `compose` for function composition
- **Lenses**: `lensIndex` for accessing array elements
- **Predicates**: `anyPass`, `allPass` for rule evaluation
- **Transformation**: `filter`, `map`, `split` for data processing

## Development

### Building

```bash
npm run build
```

Builds TypeScript source to `lib/` directory:

- TypeScript compiler generates type definitions (`.d.ts` files)
- esbuild bundles JavaScript code

### Testing

```bash
npm test          # Run tests with coverage
npm run test:watch  # Watch mode
```

Tests are located alongside source files (`.spec.ts` files) using Vitest.

### Linting

```bash
npm run lint      # Check code style
npm run lint:fix  # Fix auto-fixable issues
```

Uses `@diplodoc/lint` for ESLint, Prettier, and Stylelint.

### Type Checking

```bash
npm run typecheck  # TypeScript type checking
```

## Integration

### Used By

- **`@diplodoc/translation`** — uses `sentenize` for splitting text into sentences during translation

### Dependencies

- **`ramda`** — functional programming library

## Important Notes

1. **Russian Language Focus**: This library is optimized for Russian text. Rules handle Russian-specific cases like abbreviations ("и т. д.", "т. п."), initials ("И. В. Иванов"), and punctuation.

2. **Rule-Based Approach**: Segmentation uses rule-based logic rather than machine learning. Rules are hand-crafted to handle edge cases in Russian text.

3. **Functional Style**: The codebase uses Ramda for functional programming. Understanding Ramda's API (compose, lens, predicates) is helpful when modifying code.

4. **Window-Based Processing**: Rules examine a window of characters on each side of potential sentence boundaries. The actual window size is defined in `src/index.ts` (see `leftPreprocessor` and `rightPreprocessor`). This allows context-aware decisions.

5. **Standalone Compatibility**: This package must work both in metapackage and standalone modes. Always test both scenarios.

6. **Used by Translation**: This package is critical for `@diplodoc/translation` text segmentation. Breaking changes may affect translation quality.

7. **No External NLP Libraries**: The library is self-contained and doesn't use external NLP libraries, making it lightweight and fast.

## Algorithm Details

### Processing Flow

1. **Paragraph Splitting**: Text is first split by double newlines (`\n\n+`) to separate paragraphs
2. **Naive Sentence Extraction**: Each paragraph is split by sentence end markers (`.`, `!`, `?`, `…`) using regex
3. **Window-Based Processing**: For each potential sentence boundary, a window of characters is examined on both sides. The window size is defined in `src/index.ts` where `leftPreprocessor` and `rightPreprocessor` are created. Check these lines to see the actual values used. Note: `WINDOW_WIDTH` constant in `src/constants/parameters.ts` is the default parameter for `fstChars`/`lstChars` functions, but the actual preprocessing may use a different value.
4. **Rule Evaluation**: Rules are applied to determine if chunks should be joined or split:
   - Rules are evaluated in order: break conditions first, then join conditions
   - If a break condition matches, chunks are split
   - If no break condition matches and a join condition matches, chunks are joined
5. **Result Assembly**: Processed chunks are collected into final sentence array

### Rule Evaluation Order

Rules are evaluated using Ramda's `anyPass` and `allPass`:

- **Break conditions** are checked first (using `anyPass` - if any matches, break)
- **Join conditions** are checked if no break condition matches (using `anyPass` - if any matches, join)
- If neither break nor join conditions match, chunks are split (default behavior)

### Window-Based Context

The window size limits the context examined for each rule. To find the actual window size:

1. **Check `src/index.ts`** — lines 23-24 define `leftPreprocessor` and `rightPreprocessor` using `lstChars()` and `fstChars()` with specific width values
2. **Default parameter**: `WINDOW_WIDTH` constant in `src/constants/parameters.ts` is the default parameter for `fstChars`/`lstChars` functions, but the actual preprocessing may use a different value
3. **Functions**: `fstChars(width)` and `lstChars(width)` in `src/parsers/index.ts` extract the first/last N characters from chunks

The window size balances accuracy with performance. Rules use these windows via the preprocessor functions defined in `src/index.ts`.

## Debugging

### Debug Mode

Rules support debug logging via `DEBUG` environment variable:

```bash
DEBUG=1 npm test
```

When `DEBUG=1`, each rule evaluation logs:

- Rule name
- Input arguments (left and right chunks)
- Evaluation result (true/false)

This helps understand why sentences are joined or split.

### Playground

The `src/playground.ts` file provides a simple way to test segmentation:

```typescript
import {sentenize} from './index';

const text = 'Your test text here...';
const sentences = sentenize(text);
console.log(sentences);
```

Run with:

```bash
npx ts-node src/playground.ts
```

## Adding New Abbreviations

To add new Russian abbreviations:

1. **Open `src/constants/abbreviations.ts`** and identify the appropriate category:
   - `INITIALS` — initials like "И. В.", "Дж."
   - `HEAD` — abbreviation at start of compound word (e.g., "ст." for "ст.-слав.")
   - `TAIL` — abbreviation at end (e.g., "тыс." for "тысяч")
   - `OTHER` — standalone abbreviations (e.g., "сокр." for "сокращение")
   - `HEAD_PAIR`, `TAIL_PAIR`, `OTHER_PAIR` — two-word abbreviation pairs (e.g., "т.е." for "то есть", "и т.д." for "и так далее")

2. **Add the abbreviation** to the appropriate map:
   - Use lowercase key (abbreviations are normalized to lowercase during matching)
   - Set value to `true`
   - For pair abbreviations, use dot-separated format (e.g., `'т.е': true`)

3. **Test thoroughly**:
   - Add test cases in appropriate `.spec.ts` file (check existing test files for patterns)
   - Test with various contexts (before/after punctuation, with spaces, at sentence boundaries)
   - Verify it doesn't break existing cases
   - Consider edge cases: abbreviations in quotes, brackets, with different punctuation

**Note**: The abbreviation matching logic is in `src/rules/abbreviations.ts`. If you need to understand how abbreviations are detected, check:

- `leftAbbreviation` — checks if left chunk ends with abbreviation
- `pairAbbreviation` — checks if pair forms abbreviation
- `leftPairsTailAbbreviation` — checks if split occurs at tail of pair abbreviation

## Testing Guidelines

### Writing Tests

Tests are located alongside source files (`.spec.ts` files):

```typescript
import {describe, expect, it} from 'vitest';
import {sentenize} from './';

describe('sentenize', () => {
  it('should handle your case', () => {
    const input = 'Test text.';
    const expected = ['Test text.'];
    expect(sentenize(input)).toStrictEqual(expected);
  });
});
```

### Test Coverage

Aim for high test coverage, especially for:

- Rule logic (join/break conditions)
- Edge cases (abbreviations, initials, punctuation)
- Boundary conditions (empty text, single sentence, multiple paragraphs)

### Running Tests

```bash
npm test              # Run all tests with coverage
npm run test:watch    # Watch mode for development
```

## Performance Considerations

1. **Window Size**: The window size (defined in `src/index.ts` for preprocessing) limits context examination, keeping performance reasonable. Check `leftPreprocessor` and `rightPreprocessor` in `src/index.ts` to see the actual value used.
2. **Regex Patterns**: Patterns are compiled once and reused
3. **Functional Composition**: Ramda's composition is efficient but can create deep call stacks
4. **Text Length**: No hard limits, but very long texts may be slower. Performance depends on text length and number of sentence boundaries.
5. **Memory**: Each sentence chunk is stored in memory during processing

## Known Limitations

1. **Language-Specific**: Optimized for Russian text. May not work well for other languages
2. **Rule-Based**: Hand-crafted rules may miss edge cases that ML approaches would handle
3. **Context Window**: Limited window size (check `src/index.ts` for actual value) on each side - may miss long-distance dependencies
4. **No Learning**: Rules are static - cannot adapt to new patterns automatically
5. **Abbreviation Coverage**: Abbreviation list may be incomplete for specialized domains

## Integration Details

### Usage in Translation Package

`@diplodoc/translation` uses `sentenize` for text segmentation. To find all usage locations:

1. **Search the translation package** for imports of `@diplodoc/sentenizer` or `sentenize`
2. **Check for files** that import or use the `sentenize` function
3. **Common locations** may include:
   - Experimental utilities (e.g., `src/experiment/utils/segmentation.ts`)
   - Main translation consumers (e.g., `src/consumer/split.ts`)

The segmentation is critical for translation quality, as incorrect sentence boundaries can lead to:

- Incorrect translation context
- Broken sentence structure
- Loss of meaning

**Important**: Changes to `sentenize` behavior may affect translation output. Always test with translation package when making significant changes. To verify current usage, search the translation package codebase for `sentenize` imports.
