import CONST from '../core/const.js';
import {
    escapeHtml, getCachedPatterns, getHighlightMatchScore, getHighlightTexts, getPatternResults, getRanges, setHighlightMatches
} from '../core/highlight.js';
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
        const rowNumberHandler = (rowItem, i, parent) => {
            if (rowNumberFilter.call(this, rowItem, i, parent)) {
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
                rowNumberHandler(rowItem, list_index, parent);

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
            row.tg_formatter = formatter;
            return;
        }

        // default string formatter is not required
        formatter = this.formatters[formatter];
        if (typeof formatter === 'function') {
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

    highlightKeywordsFilter: function(rowItem, columns, patterns) {

        const highlightOptions = this.options.highlightKeywords;
        const { textGenerator, scoreKey } = highlightOptions;

        // clean matched cache
        for (const id of columns) {
            rowItem[`${CONST.HIGHLIGHT_KEY}${id}`] = null;
        }
        if (scoreKey) {
            rowItem[scoreKey] = 0;
        }

        const {
            normalizedPatterns, positivePatterns, hasCustomMatcher
        } = getCachedPatterns(this, patterns, highlightOptions);
        // keep immutable positive patterns in the instance for the asynchronous highlighter
        this.highlightKeywords = positivePatterns;
        if (!normalizedPatterns.length) {
            return true;
        }

        const texts = getHighlightTexts(this, rowItem, columns, textGenerator, hasCustomMatcher);

        // First determine row visibility without generating every match range.
        const { patternResults, isMatched } = getPatternResults(
            this, normalizedPatterns, texts, rowItem, highlightOptions.matchMode
        );
        if (!isMatched) {
            return false;
        }

        const positiveResults = patternResults.filter((item) => !item.negated);
        // ranges are only consumed by scoring, defer them until scoring is enabled
        setHighlightMatches(rowItem, positiveResults, Boolean(scoreKey));
        if (scoreKey) {
            rowItem[scoreKey] = getHighlightMatchScore(positiveResults);
        }
        return true;

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
        highlightCells.forEach((highlightCell) => {
            const cellNode = highlightCell.cellNode || highlightCell;
            const cellPatterns = highlightCell.patterns || keywords;

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

            this.highlightTextNodes(allTextNodes, cellPatterns);

        });
    },

    highlightTextNodes: function(allTextNodes, patterns) {

        const { highlightPre, highlightPost } = this.options.highlightKeywords;
        const texts = allTextNodes.map((textNode) => textNode.textContent);
        const fullText = texts.join('');
        let textOffset = 0;
        const nodeInfos = allTextNodes.map((textNode, index) => {
            const text = texts[index];
            const start = textOffset;
            textOffset += text.length;
            return {
                textNode,
                text,
                start,
                end: textOffset,
                ranges: []
            };
        });

        const ranges = getRanges(fullText, patterns);
        if (!ranges.length) {
            return;
        }

        let previousEnd = 0;
        let nodeIndex = 0;
        ranges.forEach((range) => {
            // Keep the existing overlap behavior: the first (longest) range wins.
            if (range.start < previousEnd) {
                return;
            }
            previousEnd = range.end;

            while (nodeIndex < nodeInfos.length && nodeInfos[nodeIndex].end <= range.start) {
                nodeIndex += 1;
            }

            let currentIndex = nodeIndex;
            while (currentIndex < nodeInfos.length && nodeInfos[currentIndex].start < range.end) {
                const nodeInfo = nodeInfos[currentIndex];
                const start = Math.max(range.start, nodeInfo.start);
                const end = Math.min(range.end, nodeInfo.end);
                if (start < end) {
                    nodeInfo.ranges.push({
                        start: start - nodeInfo.start,
                        end: end - nodeInfo.start
                    });
                }
                currentIndex += 1;
            }
        });
        nodeInfos.forEach(({
            textNode, text, ranges: nodeRanges
        }) => {
            if (!nodeRanges.length) {
                return;
            }

            const list = [];
            let startPos = 0;
            nodeRanges.forEach((range) => {
                list.push(escapeHtml(text.slice(startPos, range.start)));
                list.push(highlightPre);
                list.push(escapeHtml(text.slice(range.start, range.end)));
                list.push(highlightPost);
                startPos = range.end;
            });
            list.push(escapeHtml(text.slice(startPos)));

            const spanNode = document.createElement('span');
            spanNode.innerHTML = list.join('');
            textNode.parentNode.replaceChild(spanNode, textNode);
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
