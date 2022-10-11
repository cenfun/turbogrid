import { EventBase } from '../../src/index.js';

/* eslint-disable max-lines-per-function */
describe('Event base', function() {

    const e = new EventBase();

    it('Event bind/unbind/trigger', function() {
        let num = 0;
        e.bind('data', function(ee, d) {
            assert.equal(d, 'a');
            num += 1;
        });
        e.trigger('data', 'a');
        assert.equal(num, 1);
        e.trigger('data', 'a');
        assert.equal(num, 2);

        let result = null;
        e.bind('array_data', function(ee, arr) {
        //console.log(arr);
            result = arr;
            assert.equal(arr.length, 3);
            assert.equal(arr[0], 1);
            assert.equal(arr[1], 2);
            assert.equal(arr[2], 3);
        });
        e.trigger('array_data', [1, 2, 3]);
        assert.equal(result.length, 3);

        result = null;
        e.unbind('array_data');
        e.trigger('array_data', [1, 2, 3]);
        assert.equal(result, null);

    });

    it('Event one', function() {
        let num = 0;
        e.once('data', function(ee, d) {
            assert.equal(d, 'a');
            num += 1;
        });
        e.trigger('data', 'a');
        assert.equal(num, 1);
        e.trigger('data', 'a');
        assert.equal(num, 1);
    });

    it('Event once', function() {
        let num = 0;
        e.once('data', function(ee, d) {
            assert.equal(d, 'a');
            num += 1;
        });
        e.trigger('data', 'a');
        assert.equal(num, 1);
        e.trigger('data', 'a');
        assert.equal(num, 1);
    });

    it('Event unbind function', function() {
        let num = 0;
        const fn1 = function(ee, d) {
            assert.equal(d, 'a');
            num += 1;
        };
        const fn2 = function(ee, d) {
            assert.equal(d, 'a');
            num += 1;
        };

        e.bind('data', fn1);
        e.bind('data', fn2);

        e.trigger('data', 'a');
        assert.equal(num, 2);

        e.unbind('data2', fn1);
        e.trigger('data', 'a');
        assert.equal(num, 4);

        e.unbind('data', fn1);
        e.trigger('data', 'a');
        assert.equal(num, 5);

        e.unbind('data', fn2);
        e.trigger('data', 'a');
        assert.equal(num, 5);
    });


    it('Event unbind namespace', function() {

        let num = 0;
        const fn1 = function(ee, d) {
            assert.equal(d, 'a');
            num += 1;
        };
        const fn2 = function(ee, d) {
            assert.equal(d, 'a');
            num += 1;
        };

        e.bind('data.ns', fn1);
        e.bind('data.ns', fn2);

        e.trigger('data', 'a');
        assert.equal(num, 2);

        e.unbind('data.ns', fn1);

        e.unbind('.ns2');
        e.trigger('data', 'a');
        assert.equal(num, 3);

        e.unbind('.ns');
        e.trigger('data', 'a');
        assert.equal(num, 3);

    });

    it('Event unbind all', function() {

        let num = 0;
        const fn1 = function(ee, d) {
            assert.equal(d, 'a');
            num += 1;
        };
        const fn2 = function(ee, d) {
            assert.equal(d, 'a');
            num += 1;
        };

        e.bind('data', fn1);
        e.bind('data', fn2);

        e.unbind('');

        e.trigger('data', 'a');
        assert.equal(num, 2);

        e.unbind();
        e.trigger('data', 'a');
        assert.equal(num, 2);

    });

    it('Event unbind object', function() {
        let num = 0;
        const fn1 = function(ee, d) {
            num += 1;
        };
        const fn2 = function(ee, d) {
            num += 1;
        };

        e.bind('data', fn1);
        e.bind('info', fn2);

        e.trigger('data');
        assert.equal(num, 1);

        e.unbind({
            data: fn2
        });
        e.trigger('data');
        assert.equal(num, 2);

        e.unbind({
            data: fn1
        });
        e.trigger('data');
        assert.equal(num, 2);

        e.unbind({
            'info': fn2
        });
        e.trigger('info');
        assert.equal(num, 2);

    });

    it('Event bind object', function() {

        let num = 0;

        e.bind({
            '': function() {
                num += 1;
            },
            data: function(ee, d) {
                assert.equal(d, 'a');
                num += 1;
            },
            info: function(ee, d) {
                assert.equal(d, 'a');
                num += 1;
            }
        }, {
            once: true
        });

        e.trigger('data', 'a');
        assert.equal(num, 1);

        e.trigger('data', 'a');
        assert.equal(num, 1);

        e.trigger('info', 'a');
        assert.equal(num, 2);

        e.trigger('info', 'a');
        assert.equal(num, 2);

        e.trigger('data', 'a');
        assert.equal(num, 2);

        e.bind({
            data: function(ee, d) {
                assert.equal(d, 'a');
                num += 1;
            }
        });

        e.trigger('data', 'a');
        assert.equal(num, 3);

        e.bind({
            data: function(ee, d) {
                assert.equal(d, 'a');
                num += 1;
            }
        });

        e.trigger('data', 'a');
        assert.equal(num, 5);

    });

    it('Event bind list', function() {

        let num = 0;
        const fn1 = function(ee, d) {
            assert.equal(d, 'a');
            num += 1;
        };

        e.bind(1);

        e.bind('data  info ', fn1);

        e.trigger('data', 'a');
        assert.equal(num, 1);

        e.trigger('info', 'a');
        assert.equal(num, 2);

        e.trigger('data', 'a');
        assert.equal(num, 3);

    });

    it('Event bind empty', function() {
        let num = 0;
        e.bind();
        e.bind('data');
        e.bind('', function() {
            num += 1;
        });
        e.bind(NaN, function() {
            num += 1;
        });

        e.trigger('data', 'a');
        assert.equal(num, 0);

    });

    it('Event isPropagationStopped', function() {

        let num = 0;
        const fn1 = function(ee, d) {
            assert.equal(d, 'a');
            num += 1;
            ee.preventDefault();
            ee.stopImmediatePropagation();
        };
        const fn2 = function(ee, d) {
            assert.equal(d, 'a');
            num += 1;
        };

        e.bind('data', fn1);
        e.bind('data', fn2);

        e.trigger('data', 'a');
        assert.equal(num, 1);

    });

    it('Event maxListeners', function() {

        assert.equal(e.getMaxListeners(), 10);

        e.setMaxListeners();
        assert.equal(e.getMaxListeners(), 10);

        e.setMaxListeners('str');
        assert.equal(e.getMaxListeners(), 10);

        e.setMaxListeners(2);
        assert.equal(e.getMaxListeners(), 2);

        e.unbind('data');

        let num = 0;
        e.bind('data', function() {
            num += 1;
        });
        e.bind('data', function() {
            num += 1;
        });
        e.bind('data', function() {
            num += 1;
        });

        e.trigger('data', 'a');
        assert.equal(num, 2);

        e.trigger('data', 'a');
        assert.equal(num, 4);

    });

});
