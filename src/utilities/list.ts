import {compose, curry, flip, length, lte, uniq} from 'ramda';

export const lenLte = (len: number) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    compose<any[][], number, boolean>(curry(flip(lte))(len), length);

export const allEqual = compose(lenLte(1), uniq);

export const lengthNonZero = compose(Boolean, length);
