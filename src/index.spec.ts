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
});
