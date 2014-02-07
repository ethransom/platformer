function Ghost(id) {
	console.log("new ghost", id);
	Ninja.Sprite.call(this);
	this.color = 'black';
	this.id = id;
}

Ghost.prototype = new Ninja.Sprite();
Ghost.prototype.constructor = Ghost;

Ghost.prototype.draw = function(dtime, c) {
	c.save();
	c.translate(this.x, this.y);
	c.fillStyle = this.color;
	c.fillRect(-20, -20, 40, 40);
	c.restore();
};

Ghost.prototype.move = function (x, y) {
	console.log("moved ", this.id, " to ", x, ", ", y);
	this.x = x;
	this.y = y;
};
