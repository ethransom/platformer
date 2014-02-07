function Ghost(id) {
	// console.log("new ghost", id);
	Ninja.Sprite.call(this);
	this.color = 'black';
	this.id = id;
	this.name = "";
}

Ghost.prototype = new Ninja.Sprite();
Ghost.prototype.constructor = Ghost;

Ghost.prototype.draw = function(dtime, c) {
	c.save();
	c.translate(this.x, this.y);
	c.fillStyle = this.color;
	c.fillRect(-20, -20, 40, 40);

	// draw name
	c.font = 10 + "px monospace";
	c.fillStyle = 'black';
	var width = c.measureText(this.name).width;
	c.fillRect(-0.5 * width - 5, -45, width + 10, 20);
	c.fillStyle = 'white';
	c.textBaseline = 'hanging';
	c.fillText(this.name, -0.5 * width, -40);
	c.restore();
};

Ghost.prototype.move = function (x, y) {
	this.x = x;
	this.y = y;
};

Ghost.prototype.update = function (data) {
	this.color = data.color;
	this.name = data.name;
};