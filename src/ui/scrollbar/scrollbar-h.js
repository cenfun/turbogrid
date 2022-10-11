import Scrollbar from './scrollbar.js';
export default Scrollbar.extend({
    mode: 'h',
    type: {
        className: 'tg-scrollbar-h',
        offset: 'left',
        size: 'width',
        page: 'pageX',
        axis: 'x',
        offsetName: 'offsetX'
    }
});
