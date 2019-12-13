class Player {
    constructor() {
        this.position = new Vector2D(100, 0);
        this.size = 25;
        this.speed = 5;
        this.angle = 0;

        this.stateEnum = {
            NOTHING: 0,
            DAZED: 1,
            MELEE: 2
        }

        this.state = this.stateEnum.NOTHING;

        this.healthBar = new StatusBar(0, 100);
        this.healthBar.current = 100;
        this.manaBar = new StatusBar(0, 50);
        this.manaBar.current = 50;
        this.xpBar = new StatusBar(0, 5);

        this.uiInfo = {
            name: 'CodingAP',
            statBars: [
                {
                    var: 'healthBar',
                    name: 'Health',
                    colors: {
                        background: '#222',
                        foreground: '#f00',
                        stroke: '#fff',
                        text: '#fff'
                    }
                },
                {
                    var: 'manaBar',
                    name: 'Mana',
                    colors: {
                        background: '#222',
                        foreground: '#00f',
                        stroke: '#fff',
                        text: '#fff'
                    }
                },
                {
                    var: 'xpBar',
                    name: 'Experience',
                    colors: {
                        background: '#222',
                        foreground: '#0f0',
                        stroke: '#fff',
                        text: '#fff'
                    }
                }
            ]
        }

        this.keys = { w: 0, a: 0, s: 0, d: 0 };
        this.mice = [0, 0, 0, 0, 0];

        this.bullets = [];
        this.knockback = new Vector2D();
    }

    show(newPosition) {
        let position = newPosition || this.position;

        for (let i = 0; i < this.bullets.length; i++) {
            if (!newPosition) this.bullets[i].show();
        }
        context.fillStyle = '#fff';

        context.save();
        context.translate(position.x, position.y);
        context.rotate(this.angle)

        context.beginPath();
        context.ellipse(0, 0, this.size, this.size, 0, 0, Math.TWO_PI);
        context.closePath();
        context.fill();

        context.fillRect(- this.size * 3 / 4, - this.size * 1.5, this.size * 1.5, this.size * 1.5);

        context.restore();
    }

    update() {
        switch (this.state) {
            case this.stateEnum.NOTHING:
                let velocity = new Vector2D(this.keys.d - this.keys.a, this.keys.s - this.keys.w);
                velocity.setMagnitude(this.speed);

                this.position.add(velocity);
                break;
            case this.stateEnum.DAZED:
                this.position.lerp(this.knockback, 0.2);
                if (this.position.distance(this.knockback) < 1) this.state = this.stateEnum.NOTHING;
                break;
            case this.stateEnum.MELEE:
                break;
        }
        this.healthBar.changeValue(0.2);
        this.manaBar.changeValue(0.1);

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].duration <= 0) {
                this.bullets.splice(i, 1);
            }
        }

        if (this.mice[0] == 1 && this.manaBar.current > 5) {
            this.bullets.push(new Bullet(this.position, this.angle));
            this.manaBar.changeValue(-5);
            this.mice[0] = 0;
        }
    }

    collideWithEnemies(enemyManager) {
        for (let i = 0; i < enemyManager.enemies.length; i++) {
            let dist = this.position.distance(enemyManager.enemies[i].position);
            if (dist < this.size + enemyManager.enemies[i].size) {
                //Collide
                let knockPosition = this.position.clone();
                let enemyVelocity = enemyManager.enemies[i].velocity.clone();
                enemyVelocity.setMagnitude(30);
                knockPosition.add(enemyVelocity);
                this.knockback.set(knockPosition);
                this.healthBar.changeValue(-20);

                this.state = this.stateEnum.DAZED;

                knockPosition = enemyManager.enemies[i].position.clone();
                enemyVelocity = enemyManager.enemies[i].velocity.clone();
                enemyVelocity.setMagnitude(40).reverse();
                knockPosition.add(enemyVelocity);
                enemyManager.enemies[i].knockback.set(knockPosition);

                enemyManager.enemies[i].state = enemyManager.enemies[i].stateEnum.DAZED;
            }

            for (let j = this.bullets.length - 1; j >= 0; j--) {
                let dist = this.bullets[j].position.distance(enemyManager.enemies[i].position);
                if (dist < this.bullets[j].size + enemyManager.enemies[i].size) {
                    this.bullets.splice(j, 1);

                    //Collide
                    let knockPosition = enemyManager.enemies[i].position.clone();
                    let enemyVelocity = enemyManager.enemies[i].velocity.clone();
                    enemyVelocity.setMagnitude(40).reverse();
                    knockPosition.add(enemyVelocity);
                    enemyManager.enemies[i].knockback.set(knockPosition);

                    enemyManager.enemies[i].state = enemyManager.enemies[i].stateEnum.DAZED;

                    enemyManager.enemies[i].health.changeValue(-20);
                }
            }
        }
    }

    getKeys(key, state) {
        if (this.keys[key] != null) this.keys[key] = state ? 1 : 0;
    }

    getMouse(button, state) {
        if (this.mice[button] != null) this.mice[button] = state ? 1 : 0;
    }
}

