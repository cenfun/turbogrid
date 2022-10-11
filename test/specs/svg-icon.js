import { Icon } from '../../src/index.js';
describe('SVG Icon', function() {

    it('getIcon', function() {
        const str = Icon.getIcon('tree');
        assert.equal(str.substring(0, 4), '<svg');
    });

});
