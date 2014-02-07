function Coin(r, c) {
	Ninja.Sprite.call(this);
	this.r = r;
	this.c = c;

	this.x = r * 64 + 32;
	this.y = c * 64 + 32;
}

Coin.prototype = new Ninja.Sprite();
Coin.prototype.constructor = Coin;

Coin.prototype.draw = function(dtime, c) {
	c.save();
	c.translate(this.x, this.y);
	c.fillStyle = 'yellow';
	c.fillRect(-20, -20, 40, 40);
	c.restore();
};