class Bullet {
    constructor(position, angle) {
        this.position = new Vector2D(position.x, position.y);
        this.velocity = new Vector2D();
        this.velocity.setAngle(Math.toDegrees(angle - Math.HALF_PI)).setMagnitude(15);
        this.size = 10;

        this.duration = 180;
    }

    show() {
        context.fillStyle = '#08f';
        context.beginPath();
        context.ellipse(this.position.x, this.position.y, this.size, this.size, 0, 0, Math.TWO_PI);
        context.closePath();
        context.fill();
    }

    update() {
        this.position.add(this.velocity);
        this.duration--;
    }
}

class Camera {
    constructor() {
        this.position = new Vector2D();
        this.smoothness = 0.15;
    }

    followPoint(point) {
        this.position.set(point);
    }

    followPointSmooth(point) {
        this.position.lerp(point, this.smoothness);
    }
}

class EnemyManager {
    constructor() {
        this.enemySpawners = [new EnemySpawner(new Vector2D(600, 500), 2, 10)];
        this.enemies = [];
    }

    show() {
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].show();
        }
    }

    update(entity) {
        for (let i = this.enemySpawners.length - 1; i >= 0; i--) {
            this.enemySpawners[i].update();
            if (this.enemySpawners[i].shouldSpawn) {
                this.enemies.push(new Enemy(this.enemySpawners[i].position));
                this.enemySpawners[i].shouldSpawn = false;
            } else if (this.enemySpawners[i].finished) {
                this.enemySpawners.splice(i, 1);
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].follow(entity, this.enemies);
            this.enemies[i].update();
            if (this.enemies[i].dead) {
                this.enemies.splice(i, 1);
                entity.xpBar.changeValue(1);
            }
        }
    }
}

class EnemySpawner {
    constructor(position, delay, max) {
        this.position = position;
        this.delay = delay;
        this.max = max;

        this.enemyCount = 0;
        this.timer = 0;
        this.shouldSpawn = false;
        this.finished = false;
    }

    update() {
        if (this.enemyCount < this.max) {
            this.timer++;
            if (this.timer > this.delay * 60) {
                this.timer = 0;
                this.enemyCount++;
                this.shouldSpawn = true;
            }
        } else {
            this.finished = true;
        }
    }
}

class Enemy {
    constructor(position) {
        this.position = position.clone() || new Vector2D().random(100);
        this.velocity = new Vector2D();
        this.speed = 3;
        this.size = 15;
        this.stateEnum = {
            FOLLOWING: 0,
            DAZED: 1,
            PEACEFUL: 2
        }

        this.health = new StatusBar(0, 50);
        this.health.current = 50;

        this.state = this.stateEnum.FOLLOWING;

        this.knockback = new Vector2D();
        this.dead = false;
    }

    show() {
        context.fillStyle = '#f00';
        context.beginPath();
        context.ellipse(this.position.x, this.position.y, this.size, this.size, 0, 0, Math.TWO_PI);
        context.closePath();
        context.fill();
    }

    update() {
        if (this.health.current <= 0) this.dead = true;
        switch (this.state) {
            case this.stateEnum.FOLLOWING:
                this.position.add(this.velocity);
                break;
            case this.stateEnum.DAZED:
                this.position.lerp(this.knockback, 0.2);
                if (this.position.distance(this.knockback) < 1) this.state = this.stateEnum.FOLLOWING;
                break;
            case this.stateEnum.PEACEFUL:
                break;
        }
    }

    follow(entity, otherEnemies) {
        let angle = Math.atan2(entity.position.y - this.position.y, entity.position.x - this.position.x);
        this.velocity.x = Math.cos(angle) * this.speed;
        this.velocity.y = Math.sin(angle) * this.speed;
        for (let i = 0; i < otherEnemies.length; i++) {
            if (otherEnemies[i] == this) continue;
            if (this.position.distance(otherEnemies[i].position) < 40) {
                let diff = this.position.clone();
                diff.subtract(otherEnemies[i].position).normalize();
                this.velocity.add(diff);
            }
        }
    }
}