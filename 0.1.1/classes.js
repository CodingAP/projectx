class Player {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.respawnPosition = this.position.clone();
        this.velocity = new Vector2D();
        this.moveSpeed = 5;
        this.size = 25;
        this.rotation = 0;
        this.keys = { w: false, a: false, s: false, d: false };
    }

    show(context) {
        context.fillStyle = '#fff';
        context.strokeStyle = '#fff';
        context.lineWidth = 5;
        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(this.rotation);
        context.beginPath();
        context.ellipse(0, 0, this.size, this.size, 0, 0, Math.TWO_PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(40, 0);
        context.stroke();
        context.closePath();
        context.restore();
    }

    update() {
        let direction = new Vector2D();
        direction.x = (this.keys.a ? -1 : 0) + (this.keys.d ? 1 : 0);
        direction.y = (this.keys.w ? -1 : 0) + (this.keys.s ? 1 : 0);
        direction.normalize().multiply(this.moveSpeed);

        this.velocity.set(direction);
        this.position.add(this.velocity);

        if (this.position.x - this.size > canvas.width) {
            this.position.x = -this.size;
        } else if (this.position.x + this.size < 0) {
            this.position.x = canvas.width + this.size;
        }

        if (this.position.y - this.size > canvas.height) {
            this.position.y = -this.size;
        } else if (this.position.y + this.size < 0) {
            this.position.y = canvas.height + this.size;
        }
    }

    lookAt(x, y) {
        this.rotation = Math.atan2(y - this.position.y - this.size * 2, x - this.position.x - this.size * 2);
    }

    reset() {
        this.position.set(this.respawnPosition);
        this.velocity.set(0);
        this.size = 25;
    }

    getKey(key, state) {
        if (this.keys[key] != null) {
            this.keys[key] = state;
        }
    }
}