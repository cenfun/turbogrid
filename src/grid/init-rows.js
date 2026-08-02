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

        // rows changed — invalidate cached totalRowsHeight
        this.rowsHeightChanged = true;

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
            // clear stale tg_filtered when no filter is active
            this.forEachRow((rowItem) => {
                rowItem.tg_filtered = false;
            });
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

    // keywords separated by spaces
    // double quotes create single keywords with spaces (inner quotes escaped with \)
    // leading hyphen negates keywords
    // 'case:' makes keywords case-sensitive
    parseKeywords: function(keywordsStr) {
        const parsed = [];
        if (!keywordsStr) {
            return parsed;
        }
        const regex = /(?<=^|\s)(-)?(case:)?(?:"((?:.(?:\\")?)+?)"|([^\s]+))(?=\s|$)/g;
        let match;
        while ((match = regex.exec(keywordsStr))) {
            parsed.push({
                text: match[3]?.replace(/\\"/g, '"') ?? match[4],
                caseSensitive: match[2] === 'case:',
                negate: match[1] === '-'
            });
        }
        return parsed;
    },

    matchKeywords: function(keywords, text) {
        const matches = [];
        const lowerText = text.toLowerCase();
        for (const keyword of keywords) {
            const searchFor = keyword.caseSensitive ? keyword.text : keyword.text.toLowerCase();
            const lowText = keyword.caseSensitive ? text : lowerText;
            const foundIndex = lowText.indexOf(searchFor);
            const found = foundIndex !== -1;
            if (keyword.negate ? found : !found) {
                return null;
            }
            if (!keyword.negate) {
                matches.push({
                    index: foundIndex,
                    length: searchFor.length,
                    text: text.slice(foundIndex, foundIndex + searchFor.length)
                });
            }
        }
        if (matches.length === 0) {
            return null;
        }
        return matches;
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

        const keywords = this.parseKeywords(keywordsStr);
        if (!keywords.length) {
            return true;
        }

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

        let textHandler = function(_rowItem, id) {
            return _rowItem[id];
        };
        if (typeof textGenerator === 'function') {
            textHandler = textGenerator;
        }

        const htmlRegex = /<\/?[a-z][\s\S]*>/i;
        const allMatches = [];
        columns.forEach((id) => {

            const text = textHandler(rowItem, id);
            if (text === null || typeof text === 'undefined') {
                return;
            }

            const str = `${text}`.trim();
            if (!str) {
                return;
            }
            const isHtml = htmlRegex.test(str);
            const htmlText = isHtml ? getHtmlText(str, id) : str;
            const matches = this.matchKeywords(keywords, htmlText);
            if (matches) {
                rowItem[`${highlightKey}${id}`] = true;
                allMatches.push(... matches);
            }
        });
        if (allMatches.length) {
            // keep actual text matches in instance
            this.highlightKeywords = allMatches;
        }

        return allMatches.length !== 0;

    },

    highlightKeywordsHandler: function() {

        const { highlightCells } = this.renderSettings;
        if (!highlightCells.length) {
            return;
        }

        const allMatches = this.highlightKeywords;
        if (!allMatches) {
            return;
        }

        if (!this.asyncHighlightKeywords) {
            this.asyncHighlightKeywords = Util.debounce(this.highlightKeywordsSync, 10);
        }
        this.asyncHighlightKeywords.apply(this, [highlightCells, allMatches]);

    },

    highlightKeywordsSync: function(highlightCells, allMatches) {

        // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API
        // there is no renderSettings in next tick
        highlightCells.forEach((cellNode) => {

            // highlight mark will breaking DOM
            // filter text in svg image
            // filter text in textarea
            const list = Array.from(cellNode.querySelectorAll('svg'))
                .concat(Array.from(cellNode.querySelectorAll('textarea')));
            const treeWalker = document.createTreeWalker(cellNode, NodeFilter.SHOW_TEXT, (node) => {
                if (list.length) {
                    for (const container of list) {
                        if (container.contains(node)) {
                            // NodeFilter.FILTER_REJECT similar to return
                            return NodeFilter.FILTER_SKIP;
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

            this.highlightTextNodes(allTextNodes, allMatches);

        });
    },

    highlightTextNodes: function(allTextNodes, allMatches) {

        const { highlightPre, highlightPost } = this.options.highlightKeywords;

        allTextNodes.forEach((textNode) => {
            const nodeText = textNode.textContent;
            const matches = [];
            const matchedRanges = [];
            allMatches.forEach((match) => {
                // use `text`, as `index` and `length` are not guaranteed in node text
                const index = nodeText.indexOf(match.text);
                if (index !== -1) {
                    const relativeStart = index;
                    const relativeEnd = index + match.text.length;
                    let overlaps = false;
                    for (const range of matchedRanges) {
                        if (range[0] < relativeEnd && range[1] > relativeStart) {
                            overlaps = true;
                            break;
                        }
                    }
                    if (!overlaps) {
                        matches.push({
                            index: relativeStart,
                            length: match.text.length,
                            text: match.text
                        });
                        matchedRanges.push([relativeStart, relativeEnd]);
                    }
                }
            });

            if (matches.length > 0) {
                // reverse index sort
                matches.sort((a, b) => b.index - a.index);
                let highlightedText = nodeText;
                matches.forEach(({
                    index, length, text
                }) => {
                    const before = highlightedText.slice(0, index);
                    const after = highlightedText.slice(index + length);
                    highlightedText = before + highlightPre + text + highlightPost + after;
                });
                const spanNode = document.createElement('span');
                spanNode.innerHTML = highlightedText;
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
