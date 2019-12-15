let mapBounds = {
    x: -1000,
    y: -1000,
    width: 2000,
    height: 2000
}

class Player {
    constructor() {
        this.position = new Vector2D(Math.randomInt(mapBounds.x, mapBounds.x + mapBounds.width), Math.randomInt(mapBounds.y, mapBounds.y + mapBounds.height));
        this.size = 25;
        this.speed = 5;
        this.angle = 0;

        this.colliderBox = new CircleCollider(this.position.x, this.position.y, this.size);

        this.stateEnum = {
            NOTHING: 0,
            DAZED: 1,
            MELEE: 2,
            DYING: 3
        }

        this.weaponEnum = {
            GUN: 0,
            SWORD: 1
        }

        this.bulletDamage = 15;
        this.meleeDamage = 30;
        this.defense = 1;

        this.state = this.stateEnum.NOTHING;
        this.weapon = this.weaponEnum.GUN;

        this.meleeDuration = 10;
        this.meleeCurrent = 0;
        this.sword = new RectangleCollider(this.position.x, this.position.y, 20, 0);
        this.swordRotation = 0;
        this.swordSwing = false;

        this.dead = false;
        this.lifespan = 20;

        this.healthBar = new StatusBar(0, 100);
        this.healthBar.current = 100;
        this.manaBar = new StatusBar(0, 50);
        this.manaBar.current = 50;
        this.xpBar = new StatusBar(0, 5);

        this.level = 1;

        this.minimapColor = '#fff';

        this.uiInfo = {
            name: 'Player' + Math.floor(Math.random() * 1000000),
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

        this.keys = { w: 0, a: 0, s: 0, d: 0, 1: 0, 2: 0 };
        this.mice = [0, 0, 0, 0, 0];
        this.bullets = [];
        this.knockback = new Vector2D();
    }

    reset() {
        this.position = new Vector2D(Math.randomInt(mapBounds.x, mapBounds.x + mapBounds.width), Math.randomInt(mapBounds.y, mapBounds.y + mapBounds.height));
        this.keys = { w: 0, a: 0, s: 0, d: 0, 1: 0, 2: 0 };
        this.mice = [0, 0, 0, 0, 0];
        this.sword.setHeight(0);
        this.dead = false;
        this.lifespan = 20;
        this.healthBar.current = 100;
        this.manaBar.current = 50;
        this.xpBar.current = 0;
        this.xpBar.max = 5;
        this.level = 1;
        this.state = this.stateEnum.NOTHING;
    }

    show() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].show();
        }

        let position = this.position;

        context.fillStyle = 'rgba(255, 255, 255, ' + Math.map(this.lifespan, 0, 20, 0, 1) + ')';

        context.save();
        context.translate(position.x, position.y);

        switch (this.weapon) {
            case this.weaponEnum.GUN:
                context.rotate(this.angle);
                context.fillRect(-this.size * 3 / 4, -this.size * 1.5, this.size * 1.5, this.size * 1.5);
                break;
            case this.weaponEnum.SWORD:
                context.beginPath();
                for (let i = 0; i <= this.sword.points.length; i++) {
                    let p = this.sword.points[i % this.sword.points.length];
                    context.lineTo(p.x - this.position.x, p.y - this.position.y);
                }
                context.closePath();
                context.fill();
                break;
        }

        context.beginPath();
        context.ellipse(0, 0, this.size, this.size, 0, 0, Math.TWO_PI);
        context.closePath();
        context.fill();

        context.restore();
    }

    update() {
        if (this.healthBar.current == 0) this.state = this.stateEnum.DYING;
        switch (this.state) {
            case this.stateEnum.MELEE:
                this.meleeCurrent++;
                this.sword.setHeight(100);
                if (this.meleeDuration <= this.meleeCurrent) {
                    this.state = this.stateEnum.NOTHING;
                    this.sword.setHeight(0);
                }
            case this.stateEnum.NOTHING:
                if (this.meleeCurrent > 0 && this.state == this.stateEnum.NOTHING) this.meleeCurrent--;

                let velocity = new Vector2D(this.keys.d - this.keys.a, this.keys.s - this.keys.w);
                velocity.setMagnitude(this.speed);

                let newPosition = this.position.clone().add(velocity);
                newPosition.clamp(mapBounds.x, mapBounds.x + mapBounds.width, mapBounds.y, mapBounds.y + mapBounds.height);

                this.position.set(newPosition);

                if (this.keys['1']) this.weapon = this.weaponEnum.GUN;
                if (this.keys['2']) this.weapon = this.weaponEnum.SWORD;
                break;
            case this.stateEnum.DAZED:
                this.position.lerp(this.knockback, 0.2);
                if (this.position.distance(this.knockback) < 1) {
                    this.state = (this.meleeCurrent != 0) ? this.stateEnum.MELEE : this.stateEnum.NOTHING;
                }
                break;
            case this.stateEnum.DYING:
                this.lifespan--;
                if (this.lifespan <= 0) this.dead = true;
                break;
        }

        this.healthBar.changeValue(0.2);
        this.manaBar.changeValue(0.1);

        if (this.xpBar.current == this.xpBar.max) {
            this.xpBar.current = 0;
            this.xpBar.max += 3;
            this.level++;
        }

        this.colliderBox.setPosition(this.position.x, this.position.y);

        this.swordRotation = Math.map(this.meleeCurrent, 0, this.meleeDuration, (this.swordSwing ? -1 : 1) * Math.QUARTER_PI, (this.swordSwing ? 1 : -1) * Math.QUARTER_PI);
        let offsetX = Math.cos(this.angle + this.swordRotation - Math.HALF_PI) * this.sword.height / 2;
        let offsetY = Math.sin(this.angle + this.swordRotation - Math.HALF_PI) * this.sword.height / 2;
        this.sword.setPosition(this.position.x + offsetX, this.position.y + offsetY);
        this.sword.setRotation(this.angle + this.swordRotation);

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].duration <= 0) {
                this.bullets.splice(i, 1);
            }
        }

        if (this.mice[0] == 1 && this.manaBar.current > 5) {
            switch (this.weapon) {
                case this.weaponEnum.GUN:
                    this.meleeCurrent = 0;
                    this.bullets.push(new Bullet(this.position, this.angle));
                    this.manaBar.changeValue(-5);
                    break;
                case this.weaponEnum.SWORD:
                    if (this.meleeCurrent == 0) {
                        this.state = this.stateEnum.MELEE;
                        this.swordSwing = !this.swordSwing;
                    }
            }
            this.mice[0] = 0;
        }
    }

    followMouse(camera, gameplayUI) {
        let offset = camera.position.clone().subtract(this.position);
        let translatedPosition = new Vector2D(gameplayUI.position.x + (gameplayUI.width / 2), gameplayUI.position.y + (gameplayUI.height / 2)).subtract(offset);
        this.angle = Math.atan2(mouseY - translatedPosition.y, mouseX - translatedPosition.x) + Math.HALF_PI;
    }

    collideWithEnemies(enemyManager) {
        for (let i = 0; i < enemyManager.enemies.length; i++) {
            if (this.colliderBox.collideWith(enemyManager.enemies[i].colliderBox)) {
                //Collide
                let knockPosition = this.position.clone();
                let enemyVelocity = enemyManager.enemies[i].velocity.clone();
                enemyVelocity.setMagnitude(30);
                knockPosition.add(enemyVelocity);
                knockPosition.clamp(mapBounds.x, mapBounds.x + mapBounds.width, mapBounds.y, mapBounds.y + mapBounds.height);
                this.knockback.set(knockPosition);
                this.healthBar.changeValue(-enemyManager.enemies[i].damage * this.defense);

                this.state = this.stateEnum.DAZED;

                knockPosition = enemyManager.enemies[i].position.clone();
                enemyVelocity = enemyManager.enemies[i].velocity.clone();
                enemyVelocity.setMagnitude(40).reverse();
                knockPosition.add(enemyVelocity);
                knockPosition.clamp(mapBounds.x, mapBounds.x + mapBounds.width, mapBounds.y, mapBounds.y + mapBounds.height);
                enemyManager.enemies[i].knockback.set(knockPosition);

                enemyManager.enemies[i].state = enemyManager.enemies[i].stateEnum.DAZED;
            }
            if (this.sword.collideWith(enemyManager.enemies[i].colliderBox) && enemyManager.enemies[i].state != enemyManager.enemies[i].stateEnum.DAZED) {
                let knockPosition = enemyManager.enemies[i].position.clone();
                let enemyVelocity = enemyManager.enemies[i].velocity.clone();
                enemyVelocity.setMagnitude(40).reverse();
                knockPosition.add(enemyVelocity);
                knockPosition.clamp(mapBounds.x, mapBounds.x + mapBounds.width, mapBounds.y, mapBounds.y + mapBounds.height);
                enemyManager.enemies[i].knockback.set(knockPosition);

                enemyManager.enemies[i].state = enemyManager.enemies[i].stateEnum.DAZED;

                enemyManager.enemies[i].health.changeValue(-this.meleeDamage * enemyManager.enemies[i].defense);
            }

            for (let j = this.bullets.length - 1; j >= 0; j--) {
                if (this.bullets[j].colliderBox.collideWith(enemyManager.enemies[i].colliderBox)) {
                    this.bullets.splice(j, 1);

                    let knockPosition = enemyManager.enemies[i].position.clone();
                    let enemyVelocity = enemyManager.enemies[i].velocity.clone();
                    enemyVelocity.setMagnitude(40).reverse();
                    knockPosition.add(enemyVelocity);
                    knockPosition.clamp(mapBounds.x, mapBounds.x + mapBounds.width, mapBounds.y, mapBounds.y + mapBounds.height);
                    enemyManager.enemies[i].knockback.set(knockPosition);

                    enemyManager.enemies[i].seen = true;
                    enemyManager.enemies[i].state = enemyManager.enemies[i].stateEnum.DAZED;

                    enemyManager.enemies[i].health.changeValue(-this.bulletDamage * enemyManager.enemies[i].defense);
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

        this.colliderBox = new CircleCollider(this.position.x, this.position.y, this.size);

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
        this.colliderBox.setPosition(this.position.x, this.position.y);
        this.duration--;
    }
}

class Camera {
    constructor() {
        this.position = new Vector2D();
        this.restricted = false;
        this.smoothness = 0.15;
    }

    followPoint(point) {
        this.position.set(point);
    }

    followPointSmooth(point) {
        this.position.lerp(point, this.smoothness);
    }

    restrict(area, bounds) {
        let newPosition = this.position.clone();
        newPosition.clamp(bounds.x + area.width / 2, bounds.x + bounds.width - area.width / 2, bounds.y + area.height / 2, bounds.y + bounds.height - area.height / 2)
        this.restricted = newPosition.x != this.position.x || newPosition.y != this.position.y;
        this.position.set(newPosition);
    }
}

class EnemyManager {
    constructor() {
        this.enemySpawners = [];
        for (let i = 0; i < 3; i++) {
            this.enemySpawners.push(new EnemySpawner(new Vector2D(Math.randomInt(mapBounds.x, mapBounds.x + mapBounds.width), Math.randomInt(mapBounds.y, mapBounds.y + mapBounds.height)), 2, 10))
        }
        this.enemies = [];
        this.maxEnemies = 100;
    }

    reset() {
        this.enemySpawners = [];
        for (let i = 0; i < 3; i++) {
            this.enemySpawners.push(new EnemySpawner(new Vector2D(Math.randomInt(mapBounds.x, mapBounds.x + mapBounds.width), Math.randomInt(mapBounds.y, mapBounds.y + mapBounds.height)), 2, 10))
        }
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
            if (this.enemies.length < this.maxEnemies) {
                if (this.enemySpawners[i].shouldSpawn) {
                    let newLocation = this.enemySpawners[i].position.clone();
                    newLocation.add(new Vector2D().random(100)).clamp(mapBounds.x, mapBounds.x + mapBounds.width, mapBounds.y, mapBounds.y + mapBounds.height);
                    let newEnemy = new Enemy(newLocation);
                    this.enemies.push(newEnemy);
                    this.enemySpawners[i].shouldSpawn = false;
                } else if (this.enemySpawners[i].finished) {
                    this.enemySpawners[i] = new EnemySpawner(new Vector2D(Math.randomInt(mapBounds.x, mapBounds.x + mapBounds.width), Math.randomInt(mapBounds.y, mapBounds.y + mapBounds.height)), 2, 10);
                }
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].update();
            if (entity.dead) {
                this.enemies[i].state = this.enemies[i].stateEnum.PEACEFUL;
                this.enemies[i].seen = false;
                continue;
            }
            if (this.enemies[i].position.distance(entity.position) < 500 && !this.enemies[i].seen) {
                this.enemies[i].seen = true;
                this.enemies[i].state = this.enemies[i].stateEnum.FOLLOWING;
            }
            if (this.enemies[i].seen) {
                this.enemies[i].follow(entity, this.enemies);
            } else {
                this.enemies[i].state = this.enemies[i].stateEnum.PEACEFUL;
            }
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
            if (!this.shouldSpawn) {
                this.timer++;
                if (this.timer > this.delay * 60) {
                    this.timer = 0;
                    this.enemyCount++;
                    this.shouldSpawn = true;
                }
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
            PEACEFUL: 2,
            DYING: 3
        }

        this.damage = 20;

        this.defense = 1;

        this.colliderBox = new CircleCollider(this.position.x, this.position.y, this.size);

        this.minimapColor = '#f00';

        this.health = new StatusBar(0, 50);
        this.health.current = 50;

        this.state = this.stateEnum.FOLLOWING;

        this.knockback = new Vector2D();
        this.chooseRoamPlace();

        this.dead = false;
        this.lifespan = 20;
        this.seen = false;
    }

    chooseRoamPlace() {
        this.randomPlace = this.position.clone().add(new Vector2D().random(50));
        while (this.randomPlace.x > mapBounds.x + mapBounds.width || this.randomPlace.x < mapBounds.x || this.randomPlace.y > mapBounds.y + mapBounds.height || this.randomPlace.y < mapBounds.y) {
            this.randomPlace = this.position.clone().add(new Vector2D().random(50));
        }
    }

    show() {
        context.fillStyle = 'rgba(255, 0, 0, ' + Math.map(this.lifespan, 0, 20, 0, 1) + ')';
        context.beginPath();
        context.ellipse(this.position.x, this.position.y, this.size, this.size, 0, 0, Math.TWO_PI);
        context.closePath();
        context.fill();
    }

    update() {
        if (this.health.current <= 0) this.state = this.stateEnum.DYING;
        switch (this.state) {
            case this.stateEnum.FOLLOWING:
                this.position.add(this.velocity);
                break;
            case this.stateEnum.DAZED:
                this.position.lerp(this.knockback, 0.2);
                if (this.position.distance(this.knockback) < 1) this.state = this.stateEnum.FOLLOWING;
                break;
            case this.stateEnum.PEACEFUL:
                this.position.lerp(this.randomPlace, 0.01);
                if (this.position.distance(this.randomPlace) < 1) {
                    this.chooseRoamPlace();
                }
                break;
            case this.stateEnum.DYING:
                this.lifespan--;
                if (this.lifespan <= 0) this.dead = true;
                break;
        }
        this.colliderBox.setPosition(this.position.x, this.position.y);
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