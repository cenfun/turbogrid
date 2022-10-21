import CONST from '../core/const.js';
import Util from '../core/util.js';

export default {

    // grid css rules
    updateCssRules: function() {

        if (!this.cssRulesInvalid) {
            return;
        }
        this.cssRulesInvalid = false;

        this.initCssRules();

        this.updateColumnsCssRules();
        this.updateHeadersCssRules();

        this.updateStyleElement();

    },

    initCssRules: function() {

        this.cssList = {};
        // cache for display none, calculate column height
        this.cssDisplayCache = {};

        // init row height
        const h = this.getRowHeight();
        const rule = this.createCssRule('.tg-row');
        rule.height = `${h}px`;
        rule['line-height'] = `${h}px`;

    },

    // remove display = none
    resetCssDisplay: function(v) {
        if (!this.cssDisplayCache) {
            return;
        }
        v = v || '';
        for (const k in this.cssDisplayCache) {
            if (Util.hasOwn(this.cssDisplayCache, k)) {
                const rule = this.cssDisplayCache[k];
                rule.style.display = v;
            }
        }
    },


    // ==========================================================================================

    updateColumnsCssRules: function() {
        const columns = this.viewColumns;
        const fc = this.frozenInfo.column;
        // console.log(fc);
        const groups = {};
        let left = 0;
        for (let i = 0, l = columns.length; i < l; i++) {
            const columnItem = columns[i];
            const width = this.getColumnCssWidth(columnItem);
            this.updateCssRuleItem(columnItem.tg_view_index, left, width);
            this.updateParentCssRules(columnItem, left, groups);
            if (i === fc) {
                left = 0;
            } else {
                left += width;
            }
        }
    },

    updateParentCssRules: function(columnItem, left, groups) {
        const parent = columnItem.tg_parent;
        if (!parent) {
            return;
        }

        const index = parent.tg_view_index;
        if (groups[index]) {
            return;
        }

        this.updateCssRuleItem(index, left, parent.tg_width);
        groups[index] = parent;

        // parent's parent
        this.updateParentCssRules(parent, left, groups);

    },

    // ==========================================================================================

    updateHeadersCssRules: function() {

        let bottom = 0;
        const maxLevel = this.columnsInfo.maxLevel;
        for (let i = maxLevel; i >= 0; i--) {
            const h = this.headerLayerHeight[i];
            const rule = this.createCssRule(`.tg-h-${i}`);
            rule.bottom = `${bottom}px`;
            rule.height = `${h}px`;
            bottom += h;
        }

        const combinations = this.getLayerCombinations(maxLevel);
        combinations.forEach((k) => {
            const rule = this.createCssRule(`.tg-h-${k}`);
            let h = 0;
            k.split('').forEach((i) => {
                h += this.headerLayerHeight[i] || 0;
            });
            rule.height = `${h}px`;
            // console.log("combination: " + k + " " + h + "px");
        });

    },

    getLayerCombinations: function(maxIndex) {
        // for test
        // maxIndex = 1;

        let seeds = '';
        while (maxIndex >= 0) {
            seeds += maxIndex;
            maxIndex--;
        }
        // console.log(seeds);
        if (seeds.length < 2) {
            return [];
        }
        const list = [];
        const combine = function(ls, start) {
            const len = ls.length;
            let end = start + 2;
            while (end <= len) {
                const str = ls.substring(start, end);
                list.push(str);
                end++;
            }
            if (start < len - 2) {
                combine(ls, start + 1);
            }
        };
        combine(seeds, 0);
        return list;
    },

    // ==========================================================================================

    updateCssRuleItem: function(i, left, width) {
        const rule = this.createCssRule(`.tg-c-${i}`);
        rule.left = `${left}px`;
        rule.width = `${width}px`;
        if (width === 0) {
            rule.display = 'none';
        } else {
            rule.display = '';
        }
    },

    createCssRule: function(className) {
        const ns = `.${CONST.NS}.${this.id} `;
        const selector = ns + className;
        const rule = {};
        this.cssList[selector] = rule;
        return rule;
    },

    getColumnCssWidth: function(columnItem) {
        let width = columnItem.tg_width;
        if (this.isInvisible(columnItem) || width <= 0) {
            width = 0;
        }
        return width;
    },

    // ==========================================================================================

    updateStyleElement: function() {

        // create style element
        if (!this.styleElement) {
            this.createStyleElement();
        }

        if (this.checkNewCssName()) {
            this.initStyleElement();
        }

        const cssRules = this.getStyleSheetCssRules();
        if (!cssRules) {
            return;
        }
        for (let i = 0, l = cssRules.length; i < l; i++) {
            this.updateRuleProperties(cssRules[i]);
        }
    },

    createStyleElement: function() {
        // append to head is because sometimes container could be appended to another element again
        // like golden layout full size window, and style will be lose
        const root = this.shadowRoot || document.head;

        this.styleElement = document.createElement('style');
        this.styleElement.setAttribute('context', this.id);
        root.appendChild(this.styleElement);
    },

    checkNewCssName: function() {
        if (!this.previousCssList) {
            return true;
        }
        for (const name in this.cssList) {
            if (Util.hasOwn(this.cssList, name)) {
                if (!this.previousCssList[name]) {
                    return true;
                }
            }
        }
        return false;
    },

    initStyleElement: function() {
        const rules = [];
        Object.keys(this.cssList).forEach(function(k) {
            rules.push(`${k}{}`);
        });
        const str = rules.join('\n');
        this.styleElement.innerHTML = str;
        this.previousCssList = this.cssList;
    },

    getStyleSheetCssRules: function() {
        const sheet = this.styleElement.sheet;
        if (!sheet) {
            return;
        }
        return sheet.cssRules;
    },

    updateRuleProperties: function(rule) {
        const selector = `${rule.selectorText}`;
        const css = this.cssList[selector];
        if (!css) {
            return;
        }
        for (const k in css) {
            if (Util.hasOwn(css, k)) {
                const v = css[k];
                rule.style[k] = v;
                if (k === 'display' && v === 'none') {
                    this.cssDisplayCache[selector] = rule;
                }
            }
        }
    },

    // ======================================================================================================
    // for destroy and init options change
    removeCssRules: function() {
        this.previousCssList = null;
        this.cssList = null;
        this.cssDisplayCache = null;
        if (this.styleElement) {
            this.removeNode(this.styleElement);
            this.styleElement = null;
        }
    }

};
