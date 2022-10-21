
export default class Microtask {

    start(callback) {
        this.callback = callback;
        if (this.started) {
            return;
        }
        this.started = true;
        this.create();
    }

    create() {
        if (typeof window.queueMicrotask === 'function') {
            window.queueMicrotask(() => {
                this.execute();
            });
            return;
        }

        if (typeof Promise === 'function') {
            Promise.resolve().then(() => {
                this.execute();
            });
            return;
        }

        throw new Error('Current browser does NOT support queueMicrotask or Promise');
    }

    execute() {
        if (!this.started) {
            return;
        }
        this.started = false;
        const callback = this.callback;
        // must be removed first
        this.callback = null;
        // then execute
        // because it could start another callback in executing, do not remove next callback
        if (typeof callback === 'function') {
            callback.call(this);
        }
    }

    cancel() {
        this.started = false;
        this.callback = null;
    }
}
