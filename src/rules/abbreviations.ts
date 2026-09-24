import type {Pred} from 'ramda';

import {
    __,
    allPass,
    anyPass,
    call,
    compose,
    defaultTo,
    join,
    length,
    lt,
    not,
    or,
    prop,
    toLower,
    view,
    zipWith,
} from 'ramda';

import {
    HEAD,
    HEAD_PAIR,
    INITIALS,
    OTHER,
    OTHER_PAIR,
    SOFT_TAIL,
    TAIL,
    TAIL_PAIR,
} from 'src/constants';

import {isUpper, lengthNonZero, startsWithLower} from '../utilities';
import {
    dotSuffix,
    fstToken,
    fstWord,
    lstToken,
    lstWord,
    omitNonAlphaStart,
    words,
} from '../parsers';
import {first, second} from '../lenses';

const fst = compose(defaultTo(''), view(first<string>()));
const snd = compose(defaultTo(''), view(second<string>()));

// ends in a dot
const isDotDelimiter = compose(lengthNonZero, dotSuffix);

// sides tuple into map key
const hash = compose(toLower, join('.'));

// pair abbreviations join
const insidePairAbbreviationMap = anyPass([
    prop(__, HEAD_PAIR) as Pred,
    prop(__, TAIL_PAIR) as Pred,
    prop(__, OTHER_PAIR) as Pred,
]);

// abbreviation pair test
const isPairAbbreviation = compose(
    insidePairAbbreviationMap,
    hash,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    zipWith<any, any, any>(call, [
        compose(omitNonAlphaStart, lstWord, lstToken),
        compose(fstWord, fstToken),
    ]),
);

// pair abbreviation conditions:
//     * separated by dot
//     * hashed words from adjacent sides are known abbreviation pairs
export const pairAbbreviation = allPass([
    compose(isDotDelimiter, lstToken, fst),
    isPairAbbreviation as Pred,
]);

// tail abbreviation join
const insideAbbreviationMap = anyPass([
    // @ts-ignore
    prop(__, INITIALS),
    // @ts-ignore
    prop(__, HEAD),
    // @ts-ignore
    prop(__, TAIL),
    // @ts-ignore
    prop(__, OTHER),
]);

// tail abbreviation test
const isLeftAbbreviation = compose(
    insideAbbreviationMap,
    omitNonAlphaStart,
    toLower,
    lstWord,
    lstToken,
);

const isCaps = allPass([isUpper, compose(lt(1), length)]);

// latin letters only: capitals like ИМ. or Г. are cyrillic abbreviations
// written in upper case (улица ИМ. Ленина), latin ones are acronyms
const isLatin = (word: string) => /^[A-Za-z]+$/.test(word);

// an acronym written in latin capitals, like MR or DR, followed by a
// sentence in regular case is not the abbreviation it happens to spell
// (mr., dr.); in text written in capitals throughout it still is
const isLeftAcronym = allPass([
    compose(allPass([isCaps, isLatin]) as Pred, omitNonAlphaStart, lstWord, lstToken, fst),
    compose(not, isCaps, fstWord, snd) as Pred,
]);

// left abbreviation conditions:
//     * delimiter is dot
//     * lefts side right most word is known abbreviation
//     * and is not an acronym in capitals
export const leftAbbreviation = allPass([
    compose(allPass([compose(isDotDelimiter, lstToken), isLeftAbbreviation]), fst),
    compose(not, isLeftAcronym) as Pred,
]);

// right join condition is to be uppercase or lowercase word
const rightLowercaseOrCaps = compose(anyPass([startsWithLower, isCaps]), fstWord, snd);

// portion of the source <s> before target <t>
const before = (s: string) => (t: string) => s.slice(0, Math.max(s.lastIndexOf(t), 0));

// does left contain pair abbreviation
const isLeftPairsTail = (left: string) => {
    const rest = before(left);

    const head = compose(words, lstWord, rest, lstWord, lstToken);

    return or(
        isPairAbbreviation([head(left), lstWord(left)]),
        isPairAbbreviation(lstWord(left).split('.')),
    );
};

// conditions:
//     * delimiter is dot
//     * we split at the tail of the pair abbreviation
//     * right word starts with lowercase or entirely in uppercase
export const leftPairsTailAbbreviation = allPass([
    compose(isDotDelimiter, lstToken, fst),
    compose(isLeftPairsTail, fst) as Pred,
    rightLowercaseOrCaps,
]);

// soft tail abbreviation conditions:
//     * delimiter is dot
//     * lefts side right most word is a soft tail abbreviation (etc.)
//     * right word starts with lowercase or entirely in uppercase
export const leftSoftTailAbbreviation = allPass([
    compose(isDotDelimiter, lstToken, fst),
    compose(
        (word: string) => Boolean(SOFT_TAIL[word]),
        toLower,
        omitNonAlphaStart,
        lstWord,
        lstToken,
        fst,
    ) as Pred,
    rightLowercaseOrCaps,
]);

// letters with dots, like т.ч. or e.g., known or not
const isDotted = (token: string) => /^(?:\p{L}\.){2,}$/u.test(token);

// dotted abbreviation conditions:
//     * lefts side right most token is letters with dots (т.ч., т.о.)
//     * right word starts with lowercase or entirely in uppercase
export const leftDottedAbbreviation = allPass([
    compose(isDotted, omitNonAlphaStart, lstToken, fst) as Pred,
    rightLowercaseOrCaps,
]);
