import type {Pred} from 'ramda';

import {allPass, compose, identity, invoker, juxt, match, not, toLower, toUpper} from 'ramda';

import {allEqual, lengthNonZero} from './list';

export const charAt = invoker(1, 'charAt');

export const notAlpha = compose(allEqual, juxt([toLower, toUpper]));

export const hasAlpha = compose(not, notAlpha);

export const startsWithLower = allPass([
    compose(hasAlpha, charAt(0)) as Pred,
    compose(allEqual, juxt([identity, toLower]), charAt(0)) as Pred,
]);

export const startsWithUpper = allPass([
    compose(hasAlpha, charAt(0)) as Pred,
    compose(allEqual, juxt([identity, toUpper]), charAt(0)) as Pred,
]);

export const startsWithNewline = compose(lengthNonZero, match(/^\n/)) as Pred;

export const startsWithHardbreak = compose(lengthNonZero, match(/^\n\n/)) as Pred;

export const endsWithHardbreak = compose(lengthNonZero, match(/\n\n$/)) as Pred;

export const isUpper = compose(allEqual, juxt([toUpper, identity]));
