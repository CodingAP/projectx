document.addEventListener('keydown', event => {
    player.getKey(event.key, true);
    if (event.key == 'Escape') paused = !paused;
}, false);

document.addEventListener('keyup', event => {
    player.getKey(event.key, false);
}, false);

document.addEventListener('mousemove', event => {
    let rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
}, false);

document.addEventListener('mousedown', event => {

}, false);

document.addEventListener('mouseup', event => {

}, false);