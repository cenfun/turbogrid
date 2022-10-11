import Util from '../core/util.js';
import ScrollPane from '../ui/scroll-pane.js';

export default {

    initScrollPane: function() {
        this.initFrozenStyle();
        this.createScrollPane();
    },

    initFrozenStyle: function() {

        const map = {
            HL: {
                container: this.$paneHL,
                cls: []
            },
            HR: {
                container: this.$paneHR,
                cls: []
            },
            TL: {
                container: this.$paneTL,
                cls: []
            },
            TR: {
                container: this.$paneTR,
                cls: []
            },
            BL: {
                container: this.$paneBL,
                cls: []
            },
            BR: {
                container: this.$paneBR,
                cls: []
            }
        };

        const selectorFrozenH = 'tg-frozen-h';
        if (this.frozenInfo.rows) {
            if (this.frozenInfo.bottom) {
                map.BL.cls.push(selectorFrozenH);
                map.BR.cls.push(selectorFrozenH);
            } else {
                map.TL.cls.push(selectorFrozenH);
                map.TR.cls.push(selectorFrozenH);
            }
        }

        const selectorFrozenV = 'tg-frozen-v';
        const selectorFrozenLineV = 'tg-frozen-line-v';
        if (this.frozenInfo.columns) {
            if (this.frozenInfo.right) {
                map.HR.cls.push(selectorFrozenV);
                map.TR.cls.push(selectorFrozenV);
                map.BR.cls.push(selectorFrozenV);
            } else {
                map.HL.cls.push(selectorFrozenV);
                map.TL.cls.push(selectorFrozenV);
                map.BL.cls.push(selectorFrozenV);
            }

            map.HL.cls.push(selectorFrozenLineV);
            map.TL.cls.push(selectorFrozenLineV);
            map.BL.cls.push(selectorFrozenLineV);

        }

        //console.log(map);

        const selectorFrozen = 'tg-frozen';
        const selectorAll = [selectorFrozen, selectorFrozenH, selectorFrozenV, selectorFrozenLineV].join(' ');
        Object.keys(map).forEach(function(k) {
            const item = map[k];
            const container = item.container;
            container.removeClass(selectorAll);

            const cls = item.cls;
            if (!cls.length) {
                return;
            }
            //frozen row style
            const selectorNew = [selectorFrozen].concat(cls).join(' ');
            container.addClass(selectorNew);
            //console.log("new", selectorNew);
        });

    },

    //=============================================================================================

    //init all scrollPane
    createScrollPane: function() {

        //remove previous scrollPane
        this.removeScrollPane();

        //create new scrollPane
        this.scrollPaneMap = {
            HL: new ScrollPane(this.$paneHL, 'header-left'),
            HR: new ScrollPane(this.$paneHR, 'header-right'),
            TL: new ScrollPane(this.$paneTL, 'top-left'),
            TR: new ScrollPane(this.$paneTR, 'top-right'),
            BL: new ScrollPane(this.$paneBL, 'bottom-left'),
            BR: new ScrollPane(this.$paneBR, 'bottom-right')
        };

        //sync scrollPane team
        //h sync handler, with header
        //for right
        this.scrollPaneMap.BR.setGroupH([this.scrollPaneMap.HR, this.scrollPaneMap.TR]);
        this.scrollPaneMap.TR.setGroupH([this.scrollPaneMap.HR, this.scrollPaneMap.BR]);
        //for left
        this.scrollPaneMap.BL.setGroupH([this.scrollPaneMap.HL, this.scrollPaneMap.TL]);
        this.scrollPaneMap.TL.setGroupH([this.scrollPaneMap.HL, this.scrollPaneMap.BL]);

        //v sync handler
        //for bottom
        this.scrollPaneMap.BR.setGroupV(this.scrollPaneMap.BL);
        this.scrollPaneMap.BL.setGroupV(this.scrollPaneMap.BR);
        //for top frozen bottom case
        this.scrollPaneMap.TR.setGroupV(this.scrollPaneMap.TL);
        this.scrollPaneMap.TL.setGroupV(this.scrollPaneMap.TR);

        this.initActiveScrollPane();
        this.initPaneVisibility();

    },

    //active scrollPane and frozen scrollPane (for scrollPaneHidden key left/right handler)
    initActiveScrollPane: function() {
        const vp = this.getScrollPaneVP();
        const hp = this.getScrollPaneHP();

        //scrollPane.BR, scrollPane.BL, scrollPane.TR, scrollPane.TL

        //scrollPane
        const key = `${vp}${hp}`;

        this.scrollPane = this.scrollPaneMap[key];
        this.scrollPane.bind(ScrollPane.EVENT.CHANGE, (e, d) => {
            this.scrollPaneChangeHandler(e, d);
        });

        //scrollPaneFrozen
        let map = {
            L: 'L',
            R: 'L'
        };
        if (this.frozenInfo.columns && this.frozenInfo.right) {
            map = {
                L: 'R',
                R: 'L'
            };
        }
        const keyFrozen = `${vp}${map[hp]}`;
        this.scrollPaneFrozen = this.scrollPaneMap[keyFrozen];

    },

    //======================================================================================

    getScrollPaneVP: function() {
        if (this.frozenInfo.rows && !this.frozenInfo.bottom) {
            return 'B';
        }
        return 'T';
    },

    getScrollPaneHP: function() {
        if (this.frozenInfo.columns && !this.frozenInfo.right) {
            return 'R';
        }
        return 'L';
    },

    initPaneVisibility: function() {

        this.scrollPaneMap.HL.show();
        this.scrollPaneMap.TL.show();

        if (this.frozenInfo.columns) {

            this.scrollPaneMap.HR.show();
            this.scrollPaneMap.TR.show();

            if (this.frozenInfo.rows) {
                this.scrollPaneMap.BL.show();
                this.scrollPaneMap.BR.show();
            } else {
                this.scrollPaneMap.BL.hide();
                this.scrollPaneMap.BR.hide();
            }
        } else {

            this.scrollPaneMap.HR.hide();
            this.scrollPaneMap.TR.hide();
            this.scrollPaneMap.BR.hide();

            if (this.frozenInfo.rows) {
                this.scrollPaneMap.BL.show();
            } else {
                this.scrollPaneMap.BL.hide();
            }
        }

    },

    //=============================================================================================

    scrollPaneChangeHandler: function(e, d) {
        //hide column line when starting touch scroll
        this.hideColumnLine();

        this.scrollLeft = d.scrollLeft;
        this.scrollTop = d.scrollTop;
        this.scrollRenderHandler();
    },

    scrollbarFadeInOutHandler: function(e, enter) {
        if (!this.option.scrollbarFade) {
            return;
        }
        if (enter) {
            this.updateScrollPaneFade(true);
            return;
        }
        if (this.option.scrollbarFadeTimeout) {
            return;
        }
        this.updateScrollPaneFade(false);
    },

    updateScrollPaneFade: function(fadeIn) {
        //always check, first time will call directly
        if (!this.option.scrollbarFade) {
            return;
        }
        this.updateScrollPaneFadeSync(fadeIn);
        const timeout = this.option.scrollbarFadeTimeout;
        if (!timeout) {
            return;
        }
        clearTimeout(this.timeout_fade);
        this.timeout_fade = setTimeout(() => {
            this.updateScrollPaneFadeSync(false);
        }, timeout);
    },

    updateScrollPaneFadeSync: function(fadeIn) {
        if (this.previousScrollbarFadeIn === fadeIn) {
            return;
        }
        this.previousScrollbarFadeIn = fadeIn;

        const list = [];
        Object.keys(this.scrollPaneMap).forEach((key) => {
            const sp = this.scrollPaneMap[key];
            if (sp.hasScrollbar()) {
                list.push(sp);
            }
        });

        if (!list.length) {
            return;
        }

        list.forEach(function(pane) {
            pane.fade(fadeIn);
        });
    },

    //=============================================================================================
    //update

    updateScrollPane: function() {

        const sbo = this.getScrollbarOption();
        this.scrollPaneMap.HL.render(this.getScrollPaneOption({
            scrollPaneW: this.paneWidthL,
            scrollPaneH: this.headerHeight,
            scrollBodyW: this.bodyWidthL,
            scrollBodyH: this.headerHeight,
            scrollbarV: sbo.HLV,
            scrollbarH: sbo.HLH
        }));
        this.scrollPaneMap.HR.render(this.getScrollPaneOption({
            scrollPaneW: this.paneWidthR,
            scrollPaneH: this.headerHeight,
            scrollBodyW: this.bodyWidthR,
            scrollBodyH: this.headerHeight,
            scrollbarV: sbo.HRV,
            scrollbarH: sbo.HRH
        }));

        this.scrollPaneMap.TL.render(this.getScrollPaneOption({
            scrollPaneW: this.paneWidthL,
            scrollPaneH: this.paneHeightT,
            scrollBodyW: this.bodyWidthL,
            scrollBodyH: this.bodyHeightT,
            scrollbarV: sbo.TLV,
            scrollbarH: sbo.TLH
        }));
        this.scrollPaneMap.TR.render(this.getScrollPaneOption({
            scrollPaneW: this.paneWidthR,
            scrollPaneH: this.paneHeightT,
            scrollBodyW: this.bodyWidthR,
            scrollBodyH: this.bodyHeightT,
            scrollbarV: sbo.TRV,
            scrollbarH: sbo.TRH
        }));

        this.scrollPaneMap.BL.render(this.getScrollPaneOption({
            scrollPaneW: this.paneWidthL,
            scrollPaneH: this.paneHeightB,
            scrollBodyW: this.bodyWidthL,
            scrollBodyH: this.bodyHeightB,
            scrollbarV: sbo.BLV,
            scrollbarH: sbo.BLH
        }));
        this.scrollPaneMap.BR.render(this.getScrollPaneOption({
            scrollPaneW: this.paneWidthR,
            scrollPaneH: this.paneHeightB,
            scrollBodyW: this.bodyWidthR,
            scrollBodyH: this.bodyHeightB,
            scrollbarV: sbo.BRV,
            scrollbarH: sbo.BRH
        }));

        //update scroll position if column resize and scroll position is max right or bottom
        this.scrollLeft = this.getScrollLeft();
        this.scrollTop = this.getScrollTop();

        //first time update fade after rendered
        this.updateScrollPaneFade(Boolean(this.option.scrollbarFadeTimeout));

    },

    getScrollPaneOption: function(spo) {
        const o = this.option;
        spo.scrollbarFade = o.scrollbarFade;
        spo.gradient = Util.clamp(Util.toNum(o.scrollPaneGradient, true), 0, 100);
        return spo;
    },

    getScrollbarOption: function() {

        const round = this.option.scrollbarRound;

        //blank:
        //false: without blank (default)
        //true: with blank, without scroll view extension
        //1: with blank, with scroll view extension

        const sbs = [
            //header
            'HLH',
            'HLV',
            'HRH',
            'HRV',

            //top
            'TLH',
            'TLV',
            'TRH',
            'TRV',

            //bottom
            'BLH',
            'BLV',
            'BRH',
            'BRV'
        ];

        const sbo = {};
        //default scrollPane option
        sbs.forEach(function(k) {
            sbo[k] = {
                size: 0,
                round: round,
                blank: false
            };
        });
        this.scrollbarOptionHandler(sbo);
        this.scrollbarFadeHandler(sbo);
        return sbo;
    },

    scrollbarOptionHandler: function(sbo) {

        const sizeH = this.scrollbarSizeH;
        const sizeV = this.scrollbarSizeV;

        //always handle header
        this.scrollbarHeaderHandler(sbo, sizeH, sizeV);

        if (this.frozenInfo.columns) {
            if (this.frozenInfo.rows) {
                this.scrollbarC1R1Handler(sbo, sizeH, sizeV);
            } else {
                this.scrollbarC1R0Handler(sbo, sizeH, sizeV);
            }
        } else {
            if (this.frozenInfo.rows) {
                this.scrollbarC0R1Handler(sbo, sizeH, sizeV);
            } else {
                this.scrollbarC0R0Handler(sbo, sizeH, sizeV);
            }
        }
    },

    scrollbarFadeHandler: function(sbo) {
        if (!this.option.scrollbarFade) {
            return;
        }
        for (const k in sbo) {
            if (Util.hasOwn(sbo, k)) {
                const item = sbo[k];
                if (item.size > 0 && item.blank) {
                    item.blank = false;
                    item.size = 0;
                }
            }

        }
    },

    //===============================================
    //header
    scrollbarHeaderHandler: function(sbo, sizeH, sizeV) {
        if (this.hasVScroll) {
            if (this.frozenInfo.columns) {
                sbo.HRV.size = sizeV;
                sbo.HRV.blank = 1;
            } else {
                sbo.HLV.size = sizeV;
                sbo.HLV.blank = 1;
            }
        }
    },

    //===============================================
    //frozen column 0, frozen row 0
    scrollbarC0R0Handler: function(sbo, sizeH, sizeV) {
        sbo.TLH.size = sizeH;
        sbo.TLV.size = sizeV;
    },

    //===============================================
    //frozen column 0, frozen row 1
    scrollbarC0R1Handler: function(sbo, sizeH, sizeV) {
        if (this.frozenInfo.bottom) {
            this.scrollbarC0R1B1Handler(sbo, sizeH, sizeV);
        } else {
            this.scrollbarC0R1B0Handler(sbo, sizeH, sizeV);
        }
    },

    //frozen column 0, frozen row 1, bottom
    scrollbarC0R1B1Handler: function(sbo, sizeH, sizeV) {
        //h
        sbo.BLH.size = sizeH;
        //v
        sbo.TLV.size = sizeV;
        if (this.hasVScroll) {
            sbo.BLV.size = sizeV;
            sbo.BLV.blank = 1;
        }
    },

    //frozen column 0, frozen row 1, top
    scrollbarC0R1B0Handler: function(sbo, sizeH, sizeV) {
        //h
        sbo.BLH.size = sizeH;
        //v
        sbo.BLV.size = sizeV;
        if (this.hasVScroll) {
            sbo.TLV.size = sizeV;
            sbo.TLV.blank = 1;
        }
    },

    //===============================================
    scrollbarC1R0Handler: function(sbo, sizeH, sizeV) {
        if (this.frozenInfo.right) {
            this.scrollbarC1R0R1Handler(sbo, sizeH, sizeV);
        } else {
            this.scrollbarC1R0R0Handler(sbo, sizeH, sizeV);
        }
    },

    //frozen column 1, frozen row 0, right 1
    scrollbarC1R0R1Handler: function(sbo, sizeH, sizeV) {
        //h
        if (this.hasHScroll) {
            sbo.TLH.size = sizeH;
            if (this.scrollPaneHidden) {
                sbo.TRH.size = sizeH;
                sbo.TLH.blank = true;
            } else {
                sbo.TRH.size = sizeH;
                sbo.TRH.blank = true;
            }
        }
        //v
        sbo.TRV.size = sizeV;
    },

    //frozen column 1, frozen row 0, right 0
    scrollbarC1R0R0Handler: function(sbo, sizeH, sizeV) {
        //h
        if (this.hasHScroll) {
            sbo.TRH.size = sizeH;
            if (this.scrollPaneHidden) {
                sbo.TLH.size = sizeH;
                sbo.TRH.blank = true;
            } else {
                sbo.TLH.size = sizeH;
                sbo.TLH.blank = true;
            }
        }
        //v
        sbo.TRV.size = sizeV;
    },

    //===============================================
    //frozen column 1, frozen row 1
    scrollbarC1R1Handler: function(sbo, sizeH, sizeV) {
        if (this.frozenInfo.right) {
            if (this.frozenInfo.bottom) {
                this.scrollbarC1R1R1B1Handler(sbo, sizeH, sizeV);
            } else {
                this.scrollbarC1R1R1B0Handler(sbo, sizeH, sizeV);
            }
        } else {
            if (this.frozenInfo.bottom) {
                this.scrollbarC1R1R0B1Handler(sbo, sizeH, sizeV);
            } else {
                this.scrollbarC1R1R0B0Handler(sbo, sizeH, sizeV);
            }
        }
    },

    //frozen column 1, frozen row 1, right 1, bottom 1
    scrollbarC1R1R1B1Handler: function(sbo, sizeH, sizeV) {
        //h
        if (this.hasHScroll) {
            sbo.BLH.size = sizeH;
            if (this.scrollPaneHidden) {
                sbo.BRH.size = sizeH;
                sbo.BLH.blank = true;
            }
        }
        //v
        sbo.TRV.size = sizeV;
        if (this.hasVScroll) {
            sbo.BRV.size = sizeV;
            sbo.BRV.blank = 1;
        }
    },

    //frozen column 1, frozen row 1, right 1, bottom 0
    scrollbarC1R1R1B0Handler: function(sbo, sizeH, sizeV) {
        //h
        if (this.hasHScroll) {
            sbo.BLH.size = sizeH;
            if (this.scrollPaneHidden) {
                sbo.BRH.size = sizeH;
                sbo.BLH.blank = true;
            } else {
                sbo.BRH.size = sizeH;
                sbo.BRH.blank = true;
            }
        }
        //v
        sbo.BRV.size = sizeV;
        if (this.hasVScroll) {
            sbo.TRV.size = sizeV;
            sbo.TRV.blank = 1;
        }
    },

    //frozen column 1, frozen row 1, right 0, bottom 1
    scrollbarC1R1R0B1Handler: function(sbo, sizeH, sizeV) {
        //h
        if (this.hasHScroll) {
            sbo.BRH.size = sizeH;
            if (this.scrollPaneHidden) {
                sbo.BLH.size = sizeH;
                sbo.BRH.blank = true;
            }
        }
        //v
        sbo.TRV.size = sizeV;
        if (this.hasVScroll) {
            sbo.BRV.size = sizeV;
            sbo.BRV.blank = 1;
        }
    },

    //frozen column 1, frozen row 1, right 0, bottom 0
    scrollbarC1R1R0B0Handler: function(sbo, sizeH, sizeV) {
        //h
        if (this.hasHScroll) {
            sbo.BRH.size = sizeH;
            if (this.scrollPaneHidden) {
                sbo.BLH.size = sizeH;
                sbo.BRH.blank = true;
            } else {
                sbo.BLH.size = sizeH;
                sbo.BLH.blank = true;
            }
        }
        //v
        sbo.BRV.size = sizeV;
        if (this.hasVScroll) {
            sbo.TRV.size = sizeV;
            sbo.TRV.blank = 1;
        }
    },

    //============================================================================================

    removeScrollPane: function() {
        clearTimeout(this.timeout_fade);
        this.previousScrollbarFadeIn = null;
        if (!this.scrollPaneMap) {
            return;
        }
        Object.keys(this.scrollPaneMap).forEach((key) => {
            const sp = this.scrollPaneMap[key];
            if (sp) {
                sp.destroy();
            }
        });
        this.scrollPaneMap = null;
        this.scrollPane = null;
        this.scrollPaneFrozen = null;
    }

};
