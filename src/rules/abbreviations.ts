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
    or,
    prop,
    toLower,
    view,
    zipWith,
} from 'ramda';

import {HEAD, HEAD_PAIR, INITIALS, OTHER, OTHER_PAIR, TAIL, TAIL_PAIR} from 'src/constants';

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

// left abbreviation conditions:
//     * delimiter is dot
//     * lefts side right most word is known abbreviation
export const leftAbbreviation = compose(
    allPass([compose(isDotDelimiter, lstToken), isLeftAbbreviation]),
    fst,
);

const isCaps = allPass([isUpper, compose(lt(1), length)]);

// right join condition is to be uppercase or lowercase word
const rightLowercaseOrCaps = compose(anyPass([startsWithLower, isCaps]), fstWord, snd);

// portion of the source <s> before target <t>
const before = (s: string) => (t: string) => s.slice(0, Math.max(s.indexOf(t), 0));

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
