import sortH from '../icons/sort-h.svg?inline';
import sortV from '../icons/sort-v.svg?inline';
import tree from '../icons/tree.svg?inline';
import checkbox from '../icons/checkbox.svg?inline';
import drag from '../icons/drag.svg?inline';

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
