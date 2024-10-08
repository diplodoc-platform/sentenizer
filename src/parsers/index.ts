import {compose, defaultTo, filter, match, replace, split, view} from 'ramda';

import {
    BRACKETS_CLOSE_MARKERS,
    QUOTATION_CLOSE_MARKERS,
    QUOTATION_GENERIC_MARKERS,
    SENTENCE_END_MARKERS,
    WINDOW_WIDTH,
} from '../constants';
import {first, second} from '../lenses';

// unwrap first element of the string array
const firstString = first<string>();
const fst = compose(defaultTo(''), view(firstString));

// unwrap second element of the string array
const secondString = second<string>();
const snd = compose(defaultTo(''), view(secondString));

// extract sentences naively splitting by delimiters
const sentencePattern = `([^${SENTENCE_END_MARKERS}]*?[${SENTENCE_END_MARKERS}]+)`;
const senteceFlags = 'gmu';
const sentenceRegExp = new RegExp(sentencePattern, senteceFlags);

const sentences = compose(filter(Boolean), split(sentenceRegExp));

// extract trailling delimiters from sentence
const sentenceDelimitersPattern = `([${SENTENCE_END_MARKERS}]+)$`;
const sentenceDelimitersFlags = 'gmu';
const sentenceDelimitersRegExp = new RegExp(sentenceDelimitersPattern, sentenceDelimitersFlags);

// extract words, excluding trailling delimiters
const words = compose(defaultTo(''), replace(sentenceDelimitersRegExp)(''));

// extract trailling delimiters
const delimiters = compose(defaultTo(''), fst, match(sentenceDelimitersRegExp));

// first token from sentence
const fstTokenPattern = /^\s*([^\s]+?)(?=\s|$)/;
const fstTokenFlags = 'mu';
const fstTokenRegExp = new RegExp(fstTokenPattern, fstTokenFlags);

const fstToken = compose(defaultTo(''), snd, match(fstTokenRegExp));

// extract first word in the begining, excluding trailling delimiters
const fstWord = compose(fstToken, words);

// extract last token from sentence
const lstTokenPattern = /([^\s]+)\s*$/;
const lstTokenFlags = 'mu';
const lstTokenRegExp = new RegExp(lstTokenPattern, lstTokenFlags);

const lstToken = compose(defaultTo(''), snd, match(lstTokenRegExp));

const nonAlphaStartPattern = /^[^\wа-яА-Я]*/;
const nonAlphaStartFlags = 'gmu';
const nonAlphaStartRegExp = new RegExp(nonAlphaStartPattern, nonAlphaStartFlags);

const omitNonAlphaStart = replace(nonAlphaStartRegExp, '');

const lstWord = compose(lstToken, words);

// extract first WINDOW_WIDTH characters
const fstChars = (width = WINDOW_WIDTH) => {
    const fstCharsPattern = `^[\\s\\S]{0,${width}}`;
    const fstCharsFlags = 'gmu';
    const fstCharsRegExp = new RegExp(fstCharsPattern, fstCharsFlags);

    return compose(defaultTo(''), fst, match(fstCharsRegExp));
};

// extract last width (default WINDOW_WIDTH) characters
const lstChars = (width = WINDOW_WIDTH) => {
    const lstCharsPattern = `.{0,${width}}$`;
    const lstCharsFlags = 'gmu';
    const lstCharsRegExp = new RegExp(lstCharsPattern, lstCharsFlags);

    return compose(defaultTo(''), fst, match(lstCharsRegExp));
};

const spacePrefix = compose(defaultTo(''), fst, match(/^\s/));

const spaceSuffix = compose(defaultTo(''), fst, match(/\s$/));

// extract generic quote in the begining of the text
const quotationGenericPrefixPattern = `^([${QUOTATION_GENERIC_MARKERS}]+)`;
const quotationGenericPrefixFlags = 'mu';
const quotationGenericPrefixRegExp = new RegExp(
    quotationGenericPrefixPattern,
    quotationGenericPrefixFlags,
);

const quotationGenericPrefix = compose(defaultTo(''), snd, match(quotationGenericPrefixRegExp));

// extract close quote in the begining of the text
const quotationClosePrefixPattern = `^([${QUOTATION_CLOSE_MARKERS}]+)`;
const quotationClosePrefixFlags = 'mu';
const quotationClosePrefixRegExp = new RegExp(
    quotationClosePrefixPattern,
    quotationClosePrefixFlags,
);

const quotationClosePrefix = compose(defaultTo(''), snd, match(quotationClosePrefixRegExp));

// extract delimiter in the begining of the text
const delimiterPrefixPattern = `^([${SENTENCE_END_MARKERS}]+)`;
const delimiterPrefixFlags = 'mu';
const delimiterPrefixRegExp = new RegExp(delimiterPrefixPattern, delimiterPrefixFlags);

const delimiterPrefix = compose(defaultTo(''), snd, match(delimiterPrefixRegExp));

// extract close bracket in the beging of the text
const bracketsClosePrefixPattern = `^([${BRACKETS_CLOSE_MARKERS}]+)`;
const bracketsClosePrefixFlags = 'mu';
const bracketsClosePrefixRegExp = new RegExp(bracketsClosePrefixPattern, bracketsClosePrefixFlags);

const bracketsClosePrefix = compose(defaultTo(''), snd, match(bracketsClosePrefixRegExp));

// extract line consisting solely of spaces
const spacesPattern = /^(\s+)$/;
const spacesFlags = 'gmu';
const spacesRegExp = new RegExp(spacesPattern, spacesFlags);

const spaces = compose(defaultTo(''), fst, match(spacesRegExp));

// extract dot in the end of the line
const dotSuffixPattern = /[^.](\.)$/;
const dotSuffixFlags = 'mu';
const dotSuffixRegExp = new RegExp(dotSuffixPattern, dotSuffixFlags);

const dotSuffix = compose(defaultTo(''), snd, match(dotSuffixRegExp));

export {
    sentences,
    words,
    delimiters,
    fst,
    snd,
    fstToken,
    fstWord,
    lstToken,
    lstWord,
    omitNonAlphaStart,
    fstChars,
    lstChars,
    spacePrefix,
    spaceSuffix,
    quotationGenericPrefix,
    quotationClosePrefix,
    bracketsClosePrefix,
    delimiterPrefix,
    spaces,
    dotSuffix,
};
