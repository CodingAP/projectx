let resources = {};

let loadImage = (id, url) => {
    let image = new Image();
    image.onload = () => {
        resources[id] = image;
    }
    image.src = url;
}

let loadSound = (id, url) => {
    let audio = new Audio();
    audio.onload = () => {
        resources[id] = audio;
    }
    audio.src = url;
}

loadImage('logo', 'res/logo.png');