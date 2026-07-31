import sortH from '../icons/sort-h.svg?raw';
import sortV from '../icons/sort-v.svg?raw';
import tree from '../icons/tree.svg?raw';
import checkbox from '../icons/checkbox.svg?raw';
import drag from '../icons/drag.svg?raw';

const radio = '<div class="tg-icon-radio"><div>';

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
