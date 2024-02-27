import {compose, invoker, juxt, allPass, identity, not, toLower, toUpper, Pred, match} from 'ramda';
import {allEqual, lengthNonZero} from './list';

export const charAt = invoker(1, 'charAt');

export const notAlpha = compose(allEqual, juxt([toLower, toUpper]));

export const hasAlpha = compose(not, notAlpha);

export const startsWithLower = allPass([
    compose(hasAlpha, charAt(0)) as Pred<any[]>,
    compose(allEqual, juxt([identity, toLower]), charAt(0)) as Pred<any[]>,
]);

export const startsWithUpper = allPass([
    compose(hasAlpha, charAt(0)) as Pred<any[]>,
    compose(allEqual, juxt([identity, toUpper]), charAt(0)) as Pred<any[]>,
]);

export const startsWithNewline = compose(lengthNonZero, match(/^\n/)) as Pred<any[]>;

export const startsWithHardbreak = compose(lengthNonZero, match(/^\n\n/)) as Pred<any[]>;

export const endsWithHardbreak = compose(lengthNonZero, match(/\n\n$/)) as Pred<any[]>;

export const isUpper = compose(allEqual, juxt([toUpper, identity]));
