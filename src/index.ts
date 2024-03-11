/* eslint-disable security/detect-non-literal-regexp, security/detect-unsafe-regex */
import {compose, anyPass, zipWith, call} from 'ramda';

import {sentences, fstChars, lstChars} from './parsers';
import {
    spaceBothSides,
    rightLacksSpacePrefix,
    rightStartsWithLowercase,
    rightDelimiterPrefix,
    rightQuotationGenericPrefix,
    rightQuotationClosePrefix,
    rightBracketsClosePrefix,
    rightOnlySpaces,
    leftInitials,
    leftAbbreviation,
    pairAbbreviation,
    leftPairsTailAbbreviation,
    rightStartsWithHardbreak,
    rightStartsNewlineUppercased,
    leftEndsWithHardbreak,
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
    leftEndsWithHardbreak,
    rightStartsWithHardbreak,
    rightStartsNewlineUppercased,
]);

const join = compose(joinCondition, zipWith<any, any, any>(call, sidesPreprocessors));
const breaks = compose(breakCondition, zipWith<any, any, any>(call, sidesPreprocessors));

// sentences processing
export function sentenize(text: string): string[] {
    const parts = text.split(/((?:\n\s*){2,})/);
    const parsed: string[] = [];

    for (const part of parts) {
        const chunks = sentences(part);

        let left: string | null = null;
        for (const right of chunks) {
            if (!left) {
                left = right;
                continue;
            }

            if (!breaks([left, right]) && join([left, right])) {
                left += right;
            } else {
                parsed.push(left);

                left = right;
            }
        }

        if (left) parsed.push(left);
    }

    return parsed;
}
