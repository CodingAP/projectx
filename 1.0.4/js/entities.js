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
        this.troopDamage = 20;
        this.attack = 1;
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

        this.troopSize = 8;
        this.troops = [];
        this.invisible = false;

        this.powers = {
            supersize: {
                minLevel: 5,
                duration: 600,
                cooldown: 600,
                activated: false,
                original: {
                    duration: 600,
                    cooldown: 600
                },
                run: () => {
                    this.size = 50;
                    this.colliderBox.setRadius(this.size);
                    this.defense = 0.5;
                    this.attack = 1.5;
                },
                cleanup: () => {
                    this.size = 25;
                    this.colliderBox.setRadius(this.size);
                    this.defense = 1;
                    this.attack = 1;
                }
            },
            army: {
                minLevel: 10,
                duration: 0,
                cooldown: 1200,
                activated: false,
                original: {
                    duration: 0,
                    cooldown: 1200
                },
                run: () => {
                    for (let i = 0; i < Math.TWO_PI; i += Math.TWO_PI / this.troopSize) {
                        let newTroop = new Troop(new Vector2D(Math.cos(i) * this.size * 2 + this.position.x, Math.sin(i) * this.size * 2 + this.position.y));
                        this.troops.push(newTroop);
                    }
                },
                cleanup: () => { }
            },
            sneaky: {
                minLevel: 15,
                duration: 300,
                cooldown: 900,
                activated: false,
                original: {
                    duration: 300,
                    cooldown: 900
                },
                run: () => {
                    this.invisible = true;
                    this.lifespan = 10;
                },
                cleanup: () => {
                    this.invisible = false;
                    this.lifespan = 20;
                }
            }
        }

        this.keys = { w: 0, a: 0, s: 0, d: 0, 1: 0, 2: 0, t: 0, Enter: 0, i: 0 };
        this.mice = [0, 0, 0, 0, 0];
        this.bullets = [];
        this.knockback = new Vector2D();
    }

    reset() {
        this.position = new Vector2D(Math.randomInt(mapBounds.x, mapBounds.x + mapBounds.width), Math.randomInt(mapBounds.y, mapBounds.y + mapBounds.height));
        this.keys = { w: 0, a: 0, s: 0, d: 0, 1: 0, 2: 0, t: 0, Enter: 0, i: 0 };
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

        for (let i = this.troops.length - 1; i >= 0; i--) {
            this.troops[i].show();
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
                if (this.keys.t) this.activatePower('army');
                if (this.keys.Enter) this.activatePower('supersize');
                if (this.keys.i) this.activatePower('sneaky');
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
        let offsetX = Math.cos(this.angle + this.swordRotation - Math.HALF_PI) * (this.sword.height / 4 + this.size);
        let offsetY = Math.sin(this.angle + this.swordRotation - Math.HALF_PI) * (this.sword.height / 4 + this.size);
        this.sword.setPosition(this.position.x + offsetX, this.position.y + offsetY);
        this.sword.setRotation(this.angle + this.swordRotation);

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].duration <= 0) {
                this.bullets.splice(i, 1);
            }
        }

        for (let i = this.troops.length - 1; i >= 0; i--) {
            this.troops[i].update();
        }

        let powers = Object.keys(this.powers);
        for (let i = 0; i < powers.length; i++) {
            if (this.powers[powers[i]].activated) {
                if (this.powers[powers[i]].duration <= 0) {
                    if (this.powers[powers[i]].cooldown == this.powers[powers[i]].original.cooldown) this.powers[powers[i]].cleanup();
                    this.powers[powers[i]].cooldown--;
                    if (this.powers[powers[i]].cooldown <= 0) {
                        this.powers[powers[i]].activated = false;
                        this.powers[powers[i]].duration = this.powers[powers[i]].original.duration;
                        this.powers[powers[i]].cooldown = this.powers[powers[i]].original.cooldown;
                    }
                } else {
                    this.powers[powers[i]].duration--;
                }
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

    activatePower(power) {
        if (this.powers[power] == null) return;
        if (this.powers[power].minLevel > this.level) return;
        if (!this.powers[power].activated) {
            this.powers[power].activated = true;
            this.powers[power].run();
        }
    }

    followMouse(camera, gameplayUI) {
        let offset = camera.position.clone().subtract(this.position);
        let translatedPosition = new Vector2D(gameplayUI.position.x + (gameplayUI.width / 2), gameplayUI.position.y + (gameplayUI.height / 2)).subtract(offset);
        this.angle = Math.atan2(mouseY - translatedPosition.y, mouseX - translatedPosition.x) + Math.HALF_PI;
    }

    collideWithEnemies(enemyManager) {
        for (let i = this.troops.length - 1; i >= 0; i--) {
            this.troops[i].findClosest(enemyManager);
            this.troops[i].follow(this.troops);
        }

        for (let i = 0; i < enemyManager.enemies.length; i++) {
            if (this.colliderBox.collideWith(enemyManager.enemies[i].colliderBox) && !this.invisible) {
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

                enemyManager.enemies[i].health.changeValue(-this.meleeDamage * enemyManager.enemies[i].defense * this.attack);
            }

            for (let j = this.troops.length - 1; j >= 0; j--) {
                if (this.troops[j].colliderBox.collideWith(enemyManager.enemies[i].colliderBox)) {
                    this.troops.splice(j, 1);

                    let knockPosition = enemyManager.enemies[i].position.clone();
                    let enemyVelocity = enemyManager.enemies[i].velocity.clone();
                    enemyVelocity.setMagnitude(40).reverse();
                    knockPosition.add(enemyVelocity);
                    knockPosition.clamp(mapBounds.x, mapBounds.x + mapBounds.width, mapBounds.y, mapBounds.y + mapBounds.height);
                    enemyManager.enemies[i].knockback.set(knockPosition);

                    enemyManager.enemies[i].state = enemyManager.enemies[i].stateEnum.DAZED;

                    enemyManager.enemies[i].health.changeValue(-this.troopDamage * enemyManager.enemies[i].defense * this.attack);
                }
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

                    enemyManager.enemies[i].health.changeValue(-this.bulletDamage * enemyManager.enemies[i].defense * this.attack);
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

class Troop {
    constructor(position) {
        this.position = position;
        this.velocity = new Vector2D();
        this.target = null;
        this.size = 10;
        this.speed = 4;

        this.colliderBox = new CircleCollider(this.position.x, this.position.y, this.size);
    }

    findClosest(enemyManager) {
        let shortest = { distance: Infinity, enemy: null };
        for (let i = 0; i < enemyManager.enemies.length; i++) {
            let dist = this.position.distance(enemyManager.enemies[i].position);
            if (dist < shortest.distance && enemyManager.enemies[i].state != enemyManager.enemies[i].stateEnum.DYING) {
                shortest.distance = dist;
                shortest.enemy = enemyManager.enemies[i];
            }
        }
        this.target = shortest.enemy;
    }

    show() {
        context.fillStyle = '#555';
        context.beginPath();
        context.ellipse(this.position.x, this.position.y, this.size, this.size, 0, 0, Math.TWO_PI);
        context.closePath();
        context.fill();
    }

    update() {
        this.position.add(this.velocity);
        this.colliderBox.setPosition(this.position.x, this.position.y);
    }

    follow(otherTroops) {
        if (this.target) {
            let angle = Math.atan2(this.target.position.y - this.position.y, this.target.position.x - this.position.x);
            this.velocity.x = Math.cos(angle) * this.speed;
            this.velocity.y = Math.sin(angle) * this.speed;
            for (let i = 0; i < otherTroops.length; i++) {
                if (otherTroops[i] == this) continue;
                if (this.position.distance(otherTroops[i].position) < this.size * 2) {
                    let diff = this.position.clone();
                    diff.subtract(otherTroops[i].position).normalize();
                    this.velocity.add(diff);
                }
            }
        }
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
            if (entity.dead || entity.invisible) {
                this.enemies[i].peaceful();
                continue;
            }
            if (this.enemies[i].position.distance(entity.position) < 500 && !this.enemies[i].seen) {
                this.enemies[i].seen = true;
                this.enemies[i].state = this.enemies[i].stateEnum.FOLLOWING;
            }
            if (this.enemies[i].seen) {
                if (this.enemies[i].state != this.enemies[i].stateEnum.DAZED) {
                    this.enemies[i].follow(entity, this.enemies);
                }
            } else {
                if (this.enemies[i].state != this.enemies[i].stateEnum.DAZED) {
                    this.enemies[i].peaceful();
                }
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

    peaceful() {
        if (this.state == this.stateEnum.PEACEFUL) return;
        this.state = this.stateEnum.PEACEFUL;
        this.seen = false;
        this.chooseRoamPlace();
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