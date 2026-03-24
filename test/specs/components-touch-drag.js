import Drag from '../../src/components/drag.js';
import Touch from '../../src/components/touch.js';
import CONST from '../../src/core/const.js';

const makeTouchEvent = (touches = [], changedTouches = touches) => {
    return {
        touches,
        changedTouches
    };
};

const makeTouchPoint = (clientX, clientY) => {
    return {
        clientX,
        clientY
    };
};

describe('Components touch/drag', function() {

    it('Touch direction and tracking helpers', function() {
        const touch = new Touch();

        touch.options = touch.generateOptions({
            inertia: true,
            inertiaTime: 200
        });

        // start/touch move guards: no touch item
        touch.start(null);
        touch.startHandler(makeTouchEvent());
        touch.touchMoveHandler(makeTouchEvent());

        assert.equal(touch.getDirection({
            offsetX: 0,
            offsetY: 20
        }), CONST.UP);
        assert.equal(touch.getDirection({
            offsetX: 0,
            offsetY: -20
        }), CONST.DOWN);
        assert.equal(touch.getDirection({
            offsetX: 20,
            offsetY: 0
        }), CONST.LEFT);
        assert.equal(touch.getDirection({
            offsetX: -20,
            offsetY: 0
        }), CONST.RIGHT);
        assert.equal(touch.getDirection({
            offsetX: 10,
            offsetY: 10
        }), '');

        touch.trackingPoints = [];
        touch.addTrackingPoint({
            inertia: false,
            currentX: 1,
            currentY: 2
        });
        assert.equal(touch.trackingPoints.length, 0);

        touch.addTrackingPoint({
            inertia: true,
            currentX: 1,
            currentY: 2
        });
        const base = Date.now();
        touch.trackingPoints = [{
            x: 1,
            y: 2,
            t: base - 30
        }, {
            x: 11,
            y: 3,
            t: base - 10
        }];
        const motionInfo = touch.getMotionInfo();
        assert.ok(motionInfo);
        assert.equal(typeof motionInfo.offsetDistance, 'number');

        const now = Date.now();
        touch.trackingPoints = [{
            x: 1,
            y: 1,
            t: now - 500
        }, {
            x: 2,
            y: 2,
            t: now - 20
        }, {
            x: 3,
            y: 3,
            t: now - 10
        }];
        touch.filterTrackingPoints(touch.trackingPoints);
        assert.equal(touch.trackingPoints.length, 2);

        touch.destroy();
    });

    it('Touch handlers end/cancel branches', function() {
        const touch = new Touch();
        touch.options = touch.generateOptions({
            inertia: false
        });

        let endCount = 0;
        touch.bind(Touch.EVENT.TOUCH_END, () => {
            endCount += 1;
        });

        touch.startHandler(makeTouchEvent([
            makeTouchPoint(10, 20)
        ]));

        touch.touchMoveHandler(makeTouchEvent([
            makeTouchPoint(15, 26)
        ]));
        assert.equal(touch.options.changed, true);

        // touches still exists, should return before inertia/motion
        touch.touchEndHandler(makeTouchEvent([
            makeTouchPoint(15, 26)
        ], [
            makeTouchPoint(15, 26)
        ]));

        // no changed touch item
        touch.touchEndHandler(makeTouchEvent());

        touch.touchCancelHandler({
            type: 'touchcancel'
        });
        assert.ok(endCount > 0);

        touch.destroy();
    });

    it('Drag iframe and move/end branches', function() {
        const drag = new Drag();

        drag.start(null);
        drag.options = drag.generateOptions({
            type: 'mouse'
        });

        let startCount = 0;
        let moveCount = 0;
        let endCount = 0;

        drag.bind(Drag.EVENT.DRAG_START, () => {
            startCount += 1;
        });
        drag.bind(Drag.EVENT.DRAG_MOVE, () => {
            moveCount += 1;
        });
        drag.bind(Drag.EVENT.DRAG_END, () => {
            endCount += 1;
        });

        drag.startHandler({
            pageX: 10,
            pageY: 20
        });

        // first move triggers DRAG_START
        drag.mouseMoveHandler({
            pageX: 10,
            pageY: 20,
            preventDefault: () => {}
        });

        // second move triggers DRAG_MOVE
        drag.mouseMoveHandler({
            pageX: 20,
            pageY: 30,
            preventDefault: () => {}
        });

        drag.mouseUpHandler({
            pageX: 20,
            pageY: 30,
            preventDefault: () => {}
        });

        assert.equal(startCount, 1);
        assert.ok(moveCount >= 1);
        assert.equal(endCount, 1);

        const iframeA = document.createElement('iframe');
        const iframeB = document.createElement('iframe');
        const div = document.createElement('div');

        drag.iframeHandler({
            target: div
        });

        drag.iframeHandler({
            target: iframeA
        });
        assert.equal(iframeA.classList.contains('tg-pointer-events-none'), true);

        // same iframe, should keep state
        drag.iframeHandler({
            target: iframeA
        });

        drag.iframeHandler({
            target: iframeB
        });
        assert.equal(iframeA.classList.contains('tg-pointer-events-none'), false);
        assert.equal(iframeB.classList.contains('tg-pointer-events-none'), true);

        drag.unbindEvents();
        assert.equal(iframeB.classList.contains('tg-pointer-events-none'), false);

        drag.destroy();
    });

});
