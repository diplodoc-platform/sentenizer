import {describe, expect, it} from 'vitest';

import {sentenize} from './';

describe('sentenize naive', function () {
    it('should handle one basic sentence', () => {
        const input = 'Последовательно обходим кандидатов на разделение, убираем лишние.';
        const expected = ['Последовательно обходим кандидатов на разделение, убираем лишние.'];
        const actual = sentenize(input);
        expect(actual).toStrictEqual(expected);
    });
    it('should handle basic sentences that ends with .?!…;', () => {
        const input =
            'Последовательно обходим кандидатов на разделение, убираем лишние. Используем список эвристик. Сколько гусей было у бабуси? Три Веселых гуся! Он задумчиво посмотрел в окно… И забыл про гусей.';
        const expected = [
            'Последовательно обходим кандидатов на разделение, убираем лишние.',
            ' Используем список эвристик.',
            ' Сколько гусей было у бабуси?',
            ' Три Веселых гуся!',
            ' Он задумчиво посмотрел в окно…',
            ' И забыл про гусей.',
        ];
        const actual = sentenize(input);
        expect(actual).toStrictEqual(expected);
    });
    it('should handle delimiter + new line broken sentences', () => {
        const input =
            'Последовательно обходим кандидатов на разделение, убираем лишние. \
Используем список эвристик.';
        const expected = [
            'Последовательно обходим кандидатов на разделение, убираем лишние.',
            ' Используем список эвристик.',
        ];
        const actual = sentenize(input);
        expect(actual).toStrictEqual(expected);
    });
    it('should split after an acronym in capitals', () => {
        const input = 'Введена опция для операций sort и MR. Эта опция включает подстройку.';
        const expected = [
            'Введена опция для операций sort и MR.',
            ' Эта опция включает подстройку.',
        ];
        expect(sentenize(input)).toStrictEqual(expected);
    });
    it('should not split after a known abbreviation', () => {
        const input = 'Встреча с Mr. Smith прошла успешно.';
        expect(sentenize(input)).toStrictEqual([input]);
    });
});
