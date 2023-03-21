import Util from '../core/util.js';
const isEmpty = function(value) {
    if (value === '') {
        return true;
    }
    return false;
};

const emptyComparer = function(av, bv) {
    const ae = isEmpty(av);
    const be = isEmpty(bv);

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

const blankComparer = function(av, bv) {
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

    return emptyComparer(av, bv);

};

// =======================================================================

// tg_index is require be created every time
const indexComparer = function(a, b) {
    return a.tg_index > b.tg_index ? 1 : -1;
};

// index comparer if value equal
const equalComparer = function(a, b) {
    return indexComparer(a, b);
};

// =======================================================================

const stringComparer = function(av, bv) {
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

const diffTypeComparer = function(ai, bi, av, bv) {
    if (ai) {
        return -1;
    }
    if (bi) {
        return 1;
    }
    return stringComparer(av, bv);
};

const numberComparer = function(av, bv) {
    const ai = typeof av === 'number';
    const bi = typeof bv === 'number';
    // both are number
    if (ai && bi) {
        return av > bv ? -1 : 1;
    }
    return diffTypeComparer(ai, bi, av, bv);
};

const dateComparer = function(av, bv) {
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
    return diffTypeComparer(ai, bi, av, bv);
};

const booleanComparer = function(av, bv) {
    const ai = typeof av === 'boolean';
    const bi = typeof bv === 'boolean';
    // both are boolean
    if (ai && bi) {
        return av > bv ? -1 : 1;
    }
    return diffTypeComparer(ai, bi, av, bv);
};

// =======================================================================

const valueComparer = function(a, b, options, diffValueComparer) {
    const av = a[options.sortField];
    const bv = b[options.sortField];
    const bc = blankComparer(av, bv);
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
    return equalComparer(a, b);
};

export default {
    // value: empty string
    emptyValue: emptyComparer,

    // value: null undefined, empty string
    blankValue: blankComparer,

    // object: index is alias of equal
    equal: equalComparer,
    index: indexComparer,

    // object: diff value
    value: valueComparer,

    diffType: diffTypeComparer,

    string: function(a, b, options) {
        return valueComparer(a, b, options, stringComparer);
    },
    stringValue: stringComparer,

    number: function(a, b, options) {
        return valueComparer(a, b, options, numberComparer);
    },
    numberValue: numberComparer,

    date: function(a, b, options) {
        return valueComparer(a, b, options, dateComparer);
    },
    dateValue: dateComparer,

    boolean: function(a, b, options) {
        return valueComparer(a, b, options, booleanComparer);
    },
    booleanValue: booleanComparer

};
