import {and, compose, map, or, reduce} from 'ramda';
import {describe, expect, it} from 'vitest';

import {leftAbbreviation, leftInitials} from './';

describe('leftInitials', () => {
    it('evaluates to true if left is part of the initials', () => {
        const go = compose(reduce(and, true), map(leftInitials));
        const input = [
            ['это был А.', ' C. Пушкин'],
            ['сказал A. С.', ' Пушкин'],
        ];
        const expected = true;
        const actual = go(input);
        expect(actual).toBe(expected);
    });
    it('evaluates to false otherwise', () => {
        const go = compose(reduce(or, false), map(leftInitials));
        const input = [
            ['И?', 'A. C. Пушкин'],
            ['OOO.', 'Заря'],
            ['a.', 'c. пушкин'],
            ['something like 4.', ' Wow, thats a good deal.'],
        ];
        const expected = false;
        const actual = go(input);
        expect(actual).toBe(expected);
    });
});

describe('leftAbbreviation', () => {
    it('evaluates to true for a known abbreviation', () => {
        expect(leftAbbreviation(['Встреча с Mr.', ' Smith'])).toBe(true);
        expect(leftAbbreviation(['Ответ см.', ' Ниже'])).toBe(true);
    });
    it('evaluates to false for an acronym in capitals', () => {
        expect(leftAbbreviation(['Опция для операций sort и MR.', ' Эта опция'])).toBe(false);
    });
});
