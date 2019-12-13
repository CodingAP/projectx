let canvas = document.getElementById('game');
let context = canvas.getContext('2d');
let mouseX = 0, mouseY = 0;
let paused = false;

let player = new Player(canvas.width / 2, canvas.height / 2);

window.onload = () => {
    loop();
}

let loop = () => {
    if (!paused) {
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);

        player.update();
        player.lookAt(mouseX, mouseY);
        player.show(context);
    }

    requestAnimationFrame(loop);
}