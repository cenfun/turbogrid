import Util from '../core/util.js';

export default {

    // only create rows, diff with init columns
    initRowsHandler: function() {
        this.rows = this.data.rows;
        this.rowsInfo = this.initTreeInfo(this.rows, this.frozenInfo.row);
        // depends others, can NOT create view rows here
        // do NOT create view rows here
        // do NOT init options here
    },

    getRows: function() {
        return this.rows;
    },

    getViewRows: function() {
        return this.viewRows;
    },

    createViewRows: function() {

        this.initRowFilterHandler();

        const viewRows = [];

        // update row index
        const rowNumberFilter = this.getRowNumberFilter();

        let rowNumber = 1;
        const rowNumberHandler = (rowItem, i) => {
            if (rowNumberFilter.call(this, rowItem, i)) {
                rowItem.tg_row_number = rowNumber;
                rowNumber += 1;
                return;
            }
            rowItem.tg_row_number = '';
        };

        const digList = (ls, parent, collapsed) => {
            if (!Util.isList(ls)) {
                return;
            }

            let list_index = 0;
            let list_item;
            ls.forEach((rowItem) => {

                if (this.isInvisible(rowItem)) {
                    return;
                }

                // update list index, both and group (in list)
                rowItem.tg_list_index = list_index;
                list_index += 1;

                rowItem.tg_list_last = false;
                list_item = rowItem;

                // only row formatter
                this.gridRowItemHandler(rowItem);

                // need row number even collapsed, and need frozen info first too
                rowNumberHandler(rowItem, list_index);

                if (!collapsed) {
                    viewRows.push(rowItem);
                }

                const rowCollapsed = collapsed || (rowItem.tg_group && rowItem.collapsed);
                digList(rowItem.subs, rowItem, rowCollapsed);

            });

            if (list_item) {
                list_item.tg_list_last = true;
            }

        };

        digList(this.rows);

        let top = 0;
        let lastItem;
        this.initViewList(viewRows, (rowItem, i) => {
            rowItem.tg_top = top;
            top += this.getRowHeight(rowItem);

            // fix group line
            rowItem.tg_group_line = false;
            if (rowItem.collapsed) {
                rowItem.tg_group_line = true;
            }

            if (lastItem) {
                if (rowItem.tg_group || rowItem.tg_level < lastItem.tg_level) {
                    lastItem.tg_group_line = true;
                }
            }

            lastItem = rowItem;

        });

        this.viewRows = viewRows;
        // console.log(this.viewRows, rows);

        return this;
    },

    getRowNumberFilter: function() {
        const rowNumberFilter = this.options.rowNumberFilter;
        if (typeof rowNumberFilter === 'function') {
            return rowNumberFilter;
        }
        return function(rowItem, i) {
            if (rowItem.tg_group || rowItem.tg_frozen) {
                return false;
            }
            return true;
        };
    },

    // current for formatter
    gridRowItemHandler: function(row) {

        let formatter = row.formatter;
        if (!formatter) {
            return;
        }
        if (typeof formatter === 'function') {
            row.tg_formatter = formatter.bind(this);
            return;
        }

        // default string formatter is not required
        formatter = this.getFormatter(formatter);
        if (formatter) {
            row.tg_formatter = formatter;
        }

    },

    // =============================================================================
    // filter handler

    initRowFilterHandler: function() {

        const rowFilter = this.options.rowFilter;
        if (typeof rowFilter !== 'function') {
            return;
        }

        // return true:visible or false:invisible
        this.forEachRow((rowItem, i, parent) => {

            // already invisible
            if (rowItem.tg_invisible) {
                return;
            }

            // visible rows for filter only
            const filtered = !rowFilter.call(this, rowItem, i, parent);
            rowItem.tg_filtered = filtered;

            // parent should be visible if any sub is visible
            if (!filtered) {
                let current = rowItem;
                while (current.tg_parent) {
                    current.tg_parent.tg_filtered = false;
                    current = current.tg_parent;
                }
            }

        });

        // if user set owner sortColumn, (can call removeSortColumn before)
        if (this.sortColumn) {
            return;
        }

        let rowFilteredSort = this.options.rowFilteredSort;

        // return null, String, Object
        if (typeof rowFilteredSort === 'function') {
            rowFilteredSort = rowFilteredSort.call(this);
        }

        if (!rowFilteredSort) {
            return;
        }

        // String
        if (typeof rowFilteredSort === 'string') {
            rowFilteredSort = {
                sortField: rowFilteredSort,
                sortAsc: this.options.sortAsc
            };
        }

        // Object
        const sortField = rowFilteredSort.sortField || rowFilteredSort.id;
        if (!sortField) {
            return;
        }

        // console.log('rowFilteredSort', rowFilteredSort);

        this.sortRows(sortField, rowFilteredSort);

    },

    highlightKeywordsFilter: function(rowItem, columns, keywordsStr) {

        const {
            textKey, textGenerator, highlightKey
        } = this.options.highlightKeywords;

        // clean matched cache
        columns.forEach((id) => {
            rowItem[`${highlightKey}${id}`] = null;
        });

        if (!keywordsStr) {
            return true;
        }

        const keywords = `${keywordsStr}`.trim().toLowerCase().split(/\s+/g).filter((s) => s);
        if (!keywords.length) {
            return true;
        }

        let hasMatched = false;
        const getTextMatched = (text) => {

            const lowText = text.toLowerCase();

            let startPos = 0;
            for (const key of keywords) {
                const index = lowText.indexOf(key, startPos);
                if (index === -1) {
                    return;
                }
                startPos = index + key.length;
            }

            return true;
        };

        const getHtmlText = (html, id) => {
            const cacheKey = `${textKey}${id}`;
            const cacheText = rowItem[cacheKey];
            if (cacheText) {
                return cacheText;
            }
            const div = document.createElement('div');
            div.innerHTML = html;
            // textContent includes hidden text, but innerText not
            const text = div.innerText;
            rowItem[cacheKey] = text;
            return text;
        };

        const getMatched = (str, id) => {
            const isHtml = (/<\/?[a-z][\s\S]*>/i).test(str);
            if (isHtml) {
                str = getHtmlText(str, id);
            }
            return getTextMatched(str);
        };

        let textHandler = function(_rowItem, id) {
            return _rowItem[id];
        };
        if (typeof textGenerator === 'function') {
            textHandler = textGenerator;
        }

        columns.forEach((id) => {

            const text = textHandler(rowItem, id);
            if (text === null || typeof text === 'undefined') {
                return;
            }

            const str = `${text}`.trim();
            if (!str) {
                return;
            }
            const matched = getMatched(str, id);
            if (matched) {
                rowItem[`${highlightKey}${id}`] = matched;
                hasMatched = true;
                // keep in instance
                this.highlightKeywords = keywords;
            }
        });

        return hasMatched;

    },

    highlightKeywordsHandler: function() {

        const { highlightCells } = this.renderSettings;
        if (!highlightCells.length) {
            return;
        }

        const keywords = this.highlightKeywords;
        if (!keywords) {
            return;
        }

        if (!this.asyncHighlightKeywords) {
            this.asyncHighlightKeywords = Util.debounce(this.highlightKeywordsSync, 10);
        }
        this.asyncHighlightKeywords.apply(this, [highlightCells, keywords]);

    },

    highlightKeywordsSync: function(highlightCells, keywords) {

        // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API
        // there is no renderSettings in next tick
        highlightCells.forEach((cellNode) => {

            // filter text in svg (highlight mark breaking svg image)
            const svgList = Array.from(cellNode.querySelectorAll('svg'));
            const treeWalker = document.createTreeWalker(cellNode, NodeFilter.SHOW_TEXT, (node) => {
                if (svgList.length) {
                    for (const svg of svgList) {
                        if (svg.contains(node)) {
                            return NodeFilter.FILTER_REJECT;
                        }
                    }
                }
                return NodeFilter.FILTER_ACCEPT;
            });
            const allTextNodes = [];
            let currentNode = treeWalker.nextNode();
            while (currentNode) {
                allTextNodes.push(currentNode);
                currentNode = treeWalker.nextNode();
            }

            if (!allTextNodes.length) {
                return;
            }

            this.highlightTextNodes(allTextNodes, keywords);

        });
    },

    highlightTextNodes: function(allTextNodes, keywords) {

        const { highlightPre, highlightPost } = this.options.highlightKeywords;

        let keyIndex = 0;
        const nextKey = () => {
            if (keyIndex >= keywords.length) {
                keyIndex = 0;
            }
            return keywords[keyIndex++];
        };

        let key = nextKey();

        allTextNodes.forEach((textNode) => {
            const text = textNode.textContent;
            const lowText = text.toLowerCase();
            const list = [];
            let startPos = 0;
            const textLength = text.length;
            let hasKeyMatched = false;
            while (startPos < textLength) {
                const index = lowText.indexOf(key, startPos);
                if (index === -1) {
                    break;
                }

                list.push(text.slice(startPos, index));
                list.push(highlightPre);

                startPos = index + key.length;
                key = nextKey();
                hasKeyMatched = true;

                list.push(text.slice(index, startPos));
                list.push(highlightPost);

            }

            if (hasKeyMatched) {
                if (startPos < textLength) {
                    list.push(text.slice(startPos, textLength));
                }
                //  console.log(list);
                const spanNode = document.createElement('span');
                spanNode.innerHTML = list.join('');
                textNode.parentNode.replaceChild(spanNode, textNode);
            }
        });

    },

    // =============================================================================

    // row subs
    setRowSubs: function(rowIndex, subs) {
        const item = this.getRowItem(rowIndex);
        if (!item) {
            return this;
        }
        // update data
        if (Util.isList(subs)) {
            // open subs default
            item.collapsed = false;
        }
        item.subs = subs;
        this.initRowsHandler();
        // render
        this.flushRowFrom(item.tg_view_index);
        this.render('rows');
        return this;
    },

    // dynamic set new row list
    setRows: function(rows) {
        this.data.rows = Util.toList(rows);
        this.initRowsHandler();
        this.flushBody();
        this.render('rows');
    },

    // =============================================================================

    getRowParentSubs: function(rowItem) {
        return rowItem.tg_parent ? rowItem.tg_parent.subs : this.rows;
    }

};
