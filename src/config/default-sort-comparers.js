import Util from '../core/util.js';
const emptyMatch = function(value) {
    if (!value && value !== 0) {
        return true;
    }
    return false;
};

const emptyComparer = function(av, bv, options) {
    const ae = emptyMatch(av);
    const be = emptyMatch(bv);

    if (ae && be) {
        return 0;
    }

    if (ae) {
        return 1;
    }

    if (be) {
        return -1;
    }

};

// =======================================================================

const isNull = function(value) {
    if (value === null || typeof value === 'undefined') {
        return true;
    }
    return false;
};

const blankComparer = function(av, bv, options) {
    const an = isNull(av);
    const bn = isNull(bv);

    if (an && bn) {
        return 0;
    }

    if (an) {
        return 1;
    }

    if (bn) {
        return -1;
    }

    return emptyComparer(av, bv, options);

};

// =======================================================================

const stringComparer = function(av, bv, options) {
    const ai = typeof av === 'string';
    const bi = typeof bv === 'string';
    // both are string
    if (ai && bi) {
        // ignore case sort
        const au = av.toUpperCase();
        const bu = bv.toUpperCase();
        if (au !== bu) {
            return au > bu ? -1 : 1;
        }
    }
    return av > bv ? -1 : 1;
};

const diffTypeComparer = function(ai, bi, av, bv, options) {
    if (ai) {
        return -1;
    }
    if (bi) {
        return 1;
    }
    return stringComparer(av, bv, options);
};

const numberComparer = function(av, bv, options) {
    const ai = typeof av === 'number';
    const bi = typeof bv === 'number';
    // both are number
    if (ai && bi) {
        return av > bv ? -1 : 1;
    }
    return diffTypeComparer(ai, bi, av, bv, options);
};

const dateComparer = function(av, bv, options) {
    const ad = new Date(av);
    const bd = new Date(bv);
    const ai = Util.isDate(ad);
    const bi = Util.isDate(bd);
    // both are date
    if (ai && bi) {
        const am = ad.getTime();
        const bm = bd.getTime();
        if (am === bm) {
            return;
        }
        return am > bm ? -1 : 1;

    }
    return diffTypeComparer(ai, bi, av, bv, options);
};

// =======================================================================

// tg_index is require be created every time
const indexComparer = function(a, b, options) {
    return a.tg_index > b.tg_index ? 1 : -1;
};

// index comparer if value equal
const equalComparer = function(a, b, options) {
    return indexComparer(a, b, options);
};

// =======================================================================

export default {

    string: function(a, b, options) {
        const av = a[options.sortField];
        const bv = b[options.sortField];

        const cb = blankComparer(av, bv, options);
        if (cb) {
            return options.sortBlankFactor * cb;
        }

        if (cb !== 0 && av !== bv) {
            const cs = stringComparer(av, bv, options);
            if (typeof cs === 'number') {
                return options.sortFactor * cs;
            }
        }

        return equalComparer(a, b, options);
    },

    number: function(a, b, options) {
        const av = a[options.sortField];
        const bv = b[options.sortField];

        const cb = blankComparer(av, bv, options);
        if (cb) {
            return options.sortBlankFactor * cb;
        }

        if (cb !== 0 && av !== bv) {
            const cn = numberComparer(av, bv, options);
            if (typeof cn === 'number') {
                return options.sortFactor * cn;
            }
        }

        return equalComparer(a, b, options);
    },

    date: function(a, b, options) {
        const av = a[options.sortField];
        const bv = b[options.sortField];

        const cb = blankComparer(av, bv, options);
        if (cb) {
            return options.sortBlankFactor * cb;
        }

        if (cb !== 0 && av !== bv) {
            const cd = dateComparer(av, bv, options);
            if (typeof cd === 'number') {
                return options.sortFactor * cd;
            }
        }

        return equalComparer(a, b, options);
    }

};
