const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
var frames = 0;
var tempX = 0;
var tempY = 0;
var framecur;
var playerX = canvas.width / 2;
var playerY = canvas.height / 2;
var playerS = 25;
var bulletX = playerX;
var bulletY = playerY;
var playerCol;
var troopCol1;
var troopCol2;
var troopCol3;
var troopCol4;
var troopCol5;
var troopCol6;
var troopCol7;
var troopCol8;
var troopD1 = true;
var troopD2 = true;
var troopD3 = true;
var troopD4 = true;
var troopD5 = true;
var troopD6 = true;
var troopD7 = true;
var troopD8 = true;
var troopS = 10;
var pause = false;
var troop1X = playerX - 50;
var troop2X = playerX;
var troop3X = playerX + 50;
var troop4X = playerX + 75;
var troop5X = playerX + 50;
var troop6X = playerX;
var troop7X = playerX - 50;
var troop8X = playerX - 75;
var troop1Y = playerY - 50;
var troop2Y = playerY - 75;
var troop3Y = playerY - 50;
var troop4Y = playerY;
var troop5Y = playerY + 50;
var troop6Y = playerY + 75;
var troop7Y = playerY + 50;
var troop8Y = playerY;
var troopSpd = 2;
var rBarR = 0.05;
var bBarR = 0.05;
var enemyX = 200;
var enemyY = 150;
var enemyS = 15;
var enemyCol;
var enemySpd = 1;
var death = false;
var enemy2X = 600;
var enemy2Y = 450;
var enemy2S = 15;
var enemyCol2;
var death2 = false;
var moveX = 0;
var moveY = 0;
var cameraMoveX = 0;
var cameraMoveY = 0;
var moveT = 0;
var specAbilityBool = false;
var rBarH = 60;
var bBarH = 45;
var rBarW = 50;
var bBarW = 50;
var bBarX = 25;
var rBarX = 25;
var erBarX = 15;
var erBarH = 30;
var erBarW = 30;
var e2rBarW = 30;
var bBarMW = 50;
var rBarMW = 50;
var collision = false;
window.onload = function () {
    var fps = 60;
    setInterval(function () {
        if (!pause) {
            defColBox();
            draw();
            update();
            regenBar();
            moveToPoint();
            wrapAround();
            calcShoot();
            document.onkeydown = checkKeys;
            document.onkeyup = stop;
            if (!death || !death2) {
                collide();
            }
        }
    }, 1000 / fps);
}
function drawRect(x, y, w, h, c) {
    context.fillStyle = c;
    context.fillRect(x, y, w, h);
}
function drawCircle(x, y, r, c) {
    context.fillStyle = c;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, true);
    context.fill();
}

