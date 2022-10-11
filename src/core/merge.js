import isObject from './is-object.js';

const mergeArray = function(base, item, deep) {
    //merge array to base
    const len = item.length;
    for (let i = 0; i < len; i++) {
        const v = item[i];
        if (deep && isObject(v)) {
            base[i] = merge(base[i], v);
        } else {
            base[i] = v;
        }
    }
    //length fixing for array
    if (base instanceof Array) {
        base.length = len;
    }
};

const mergeObject = function(base, item, deep) {
    //merge object to base
    Object.keys(item).forEach(function(k) {
        const v = item[k];
        if (deep && isObject(v) && Object.prototype.hasOwnProperty.call(base, k)) {
            base[k] = merge(base[k], v);
        } else {
            base[k] = v;
        }
    });
};

const mergeList = function(args, deep) {
    let base;
    args.forEach((item) => {
        //only for valid object or array
        if (!isObject(item)) {
            return;
        }
        //base type depend on first parameter
        if (!base) {
            base = (item instanceof Array) ? [] : {};
        }
        //merge to base
        if (item instanceof Array) {
            mergeArray(base, item, deep);
        } else {
            mergeObject(base, item, deep);
        }
    });
    return base || {};
};

//merge JSON
const merge = function() {
    const args = Array.from(arguments);
    const len = args.length;
    //no parameters
    if (!len) {
        return {};
    }
    //deep merge depend on last parameter
    let deep = true;
    if (args[len - 1] === false) {
        deep = false;
    }
    return mergeList(args, deep);
};

export default merge;
