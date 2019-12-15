let resources = {};
let resourceCount = 0;
let currentCount = 0;
let finishedLoading = false;

let loadImage = (id, url) => {
    let image = new Image();
    resourceCount++;
    image.onload = () => {
        currentCount++;
        if (resourceCount == currentCount) finishedLoading = true;
        resources[id] = image;
    }
    image.src = url;
}

let loadSound = (id, url) => {
    let audio = new Audio();
    resourceCount++;
    audio.onload = () => {
        currentCount++;
        if (resourceCount == currentCount) finishedLoading = true;
        resources[id] = audio;
    }
    audio.src = url;
}

loadImage('logo', 'res/logo.png');
loadImage('button1Background', 'res/button_background.png');
loadImage('button1Hover', 'res/button_hover.png');
loadImage('button1Clicked', 'res/button_clicked.png');
loadImage('button1Disabled', 'res/button_disabled.png');