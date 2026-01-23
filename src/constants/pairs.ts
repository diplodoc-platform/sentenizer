export type RegExpPair = [() => RegExp, () => RegExp];

export const REGEXP_PAIRS: RegExpPair[] = [
    [() => /\*\*[\p{L}_~*]/giu, () => /[\p{L}_~*]\*\*/giu],
    [() => /_[\p{L}_~*]/giu, () => /[\p{L}_~*]_/giu],
    [() => /~~[\p{L}_~*]/giu, () => /[\p{L}_~*]~~/giu],
];
