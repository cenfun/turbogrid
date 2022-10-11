import { Motion } from '../../src/index.js';

describe('Motion', function() {

    it('Motion events', function(done) {

        const from = {
            a: 1,
            b: 2,
            c: 5
        };
        const till = {
            a: 10,
            b: 20,
            c: 'NaN'
        };

        const m = new Motion({
            delay: 0,
            duration: 100,
            from: from,
            till: till
        });
        let startCalled;
        m.bind(Motion.EVENT.MOTION_START, function(e) {
            startCalled = true;
        });
        let moveCalled;
        m.bind(Motion.EVENT.MOTION_MOVE, function(e) {
            moveCalled = true;
        });
        m.bind(Motion.EVENT.MOTION_END, function(e, d) {
            assert(startCalled);
            assert(moveCalled);

            console.log(d);

            assert.equal(d.a, 10);
            assert.equal(d.b, 20);
            assert.equal(typeof d.c, 'undefined');
            done();
        });
        m.start();

    });


    it('Motion stop on start', function() {
        const m = new Motion();
        m.bind(Motion.EVENT.MOTION_START, function(e) {
            m.stop();
        });
        m.start({
            easing: function(k) {
                return k;
            },
            from: 1,
            till: 10,
            duration: 100
        });
        m.stop();
        m.stop();
        assert.equal(m.data, 1);
    });

    it('Motion stop on move', async () => {
        const m = new Motion();
        m.start({
            from: 1,
            till: 10,
            duration: 300
        });
        await delay(100);
        m.stop();

        assert(m.data > 1, m.data);
        assert(m.data < 10, m.data);

    });

    it('Motion start none', (done) => {
        const m = new Motion();
        m.bind(Motion.EVENT.MOTION_END, function(e, d) {
            assert.equal(d, '');
            done();
        });
        m.start({
            from: '',
            till: 10,
            duration: 100
        });

    });

    it('Motion start object none', (done) => {
        const m = new Motion();
        m.bind(Motion.EVENT.MOTION_END, function(e, d) {
            assert.equal(typeof d.a, 'undefined');
            assert.equal(d.b, 20);
            assert.equal(typeof d.c, 'undefined');
            done();
        });
        m.start({
            from: {
                a: 1,
                b: 2
            },
            till: {
                b: 20,
                c: 30
            },
            duration: 100
        });

    });

});
