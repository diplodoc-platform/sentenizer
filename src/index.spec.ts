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
    // Acronyms in latin capitals end a sentence; abbreviations, initials and
    // cyrillic abbreviations written in capitals do not.
    it.each([
        [
            'Операции sort и MR. Эта опция включает подстройку.',
            ['Операции sort и MR.', ' Эта опция включает подстройку.'],
        ],
        ['Use the REST API. Then call it.', ['Use the REST API.', ' Then call it.']],
        ['Created in the USSR. Later moved.', ['Created in the USSR.', ' Later moved.']],
        ['Контроль в СССР. Далее текст.', ['Контроль в СССР.', ' Далее текст.']],
        ['Опция для MR. это продолжение.', ['Опция для MR. это продолжение.']],
        ['Встреча с Mr. Smith прошла.', ['Встреча с Mr. Smith прошла.']],
        ['Call Dr. Who now.', ['Call Dr. Who now.']],
        ['MR. SMITH ARRIVED.', ['MR. SMITH ARRIVED.']],
        ['СМ. ЗАГЛАВНЫЕ БУКВЫ.', ['СМ. ЗАГЛАВНЫЕ БУКВЫ.']],
        ['Приложение А. Смотрите ниже.', ['Приложение А. Смотрите ниже.']],
        ['Автор А. С. Пушкин.', ['Автор А. С. Пушкин.']],
        ['Plan B. Next step.', ['Plan B. Next step.']],
        ['См. раздел ниже. Далее.', ['См. раздел ниже.', ' Далее.']],
        ['т. е. это так. Далее.', ['т. е. это так.', ' Далее.']],
        ['Using GPUs. Next.', ['Using GPUs.', ' Next.']],
        ['Проверка ДС. Эта строка.', ['Проверка ДС.', ' Эта строка.']],
        ['Version 2.0 GA. Next sentence.', ['Version 2.0 GA.', ' Next sentence.']],
        ['Ещё раз: ИМ. Ленина.', ['Ещё раз: ИМ. Ленина.']],
        ['Улица ИМ. Ленина.', ['Улица ИМ. Ленина.']],
        ['в г. Москва. Далее.', ['в г. Москва.', ' Далее.']],
        ['в Г. Москва. Далее.', ['в Г. Москва.', ' Далее.']],
    ])('should split %j around acronyms and abbreviations', (input, expected) => {
        expect(sentenize(input)).toStrictEqual(expected);
    });

    // English abbreviations of the dictionaries: kept in the sentence like
    // their Russian counterparts.
    it.each([
        ['See Fig. 3 and Sec. 2.1 for details.', ['See Fig. 3 and Sec. 2.1 for details.']],
        ['See p. 12 or pp. 3-5, cf. the appendix.', ['See p. 12 or pp. 3-5, cf. the appendix.']],
        ['Incl. taxes, approx. 5 items.', ['Incl. taxes, approx. 5 items.']],
        ['Смотрите табл. 2 ниже.', ['Смотрите табл. 2 ниже.']],
        ['Use a proxy, e.g. nginx.', ['Use a proxy, e.g. nginx.']],
        ['Done. Next sentence.', ['Done.', ' Next sentence.']],
    ])('should keep %j', (input, expected) => {
        expect(sentenize(input)).toStrictEqual(expected);
    });

    // A pair abbreviation written with a space ends the text before a word in
    // capitals; its last letter used to be looked up at its first occurrence
    // in the text (the "е" of "есть").
    it.each([
        ['То есть т. е. КОД в тексте.', ['То есть т. е. КОД в тексте.']],
        ['То есть т.е. КОД в тексте.', ['То есть т.е. КОД в тексте.']],
        ['Some e.g. CODE in text.', ['Some e.g. CODE in text.']],
        ['Some i.e. CODE in text.', ['Some i.e. CODE in text.']],
    ])('should keep a pair abbreviation before capitals: %j', (input, expected) => {
        expect(sentenize(input)).toStrictEqual(expected);
    });

    // etc. often ends a sentence: kept in it only before a word that does
    // not start a new one, like the Russian "т. д."
    it.each([
        ['Rows, columns, etc. Next sentence.', ['Rows, columns, etc.', ' Next sentence.']],
        ['Rows, columns, etc. and more.', ['Rows, columns, etc. and more.']],
        ['Rows, columns, etc. CODE in text.', ['Rows, columns, etc. CODE in text.']],
    ])('should split after etc. only before a new sentence: %j', (input, expected) => {
        expect(sentenize(input)).toStrictEqual(expected);
    });

    // Rules look at the text right before the delimiter, not at the end of
    // the first line of a multi-line paragraph.
    it.each([
        ['Type: bool\nFinite (e.g. CODE there).', ['Type: bool\nFinite (e.g. CODE there).']],
        ['Тип: bool\nКонечен (см. КОД там).', ['Тип: bool\nКонечен (см. КОД там).']],
        ['Тип: bool\nКонечен (см. Далее там).', ['Тип: bool\nКонечен (см. Далее там).']],
    ])('should read the last line of a multi-line text: %j', (input, expected) => {
        expect(sentenize(input)).toStrictEqual(expected);
    });

    // Letters with dots are an abbreviation whether the dictionaries know it
    // or not, kept in the sentence before a word that does not start a new one.
    it.each([
        ['В т.ч. КОД в тексте.', ['В т.ч. КОД в тексте.']],
        ['В т.ч. и другие.', ['В т.ч. и другие.']],
        ['В т.ч. Далее текст.', ['В т.ч.', ' Далее текст.']],
    ])('should keep letters with dots: %j', (input, expected) => {
        expect(sentenize(input)).toStrictEqual(expected);
    });
});
