import merge from './merge.js';
import EventBase from './event-base.js';
const OptionBase = EventBase.extend({

    option: null,

    getDefaultOption: function() {
        return {};
    },

    getOption: function() {
        if (arguments.length) {
            if (this.option) {
                return this.option[arguments[0]];
            }
            return;
        }
        return this.option;
    },

    setOption: function() {
        const args = Array.from(arguments);
        const defaultOption = this.getDefaultOption.apply(this, args);
        //no arguments returns default
        if (args.length === 0) {
            this.option = defaultOption;
            return this;
        }
        const firstArg = args[0];
        if (args.length === 1) {
            this.option = merge(defaultOption, firstArg);
            return this;
        }
        if (typeof firstArg === 'string') {
            //keep option for single option change
            this.option[firstArg] = args[1];
            return this;
        }
        //multiple options, concat require Array type
        const list = [defaultOption].concat(args);
        this.option = merge.apply(null, list);
        return this;
    }

});

export default OptionBase;
