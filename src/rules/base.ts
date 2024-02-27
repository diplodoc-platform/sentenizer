import {call, zipWith, compose, map, all, not, always} from 'ramda';

import {startsWithLower, startsWithNonAlpha, startsWithNewLine, lengthNonZero} from '../utilities';
import {
    fstToken,
    words,
    spacePrefix,
    spaceSuffix,
    quotationGenericPrefix,
    quotationClosePrefix,
    bracketsClosePrefix,
    delimiterPrefix,
    spaces,
} from '../parsers';

const isSpaceSuffix = compose(lengthNonZero, spaceSuffix);
const isSpacePrefix = compose(lengthNonZero, spacePrefix);

const log = (name: string, action: Function) => {
    return (...args: any[]) => {
        const result = action(...args);

        if (process.env.DEBUG) {
            console.log(name, args, result);
        }

        return result;
    }
}

// determine if delimiter surronded by spaces on both sides
export const spaceBothSides = log('spaceBothSides', compose(
    all(Boolean),
    zipWith<any, any, any>(call, [isSpaceSuffix, isSpacePrefix]),
    map(words),
));

// determine if right of delimiter lacks space prefix
export const rightLacksSpacePrefix = log('rightLacksSpacePrefix', compose(
    all(Boolean),
    zipWith(call, [always(true), compose(not, isSpacePrefix)]),
    map(words),
));

// determine if right starts with lower case
export const rightStartsWithLowercase = log('rightStartsWithLowercase', compose(
    all(Boolean),
    zipWith(call, [always(true), compose(startsWithLower, fstToken)]),
));

export const rightStartsWithNonAlpha = log('rightStartsWithNonAlpha', compose(
    all(Boolean),
    zipWith(call, [always(true), compose(startsWithNonAlpha, fstToken)]),
));

export const rightStartsWithNewLine = log('rightStartsWithNewLine', compose(
    all(Boolean),
    zipWith(call, [always(true), startsWithNewLine]),
));

// todo: determine if right is a delimiter
export const rightDelimiterPrefix = log('rightDelimiterPrefix', compose(
    all(Boolean),
    zipWith(call, [always(true), compose(lengthNonZero, delimiterPrefix, fstToken)]),
));

// determine if right is a generic quotation mark
export const rightQuotationGenericPrefix = log('rightQuotationGenericPrefix', compose(
    all(Boolean),
    zipWith(call, [always(true), compose(lengthNonZero, quotationGenericPrefix)]),
));

// determine if right is a close quotation mark
export const rightQuotationClosePrefix = log('rightQuotationClosePrefix', compose(
    all(Boolean),
    zipWith(call, [always(true), compose(lengthNonZero, quotationClosePrefix, fstToken)]),
));

// determine if right is a close bracket
export const rightBracketsClosePrefix = log('rightBracketsClosePrefix', compose(
    all(Boolean),
    zipWith(call, [always(true), compose(lengthNonZero, bracketsClosePrefix, fstToken)]),
));

// determine if right consists of only spaces
export const rightOnlySpaces = log('rightOnlySpaces', compose(
    all(Boolean),
    zipWith(call, [always(true), compose(lengthNonZero, spaces)]),
));
