
export default {

    keyTabHandler: function(e) {
        // if (e.shiftKey) {
        //     return this.navigatePrev(e);
        // }
        // return this.navigateNext(e);
    },

    keyEnterHandler: function(e) {

    },

    keyEscHandler: function(e) {

    },

    // ============================================================================================

    keyPageUpHandler: function(e) {
        return this.scrollPane.keyPageUpHandler(e);
    },

    keyPageDownHandler: function(e) {
        return this.scrollPane.keyPageDownHandler(e);
    },

    keyEndHandler: function(e) {
        return this.scrollPane.keyEndHandler(e);
    },

    keyHomeHandler: function(e) {
        return this.scrollPane.keyHomeHandler(e);
    },

    // ============================================================================================

    keyLeftHandler: function(e) {
        if (this.scrollPaneHidden) {
            return this.scrollPaneFrozen.keyLeftHandler(e);
        }
        return this.scrollPane.keyLeftHandler(e);
    },

    keyUpHandler: function(e) {
        return this.scrollPane.keyUpHandler(e);
    },

    keyRightHandler: function(e) {
        if (this.scrollPaneHidden) {
            return this.scrollPaneFrozen.keyRightHandler(e);
        }
        return this.scrollPane.keyRightHandler(e);
    },

    keyDownHandler: function(e) {
        return this.scrollPane.keyDownHandler(e);
    }

};
