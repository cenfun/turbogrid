import Util from '../core/util.js';

const isBlank = function(value) {
    if (value === null || typeof value === 'undefined') {
        return true;
    }
    return false;
};

const blankComparer = function(av, bv) {
    const ab = isBlank(av);
    const bb = isBlank(bv);
    if (ab && bb) {
        return 0;
    }
    if (ab) {
        return 1;
    }
    if (bb) {
        return -1;
    }
};

// =======================================================================

// tg_index is require be created every time, no need sortFactor, always 0->9
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
        // date string "2017-05-21" === number 1495324800000
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

const pinyinComparer = function(av, bv) {
    const ai = typeof av === 'string';
    const bi = typeof bv === 'string';
    // both are string
    if (ai && bi) {
        return bv.localeCompare(av, 'zh-Hans-CN');
    }
    return av > bv ? -1 : 1;
};

// =======================================================================

const valueComparer = function(a, b, options, diffValueComparer) {
    const av = a[options.sortField];
    const bv = b[options.sortField];
    const bcv = blankComparer(av, bv);
    // has number result: 0, 1, -1
    if (typeof bcv === 'number') {
        if (bcv === 0) {
            return equalComparer(a, b);
        }
        return options.sortBlankFactor * bcv;
    }
    if (av !== bv && typeof diffValueComparer === 'function') {
        const dvc = diffValueComparer(av, bv);
        if (Util.isNum(dvc)) {
            return options.sortFactor * dvc;
        }
    }
    return equalComparer(a, b);
};

export default {

    // null/undefined
    blankValue: blankComparer,

    // index is alias of equal
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
    booleanValue: booleanComparer,

    pinyin: function(a, b, options) {
        return valueComparer(a, b, options, pinyinComparer);
    },
    pinyinValue: pinyinComparer

};
