import { Util } from '../../src/index.js';
/* eslint-disable max-lines-per-function */
describe('Util', function() {

    it('Util isObject', function() {

        assert.equal(Util.isObject({}), true);
        assert.equal(Util.isObject([]), true);
        assert.equal(Util.isObject(Object.create([])), true);
        assert.equal(Util.isObject(Object.create({})), true);
        assert.equal(Util.isObject(Object.create(null)), true);


        assert.equal(Util.isObject(function() {}), false);
        const A = function() {};
        const a = new A();
        assert.equal(Util.isObject(a), false);

        class MyClass {}
        assert.equal(Util.isObject(MyClass), false);

        assert.equal(Util.isObject(Function), false);

        assert.equal(Util.isObject(null), false);
        let und;
        assert.equal(Util.isObject(und), false);

        assert.equal(Util.isObject(window), false);
        assert.equal(Util.isObject(Math), false);
        assert.equal(Util.isObject(document), false);
        assert.equal(Util.isObject(document.querySelector('body')), false);
        assert.equal(Util.isObject(document.querySelectorAll('body')), false);

        assert.equal(Util.isObject(new Date()), false);
        assert.equal(Util.isObject('string'), false);
        assert.equal(Util.isObject(1), false);


    });

    it('Util merge', () => {

        assert(Util.merge());

        const noDeep = Util.merge({
            a: {
                v: 2
            }
        }, {
            a: {
                b: 1
            }
        }, false);

        assert.equal(typeof noDeep.a.v, 'undefined');
        assert.equal(noDeep.a.b, 1);

        const a = {
            arr: [1, 2, 3]
        };
        const b = {
            arr: [5, 6]
        };
        const c = Util.merge(a, b);
        assert.equal(a.arr.join(','), '1,2,3');
        assert.equal(b.arr.join(','), '5,6');
        assert.equal(c.arr.join(','), '5,6');

        const d = Util.merge(b, a);
        assert.equal(d.arr.join(','), '1,2,3');

    });

    it('Util uid', () => {
        assert(Util.uid().length, 8);
        assert(Util.uid(4).length, 4);
        assert(Util.uid(4, 'prefix_').startsWith('prefix_'), true);
    });

    it('Util isNum', () => {
        assert.equal(Util.isNum(1), true);
        assert.equal(Util.isNum(NaN), false);
        assert.equal(Util.isNum(Number.MAX_VALUE), false);
        assert.equal(Util.isNum('1'), false);
    });

    it('Util toNum', () => {
        assert.equal(Util.toNum(1), 1);
        assert.equal(Util.toNum(NaN), 0);
        assert.equal(Util.toNum('10.01d'), 10.01);
        assert.equal(Util.toNum('10.01d', true), 10);
        assert.equal(Util.toNum('1'), 1);
    });

    it('Util convertNum', () => {
        assert.equal(Util.convertNum(1), 1);
        assert.equal(Util.convertNum('1'), 1);
        assert.equal(Util.convertNum('...1'), '...1');
    });

    it('Util clamp', function() {
        assert.equal(Util.clamp(1, 2, 3), 2);
        assert.equal(Util.clamp(1.2, 0, 3), 1.2);
        assert.equal(Util.clamp(5, 0, 3), 3);

        assert.equal(Util.clamp(5, 0, -1), 0);
        assert.equal(Util.clamp(-5, 0, -1), 0);
        assert.equal(Util.clamp(0, 0, -1), 0);
        assert.equal(Util.clamp(-1, 0, -1), 0);
        assert.equal(Util.clamp(0.5, 0, -1), 0);
    });

    it('Util per', function() {
        assert.equal(Util.per('0.5'), 0.5);
        assert.equal(Util.per(1.2), 1);
        assert.equal(Util.per(-10), 0);
    });

    it('Util replace', function() {
        assert.equal(Util.replace('{name}'), '{name}');
        assert.equal(Util.replace('{name}', {
            name: 1
        }), '1');

        assert.equal(Util.replace('!hasOwnProperty{name}', {
            key: 1
        }), '!hasOwnProperty{name}');

        let und;
        assert.equal(Util.replace('undefined{name}', {
            name: und
        }), 'undefinedundefined');

        assert.equal(Util.replace('{name1}{name2}{name3}', {
            name1: 1,
            name2: 2,
            name3: 3
        }), '123');
    });

    it('isList', function() {
        assert.equal(Util.isList([]), false);
        assert.equal(Util.isList([1]), true);
        assert.equal(Util.isList(), false);
        assert.equal(Util.isList(1), false);
    });

    it('Util toList', () => {

        assert.equal(Util.toList().length, 0);

        let list = Util.toList(0);
        assert.equal(list.length, 1);
        assert.equal(list[0], 0);

        // string
        list = Util.toList('');
        assert.equal(list.length, 1);
        assert.equal(list[0], '');

        list = Util.toList('string');
        assert.equal(list.length, 1);
        assert.equal(list[0], 'string');

        const o = {};
        list = Util.toList(o);
        assert.equal(list.length, 1);
        assert.equal(list[0], o);


        // array like
        const al = {
            length: 10
        };
        list = Util.toList(al);
        assert.equal(list.length, 10);
        assert.equal(typeof list[0], 'undefined');

    });

    it('inList', function() {
        assert.equal(Util.inList(1, [1]), true);
        assert.equal(Util.inList(2, [1]), false);
        assert.equal(Util.inList(2, []), false);
    });

    it('isDate', function() {
        assert.equal(Util.isDate(new Date()), true);
        assert.equal(Util.isDate(new Date(' ')), false);
        assert.equal(Util.isDate(0), false);
        assert.equal(Util.isDate(1), false);
        assert.equal(Util.isDate({}), false);
        assert.equal(Util.isDate([]), false);
    });

    it('Util isPromise', function() {
        assert.equal(Util.isPromise(Promise.resolve()), true);
        assert.equal(Util.isPromise({
            then: function() {}
        }), true);
        assert.equal(Util.isPromise(null), false);
        assert.equal(Util.isPromise({}), false);
        assert.equal(Util.isPromise({
            then: true
        }), false);
        assert.equal(Util.isPromise(function() {
        }), false);
    });

    it('getValue', function() {

        let und;
        const data = {
            a: {
                b: {
                    c: '1'
                }
            },
            d: {
                e: '2'
            },
            f: '3',
            n: null,
            u: und
        };

        assert.equal(Util.getValue(null, 'a', 'dv'), 'dv');
        assert.equal(typeof Util.getValue(data, ''), 'undefined');

        assert.equal(Util.getValue(data, 'a.b.c'), '1');
        assert.equal(typeof Util.getValue(data, 'a.b.c2'), 'undefined');
        assert.equal(Util.getValue(data, 'a.b.c2', '12'), '12');

        assert.equal(Util.getValue(data, 'a.c', '12'), '12');

        assert.equal(Util.getValue(data, 'f', '12'), '3');
        assert.equal(Util.getValue(data, 'n', 'u'), null);
        assert.equal(Util.getValue(data, 'u', 'u'), 'u');
    });

    it('Util forEachTree', () => {
        const tree = [{
            name: 'a',
            subs: [{
                name: 'a-1'
            }, {
                name: 'a-2'
            }]
        }, {
            name: 'b'
        }];

        Util.forEachTree(tree, function(item) {
            item.value = item.name;
        });
        assert.equal(tree[0].value, 'a');
        assert.equal(tree[0].subs[0].value, 'a-1');
        assert.equal(tree[0].subs[1].value, 'a-2');
        assert.equal(tree[1].value, 'b');

        Util.forEachTree(tree, function(item) {
            item.value = `${item.name}-new`;
            if (item.name === 'a-1') {
                return false;
            }
        });
        assert.equal(tree[0].value, 'a-new');
        assert.equal(tree[0].subs[0].value, 'a-1-new');
        assert.equal(tree[0].subs[1].value, 'a-2');
        assert.equal(tree[1].value, 'b');

    });

    it('Util removePreProps', () => {
        const obj = {
            a: 1,
            previous_a: 2
        };
        Util.removePreProps();
        Util.removePreProps(obj, 'previous');
        assert.equal(obj.a, 1);
        assert.equal(obj.previous_a, null);
    });

    it('Util hasShiftKey', function() {
        assert.equal(Util.hasShiftKey(), false);
        assert.equal(Util.hasShiftKey({
            shiftKey: true
        }), true);
    });

    it('Util isMobile', function() {
        assert.equal(Util.isMobile(), false);
        // assert.equal(Util.isMobile(), true);
    });

    it('Util contains', function() {
        const a = {};
        const b = {};
        assert.equal(Util.contains(a, b), false);
        b.parentNode = {
            parentNode: a
        };
        assert.equal(Util.contains(a, b), true);
        assert.equal(Util.contains(a), false);
        assert.equal(Util.contains(null, b), false);
    });


    it('Util classMap', function() {
        assert.equal(Util.classMap(), '');
        assert.equal(Util.classMap(''), '');
        assert.equal(Util.classMap(' '), '');
        assert.equal(Util.classMap(' a '), 'a');

        assert.equal(Util.classMap(['  ', '', null, 0]), '');
        assert.equal(Util.classMap([' a ']), 'a');
        assert.equal(Util.classMap([' a ', 'b ']), 'a b');
        assert.equal(Util.classMap([' a ', 'b ', ' ']), 'a b');
        assert.equal(Util.classMap([' a ', 'b ', ' ', null]), 'a b');
        assert.equal(Util.classMap([' a ', 'b ', 'a', 'c']), 'a b c');

        assert.equal(Util.classMap({
            a: true, b: true
        }), 'a b');

        assert.equal(Util.classMap({
            a: true, b: true, c: false
        }), 'a b');

    });

    it('Util styleMap', function() {
        assert.equal(Util.styleMap(), '');
        assert.equal(Util.styleMap(''), '');
        assert.equal(Util.styleMap(' '), '');
        assert.equal(Util.styleMap(' color: red '), 'color: red');
        assert.equal(Util.styleMap(['  ', '', null, 0]), '');
        assert.equal(Util.styleMap(['  a;', '', null, 0]), '');
        assert.equal(Util.styleMap([' red ', '', null, 0]), '');
        assert.equal(Util.styleMap([' color: red ', ' ']), 'color: red;');
        assert.equal(Util.styleMap([' color: red ', ' ', null]), 'color: red;');
        assert.equal(Util.styleMap([' color: red; ', ' display: none']), 'color: red; display: none;');

        assert.equal(Util.styleMap({
            color: 'red',
            display: 'none'
        }), 'color: red; display: none;');

        assert.equal(Util.styleMap({
            color: 'red',
            display: 'none',
            borderColor: 'green',
            'z-index': 1000,
            FontSize: ' 14px ',
            position: false,
            padding: null,
            margin: '',
            marginLeft: 0
        }), 'color: red; display: none; border-color: green; z-index: 1000; font-size: 14px; margin-left: 0;');

    });

    it('Util setInstance/getInstance', () => {
        const id = Util.uid();
        const instance = {};
        const container = document.createElement('div');
        container.setAttribute('id', id);
        document.body.appendChild(container);

        Util.setInstance();
        Util.setInstance(container, instance);

        assert.equal(typeof Util.getInstance(), 'undefined');
        assert.equal(typeof Util.getInstance('invalid-id'), 'undefined');
        assert.equal(Util.getInstance(id), instance);

        container.remove();

        assert.equal(typeof Util.getInstance(id), 'undefined');

    });

    it('Util bindEvents/unbindEvents', () => {

        Util.bindEvents();

        let clicked = 0;
        const events = {
            click: {
                handler: (e) => {
                    clicked += 1;
                }
            }
        };
        Util.bindEvents(events, document);
        assert.equal(clicked, 0);

        document.dispatchEvent(new Event('click'));
        assert.equal(clicked, 1);
        document.dispatchEvent(new Event('click'));
        assert.equal(clicked, 2);

        Util.unbindEvents();

        Util.unbindEvents(events);
        document.dispatchEvent(new Event('click'));
        assert.equal(clicked, 2);

    });

    it('Util preventDefault', () => {

        // document cancelable = false
        let defaultPrevented = false;
        Util.bindEvents({
            click: {
                handler: (e) => {
                    Util.preventDefault(e);
                    defaultPrevented = e.defaultPrevented;
                }
            }
        }, document);

        document.dispatchEvent(new Event('click'));
        assert.equal(defaultPrevented, false);


        // div cancelable = true
        const div = document.createElement('div');
        document.body.appendChild(div);

        defaultPrevented = false;
        Util.bindEvents({
            wheel: {
                handler: (e) => {
                    Util.preventDefault(e);
                    // console.log(e);
                    defaultPrevented = e.defaultPrevented;
                }
            }
        }, div);

        div.dispatchEvent(new WheelEvent('wheel', {
            cancelable: true,
            deltaX: 0,
            deltaY: 10
        }));

        assert.equal(defaultPrevented, true);

        div.remove();

    });


    it('Util debounce', async () => {
        let called = 0;
        const callback = function() {
            called += 1;
        };

        const asyncHandler = Util.debounce(callback);
        assert.equal(called, 0);
        asyncHandler();
        assert.equal(called, 0);

        await delay(50);

        asyncHandler();
        assert.equal(called, 0);

        await delay(50);

        asyncHandler();
        assert.equal(called, 0);

        await delay(150);

        asyncHandler();
        assert.equal(called, 1);

        await delay(50);

        asyncHandler();
        asyncHandler.cancel();
        assert.equal(called, 1);
    });

    it('Util throttle', async () => {
        let called = 0;
        const callback = function() {
            called += 1;
        };

        const asyncHandler = Util.throttle(callback);
        assert.equal(called, 0);
        asyncHandler();
        // first execute
        assert.equal(called, 1);

        // start timeout
        asyncHandler();
        assert.equal(called, 1);

        // timeout
        await delay(150);
        assert.equal(called, 2);

        await delay(50);

        // now > last + delay
        asyncHandler();
        assert.equal(called, 3);

        // cancel
        asyncHandler();
        asyncHandler.cancel();
        assert.equal(called, 3);


    });

    it('Util microtask', async () => {
        let called = 0;
        const callback = function() {
            called += 1;
        };

        const asyncHandler = Util.microtask(callback);
        assert.equal(called, 0);
        asyncHandler();
        asyncHandler();
        assert.equal(called, 0);

        await delay();
        assert.equal(called, 1);

        asyncHandler();
        assert.equal(called, 1);

        asyncHandler.cancel();
        await delay();
        assert.equal(called, 1);

        const temp = window.queueMicrotask;
        window.queueMicrotask = null;
        asyncHandler();
        await delay();
        assert.equal(called, 2);
        window.queueMicrotask = temp;

    });

    it('Util cancelAsync', async () => {
        let called = 0;
        const callback = function() {
            called += 1;
        };

        const obj = {
            timeoutHandler: function() {
                clearTimeout(obj.timeoutSomething);
                obj.timeoutSomething = setTimeout(() => {
                    callback();
                }, 100);
            },
            asyncDebounce: Util.debounce(callback),
            asyncThrottle: Util.throttle(callback),
            asyncMicrotask: Util.microtask(callback)
        };

        Object.values(obj).forEach((item) => {
            if (typeof item === 'function') {
                item();
            }
        });
        Object.values(obj).forEach((item) => {
            if (typeof item === 'function') {
                item();
            }
        });

        await delay(150);

        // debounce 1
        // throttle 2
        // microtask 1
        // timeout 1
        assert.equal(called, 5);

        Object.values(obj).forEach((item) => {
            if (typeof item === 'function') {
                item();
            }
        });
        Object.values(obj).forEach((item) => {
            if (typeof item === 'function') {
                item();
            }
        });

        Util.cancelAsync();

        Util.cancelAsync(obj);

        // throttle 1
        assert.equal(called, 5 + 1);


    });

});
