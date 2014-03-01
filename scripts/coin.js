define(function () {
	function Coin(r, c) {
		Ninja.Sprite.call(this);
		if (typeof r == 'undefined' && typeof c == 'undefined') {
			this.c = Math.floor(Math.random() * 30);
			this.r = Math.floor(Math.random() * 15);
		} else {
			this.r = r;
			this.c = c;
		}

		this.x = this.c * 64 + 32;
		this.y = this.r * 64 + 32;
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

	return Coin;
});
