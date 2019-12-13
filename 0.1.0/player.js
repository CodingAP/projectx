function Player(x, y) {
	this.x = x;
	this.y = y;
	this.sx = x;
	this.sy = y;
	this.w = 25;
	this.health = 50;
	this.exprate = 25;
	this.mana = 50;
	this.exp = 0;
	this.max = 50;
	this.rate = 0.05;
	this.level = 5;
	this.margin = 30;
	this.textmargin = 0;
	this.troops = [];
	this.show = function() {
		circle(this.x, this.y, this.w, 'white');
		rect(this.x - this.w, this.y - 40 - this.margin, this.health, 10, 'red');
		rect(this.x - this.w, this.y - 25 - this.margin, this.mana, 10, 'blue');
		rect(this.x - this.w, this.y - 10 - this.margin, this.exp, 10, 'green');
		text('Level: ' + this.level, '15px Arial', this.x - this.w + this.textmargin, this.y - 45 - this.margin, 'white');
	}
	this.move = function(x, y) {
		this.x += x;
		this.y += y;
	}
	this.wrap = function() {
		if (this.x + this.w < 0) {
			this.x = canvas.width + this.w;
		} else if (this.x - this.w > canvas.width) {
			this.x = -this.w;
		} else if (this.y + this.w < 0) {
			this.y = canvas.height + this.w;
		} else if (this.y - this.w > canvas.height) {
			this.y = -this.w;
		}
	}
	this.updateBars = function() {
		if (this.health < this.max) {
			this.health += this.rate;
		} if (this.mana < this.max) {
			this.mana += this.rate;
		} if (this.health > this.max) {
			this.health = this.max;
		} if (this.mana > this.max) {
			this.mana = this.max;
		} if (this.health < 0) {
			this.reset()
		} if (this.exp >= this.max) {
			this.level++
			this.exp = 0;
		} if (this.level == 10) {
			this.level--;
		}
	}
	this.collisionBox = function() {
		return {
			x: this.x - this.w,
			y: this.y - this.w,
			w: this.w * 2,
			h: this.w * 2
		}
	}
	this.reset = function() {
		this.x = this.sx;
		this.y = this.sy;
		this.health = this.max;
		this.mana = this.max;
		this.level = 1;
		this.exp = 0;
		this.w = 25;
		this.max = 50;
		this.margin = 30;
		this.textmargin = 0;
		this.exprate = 25;
	}
	this.collide = function(b) {
		var a = this.collisionBox();
		return (doCollison(a, b));
	}
	this.hit = function(a) {
		this.health -= 25/this.level;
		if (this.x > a.x) {
			this.x += 50;
		} else {
			this.x -= 50;
		}
	}
	this.ability1 = function() {
		this.w = 50;
		this.max = 100;
		this.margin = 55;
		this.textmargin = 25;
		this.exprate = 50;
		console.log('go');
	}
	this.ability2 = function() {
		for (var i = -2; i <= 2; i++) {
			for (var j = -2; j <= 2; j++) {
				var mod = i + j;
				if (mod % 2 == 1 || mod % 2 == -1) {
					var troop = new Troop(this.x + i * 37.5, this.y + j * 37.5);
					troops.push(troop)
				}
			}	
		}
		//console.log(troops)
	}
}