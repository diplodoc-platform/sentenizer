import {compose, curry, flip, lte, uniq, length} from 'ramda';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lenLte = (len: number) => compose<any[][], number, boolean>(curry(flip(lte))(len), length);

export const allEqual = compose(lenLte(1), uniq);

export const lengthNonZero = compose(Boolean, length);
