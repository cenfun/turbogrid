import $ from '../core/query.js';
import Util from '../core/util.js';
import EventBase from '../core/event-base.js';
import Scrollbar from './scrollbar.js';

const EVENT = {
    CHANGE: 'change'
};

export default class ScrollPane extends EventBase {

    static EVENT = EVENT;

    visible = true;

    constructor(container, name) {
        super();
        this.id = Util.uid(4, `tg-scroll-pane-${name}-`);

        this.gradientInfo = [];

        this.$container = $(container).attr('id', this.id);
        this.$container.addClass('tg-scroll-pane');
        this.$scrollView = this.$container.find('.tg-scroll-view');
        this.$scrollBody = this.$scrollView.find('.tg-scroll-body');

        //h scrollbar bottom
        this.scrollbarH = new Scrollbar(Scrollbar.H, this.$container);
        this.scrollbarH.bind(Scrollbar.EVENT.CHANGE, (e, d) => {
            this.scrollHChangeHandler();
        });

        //v scrollbar right
        this.scrollbarV = new Scrollbar(Scrollbar.V, this.$container);
        this.scrollbarV.bind(Scrollbar.EVENT.CHANGE, (e, d) => {
            this.scrollVChangeHandler();
        });

        this.options = this.generateOptions();

    }

    generateOptions(options) {
        const defaultOptions = {
            scrollbarH: {},
            scrollbarV: {},
            scrollbarFade: false,
            scrollSizeOnKeyPress: 20,
            gradient: 30
        };

        return Util.merge(defaultOptions, options);
    }

    //==========================================================================

    show() {
        this.$container.show();
        this.visible = true;
        return this;
    }

    hide() {
        this.$container.hide();
        this.visible = false;
        return this;
    }

    //==========================================================================

    width() {
        return this.scrollPaneW;
    }

    height() {
        return this.scrollPaneH;
    }

    //==========================================================================

    render(options) {
        if (!this.visible) {
            return this;
        }
        this.options = this.generateOptions(options);
        this.update();
        return this;
    }

    update() {
        this.scrollPaneW = this.options.scrollPaneW;
        this.scrollPaneH = this.options.scrollPaneH;
        this.scrollBodyW = this.options.scrollBodyW;
        this.scrollBodyH = this.options.scrollBodyH;

        this.updateScrollbar();
    }

    //==========================================================================
    //set sync group list

    setGroupH(list) {
        this.groupH = Util.toList(list);
    }

    setGroupV(list) {
        this.groupV = Util.toList(list);
    }

    //==========================================================================
    //sync to list

    updateGroupH() {
        if (!Util.isList(this.groupH)) {
            return this;
        }
        const positionH = this.scrollbarH.getPosition();
        this.groupH.forEach(function(scrollPane) {
            if (!scrollPane) {
                return;
            }
            scrollPane.updateScrollHFromGroup(positionH);
        });
        return this;
    }

    updateGroupV() {
        if (!Util.isList(this.groupV)) {
            return this;
        }
        const positionV = this.scrollbarV.getPosition();
        this.groupV.forEach(function(scrollPane) {
            if (!scrollPane) {
                return;
            }
            scrollPane.updateScrollVFromGroup(positionV);
        });
        return this;
    }

    updateGroupList() {
        this.updateGroupH();
        this.updateGroupV();
    }

    //==========================================================================
    //sync from group scrollPane

    updateScrollHFromGroup(positionH) {
        const posH = this.scrollbarH.getPosition();
        if (posH === positionH) {
            return;
        }
        this.scrollbarH.setPosition(positionH);
        this.updateScrollLeft();
        this.triggerEvent();
    }

    updateScrollVFromGroup(positionV) {
        const posV = this.scrollbarV.getPosition();
        if (posV === positionV) {
            return;
        }
        this.scrollbarV.setPosition(positionV);
        this.updateScrollTop();
        this.triggerEvent();
    }

    //==========================================================================

    //set position from outside
    setPosition(scrollLeft, scrollTop) {
        this.scrollbarH.setPosition(scrollLeft);
        this.scrollbarV.setPosition(scrollTop);

        this.updateScrollLeft();
        this.updateScrollTop();

        this.updateGroupList();

        return this;
    }

    //==========================================================================

    updateScrollbar() {

        //set options for calculation
        this.scrollbarH.updateOptions(this.options.scrollbarH);
        this.scrollbarV.updateOptions(this.options.scrollbarV);

        //start to calculate state and size
        this.updateScrollState();
        this.updateScrollView();
        this.updateScrollTrack();

        //update new size
        this.scrollbarH.updateSize(this.scrollViewW, this.scrollBodyW, this.scrollTrackW);
        this.scrollbarV.updateSize(this.scrollViewH, this.scrollBodyH, this.scrollTrackH);

        //update visible and set with last position
        if (this.hasScrollH) {
            this.scrollbarH.show();
            this.scrollbarH.setPosition(this.scrollbarH.getPosition());
        } else {
            this.scrollbarH.hide();
        }
        if (this.hasScrollV) {
            this.scrollbarV.show();
            this.scrollbarV.setPosition(this.scrollbarV.getPosition());
        } else {
            this.scrollbarV.hide();
        }

        this.updateScrollLeft();
        this.updateScrollTop();

        this.updateGroupList();

    }

