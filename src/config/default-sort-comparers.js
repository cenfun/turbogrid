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

// tg_index is require be created every time
const indexComparer = function(a, b, options) {
    return a.tg_index > b.tg_index ? 1 : -1;
};

// index comparer if value equal
const equalComparer = function(a, b, options) {
    return indexComparer(a, b, options);
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

const valueComparer = function(a, b, options, diffValueComparer) {
    const av = a[options.sortField];
    const bv = b[options.sortField];
    const bc = blankComparer(av, bv, options);
    // 1, -1
    if (bc) {
        return options.sortBlankFactor * bc;
    }
    // undefined, 0
    if (bc !== 0 && av !== bv && typeof diffValueComparer === 'function') {
        const dvc = diffValueComparer.call(this, av, bv, options);
        if (Util.isNum(dvc)) {
            return options.sortFactor * dvc;
        }
    }
    return equalComparer(a, b, options);
};

export default {
    // value: empty string
    empty: emptyComparer,

    // value: null undefined, empty string
    blank: blankComparer,

    // object: index is alias of equal
    equal: equalComparer,
    index: indexComparer,

    // object: diff value
    value: valueComparer,

    string: function(a, b, options) {
        return valueComparer(a, b, options, stringComparer);
    },

    number: function(a, b, options) {
        return valueComparer(a, b, options, numberComparer);
    },

    date: function(a, b, options) {
        return valueComparer(a, b, options, dateComparer);
    }

};
