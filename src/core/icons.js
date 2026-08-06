const moduleStrings = import.meta.glob('../icons/*.svg', {
    query: '?raw',
    eager: true
});

export const icons = {
    radio: '<div class="tg-icon-radio"><div>'
};

Object.keys(moduleStrings).forEach((src) => {
    const name = src.split('/').pop().replace('.svg', '');
    icons[name] = moduleStrings[src].default;
});

export const getIcon = function(name) {
    let str = icons[name];
    str = String(str).trim();
    return str;
};