    updateScrollState() {

        const scrollbarSizeH = this.scrollbarH.getSize();
        const scrollbarSizeV = this.scrollbarV.getSize();

        const blankH = this.scrollbarH.getBlank();
        const blankV = this.scrollbarV.getBlank();

        const fade = this.options.scrollbarFade;

        //========================================
        //scrollH fixing
        let hasScrollH = false;
        let scrollSizeH = 0;
        const scrollHHandler = function() {
            if (this.scrollPaneW < this.scrollBodyW || blankH) {
                hasScrollH = true;
                scrollSizeH = scrollbarSizeH;
                if (fade) {
                    scrollSizeH = 0;
                }
            }
        };
        scrollHHandler.call(this);

        //========================================
        //scrollV fixing
        let hasScrollV = false;
        let scrollSizeV = 0;
        const scrollVHandler = function() {
            if (this.scrollPaneH < this.scrollBodyH + scrollSizeH || blankV) {
                hasScrollV = true;
                scrollSizeV = scrollbarSizeV;
                if (fade) {
                    scrollSizeV = 0;
                }
                //scrollH fixing again for scrollSizeV change
                if (!hasScrollH && this.scrollPaneW < this.scrollBodyW + scrollSizeV) {
                    hasScrollH = true;
                    scrollSizeH = scrollbarSizeH;
                    if (fade) {
                        scrollSizeH = 0;
                    }
                }
            }
        };
        scrollVHandler.call(this);

        //========================================
        this.hasScrollH = hasScrollH;
        this.hasScrollV = hasScrollV;

        this.scrollSizeH = scrollSizeH;
        this.scrollSizeV = scrollSizeV;

    }

    updateScrollView() {

        this.scrollViewW = this.scrollPaneW;
        if (this.hasScrollV) {
            this.scrollViewW = this.scrollPaneW - this.scrollSizeV;
        }
        this.scrollViewH = this.scrollPaneH;
        if (this.hasScrollH) {
            this.scrollViewH = this.scrollPaneH - this.scrollSizeH;
        }

        const blankH = this.scrollbarH.getBlank();
        const blankV = this.scrollbarV.getBlank();

        //blank type fixing
        let width = this.scrollViewW;
        if (blankV && blankV !== true) {
            width = this.scrollPaneW;
        }

        let height = this.scrollViewH;
        if (blankH && blankH !== true) {
            height = this.scrollPaneH;
        }

        this.$scrollView.css({
            width: `${width}px`,
            height: `${height}px`
        });

        return this;
    }

    updateScrollTrack() {
        this.scrollTrackW = this.scrollViewW;
        this.scrollTrackH = this.scrollViewH;
        if (!this.options.scrollbarFade) {
            return;
        }
        //only for both visible
        if (this.hasScrollH && this.hasScrollV) {
            this.scrollTrackW -= this.scrollbarV.getSize();
            this.scrollTrackH -= this.scrollbarH.getSize();
        }
    }

    //==========================================================================

    fade(fadeIn) {
        const doneH = this.scrollbarH.fade(fadeIn);
        const doneV = this.scrollbarV.fade(fadeIn);
        //all need call
        return doneH || doneV;
    }

    hasScrollbar() {
        if (!this.visible) {
            return false;
        }
        if (!this.hasScrollH && !this.hasScrollV) {
            return false;
        }
        if (!this.scrollbarV.getSize() && !this.scrollbarH.getSize()) {
            return false;
        }
        return true;
    }

    //==========================================================================

    updateScrollLeft() {
        const scrollLeft = this.getScrollLeft();

        this.$scrollBody.css('left', `${-scrollLeft}px`);

        this.updateGradient();
        return this;
    }

    updateScrollTop() {
        const scrollTop = this.getScrollTop();

        const scrollTopOffset = this.getScrollTopOffset();
        const top = scrollTop - scrollTopOffset;

        this.$scrollBody.css('top', `${-top}px`);

        this.updateGradient();
        return this;
    }

    updateGradient() {
        const os = this.options;
        if (!os.scrollbarFade) {
            return;
        }
        const gradient = os.gradient;
        if (!gradient) {
            return;
        }
        if (!this.asyncUpdateGradient) {
            this.asyncUpdateGradient = Util.microtask(this.updateGradientSync);
        }
        this.asyncUpdateGradient.apply(this, arguments);
    }

