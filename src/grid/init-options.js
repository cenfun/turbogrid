import CONST from '../core/const.js';
import Util from '../core/util.js';

import defaultFormatters from '../config/default-formatters.js';
import defaultOptions from '../config/default-options.js';
// test if be changed
// setTimeout(function() {
//     console.log(defaultOptions());
// }, 2000);

export default {

    initOptionsHandler: function() {

        // final global options before render
        this.options = this.generateOptions();
        // console.log(this.options);

        this.initOptionsFormatters();

        this.initOptionsSort();
        this.initOptionsFrozen();
        this.initOptionsScrollbar();
        this.initOptionsContainer();

        this.initBindWindowResize();
        this.initBindContainerResize();

        return this;
    },

    generateOptions() {
        // console.log('generateOptions');
        // require function return to create new pure default options
        const dos = defaultOptions();

        // theme options
        const themeOptions = this.generateThemeOptions();

        // merge all options with priority
        return Util.merge(dos, themeOptions, this.constructorOptions, this.customOptions, this.dataOptions);
    },

    generateThemeOptions() {
        // pick last one
        const theme = this.pickOptions('theme').pop();
        if (!theme) {
            return;
        }
        return this.getThemeOptions(theme);
    },

    // only for string or object
    pickOptions(key) {
        return [this.constructorOptions, this.customOptions, this.dataOptions].map((item) => {
            return item && item[key];
        }).filter((item) => item);
    },

    // =============================================================================================

    initOptionsFormatters() {
        // custom list
        let optionsFormatters;
        const formatters = this.pickOptions('formatters');
        if (formatters.length) {
            optionsFormatters = Util.merge.apply(null, formatters);
        }

        // final global formatters before render
        this.formatters = Util.merge(defaultFormatters, optionsFormatters, this.customFormatters);
        // console.log(this.formatters);

        // global null formatter cache to this
        this.nullFormatter = this.getFormatter('null');
    },

    initOptionsSort() {
        // must be h or v
        if (this.options.sortIndicator !== 'v') {
            this.options.sortIndicator = 'h';
        }
    },

    initOptionsFrozen: function() {
        const o = this.options;

        this.frozenInfo = {
            // index
            column: -1,
            row: -1,
            // length
            columns: 0,
            rows: 0,
            // position
            bottom: Boolean(o.frozenBottom),
            right: Boolean(o.frozenRight)
        };

        // init frozen column
        let fc = Util.toNum(o.frozenColumn, true);
        fc = Util.clamp(fc, -1, o.frozenColumnMax);
        // left private columns fixing, not for right
        if (fc > -1 && !this.frozenInfo.right) {
            if (o.selectVisible) {
                fc += 1;
            }
            if (o.rowDragVisible) {
                fc += 1;
            }
            if (o.rowNumberVisible) {
                fc += 1;
            }
        }
        this.frozenInfo.column = fc;

        if (fc > -1) {
            this.frozenInfo.columns = fc + 1;
        } else {
            this.frozenInfo.columns = 0;
            this.frozenInfo.right = false;
        }


        // init frozen row
        let fr = Util.toNum(o.frozenRow, true);
        fr = Util.clamp(fr, -1, o.frozenRowMax);
        this.frozenInfo.row = fr;

        if (fr > -1) {
            this.frozenInfo.rows = fr + 1;
        } else {
            this.frozenInfo.rows = 0;
            this.frozenInfo.bottom = false;
        }

    },

    initOptionsScrollbar: function() {
        const o = this.options;

        if ((o.scrollbarType === 'auto' && Util.isTouchDevice()) || ['touch', 'mobile'].includes(o.scrollbarType)) {
            o.scrollbarFade = true;
            o.scrollbarSize = 6;
            o.scrollbarRound = true;
        }

        const size = Util.toNum(o.scrollbarSize);
        this.scrollbarSizeH = size;
        if (Util.isNum(o.scrollbarSizeH)) {
            this.scrollbarSizeH = o.scrollbarSizeH;
        }

        this.scrollbarSizeV = size;
        if (Util.isNum(o.scrollbarSizeV)) {
            this.scrollbarSizeV = o.scrollbarSizeV;
        }

    },

    initOptionsContainer: function() {

        this.$container.attr('id', this.id);

        const o = this.options;

        // remove previous first
        this.$container.removeClass();

        const list = [CONST.NS, this.id, `tg-${o.theme}`, o.className];

        if (!o.textSelectable) {
            list.push('tg-text-unselectable');
        }

        if (Util.isTouchDevice()) {
            list.push('tg-touch-device');
        }

        // console.log(list);
        this.$container.addClass(Util.classMap(list));

    }

};

