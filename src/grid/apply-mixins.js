function getOwnKeys(target) {
    return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
}

function applyMixins(targetClass, mixinModules) {
    const props = targetClass.prototype;
    const sourceMap = new Map();

    getOwnKeys(props).forEach((key) => {
        sourceMap.set(key, targetClass.name);
    });

    Object.entries(mixinModules).forEach(([name, mixin]) => {
        getOwnKeys(mixin).forEach((key) => {
            if (key === '__proto__') {
                return;
            }

            const previousSource = sourceMap.get(key);
            if (previousSource) {
                throw new Error(`ERROR: duplicate mixin key "${String(key)}" from "${name}". Already defined in "${previousSource}".`);
            }

            Object.defineProperty(props, key, Object.getOwnPropertyDescriptor(mixin, key));
            sourceMap.set(key, name);
        });
    });

    return targetClass;
}

export default applyMixins;