    updateGradientSync() {
        const gradientInfo = [];

        const gradient = this.options.gradient;
        const scrollLeft = this.getScrollLeft();
        const scrollTop = this.getScrollTop();

        const maxLeft = this.getMaxScrollLeft();
        const maxTop = this.getMaxScrollTop();

        if (this.hasScrollH) {
            if (scrollLeft > gradient) {
                gradientInfo.push('left');
            }
            if (scrollLeft < maxLeft - gradient) {
                gradientInfo.push('right');
            }
        }

        if (this.hasScrollV) {
            if (scrollTop > gradient) {
                gradientInfo.push('top');
            }
            if (scrollTop < maxTop - gradient) {
                gradientInfo.push('bottom');
            }
        }

        if (gradientInfo.join('') === this.gradientInfo.join('')) {
            return;
        }
        this.gradientInfo = gradientInfo;

        //remove and add tg-gradient class
        ['left', 'right', 'top', 'bottom'].forEach((item) => {
            const className = `tg-gradient-${item}`;
            if (gradientInfo.includes(item)) {
                this.$container.addClass(className);
            } else {
                this.$container.removeClass(className);
            }
        });

    }

    getScrollLeft() {
        return this.scrollbarH.getPosition();
    }

    getScrollTop() {
        return this.scrollbarV.getPosition();
    }

    getMaxScrollLeft() {
        return this.scrollbarH.getMaxPosition();
    }

    getMaxScrollTop() {
        return this.scrollbarV.getMaxPosition();
    }

    // max height fixing for IE
    getScrollTopOffset() {
        const scrollTop = this.getScrollTop();

        //max size, bigger than 8K screen
        const top = scrollTop % 10000;
        return scrollTop - top;
    }

    triggerEvent() {
        this.trigger(EVENT.CHANGE, {
            scrollLeft: this.getScrollLeft(),
            scrollTop: this.getScrollTop()
        });
    }

    //==========================================================================

    scrollHChangeHandler() {
        this.updateScrollLeft();
        this.updateGroupList();
        this.triggerEvent();
    }

    scrollVChangeHandler() {
        this.updateScrollTop();
        this.updateGroupList();
        this.triggerEvent();
    }

    //==========================================================================
    //set offset from mouse wheel, key up/down/left/right, page up/page down/home/end
    setOffsetH(offset) {
        const scrollLeft = this.getScrollLeft();
        this.scrollbarH.setOffset(offset);
        const newScrollLeft = this.getScrollLeft();
        if (newScrollLeft === scrollLeft) {
            return false;
        }
        this.updateScrollLeft();
        this.updateGroupList();
        this.triggerEvent();
        return true;
    }

    setOffsetV(offset) {
        const scrollTop = this.getScrollTop();
        this.scrollbarV.setOffset(offset);
        const newScrollTop = this.getScrollTop();
        if (newScrollTop === scrollTop) {
            return false;
        }
        this.updateScrollTop();
        this.updateGroupList();
        this.triggerEvent();
        return true;
    }

    //==========================================================================

    mouseWheelHandler(e) {

        const deltaX = e.deltaX;
        const deltaY = e.deltaY;

        const dx = Math.abs(deltaX);
        const dy = Math.abs(deltaY);

        //only choose one direction
        if (dx > dy) {
            if (this.hasScrollH) {
                return this.setOffsetH(deltaX);
            }
        } else {
            if (this.hasScrollV) {
                return this.setOffsetV(deltaY);
            }
            if (this.hasScrollH && !dx) {
                return this.setOffsetH(deltaY);
            }
        }

        return false;
    }

    //==========================================================================

    keyPageUpHandler(e) {
        return this.setOffsetV(-this.scrollViewH);
    }

    keyPageDownHandler(e) {
        return this.setOffsetV(this.scrollViewH);
    }

    keyEndHandler(e) {
        return this.setOffsetV(this.scrollBodyH);
    }

    keyHomeHandler(e) {
        return this.setOffsetV(-this.scrollBodyH);
    }

    //==========================================================================

    keyLeftHandler(e) {
        return this.setOffsetH(-this.options.scrollSizeOnKeyPress);
    }

    keyUpHandler(e) {
        return this.setOffsetV(-this.options.scrollSizeOnKeyPress);
    }

    keyRightHandler(e) {
        return this.setOffsetH(this.options.scrollSizeOnKeyPress);
    }

    keyDownHandler(e) {
        return this.setOffsetV(this.options.scrollSizeOnKeyPress);
    }

    //==========================================================================

    destroy() {
        this.visible = false;
        this.groupH = null;
        this.groupV = null;
        if (this.scrollbarV) {
            this.scrollbarV.destroy();
            this.scrollbarV = null;
        }
        if (this.scrollbarH) {
            this.scrollbarH.destroy();
            this.scrollbarH = null;
        }
        this.$container = null;
        this.$scrollView = null;
        this.$scrollBody = null;
        return this;
    }

}
