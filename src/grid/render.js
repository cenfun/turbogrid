import E from '../core/event-types.js';
import Util from '../core/util.js';

export default {

    render: function() {
        if (!this.asyncRender) {
            this.asyncRender = Util.microtask(this.renderSync);
        }
        this.asyncRender.apply(this, arguments);
    },

    renderSync: function() {

        this.renderStartedTimestamp = Date.now();

        const renderSettings = this.generateRenderSettings.apply(this, arguments);
        // keep in render process
        this.renderSettings = renderSettings;

        // console.log('renderSettings', renderSettings);

        // the render type determines the scope

        // rerender header and body
        // rerender(), setData(), setOption(), setFormatter()
        if (renderSettings.type === 'all') {
            this.flushBody();
            // reset + init options/formatter/columns/viewColumns/rows/onInit/scrollPane/columnLine/events
            this.initHandler();
            this.renderHeader();
            this.updateViewRowsAndSize();
            this.renderBody();
            return this;
        }


        // columns changed
        // column collapsed
        if (renderSettings.type === 'columns') {
            this.flushBody();
            this.initColumnsHandler();
            this.renderHeader();
            this.updateViewRowsAndSize();
            this.renderBody();
            return this;
        }


        // rows === flush rows self partly + update view rows + resize
        // update but self flush (partly)
        // rows changed
        if (renderSettings.type === 'rows') {
            this.updateViewRowsAndSize();
            this.renderBody();
            return this;
        }


        // resize() only resize, no data update
        if (renderSettings.type === 'resize') {
            this.resizeHandler();
            this.renderBody();
            return this;
        }


        // default mini render
        // render scroll area, no data update, no resize
        this.renderBody();

        return this;
    },

    generateRenderSettings: function(settings) {

        const renderSettings = {
            type: this.renderType,
            scrollLeft: null,
            scrollTop: null,
            scrollColumn: null,
            scrollRow: null,
            highlightCells: []
        };

        if (typeof settings === 'string') {
            renderSettings.type = settings;
        } else if (settings) {
            Object.assign(renderSettings, settings);
        }

        if (!this.headerCreated) {
            renderSettings.type = 'all';
        }

        return renderSettings;
    },

    renderBody: function() {

        this.scrollOnInit();

        // update row offset first
        this.scrollTopOffset = this.scrollPane.getScrollTopOffset();

        const viewport = this.getViewport();

        // keep for current viewport property
        this.viewport = viewport;

        // clean out of viewport
        this.flushWithViewport();

        // update top after clear row cache
        if (this.previousScrollTopOffset !== this.scrollTopOffset) {
            this.previousScrollTopOffset = this.scrollTopOffset;
            this.updateRowCacheTopOffset();
        }

        // console.log('viewport rows/columns:', viewport.rows, viewport.columns);
        this.renderRows(viewport.rows);
        this.renderCells(viewport.rows, viewport.columns);

        this.renderUpdatedTimestamp = Date.now();
        this.renderDuration = this.renderUpdatedTimestamp - this.renderStartedTimestamp;
        // console.log(this.renderDuration);

        // updated every time
        // first triggered, because onNextUpdated could be in next events with side effects
        this.trigger(E.onUpdated, viewport);

        // complete only one time
        if (!this.firstUpdated) {
            this.firstUpdated = true;
            this.trigger(E.onFirstUpdated, viewport);
        }

        // update internal layout and outside size if changed
        this.layoutEventHandler();
        this.resizeEventHandler();

        // render highlight keywords
        this.highlightKeywordsHandler();

        // destroy render settings
        this.renderSettings = null;
        this.renderType = null;

        return this;
    },

    rerender: function() {
        this.render('all');
        return this;
    }

};
