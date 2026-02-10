[![NPM version](https://img.shields.io/npm/v/@diplodoc/sentenizer.svg?style=flat)](https://www.npmjs.org/package/@diplodoc/sentenizer)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=diplodoc-platform_sentenizer&metric=alert_status)](https://sonarcloud.io/summary/overall?id=diplodoc-platform_sentenizer)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=diplodoc-platform_sentenizer&metric=coverage)](https://sonarcloud.io/summary/overall?id=diplodoc-platform_sentenizer)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=diplodoc-platform_sentenizer&metric=sqale_rating)](https://sonarcloud.io/summary/overall?id=diplodoc-platform_sentenizer)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=diplodoc-platform_sentenizer&metric=reliability_rating)](https://sonarcloud.io/summary/overall?id=diplodoc-platform_sentenizer)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=diplodoc-platform_sentenizer&metric=security_rating)](https://sonarcloud.io/summary/overall?id=diplodoc-platform_sentenizer)

# @diplodoc/sentenizer

Rule-based NLP library for sentence segmentation with **Russian language** support. Splits text into sentences using hand-crafted rules that handle Russian-specific cases like abbreviations, initials, and punctuation.

## Features

- **Rule-based segmentation** — Hand-crafted rules optimized for Russian text
- **Russian-specific handling** — Correctly handles abbreviations (e.g., "и т. д.", "т. п."), initials (e.g., "И. В. Иванов"), quotations, and brackets
- **Functional programming** — Uses Ramda for clean, composable code
- **High accuracy** — Tested on various Russian text samples
- **Lightweight** — No external NLP libraries, fast and self-contained

## Installation

```bash
npm install @diplodoc/sentenizer
```

## Usage

### Basic Example

```javascript
const {sentenize} = require('@diplodoc/sentenizer');

const text = 'Он купил фрукты - яблоки, бананы, и т. д. все были очень рады угощению. Вот такой он добродушный наш родственник И. В. Иванов.';

const sentences = sentenize(text);
// sentences:
// [
//  'Он купил фрукты - яблоки, бананы, и т. д. все были очень рады угощению.',
//  'Вот такой он добродушный наш родственник И. В. Иванов.'
// ]
```

### ES Modules

```javascript
import {sentenize} from '@diplodoc/sentenizer';

const sentences = sentenize('Первое предложение. Второе предложение!');
// ['Первое предложение.', ' Второе предложение!']
```

## API

### `sentenize(text: string): string[]`

Splits text into sentences.

**Parameters:**
- `text` (string) — Text to segment

**Returns:**
- `string[]` — Array of segmented sentences

**Type signature:**
```
sentenize :: string -> string[]
```

## How It Works

The library uses a rule-based approach with two types of conditions:

**Join Conditions** (chunks should be merged):
- Abbreviations (e.g., "и т. д.", "т. п.")
- Initials (e.g., "И. В. Иванов")
- Quotations and brackets
- Lowercase continuation
- Delimiters and spaces

**Break Conditions** (chunks should be split):
- Hard breaks (double newlines)
- Uppercase start after sentence end

## Integration

This package is used by `@diplodoc/translation` for text segmentation during translation.

## Development

See [AGENTS.md](./AGENTS.md) for detailed development guidelines.

## License

MIT
