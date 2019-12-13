function Enemy(x, y) {
	this.x = x;
	this.y = y;
	this.w = 15;
	this.dead = false;
	this.health = 30;
	this.max = 30;
	this.spd = 1.25;
	this.show = function() {
		circle(this.x, this.y, this.w, 'green');
		rect(this.x - this.w, this.y - 25, this.health, 5, 'red');
	}
	this.collisionBox = function() {
		return {
			x: this.x - this.w,
			y: this.y - this.w,
			w: this.w * 2,
			h: this.w * 2
		}
	}
	this.moveTo = function(a) {
		if (a.x > this.x) {
			this.x += this.spd;
		} else if (a.x < this.x) {
			this.x -= this.spd;
		}
		if (a.y > this.y) {
			this.y += this.spd;
		} else if (a.y < this.y) {
			this.y -= this.spd;
		}
	}
	this.updateBars = function() {
		if (this.health <= 0) {
			this.x = Math.random() * 1000;
			this.y = Math.random() * 1000;
			this.health = this.max;
			if (this.x > canvas.width) {
				this.x -= 100
			}
			if (this.y > canvas.height) {
				this.y -= 100
			}
		}
	}
}