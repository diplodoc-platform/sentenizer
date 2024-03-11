import {
    call,
    zipWith,
    compose,
    map,
    all,
    not,
    always,
    Pred,
    identity,
    allPass,
    equals,
    length,
    juxt,
    toUpper
} from 'ramda';

import {
    startsWithLower,
    startsWithUpper,
    startsWithNewline,
    startsWithHardbreak,
    endsWithHardbreak,
    lengthNonZero, allEqual, hasAlpha,
} from '../utilities';
import {
    fstToken,
    words,
    spacePrefix,
    spaceSuffix,
    quotationGenericPrefix,
    quotationClosePrefix,
    bracketsClosePrefix,
    delimiterPrefix,
    spaces, dotSuffix, lstWord,
} from '../parsers';

// determine if left is part of the initials
// conditions:
//     * left delimiter is dot
//     * left last word is single letter
//     * left last word is in upper case
//     * left has alpha characters
const isLeftDotDelimiter = compose(lengthNonZero, dotSuffix);
const isLeftSingleLetter = compose(equals(1), length, lstWord);
const isLeftUpper = compose(allEqual, juxt([toUpper, identity]), lstWord);
const leftHasAlpha = compose(hasAlpha, lstWord);
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

const _ = always(true);
const rule = (name: string, [left, right]: [Pred, Pred], remap = identity<string>) => {
    return log(name, compose(
        all(Boolean),
        zipWith(call, [left, right]),
        map(remap),
    ));
}

// determine if delimiter surronded by spaces on both sides
export const spaceBothSides = rule('spaceBothSides', [isSpaceSuffix, isSpacePrefix], words);

// determine if right of delimiter lacks space prefix
export const rightLacksSpacePrefix = rule('rightLacksSpacePrefix', [_, compose(not, isSpacePrefix)], words);

// determine if right starts with lower case
export const rightStartsWithLowercase = rule('rightStartsWithLowercase', [_, compose(startsWithLower, fstToken)]);

// todo: determine if right is a delimiter
export const rightDelimiterPrefix = rule('rightDelimiterPrefix', [_, compose(lengthNonZero, delimiterPrefix, fstToken)]);

// determine if right is a generic quotation mark
export const rightQuotationGenericPrefix = rule('rightQuotationGenericPrefix', [_, compose(lengthNonZero, quotationGenericPrefix)]);

// determine if right is a close quotation mark
export const rightQuotationClosePrefix = rule('rightQuotationClosePrefix', [_, compose(lengthNonZero, quotationClosePrefix, fstToken)]);

// determine if right is a close bracket
export const rightBracketsClosePrefix = rule('rightBracketsClosePrefix', [_, compose(lengthNonZero, bracketsClosePrefix, fstToken)]);

// determine if right consists of only spaces
export const rightOnlySpaces = rule('rightOnlySpaces', [_, compose(lengthNonZero, spaces)]);

export const leftEndsWithHardbreak = rule('leftEndsWithHardbreak', [endsWithHardbreak, _]);

export const rightStartsWithHardbreak = rule('rightStartsWithHardbreak', [_, startsWithHardbreak]);

export const rightStartsNewlineUppercased = rule('rightStartsNewlineUppercased', [_, allPass([startsWithNewline, startsWithUpper])]);

export const leftInitials = rule('leftInitials', [allPass([isLeftDotDelimiter, isLeftSingleLetter, isLeftUpper, leftHasAlpha]), _]);