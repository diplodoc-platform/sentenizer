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
- `jest.config.js` — Jest test configuration

## Tech Stack

This package follows the standard Diplodoc platform tech stack. See `.agents/dev-infrastructure.md` and `.agents/style-and-testing.md` in the metapackage root for detailed information.

**Package-specific details**:

- **Language**: TypeScript
- **Runtime**: Node.js >=11.5.1 (npm requirement)
- **Testing**: Jest with coverage
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
- Uses Jest with coverage reporting
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

- `spaceBothSides` — space on both sides of boundary
- `rightLacksSpacePrefix` — right chunk lacks space prefix
- `rightStartsWithLowercase` — right chunk starts with lowercase (continuation)
- `rightDelimiterPrefix` — right chunk starts with delimiter
- `rightQuotationGenericPrefix` — right chunk starts with quotation mark
- `rightQuotationClosePrefix` — right chunk starts with closing quotation
- `rightBracketsClosePrefix` — right chunk starts with closing bracket
- `rightOnlySpaces` — right chunk contains only spaces
- `leftInitials` — left chunk ends with initials (e.g., "И. В.")
- `leftAbbreviation` — left chunk ends with abbreviation
- `pairAbbreviation` — pair forms abbreviation
- `leftPairsTailAbbreviation` — left chunk ends with abbreviation tail

**Break Conditions** (chunks should be split):

- `leftEndsWithHardbreak` — left chunk ends with hard break (newline)
- `rightStartsWithHardbreak` — right chunk starts with hard break
- `rightStartsNewlineUppercased` — right chunk starts on new line with uppercase

### Constants

**Markers**:

- `SENTENCE_END_MARKERS` — sentence ending punctuation (`.`, `!`, `?`)
- `QUOTATION_GENERIC_MARKERS` — quotation marks
- `QUOTATION_CLOSE_MARKERS` — closing quotation marks
- `BRACKETS_CLOSE_MARKERS` — closing brackets

**Abbreviations**:

- `INITIALS` — initials patterns (e.g., "И. В.")
- `HEAD`, `TAIL`, `OTHER` — abbreviation parts
- `HEAD_PAIR`, `TAIL_PAIR`, `OTHER_PAIR` — abbreviation pairs

**Parameters**:

- `WINDOW_WIDTH` — number of characters to examine on each side of boundary (default: 20)

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

4. **Window-Based Processing**: Rules examine a window of characters (default 20) on each side of potential sentence boundaries. This allows context-aware decisions.

5. **Standalone Compatibility**: This package must work both in metapackage and standalone modes. Always test both scenarios.

6. **Used by Translation**: This package is critical for `@diplodoc/translation` text segmentation. Breaking changes may affect translation quality.

7. **No External NLP Libraries**: The library is self-contained and doesn't use external NLP libraries, making it lightweight and fast.
