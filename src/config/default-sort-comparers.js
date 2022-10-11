import Util from '../core/util.js';
const emptyMatch = function(value) {
    if (!value && value !== 0) {
        return true;
    }
    return false;
};

const emptyComparer = function(av, bv, option) {
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

//=======================================================================

const isNull = function(value) {
    if (value === null || typeof value === 'undefined') {
        return true;
    }
    return false;
};

const blankComparer = function(av, bv, option) {
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

    return emptyComparer(av, bv, option);

};

//=======================================================================

const stringComparer = function(av, bv, option) {
    const ai = typeof av === 'string';
    const bi = typeof bv === 'string';
    //both are string
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

const diffTypeComparer = function(ai, bi, av, bv, option) {
    if (ai) {
        return -1;
    }
    if (bi) {
        return 1;
    }
    return stringComparer(av, bv, option);
};

const numberComparer = function(av, bv, option) {
    const ai = typeof av === 'number';
    const bi = typeof bv === 'number';
    //both are number
    if (ai && bi) {
        return av > bv ? -1 : 1;
    }
    return diffTypeComparer(ai, bi, av, bv, option);
};

const dateComparer = function(av, bv, option) {
    const ad = new Date(av);
    const bd = new Date(bv);
    const ai = Util.isDate(ad);
    const bi = Util.isDate(bd);
    //both are date
    if (ai && bi) {
        const am = ad.getTime();
        const bm = bd.getTime();
        if (am === bm) {
            return;
        }
        return am > bm ? -1 : 1;

    }
    return diffTypeComparer(ai, bi, av, bv, option);
};

//=======================================================================

// tg_index is require be created every time
const indexComparer = function(a, b, option) {
    return a.tg_index > b.tg_index ? 1 : -1;
};

// index comparer if value equal
const equalComparer = function(a, b, option) {
    return indexComparer(a, b, option);
};

//=======================================================================

export default {

    string: function(a, b, option) {
        const av = a[option.sortField];
        const bv = b[option.sortField];

        const cb = blankComparer(av, bv, option);
        if (cb) {
            return option.sortBlankFactor * cb;
        }

        if (cb !== 0 && av !== bv) {
            const cs = stringComparer(av, bv, option);
            if (typeof cs === 'number') {
                return option.sortFactor * cs;
            }
        }

        return equalComparer(a, b, option);
    },

    number: function(a, b, option) {
        const av = a[option.sortField];
        const bv = b[option.sortField];

        const cb = blankComparer(av, bv, option);
        if (cb) {
            return option.sortBlankFactor * cb;
        }

        if (cb !== 0 && av !== bv) {
            const cn = numberComparer(av, bv, option);
            if (typeof cn === 'number') {
                return option.sortFactor * cn;
            }
        }

        return equalComparer(a, b, option);
    },

    date: function(a, b, option) {
        const av = a[option.sortField];
        const bv = b[option.sortField];

        const cb = blankComparer(av, bv, option);
        if (cb) {
            return option.sortBlankFactor * cb;
        }

        if (cb !== 0 && av !== bv) {
            const cd = dateComparer(av, bv, option);
            if (typeof cd === 'number') {
                return option.sortFactor * cd;
            }
        }

        return equalComparer(a, b, option);
    }

};
