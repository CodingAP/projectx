function Troop(x, y) {
	this.x = x;
	this.y = y;
	this.w = 5;
	this.show = function() {
		circle(this.x, this.y, this.w, 'gray');
	}
	this.findNearestTarget = function(a) {
		return (dist(this.x, this.y, a.x, a.y));
	}
}