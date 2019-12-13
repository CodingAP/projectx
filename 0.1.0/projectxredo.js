var canvas, context, fps;
var player;
var moveX = 0;
var moveY = 0;
var enemyAmount = 2;
var paused = false;
var enemies = [];
var troops = [];
var troopBool = false;
var enemiesd = [];
window.onload = function () {
    canvas = document.getElementById('game');
    context = canvas.getContext('2d');
    var fps = 60;
    player = new Player(canvas.width / 2, canvas.height / 2);
    for (var i = 0; i < enemyAmount; i++) {
        var enemy = new Enemy(Math.random() * 1000, Math.random() * 1000);
        enemies.push(enemy);
    }
    document.onkeydown = checkKeys;
    document.onkeyup = function () { moveX = 0; moveY = 0; }
    setInterval(function () {
        draw();
        update();
    }, 1000 / fps);
}
function draw() {
    rect(0, 0, canvas.width, canvas.height, 'black');
    player.show()
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].show();
    }
}
function update() {
    if (!paused) {
        player.move(moveX, moveY);
        player.wrap();
        player.updateBars();
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].moveTo(player);
            enemies[i].updateBars();
            enemyCol = enemies[i].collisionBox();
            if (player.collide(enemyCol)) {
                player.hit(enemyCol);
                enemies[i].health -= 10 * player.level;
                if (enemies[i].health <= 0) {
                    player.exp += player.exprate / player.level;
                }
            }
        }
        if (troopBool) {
            for (var i = 0; i < troops.length; i++) {
                troops[i].show()
            }
        }
    }
}
function checkKeys(e) {
    //alert(e.keyCode)
    if (e.keyCode === 65) {
        moveX = -5
        paused = false;
    } else if (e.keyCode === 68) {
        moveX = 5
        paused = false;
    } else if (e.keyCode === 83) {
        moveY = 5
        paused = false;
    } else if (e.keyCode === 87) {
        moveY = -5
        paused = false;
    } else if (e.keyCode === 32) {
        if (player.level >= 5) {
            player.ability2()
            troopBool = true;
            for (var i = 0; i < troops.length; i++) {
                var dists = [];
                //enemiesd.push(dists);
                for (var i = 0; i < enemies.length; i++) {
                    var d = troops[i].findNearestTarget(enemies[i]);
                    dists.push(d);
                }
            }
            console.log(enemiesd)
        }
        paused = false;
    } else if (e.keyCode === 13) {
        if (player.level >= 3) {
            player.ability1()
        }
        paused = false;
    } else if (e.keyCode === 16) {
        //This is a normal state
    } else if (e.keyCode === 27) {
        paused = true;
    }
}
function rect(x, y, w, h, c) {
    context.fillStyle = c;
    context.fillRect(x, y, w, h);
}
function circle(x, y, r, c) {
    context.fillStyle = c;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, true);
    context.stroke();
    context.fill();
}
function text(txt, fnt, x, y, c) {
    context.fillStyle = c;
    context.font = fnt;
    context.fillText(txt, x, y);
}
function doCollison(a, b) {
    if (a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.h + a.y > b.y) {
        return true;
    } else {
        return false;
    }
}
function dist(sx, sy, dx, dy) {
    var x = dx - sx;
    var y = dy - sy;
    var d = x * x + y * y;
    return (Math.floor(Math.sqrt(d)));
}