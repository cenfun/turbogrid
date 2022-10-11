function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function mergeProps(target, list, isConcat) {
    for (let i = 0, l = list.length; i < l; i++) {
        const item = list[i];
        if (!item) {
            continue;
        }
        for (const k in item) {
            if (isConcat && hasOwn(target, k)) {
                console.log(`ERROR: concat with an existing key: "${k}" (index:${i})`);
                //console.log(list);
            }
            if (target[k] !== item[k]) {
                target[k] = item[k];
            }
        }
    }
    return target;
}

const Extend = function() {

};

Extend.extend = function(protoProps, staticProps) {

    const Super = this;

    //============================================================
    //constructor
    let Sub = function() {
        return Super.apply(this, arguments);
    };

    //if have custom constructor
    if (protoProps && hasOwn(protoProps, 'constructor') && typeof protoProps.constructor === 'function') {
        Sub = protoProps.constructor;
    }

    //============================================================

    //add static properties to the constructor
    mergeProps(Sub, [Super, staticProps]);

    //============================================================
    //prototype handler

    const parentProps = Object.create(Super.prototype);
    parentProps.constructor = Sub;

    mergeProps(Sub.prototype, [parentProps, protoProps]);

    //============================================================

    return Sub;

};

Extend.concat = function() {
    const protoProps = mergeProps({}, arguments, true);
    return Extend.extend.call(this, protoProps);
};

export default class {
    static extends() {
        const Cls = function() {};
        Cls.prototype = mergeProps({}, Array.from(arguments), true);
        return Cls;
    }
}
