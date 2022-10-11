import Scrollbar from './scrollbar.js';
export default Scrollbar.extend({
    mode: 'v',
    type: {
        className: 'tg-scrollbar-v',
        offset: 'top',
        size: 'height',
        page: 'pageY',
        axis: 'y',
        offsetName: 'offsetY'
    }
});
