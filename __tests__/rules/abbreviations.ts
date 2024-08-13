/* eslint-disable @typescript-eslint/no-shadow */
import {
    and,
    compose,
    concat,
    flip,
    juxt,
    keys,
    map,
    or,
    reduce,
    split,
    toUpper,
    unnest,
} from 'ramda';

import {leftAbbreviation, leftPairsTailAbbreviation, pairAbbreviation} from '../../src/rules';
import {
    HEAD,
    HEAD_PAIR,
    INITIALS,
    OTHER,
    OTHER_PAIR,
    TAIL,
    TAIL_PAIR,
} from '../../src/constants/abbreviations';

const pairWith =
    (a: string) =>
    (b: string): [string, string] => [b, a];

const keysWithRightFirstUpper = map(compose(pairWith(' С заглавной'), flip(concat)('.')));
const keysSpacesWithRightFirstUpper = map(compose(pairWith(' С заглавной'), flip(concat)('. ')));
const keysWithRightUpper = map(compose(pairWith(' ЗАГЛАВНЫЕ'), flip(concat)('.')));
const keysUpperWithRightUpper = map(compose(pairWith(' ЗАГЛАВНЫЕ'), flip(concat)('.'), toUpper));
const keysSpacesWithRightLower = map(compose(pairWith(' строчный'), flip(concat)('. ')));

const generateInput = compose(
    unnest,
    juxt([
        keysSpacesWithRightFirstUpper,
        keysWithRightFirstUpper,
        keysWithRightUpper,
        keysUpperWithRightUpper,
    ]),
    keys,
);

describe('leftAbbreviation', () => {
    it('evaluates to true if left is head, tail, initials abbreviation', () => {
        const go = compose(reduce(and, true), map(leftAbbreviation));
        const input = [
            ...generateInput(INITIALS),
            ...generateInput(HEAD),
            ...generateInput(TAIL),
            ...generateInput(OTHER),
        ];
        const expected = true;
        const actual = go(input);
        expect(actual).toBe(expected);
    });

    it('evaluates to false otherwise', () => {
        const go = compose(reduce(or, false), map(leftAbbreviation));
        const input = [
            ['Пщ. ', ' Бдыщ'],
            ['Jacq. ', ' Lacan'],
            ['Мд!', 'Али'],
            ['Вс', ' Мейерхольд'],
        ];
        const expected = false;
        const actual = go(input);
        expect(actual).toBe(expected);
    });

    it('ends with parens', () => {
        const input = ['md).', ' Sentence'];
        const actual = leftAbbreviation(input);
        expect(actual).toStrictEqual(false);
    });

    it('starts with parens', () => {
        const input = ['(см.', ' [ссылка](file.md)'];
        const actual = leftAbbreviation(input);
        expect(actual).toStrictEqual(true);
    });
});

describe('pairAbbreviation', () => {
    it('evaluates to true if sides are known abbreviation pair delimited by dot', () => {
        const go = compose(reduce(and, true), map(pairAbbreviation));
        const generateCaps = map(compose(map(flip(concat)('.')), split('.'), toUpper));
        const generateSpaced = map(compose(map(flip(concat)('. ')), split('.')));
        const generateInput = compose(unnest, juxt([generateCaps, generateSpaced]), keys);
        const input = [
            ...generateInput(HEAD_PAIR),
            ...generateInput(TAIL_PAIR),
            ...generateInput(OTHER_PAIR),
        ];
        const expected = true;
        const actual = go(input);
        expect(actual).toBe(expected);
    });

    it('evaluates to false otherwise', () => {
        const go = compose(reduce(or, false), map(pairAbbreviation));
        const input = [
            ['фоо.', 'бар.'],
            ['фоо. ', 'бар. '],
            ['ФОО. ', 'БАР.'],
        ];
        const expected = false;
        const actual = go(input);
        expect(actual).toBe(expected);
    });

    it('handles sticking with parens', () => {
        const input = ['(т.', 'е. кто-то другой)'];
        const actual = pairAbbreviation(input);
        expect(actual).toStrictEqual(true);
    });
});

describe('leftPairsTailAbbreviation', () => {
    const test = (expected: boolean) => (pair: string[]) => {
        it('handles "' + pair.join('') + '"', () => {
            expect(leftPairsTailAbbreviation(pair)).toBe(expected);
        });
    };

    const generateInput = compose(
        unnest,
        juxt([keysUpperWithRightUpper, keysSpacesWithRightLower]),
        keys,
    );

    [
        ...generateInput(HEAD_PAIR),
        ...generateInput(TAIL_PAIR),
        ...generateInput(OTHER_PAIR),
    ].forEach(test(true));

    [
        ['фоо.бар. ', 'амбар'],
        ['not.an.abbr.', ' not happening'],
        ['not. an. abbr.', ' not happening'],
        ['и т.п.', ' В очереди'],
    ].forEach(test(false));
});
