import E from '../core/event-types.js';
import Util from '../core/util.js';

export default {

    //for reset all
    reset: function() {

        this.firstUpdated = false;
        this.headerCreated = false;

        Util.cancelAsync(this);
        Util.removePreProps(this, 'previous');

        this.removeSortColumn();

        //init
        this.columns = null;
        this.columnsInfo = null;

        this.viewColumns = null;
        this.viewAllColumns = null;
        this.viewGroupColumns = null;

        this.rows = null;
        this.rowsInfo = null;

        this.viewRows = null;

        this.headerRowItem = null;
        this.protectedItem = null;

        //column cache
        this.selectColumn = null;
        this.rowDragColumn = null;
        this.rowNumberColumn = null;
        this.blankColumn = null;

        this.sortColumn = null;

        this.nullFormatter = null;

        this.frozenRowsHeight = 0;
        this.totalRowsHeight = 0;
        this.scrollRowsHeight = 0;

        //to rebuild css rules
        this.bodyWidthL = 0;
        this.bodyWidthR = 0;

        //to clean size cache
        this.bodyHeightT = 0;
        this.bodyHeightB = 0;

        this.paneWidthL = 0;
        this.paneWidthR = 0;
        this.paneHeightT = 0;
        this.paneHeightB = 0;

        //reset scroll state
        this.scrollLeft = 0;
        this.scrollTop = 0;
        this.scrollTopOffset = 0;

        return this;
    },

    destroy: function() {

        // do not destroy twice
        if (this.destroyed) {
            return;
        }
        this.destroyed = true;

        //before destroy
        this.trigger(E.onDestroy);

        this.reset();

        //resize events
        this.unbindWindowResize();
        this.unbindContainerResize();

        //inner events
        this.unbindEvents();
        //outer events
        this.unbind();
        //remove all
        this.delEventListeners();

        //style elements
        this.removeCssRules();

        this.removeScrollPane();

        //remove inner container
        this.container = null;
        if (this.$container) {
            this.$container.remove();
            this.$container = null;
        }


        //just empty outer holder, but do NOT remove it
        this.holder = null;
        if (this.$holder) {
            this.$holder.empty();
            this.$holder = null;
        }

        //global cache
        this.removeCache();

        // starts with $
        Util.removePreProps(this, '$');

        //require for GC after destroy
        this.options = null;
        this.formatters = null;
        this.data = null;

    }

};
