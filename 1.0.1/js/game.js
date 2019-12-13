let canvas = document.querySelector('canvas');
let context = canvas.getContext('2d');
let mouseX, mouseY;
let frameRate = 60, frames = 0;

let player = new Player();
let enemyManager = new EnemyManager();
let camera = new Camera();
let images = {};

let playBounds = {
    width: 0.75,
    height: 1,
    offset: { x: 0, y: 0 }
}
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
    frames++;

    show();
    update();

    requestAnimationFrame(loop);
}

let show = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    let x = playBounds.offset.x * canvas.width;
    let y = playBounds.offset.y * canvas.height;
    let width = playBounds.width * canvas.width;
    let height = playBounds.height * canvas.height;

    camera.followPointSmooth(player.position);

    context.save();
    context.translate(x + width / 2, y + height / 2);
    context.translate(-camera.position.x, -camera.position.y);

    let playerBounds = {
        minX: player.position.x - width / 1.5,
        maxX: player.position.x + width / 1.5,
        minY: player.position.y - height / 1.5,
        maxY: player.position.y + height / 1.5
    }

    for (let y = -100; y <= 100; y++) {
        if (y * 50 < playerBounds.minY || y * 50 > playerBounds.maxY) continue;
        for (let x = -100; x <= 100; x++) {
            if (x * 50 < playerBounds.minX || x * 50 > playerBounds.maxX) continue;
            context.fillStyle = ((y * 201 + x) % 2 == 0) ? '#070' : '#0a0';
            context.fillRect(x * 50, y * 50, 50, 50);
        }
    }

    enemyManager.show();

    player.angle = Math.atan2(mouseY - (y + height / 2), mouseX - (x + width / 2)) + Math.HALF_PI;
    player.show();

    context.restore();

    playerUI.show();
}

let update = () => {
    player.update();
    enemyManager.update(player);

    player.collideWithEnemies(enemyManager)
}

let resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}