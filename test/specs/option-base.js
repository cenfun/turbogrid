import OptionBase from '../../src/core/option-base.js';

describe('Option Base', function() {

    it('Option getDefaultOption', function() {
        const o = new OptionBase();
        assert(o.getDefaultOption());
    });

    it('Option setOption/getOption null', function() {
        const o = new OptionBase();
        assert.equal(o.getOption(), null);
        assert.equal(typeof o.getOption('a'), 'undefined');
    });

    it('Option setOption/getOption default', function() {
        const o = new OptionBase();
        const defaults = {};
        o.getDefaultOption = function() {
            return defaults;
        };
        o.setOption();
        assert.equal(o.getOption(), defaults);
    });

    it('Option setOption/getOption object', function() {
        const o = new OptionBase();
        o.setOption({
            a: 1
        });
        assert.equal(o.option.a, 1);
        assert.equal(o.getOption().a, 1);
        assert.equal(o.getOption('a'), 1);
    });

    it('Option setOption/getOption single k/v', function() {
        const o = new OptionBase();
        o.setOption({
            a: 1,
            b: 1
        });

        o.setOption('b', 2);
        o.setOption('c', 3);

        assert.equal(o.getOption('a'), 1);
        assert.equal(o.getOption('b'), 2);
        assert.equal(o.getOption('c'), 3);

    });

    it('Option setOption/getOption multiple', function() {
        const o = new OptionBase();
        o.setOption({
            a: 1,
            b: 1
        }, {
            b: 2,
            c: 3
        });
        assert.equal(o.getOption('a'), 1);
        assert.equal(o.getOption('b'), 2);
        assert.equal(o.getOption('c'), 3);

    });

    it('Option setOption/getOption deep', function() {
        const o = new OptionBase();
        o.getDefaultOption = function() {
            return {
                a: {
                    b: [1, 2, 3]
                }
            };
        };

        o.setOption({
            a: {
                b: [5, 6]
            },
            b: 1
        });
        assert.equal(o.getOption('b'), 1);
        assert.equal(o.getOption('a').b.join(','), '5,6');

    });


});
