
export const triggerTouch = function(node, type, x, y) {
    const touchObj = new Touch({
        identifier: Date.now(),
        target: node,
        clientX: x,
        clientY: y
    });
    let touches = [touchObj];
    if (type === 'touchend') {
        touches = [];
    }
    const touchEvent = new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        changedTouches: [touchObj],
        targetTouches: [touchObj],
        touches
    });
    node.dispatchEvent(touchEvent);
};

export const createContainer = function(w, h) {
    const container = document.createElement('div');
    container.style.width = w;
    container.style.height = h;
    document.body.appendChild(container);
    return container;
};


const Helper = {
    triggerTouch,
    createContainer
};

export default Helper;
