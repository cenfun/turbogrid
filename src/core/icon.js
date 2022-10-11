
const sortH = `
<svg class="tg-icon-sort-h" pointer-events="none" viewBox="0 0 19 6">
    <path class="tg-icon-item tg-icon-item-light tg-asc" fill="currentColor" d="M0 0h10l-5 6z" />
    <path class="tg-icon-item tg-asc" fill="currentColor" d="M9 6h10l-5 -6z" />
    <path class="tg-icon-item tg-desc" fill="currentColor" d="M0 0h10l-5 6z" />
    <path class="tg-icon-item tg-icon-item-light tg-desc" fill="currentColor" d="M9 6h10l-5 -6z" />
</svg>
`;

const sortV = `
<svg class="tg-icon-sort-v" pointer-events="none" viewBox="0 0 10 16">
    <path class="tg-icon-item tg-icon-item-light tg-asc" fill="currentColor" d="M0 9h10l-5 6z" />
    <path class="tg-icon-item tg-asc" fill="currentColor" d="M0 7h10l-5 -6z" />
    <path class="tg-icon-item tg-desc" fill="currentColor" d="M0 9h10l-5 6z" />
    <path class="tg-icon-item tg-icon-item-light tg-desc" fill="currentColor" d="M0 7h10l-5 -6z" />
</svg>
`;

const tree = `
<svg class="tg-icon-tree" pointer-events="none" viewBox="0 0 20 20">
    <path class="tg-tree-item tg-tree-collapsed" fill="currentColor" d="M0,0 l20,10 l-20,10 z" />
    <path class="tg-tree-item tg-tree-expanded" fill="currentColor" d="M0,0 l10,20 l10,-20 z" />
</svg>
`;

const checkbox = `
<svg class="tg-icon-checkbox" pointer-events="none" viewBox="0 0 16 16">
    <path class="tg-checkbox-item tg-checkbox-none" fill="currentColor" d="M0,3 q0,-3 3,-3 h9 q3,0 3,3 v9 q0,3 -3,3 h-9 q-3,0 -3,-3 v-9 zM1,3,v9,q0,2 2,2,h9,q2,0 2,-2,v-9,q0,-2 -2,-2,h-9,q-2,0 -2,2,z" />
    <path class="tg-checkbox-item tg-checkbox-selected" fill="currentColor" d="M0,3 q0,-3 3,-3 h9 q3,0 3,3 v9 q0,3 -3,3 h-9 q-3,0 -3,-3 v-9 zM12,2.5 l-6,8 l-3,-3 l-1,1 l4,4 l7,-9 z" />
    <path class="tg-checkbox-item tg-checkbox-mixed" fill="currentColor" d="M0,3 q0,-3 3,-3 h9 q3,0 3,3 v9 q0,3 -3,3 h-9 q-3,0 -3,-3 v-9 zM2.5,7 v1 h10 v-1 h-10 z" />
</svg>
`;

const radio = '<div class="tg-icon-radio"><div>';

const drag = `
<svg class="tg-icon-row-drag" pointer-events="none" viewBox="0 0 32 32">
    <path fill="currentColor" d="M10 6h4v4h-4zm8 0h4v4h-4zm-8 8h4v4h-4zm8 0h4v4h-4zm-8 8h4v4h-4zm8 0h4v4h-4z"/>
</svg>
`;

const icons = {
    'sort-h': sortH,
    'sort-v': sortV,

    'checkbox': checkbox,
    'radio': radio,

    'drag': drag,

    'tree': tree
};

export default {

    icons: icons,

    getIcon: function(name) {
        let str = icons[name];
        str = String(str).trim();
        return str;
    }

};
