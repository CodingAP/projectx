let canvas = document.querySelector('canvas');
let context = canvas.getContext('2d');
let mouseX = 0, mouseY = 0, mouse = -1, key = '', frames, frameRate = 60;
let globalFont = 'Arial';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameManager, mainMenuState, gameState, pausedState, deadState;

window.onload = () => {
    setInterval(() => {
        frameRate = frames;
        frames = 0;
    }, 1000);
    addListeners();
    initalize();
    loop();
};

let addListeners = () => {
    document.addEventListener('mousedown', event => {
        event.preventDefault();
        mouse = event.button;
        gameManager.getMouse(event.button, true);
    }, false);

    document.addEventListener('mouseup', event => {
        event.preventDefault();
        mouse = -1;
        gameManager.getMouse(event.button, false);
    }, false);

    document.addEventListener('mousemove', event => {
        let rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    }, false);

    document.addEventListener('keydown', event => {
        event.preventDefault();
        key = event.key;
        gameManager.getKeys(event.key, true);
    }, false);

    document.addEventListener('keyup', event => {
        event.preventDefault();
        key = '';
        gameManager.getKeys(event.key, false);
    }, false);

    window.addEventListener('resize', resizeCanvas, false)
}

let initalize = () => {
    gameManager = new GameManager();
    mainMenuState = new MainMenuState();
    gameState = new GameplayState();
    pausedState = new PausedState();
    deadState = new DeadState();
    gameManager.setState(mainMenuState);
}

let loop = () => {
    frames++;
    context.clearRect(0, 0, canvas.width, canvas.height);

    gameManager.update();
    gameManager.show();

    requestAnimationFrame(loop);
}

let resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}