import $ from '../core/query.js';
import CONST from '../core/const.js';
import Util from '../core/util.js';

import globalStyle from '../theme/theme.scss';
import templateHtml from '../template.html';

export default {

    create: function(options) {

        this.id = Util.uid(4, 'tg-');

        if (!Util.isObject(options)) {
            options = {
                container: options
            };
        }

        this.constructorOptions = options;

        // console.log(options, this.options);

        this.createCache();
        this.createView(options.container);

    },

    createView: function(holder) {
        this.createHolder(holder);
        if (!this.$holder) {
            console.error('ERROR: Grid requires a container');
            return;
        }
        this.createGlobalStyle();
        this.createContainer();
    },

    createHolder: function(holder) {
        const $holder = $(holder);
        if (!$holder.length) {
            return;
        }
        this.$holder = $holder;
        this.$holder.empty();
        this.holder = this.$holder.get(0);

        // created in shadow DOM
        // https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode
        const rootNode = this.holder.getRootNode();
        this.shadowRoot = null;
        // in shadow dom
        if (rootNode && rootNode.host) {
            this.shadowRoot = rootNode;
        }

    },

    createGlobalStyle: function() {
        const root = this.shadowRoot || document.head;

        // already appended
        const prevStyle = root.querySelector(`style[context="${CONST.ID}"]`);
        if (prevStyle) {
            return;
        }

        // append global css to shadow root
        const $style = document.createElement('style');
        $style.setAttribute('context', CONST.ID);
        $style.innerHTML = globalStyle.toString();
        root.appendChild($style);

    },

    createContainer: function() {

        this.$container = $(templateHtml).appendTo(this.$holder);

        // init id for container in order to keep instance, do NOT remove by gc
        this.$container.attr('id', this.id);
        this.$container.addClass(`${CONST.NS} ${this.id}`);

        // cache instance for automation test
        this.container = this.$container.get(0);
        Util.setInstance(this.container, this);

        // ===============================================================

        this.$headerFrame = this.$container.find('.tg-header-frame');

        // ===============================================================
        // for header scrollPane container
        this.$paneHL = this.$headerFrame.find('.tg-pane-header-left');
        this.$paneHR = this.$headerFrame.find('.tg-pane-header-right');

        // Append the column to the headers
        this.$headerL = this.$paneHL.find('.tg-header-left');
        this.$headerR = this.$paneHR.find('.tg-header-right');

        // Cache the header columns
        this.$header = $().add(this.$headerL).add(this.$headerR);

        // ===============================================================

        this.$bodyFrame = this.$container.find('.tg-body-frame');

        // ===============================================================
        // for body scrollPane container
        this.$paneTL = this.$bodyFrame.find('.tg-pane-top-left');
        this.$paneTR = this.$bodyFrame.find('.tg-pane-top-right');
        this.$paneBL = this.$bodyFrame.find('.tg-pane-bottom-left');
        this.$paneBR = this.$bodyFrame.find('.tg-pane-bottom-right');

        // ===============================================================
        this.$bodyTL = this.$paneTL.find('.tg-body-top-left');
        this.$bodyTR = this.$paneTR.find('.tg-body-top-right');
        this.$bodyBL = this.$paneBL.find('.tg-body-bottom-left');
        this.$bodyBR = this.$paneBR.find('.tg-body-bottom-right');

        this.$body = $().add(this.$bodyTL).add(this.$bodyTR).add(this.$bodyBL).add(this.$bodyBR);

        // ===============================================================

        this.$columnLineContainer = this.$container.find('.tg-column-line');
        this.$columnLineItem = this.$columnLineContainer.find('.tg-column-line-item');
        this.$columnLineItemL = this.$columnLineContainer.find('.tg-column-line-l');
        this.$columnLineItemR = this.$columnLineContainer.find('.tg-column-line-r');


        return this;
    }

};
