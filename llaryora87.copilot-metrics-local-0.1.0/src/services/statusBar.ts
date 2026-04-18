let updateStatusBarCallback: () => void = () => {};

export function setStatusBarCallback(callback: () => void) {
    updateStatusBarCallback = callback;
}

export function updateStatusBar() {
    updateStatusBarCallback();
}