function checkKeys(e) {
    //alert(e.keyCode);
    if (e.keyCode === 65) {
        moveX = -5
        cont();
    } else if (e.keyCode === 68) {
        moveX = 5
        cont();
    } else if (e.keyCode === 83) {
        moveY = 5
        cont();
    } else if (e.keyCode === 87) {
        moveY = -5
        cont();
    } else if (e.keyCode === 32) {
        specAbilityT();
        cont();
    } else if (e.keyCode === 13) {
        specAbilityG();
        cont();
    } else if (e.keyCode === 16) {
        norm();
        cont();
    } else if (e.keyCode === 27) {
        brk();
    }
}
function stop() {
    moveY = 0;
    moveX = 0;
}
function specAbilityT() {
    if (bBarW >= 50) {
        specAbilityBool = true;
        playerS = 25;
        rBarH = 60;
        bBarH = 45;
        bBarW -= 50;
        bBarX = 25;
        rBarX = 25;
        bBarMW = 50;
        rBarMW = 50;
    }
}
function specAbilityG() {
    framecur = frames;
    if (bBarW >= 25) {
        playerS = 50;
        specAbilityBool = false;
        bBarH = 75;
        rBarH = 90;
        bBarW -= 25;
        bBarX = 50;
        rBarX = 50;
        bBarMW = 100;
        rBarMW = 100;
    }
}
function norm() {
    playerS = 25;
    specAbilityBool = false;
    rBarH = 60;
    bBarH = 45;
    bBarX = 25;
    rBarX = 25;
    bBarMW = 50;
    rBarMW = 50;
}
function moveToPoint() {
    //Enemy 1
    if (enemyX < playerX) {
        enemyX += enemySpd
    }
    if (enemyX > playerX) {
        enemyX -= enemySpd
    }
    if (enemyY < playerY) {
        enemyY += enemySpd
    }
    if (enemyY > playerY) {
        enemyY -= enemySpd
    }
    //Enemy 2
    if (enemy2X < playerX) {
        enemy2X += enemySpd
    }
    if (enemy2X > playerX) {
        enemy2X -= enemySpd
    }
    if (enemy2Y < playerY) {
        enemy2Y += enemySpd
    }
    if (enemy2Y > playerY) {
        enemy2Y -= enemySpd
    }
    //Troops
    if (specAbilityBool) {
        if (troop1X < enemyX) {
            troop1X += troopSpd
        }
        if (troop1X > enemyX) {
            troop1X -= troopSpd
        }
        if (troop1Y < enemyY) {
            troop1Y += troopSpd
        }
        if (troop1Y > enemyY) {
            troop1Y -= troopSpd
        }
        if (troop2X < enemy2X) {
            troop2X += troopSpd
        }
        if (troop2X > enemy2X) {
            troop2X -= troopSpd
        }
        if (troop2Y < enemy2Y) {
            troop2Y += troopSpd
        }
        if (troop2Y > enemy2Y) {
            troop2Y -= troopSpd
        }
        if (troop3X < enemyX) {
            troop3X += troopSpd
        }
        if (troop3X > enemyX) {
            troop3X -= troopSpd
        }
        if (troop3Y < enemyY) {
            troop3Y += troopSpd
        }
        if (troop3Y > enemyY) {
            troop3Y -= troopSpd
        }
        if (troop4X < enemy2X) {
            troop4X += troopSpd
        }
        if (troop4X > enemy2X) {
            troop4X -= troopSpd
        }
        if (troop4Y < enemy2Y) {
            troop4Y += troopSpd
        }
        if (troop4Y > enemy2Y) {
            troop4Y -= troopSpd
        }
        if (troop5X < enemyX) {
            troop5X += troopSpd
        }
        if (troop5X > enemyX) {
            troop5X -= troopSpd
        }
        if (troop5Y < enemyY) {
            troop5Y += troopSpd
        }
        if (troop5Y > enemyY) {
            troop5Y -= troopSpd
        }
        if (troop6X < enemy2X) {
            troop6X += troopSpd
        }
        if (troop6X > enemy2X) {
            troop6X -= troopSpd
        }
        if (troop6Y < enemy2Y) {
            troop6Y += troopSpd
        }
        if (troop6Y > enemy2Y) {
            troop6Y -= troopSpd
        }
        if (troop7X < enemyX) {
            troop7X += troopSpd
        }
        if (troop7X > enemyX) {
            troop7X -= troopSpd
        }
        if (troop7Y < enemyY) {
            troop7Y += troopSpd
        }
        if (troop7Y > enemyY) {
            troop7Y -= troopSpd
        }
        if (troop8X < enemy2X) {
            troop8X += troopSpd
        }
        if (troop8X > enemy2X) {
            troop8X -= troopSpd
        }
        if (troop8Y < enemy2Y) {
            troop8Y += troopSpd
        }
        if (troop8Y > enemy2Y) {
            troop8Y -= troopSpd
        }
    }
}
function draw() {
    drawRect(0, 0, canvas.width, canvas.height, 'black');
    //Basic background
    //drawRect(playerCol.x, playerCol.y, playerCol.width, playerCol.height, 'red');
    //drawRect(enemyCol.x, enemyCol.y, enemyCol.width, enemyCol.height, 'red');
    drawCircle(playerX, playerY, playerS, 'white');
    //Player object
    if (!death) {
        drawCircle(enemyX, enemyY, enemyS, 'green')
        drawRect(enemyX - erBarX, enemyY - erBarH, erBarW, 5, 'red');
    }
    if (!death2) {
        drawCircle(enemy2X, enemy2Y, enemy2S, 'green')
        drawRect(enemy2X - erBarX, enemy2Y - erBarH, e2rBarW, 5, 'red');
    }
    //Enemy object
    if (specAbilityBool) {
        //drawRect(troopCol1.x, troopCol1.y, troopCol1.width, troopCol1.height, 'red');
        if (troopD1) {
            drawCircle(troop1X, troop1Y, troopS, 'gray');
        }
        if (troopD2) {
            drawCircle(troop2X, troop2Y, troopS, 'gray');
        }
        if (troopD3) {
            drawCircle(troop3X, troop3Y, troopS, 'gray');
        }
        if (troopD4) {
            drawCircle(troop4X, troop4Y, troopS, 'gray');
        }
        if (troopD5) {
            drawCircle(troop5X, troop5Y, troopS, 'gray');
        }
        if (troopD6) {
            drawCircle(troop6X, troop6Y, troopS, 'gray');
        }
        if (troopD7) {
            drawCircle(troop7X, troop7Y, troopS, 'gray');
        }
        if (troopD8) {
            drawCircle(troop8X, troop8Y, troopS, 'gray');
        }
    }
    drawRect(playerX - bBarX - 1, playerY - bBarH, bBarW, 10, 'blue');
    drawRect(playerX - rBarX, playerY - rBarH, rBarW, 10, 'red');
}
function update() {
    frames += 1;
    playerX += moveX;
    playerY += moveY;
    if (erBarW <= 0) {
        resetEnemy1();
    }
    if (e2rBarW <= 0) {
        resetEnemy2();
    }
    if (!troopD1 && !troopD2 && !troopD3 && !troopD4 && !troopD5 && !troopD6 && !troopD7 && !troopD8) {
        specAbilityBool = false;
    }
}
function reset() {
    playerX = canvas.width / 2;
    playerY = canvas.height / 2;
    playerS = 25;
    specAbilityBool = false;
    rBarH = 60;
    bBarH = 45;
    bBarX = 25;
    rBarX = 25;
    rBarW = 50;
    bBarW = 50;
    bBarMW = 50;
    rBarMW = 50;
    troop1X = playerX - 50;
    troop2X = playerX;
    troop3X = playerX + 50;
    troop4X = playerX + 75;
    troop5X = playerX + 50;
    troop6X = playerX;
    troop7X = playerX - 50;
    troop8X = playerX - 75;
    troop1Y = playerY - 50;
    troop2Y = playerY - 75;
    troop3Y = playerY - 50;
    troop4Y = playerY;
    troop5Y = playerY + 50;
    troop6Y = playerY + 75;
    troop7Y = playerY + 50;
    troop8Y = playerY;
}
function resetEnemy1() {
    enemyX = Math.random() * 1000;
    enemyY = Math.random() * 1000;
    erBarW = 30;
    troopD1 = true;
    troopD3 = true;
    troopD5 = true;
    troopD7 = true;
    troop1X = playerX - 50;
    troop1Y = playerY - 50;
    troop3X = playerX + 50;
    troop3Y = playerY - 50;
    troop5X = playerX + 50;
    troop5Y = playerY + 50;
    troop7X = playerX - 50;
    troop7Y = playerY + 50;
    if (enemyX > canvas.width) {
        enemyX -= canvas.width
    }
    if (enemyY > canvas.height) {
        enemyY -= canvas.height
    }
}
function resetEnemy2() {
    enemy2X = Math.random() * 1000;
    enemy2Y = Math.random() * 1000;
    e2rBarW = 30;
    troopD2 = true;
    troopD4 = true;
    troopD6 = true;
    troopD8 = true;
    troop2X = playerX;
    troop2Y = playerY - 75;
    troop4X = playerX + 75;
    troop4Y = playerY;
    troop6X = playerX;
    troop6Y = playerY + 75;
    troop8X = playerX - 75;
    troop8Y = playerY;
    if (enemy2X > canvas.width) {
        enemy2X -= canvas.width
    }
    if (enemy2Y > canvas.height) {
        enemy2Y -= canvas.height
    }
}
function regenBar() {
    if (bBarW < bBarMW) {
        bBarW += bBarR;
    }
    if (bBarW > bBarMW) {
        bBarW = bBarMW;
    }
    if (rBarW < rBarMW) {
        rBarW += rBarR;
    }
    if (rBarW > rBarMW) {
        rBarW = rBarMW;
    }
    if (rBarW < 0) {
        reset();
    }
}
function defColBox() {
    playerCol = { x: playerX - playerS, y: playerY - playerS, width: playerS * 2, height: playerS * 2 }
    enemyCol = { x: enemyX - enemyS, y: enemyY - enemyS, width: enemyS * 2, height: enemyS * 2 }
    enemyCol2 = { x: enemy2X - enemy2S, y: enemy2Y - enemy2S, width: enemyS * 2, height: enemyS * 2 }
    if (specAbilityBool) {
        troopCol1 = { x: troop1X - troopS, y: troop1Y - troopS, width: troopS * 2, height: troopS * 2 }
        troopCol2 = { x: troop2X - troopS, y: troop2Y - troopS, width: troopS * 2, height: troopS * 2 }
        troopCol3 = { x: troop3X - troopS, y: troop3Y - troopS, width: troopS * 2, height: troopS * 2 }
        troopCol4 = { x: troop4X - troopS, y: troop4Y - troopS, width: troopS * 2, height: troopS * 2 }
        troopCol5 = { x: troop5X - troopS, y: troop5Y - troopS, width: troopS * 2, height: troopS * 2 }
        troopCol6 = { x: troop6X - troopS, y: troop6Y - troopS, width: troopS * 2, height: troopS * 2 }
        troopCol7 = { x: troop7X - troopS, y: troop7Y - troopS, width: troopS * 2, height: troopS * 2 }
        troopCol8 = { x: troop8X - troopS, y: troop8Y - troopS, width: troopS * 2, height: troopS * 2 }
    }
}
function collide() {
    if (playerCol.x < enemyCol.x + enemyCol.width &&
        playerCol.x + playerCol.width > enemyCol.x &&
        playerCol.y < enemyCol.y + enemyCol.height &&
        playerCol.height + playerCol.y > enemyCol.y && !death) {
        rBarW -= 25;
        //erBarW -= 15;
        if (playerX < enemyX) {
            playerX -= 50;
        } else if (playerX > enemyX) {
            playerX += 50;
        } else if (playerY > enemyY) {
            playerY += 50;
        } else if (playerY < enemyY) {
            playerY -= 50;
        }
    }
    if (playerCol.x < enemyCol2.x + enemyCol2.width &&
        playerCol.x + playerCol.width > enemyCol2.x &&
        playerCol.y < enemyCol2.y + enemyCol2.height &&
        playerCol.height + playerCol.y > enemyCol2.y && !death2) {
        rBarW -= 25;
        //e2rBarW -= 15;
        if (playerX < enemy2X) {
            playerX -= 50;
        } else if (playerX > enemy2X) {
            playerX += 50;
        } else if (playerY > enemy2Y) {
            playerY += 50;
        } else if (playerY < enemy2Y) {
            playerY -= 50;
        }
    }
    if (troopCol1.x < enemyCol.x + enemyCol.width &&
        troopCol1.x + troopCol1.width > enemyCol.x &&
        troopCol1.y < enemyCol.y + enemyCol.height &&
        troopCol1.height + troopCol1.y > enemyCol.y && troopD1) {
        troopD1 = false;
        erBarW -= 5
    }

    if (troopCol2.x < enemyCol2.x + enemyCol2.width &&
        troopCol2.x + troopCol2.width > enemyCol2.x &&
        troopCol2.y < enemyCol2.y + enemyCol2.height &&
        troopCol2.height + troopCol2.y > enemyCol2.y && troopD2) {
        troopD2 = false;
        e2rBarW -= 5
    }

    if (troopCol3.x < enemyCol.x + enemyCol.width &&
        troopCol3.x + troopCol3.width > enemyCol.x &&
        troopCol3.y < enemyCol.y + enemyCol.height &&
        troopCol3.height + troopCol3.y > enemyCol.y && troopD3) {
        troopD3 = false;
        erBarW -= 5
    }

    if (troopCol4.x < enemyCol2.x + enemyCol2.width &&
        troopCol4.x + troopCol4.width > enemyCol2.x &&
        troopCol4.y < enemyCol2.y + enemyCol2.height &&
        troopCol4.height + troopCol4.y > enemyCol2.y && troopD4) {
        troopD4 = false;
        e2rBarW -= 5
    }

    if (troopCol5.x < enemyCol.x + enemyCol.width &&
        troopCol5.x + troopCol5.width > enemyCol.x &&
        troopCol5.y < enemyCol.y + enemyCol.height &&
        troopCol5.height + troopCol5.y > enemyCol.y && troopD5) {
        troopD5 = false;
        erBarW -= 5
    }

    if (troopCol6.x < enemyCol2.x + enemyCol2.width &&
        troopCol6.x + troopCol6.width > enemyCol2.x &&
        troopCol6.y < enemyCol2.y + enemyCol2.height &&
        troopCol6.height + troopCol6.y > enemyCol2.y && troopD6) {
        troopD6 = false;
        e2rBarW -= 5
    }

    if (troopCol7.x < enemyCol.x + enemyCol.width &&
        troopCol7.x + troopCol7.width > enemyCol.x &&
        troopCol7.y < enemyCol.y + enemyCol.height &&
        troopCol7.height + troopCol7.y > enemyCol.y && troopD7) {
        troopD7 = false;
        erBarW -= 5
    }

    if (troopCol8.x < enemyCol2.x + enemyCol2.width &&
        troopCol8.x + troopCol8.width > enemyCol2.x &&
        troopCol8.y < enemyCol2.y + enemyCol2.height &&
        troopCol8.height + troopCol8.y > enemyCol2.y && troopD8) {
        troopD8 = false;
        e2rBarW -= 5
    }
}
function wrapAround() {
    if (playerX + playerS <= 0) {
        playerX = canvas.width + playerS;
    } else if (playerX - playerS >= canvas.width) {
        playerX = -playerS;
    }
    if (playerY + playerS <= 0) {
        playerY = canvas.height + playerS;
    } else if (playerY - playerS >= canvas.height) {
        playerY = -playerS;
    }
    if (enemyX + enemyS <= 0) {
        enemyX = canvas.width + enemyS;
    } else if (enemyX - enemyS >= canvas.width) {
        enemyX = -enemyS;
    }
    if (enemyY + enemyS <= 0) {
        enemyY = canvas.height + enemyS;
    } else if (enemyY - enemyS >= canvas.height) {
        enemyY = -enemyS;
    }
    if (enemy2X + enemyS <= 0) {
        enemy2X = canvas.width + enemyS;
    } else if (enemy2X - enemyS >= canvas.width) {
        enemy2X = -enemyS;
    }
    if (enemy2Y + enemyS <= 0) {
        enemy2Y = canvas.height + enemyS;
    } else if (enemy2Y - enemyS >= canvas.height) {
        enemy2Y = -enemyS;
    }
}
function cont() {
    enemySpd = 1;
    troopSpd = 2;
    rBarR = 0.05;
    bBarR = 0.05;
}
function brk() {
    moveY = 0;
    moveX = 0;
    enemySpd = 0;
    troopSpd = 0;
    rBarR = 0;
    bBarR = 0;
}
var IE = document.all ? true : false;
if (!IE) document.captureEvents(Event.MOUSEMOVE)
document.onmousemove = getMouseXY;
function getMouseXY(e) {
    if (IE) {
        tempX = event.clientX + document.body.scrollLeft;
        tempY = event.clientY + document.body.scrollTop;
    } else {
        tempX = e.pageX - 250;
        tempY = e.pageY - 250;
    }
    if (tempX < 0) { tempX = 0; }
    if (tempY < 0) { tempY = 0; }
    document.Show.MouseX.value = tempX;
    document.Show.MouseY.value = tempY;
    return true;
}
function calcShoot() {
    var dx = tempX - playerX
    var dy = tempY - playerY
    var dist = dx / dy

}
function shoot(xspd, yspd) {
    drawCircle(bulletX, bulletY, 5, 'gray');
    bulletX += xspd
    bulletY += yspd
    console.log(bulletX + ', ' + bulletY)
}