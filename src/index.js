import Stack from './stack'

window.onload = () => {
    return new Promise((resolve, reject) => {
        window.Stack = new Stack(document.querySelector('body'), true);
        resolve();
    })
};