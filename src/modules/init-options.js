import CONST from '../core/const.js';
import Util from '../core/util.js';

export default {

    initOptionHandler: function() {

        //merge option from data.option first
        this.initOptionFromData();

        //must be h or v
        if (this.option.sortIndicator !== 'v') {
            this.option.sortIndicator = 'h';
        }

        this.initOptionFrozen();
        this.initOptionScrollbar();
        this.initOptionContainer();

        this.initBindWindowResize();
        this.initBindContainerResize();

        return this;
    },

    initOptionFromData() {
        const dataOption = this.data.option;
        if (!dataOption) {
            return;
        }
        const list = [this.option, dataOption];
        const t = this.getThemeOptions(dataOption.theme);
        if (t) {
            list.push(t);
        }
        this.option = Util.merge.apply(Util, list);
    },

    initOptionFrozen: function() {
        const o = this.option;

        this.frozenInfo = {
            //index
            column: -1,
            row: -1,
            //length
            columns: 0,
            rows: 0,
            //position
            bottom: Boolean(o.frozenBottom),
            right: Boolean(o.frozenRight)
        };

        //init frozen column
        let fc = Util.toNum(o.frozenColumn, true);
        fc = Util.clamp(fc, -1, o.frozenColumnMax);
        //left private columns fixing, not for right
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


        //init frozen row
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

    initOptionScrollbar: function() {
        const o = this.option;

        if ((o.scrollbarType === 'auto' && Util.isMobile()) || ['mobile', 'touch'].includes(o.scrollbarType)) {
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

    initOptionContainer: function() {

        this.$container.attr('id', this.id);

        const o = this.option;

        // remove previous first
        this.$container.removeClass();

        const list = [CONST.NS, this.id, `tg-${o.theme}`, o.className];

        if (!o.textSelectable) {
            list.push('tg-text-unselectable');
        }

        //console.log(list);
        this.$container.addClass(Util.classMap(list));

    }

};

