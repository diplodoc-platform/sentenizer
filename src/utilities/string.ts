import {compose, invoker, juxt, allPass, identity, not, toLower, toUpper, Pred, match} from 'ramda';
import {allEqual, lengthNonZero} from './list';

export const charAt = invoker(1, 'charAt');

export const notAlpha = compose(allEqual, juxt([toLower, toUpper]));

export const hasAlpha = compose(not, notAlpha);

export const startsWithLower = allPass([
    compose(not, lengthNonZero, match(/\n/), charAt(0)) as Pred<any[]>,
    compose(not, notAlpha, charAt(0)) as Pred<any[]>,
    compose(allEqual, juxt([identity, toLower]), charAt(0)) as Pred<any[]>,
]);

export const startsWithNonAlpha = compose(notAlpha, charAt(0)) as Pred<any[]>;

export const startsWithNewLine = compose(lengthNonZero, match(/\n/), charAt(0)) as Pred<any[]>;

export const isUpper = compose(allEqual, juxt([toUpper, identity]));
