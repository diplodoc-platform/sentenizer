/* eslint-disable security/detect-non-literal-regexp, security/detect-unsafe-regex */
import {compose, anyPass, zipWith, call} from 'ramda';

import {sentences, fstChars, lstChars} from './parsers';
import {
    spaceBothSides,
    rightLacksSpacePrefix,
    rightStartsWithLowercase,
    rightStartsWithNonAlpha,
    rightDelimiterPrefix,
    rightQuotationGenericPrefix,
    rightQuotationClosePrefix,
    rightBracketsClosePrefix,
    rightOnlySpaces,
    leftInitials,
    leftAbbreviation,
    pairAbbreviation,
    leftPairsTailAbbreviation,
    rightStartsWithNewLine,
} from './rules';

// sides preprocessing before evaluation
const leftPreprocessor = lstChars(20);
const rightPreprocessor = fstChars(20);
const sidesPreprocessors = [leftPreprocessor, rightPreprocessor];

// conditions to join upon
const joinCondition = anyPass([
    spaceBothSides,
    rightLacksSpacePrefix,
    rightStartsWithLowercase,
    rightStartsWithNonAlpha,
    rightDelimiterPrefix,
    rightQuotationGenericPrefix,
    rightQuotationClosePrefix,
    rightBracketsClosePrefix,
    rightOnlySpaces,
    leftInitials,
    leftAbbreviation,
    pairAbbreviation,
    leftPairsTailAbbreviation,
]);

const breakCondition = anyPass([
    rightStartsWithNewLine,
]);

const join = compose(joinCondition, zipWith<any, any, any>(call, sidesPreprocessors));
const hardbreak = compose(breakCondition, zipWith<any, any, any>(call, sidesPreprocessors));

// sentences processing
export function sentenize(text: string): string[] {
    const chunks = sentences(text);
    const parsed: string[] = [];

    let left: string | null = null;
    for (const chunk of chunks) {
        if (!left) {
            left = chunk;
            continue;
        }

        if (!hardbreak([left, chunk]) && join([left, chunk])) {
            left += chunk;
        } else {
            parsed.push(left);

            left = chunk;
        }
    }

    if (left) parsed.push(left);

    return parsed;
}
