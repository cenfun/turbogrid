import Grid from './grid/grid.js';

import $ from './core/query.js';
import CONST from './core/const.js';

import EventBase from './core/event-base.js';
import { icons, getIcon } from './core/icons.js';
import Motion from './components/motion.js';
import ScrollPane from './components/scroll-pane.js';
import Util from './core/util.js';

const VERSION = CONST.VERSION;
const TAG = CONST.TAG;

// Kept for backward compatibility; prefer the named icons/getIcon exports.
const Icon = {
    icons,
    getIcon
};

export {

    VERSION,
    TAG,

    Grid,

    $,
    CONST,
    EventBase,
    Icon,
    icons,
    getIcon,
    Motion,
    ScrollPane,
    Util

};

export default {

    VERSION,
    TAG,

    Grid,

    $,
    CONST,
    EventBase,
    Icon,
    icons,
    getIcon,
    Motion,
    ScrollPane,
    Util

};

