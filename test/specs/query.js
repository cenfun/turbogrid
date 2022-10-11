import { $ } from '../../src/index.js';

describe('Query', function() {

    const myDiv = document.createElement('div');
    myDiv.className = 'my-div';
    document.body.appendChild(myDiv);

    //require window focus to test blur
    window.focus();

    it('query length', function() {
        assert.equal($().length, 0);
        const div = document.createElement('div');
        assert.equal($(div).length, 1);
    });

    it('query init', function() {
        assert.equal($('.my-div').length, 1);
        assert.equal($('<div>').length, 1);

        const div = $(document.createElement('div'));
        assert.equal($(div), div);

        assert.equal($(window).get(0), window);

        assert.equal($({}).length, 0);

    });

    it('query each', function() {

        const div = document.createElement('div');

        let len = 0;
        $(div).add().add(document.body).add($(div)).each().each(function() {
            len += 1;
        });

        assert.equal(len, 3);

    });

    it('query empty', function() {

        const div = document.createElement('div');
        $(div).append('text');

        assert.equal($(div).empty().html(), '');

    });

    it('query remove, addClass, removeClass', function() {

        assert.ok(document.querySelector('.my-div'));

        $('.my-div').remove();

        assert.equal(document.querySelector('.my-div'), null);

        $().addClass('ddd').removeClass('ddd');

        const elem = $('<div>').appendTo(document.body);
        elem.addClass('my-div');

        assert.ok(document.querySelector('.my-div'));

        elem.addClass('class-name');

        assert.equal(elem.hasClass(), false);
        assert.equal(elem.hasClass('class-name'), true);
        assert.equal(elem.hasClass('my-div'), true);

        assert.equal($().hasClass('class-name'), false);

        elem.removeClass('other-name');
        assert.equal(elem.hasClass('class-name'), true);
        assert.equal(elem.hasClass('my-div'), true);

        elem.removeClass(false);
        assert.equal(elem.hasClass('class-name'), true);
        assert.equal(elem.hasClass('my-div'), true);

        elem.removeClass('class-name');
        assert.equal(elem.hasClass('class-name'), false);
        assert.equal(elem.hasClass('my-div'), true);

        elem.removeClass();
        assert.equal(elem.hasClass('class-name'), false);
        assert.equal(elem.hasClass('my-div'), false);

        elem.addClass('my-div');

    });

    it('query find', function() {

        assert.ok(document.querySelector('.my-div'));
        assert.equal($(document.body).find().length, 0);
        assert.equal($().find().length, 0);
        assert.equal($(document.body).find('.my-div').length, 1);

    });

    it('query prepend/append', function() {

        const elem = document.querySelector('.my-div');
        $(elem).prepend();
        $(elem).append();
        $(elem).appendTo();

        assert.equal($(elem).prepend('<div class="prepend-div">').length, 1);
        assert.equal($(document.body).find('.prepend-div').length, 1);

    });

    it('query html', function() {

        const div = $(document.body).find('.my-div');
        div.html('html');
        assert.equal(div.html(), 'html');
        assert.equal($().html(), '');
        $('.my-div').remove();
    });


    it('query css', function() {
        const div = document.createElement('div');
        div.style.marginLeft = '18px';
        document.body.appendChild(div);

        assert.equal($(div).css('margin-left'), '18px');

        $(div).remove();
    });

    it('query attr, removeAttr', function() {
        const div = document.createElement('div');

        $(div).attr().attr({
            a: 'a',
            b: 'b'
        });

        assert.equal(div.getAttribute('a'), 'a');
        assert.equal(div.getAttribute('b'), 'b');

        $().removeAttr().removeAttr('a');

        $(div).removeAttr().removeAttr('a');

        assert.equal(div.getAttribute('a'), null);
        assert.equal($().attr('a'), null);

    });

    it('query width/height', function() {
        const div = document.createElement('div');
        document.body.appendChild(div);

        $(div).css();
        $(div).css({
            width: 100,
            height: '200px'
        });

        assert.equal($().width(), 0);
        assert.equal($().height(), 0);
        assert.equal($().css('width'), null);

        assert.equal($(div).width(), 100);
        assert.equal($(div).height(), 200);

        assert.ok($(window).width());
        assert.ok($(document).width());

        assert.equal($(div).css('width'), '100px');
        assert.equal($(div).css('height'), '200px');

        $(div).remove();

    });

    it('query blur', () => {
        const input = document.createElement('input');
        input.value = 'input for query blur';
        document.body.appendChild(input);

        let callBlue = false;

        input.addEventListener('blur', (e) => {
            //console.log('query blur triggered');
            callBlue = true;
        });

        input.dispatchEvent(new Event('blur'));

        assert.equal(callBlue, true);

        $(input).remove();

    });


    it('query is', function() {
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const input = document.createElement('input');

        assert.equal($(input).is(), false);
        assert.equal($(window).is('window'), false);

        assert.equal($(input).is('input'), true);

        assert.equal($(input).add(div1).is('input'), false);
        assert.equal($(input).add(div1).is('div'), false);

        assert.equal($(div1).add(div2).is('div'), true);

    });

});
