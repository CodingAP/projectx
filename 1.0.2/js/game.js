let canvas = document.querySelector('canvas');
let context = canvas.getContext('2d');
let mouseX, mouseY;
let frameRate = 60, frames = 0, paused = false, time = 180;

let player = new Player();
let enemyManager = new EnemyManager();
let camera = new Camera();
let images = {};

let playBounds = {
    width: 0.75,
    height: 1,
    offset: { x: 0, y: 0 }
};
let playerUI = new GameUI(player, {
    width: 0.25,
    height: 1,
    offset: { x: 0.75, y: 0 }
});

window.onload = () => {
    setInterval(() => {
        frameRate = frames;
        frames = 0;
    }, 1000)

    resizeCanvas();
    addListeners();
    loop();
}

let addListeners = () => {
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('keydown', event => {
        player.getKeys(event.key, true);
        if (event.key == 'Escape') paused = !paused;
    });

    document.addEventListener('keyup', event => {
        player.getKeys(event.key, false);
    });

    document.addEventListener('mousemove', event => {
        let rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    });

    document.addEventListener('mousedown', event => {
        player.getMouse(event.button, true);
    });

    document.addEventListener('mouseup', event => {
        player.getMouse(event.button, false);
    });
}

let loop = () => {
    let x = playBounds.offset.x * canvas.width;
    let y = playBounds.offset.y * canvas.height;
    let width = playBounds.width * canvas.width;
    let height = playBounds.height * canvas.height;

    frames++;
    show();
    if (!paused) {
        update();
    } if (player.dead) {
        time--;
        if (time <= 0) {
            player.reset();
            time = 180;
        }
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#fff';
        context.font = width * 0.05 + 'px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('You\'ve Died!', width / 2, height / 2);
        context.font = width * 0.03 + 'px Arial';
        context.fillText('Respawning in ' + Math.ceil(time / 60) + '...', width / 2, height * 0.55);
    } else if (paused) {
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#fff';
        context.font = canvas.width * 0.05 + 'px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Paused', canvas.width / 2, canvas.height / 2);
    }

    requestAnimationFrame(loop);
}

let show = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    let x = playBounds.offset.x * canvas.width;
    let y = playBounds.offset.y * canvas.height;
    let width = playBounds.width * canvas.width;
    let height = playBounds.height * canvas.height;
    let tileSize = 50;

    context.save();
    context.translate(x + width / 2, y + height / 2);
    context.translate(-camera.position.x, -camera.position.y);

    let cameraBounds = {
        minX: camera.position.x - width / 1.5,
        maxX: camera.position.x + width / 1.5,
        minY: camera.position.y - height / 1.5,
        maxY: camera.position.y + height / 1.5
    }

    let tile = 0;
    for (let y = mapBounds.y; y < mapBounds.y + mapBounds.height; y += tileSize) {
        tile++;
        if (y < cameraBounds.minY || y > cameraBounds.maxY) continue;
        for (let x = mapBounds.x; x < mapBounds.x + mapBounds.width; x += tileSize) {
            tile++;
            if (x < cameraBounds.minX || x > cameraBounds.maxX) continue;
            context.fillStyle = (tile % 2 == 0) ? '#0a0' : '#070';
            context.fillRect(x, y, tileSize, tileSize);
        }
    }

    enemyManager.show();
    player.show();

    context.restore();

    playerUI.show();
}

let update = () => {
    let x = playBounds.offset.x * canvas.width;
    let y = playBounds.offset.y * canvas.height;
    let width = playBounds.width * canvas.width;
    let height = playBounds.height * canvas.height;

    camera.followPointSmooth(player.position);
    camera.restrict({
        width: width,
        height: height
    }, mapBounds);

    if (!player.dead) {
        player.followMouse();
        player.update();
        player.collideWithEnemies(enemyManager);
    }
    enemyManager.update(player);
}

let resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    show();
}