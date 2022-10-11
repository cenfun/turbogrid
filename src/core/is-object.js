//if is plain object or array
const isObject = function(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    const tag = Object.prototype.toString.call(obj);
    if (!['[object Object]', '[object Array]'].includes(tag)) {
        return false;
    }

    //Object.create(null)
    if (!obj.constructor) {
        return true;
    }

    if ([Object, Array].includes(obj.constructor)) {
        return true;
    }

    return false;
};
export default isObject;
