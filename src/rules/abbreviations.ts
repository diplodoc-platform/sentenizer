import {
    or,
    view,
    join,
    __,
    compose,
    zipWith,
    call,
    prop,
    defaultTo,
    allPass,
    anyPass,
    toLower,
    Pred,
    length,
    lt,
} from 'ramda';

import {
    INITIALS,
    HEAD,
    TAIL,
    OTHER,
    HEAD_PAIR,
    TAIL_PAIR,
    OTHER_PAIR,
} from '../constants/abbreviations';
import {lengthNonZero, startsWithLower, isUpper} from '../utilities';
import {
    dotSuffix,
    lstWord,
    fstWord,
    words,
    lstToken,
    fstToken,
    omitNonAlphaStart,
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
    prop(__, HEAD_PAIR) as Pred<any[]>,
    prop(__, TAIL_PAIR) as Pred<any[]>,
    prop(__, OTHER_PAIR) as Pred<any[]>,
]);

// abbreviation pair test
const isPairAbbreviation = compose(
    insidePairAbbreviationMap,
    hash,
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
    isPairAbbreviation as Pred<any[]>,
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
    compose(isLeftPairsTail, fst) as Pred<any[]>,
    rightLowercaseOrCaps,
]);
