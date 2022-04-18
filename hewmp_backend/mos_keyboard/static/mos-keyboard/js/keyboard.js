const ORIGIN_LAYER_0 = 0;
const CODES_LAYER_0 = [
    ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
];

const ORIGIN_LAYER_1 = -1;
const CODES_LAYER_1 = [
    ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal'],
    [null, 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight'],
    [null, 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Backslash'],
    ['IntlBackslash', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash'],
];

const ORIGIN_LAYER_2 = 0;
const CODES_LAYER_2 = [
    ['Insert', 'Home', 'PageUp'],
    ['Delete', 'End', 'PageDown'],
];

const ORIGIN_LAYER_3 = 0;
const CODES_LAYER_3 = [
    ['NumLock', 'NumpadDivide', 'NumpadMultiply', 'NumpadSubtract'],
    ['Numpad7', 'Numpad8', 'Numpad9', 'NumpadAdd'],
    ['Numpad4', 'Numpad5', 'Numpad6'],
    ['Numpad1', 'Numpad2', 'Numpad3', 'NumpadEnter'],
    ['Numpad0', null, 'NumpadDecimal'],
];

COORDS_BY_CODE = new Map();
CODES_LAYER_0.forEach((row, y) => row.forEach((code, x) => COORDS_BY_CODE.set(code, [ORIGIN_LAYER_0 + x, y, 0])));
CODES_LAYER_1.forEach((row, y) => row.forEach((code, x) => COORDS_BY_CODE.set(code, [ORIGIN_LAYER_1 + x, y, 1])));
CODES_LAYER_2.forEach((row, y) => row.forEach((code, x) => COORDS_BY_CODE.set(code, [ORIGIN_LAYER_2 + x, y, 2])));
CODES_LAYER_3.forEach((row, y) => row.forEach((code, x) => COORDS_BY_CODE.set(code, [ORIGIN_LAYER_3 + x, y, 3])));
COORDS_BY_CODE.delete(null);

class Keyboard {
    constructor(keydownCb, keyupCb) {
        this.keydownCb = keydownCb;
        this.keyupCb = keyupCb;
        this.activeKeys = new Set();
        this.pendingKeys = new Set();
        this.stickyKeys = new Set();
    }

    keydown(event) {
        if (event.key == "Shift") {
            for (const code of this.activeKeys) {
                this.pendingKeys.add(code);
            };
            return true;
        }

        if (this.stickyKeys.has(event.code)) {
            this.activeKeys.delete(event.code);
            this.stickyKeys.delete(event.code);
            this.pendingKeys.delete(event.code);
            this.keyupCb(COORDS_BY_CODE.get(event.code));
            return true;
        }

        if (this.pendingKeys.has(event.code)) {
            return true;
        }

        if (this.activeKeys.has(event.code)) {
            return true;
        }

        if (COORDS_BY_CODE.has(event.code)) {
            this.activeKeys.add(event.code);
            this.keydownCb(COORDS_BY_CODE.get(event.code));
            if (event.shiftKey) {
                this.pendingKeys.add(event.code);
            }
            return true;
        }
        return false;
    }

    keyup(event) {
        if (event.shiftKey && this.activeKeys.has(event.code)) {
            this.stickyKeys.add(event.code);
        }
        if (this.pendingKeys.has(event.code)) {
            this.pendingKeys.delete(event.code);
            this.stickyKeys.add(event.code);
        }
        if (this.stickyKeys.has(event.code)) {
            return true;
        }

        if (this.activeKeys.has(event.code)) {
            this.activeKeys.delete(event.code);
            this.keyupCb(COORDS_BY_CODE.get(event.code));
            return true;
        }
        return false;
    }

    deactivate() {
        this.pendingKeys.clear();
        this.stickyKeys.clear();
        for (const code of this.activeKeys.keys()) {
            this.keyupCb(COORDS_BY_CODE.get(code));
        }
        this.activeKeys.clear();
    }
}
