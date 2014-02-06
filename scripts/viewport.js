function Viewport(w, h, game) {
	this.shift_x = 0;
	this.shift_y = 0;

	this.game = game;

	this.width = w;
	this.height = h;

	this.draw = function(dtime, ctx) {
		ctx.translate(Math.floor(this.shift_x), Math.floor(this.shift_y));
	};

	this.move = function(x, y) {
		this.shift_x = x;
		this.shift_y = y;
	};

	this.withinBounds = function(x, y) {
		return (x > this.shift_x &&
			y > this.shift_y &&
			x < (this.shift_x + this.width) &&
			y < (this.shift_y + this.height));
	};

	this.center = function(x, y) {
		this.shift_x = (this.width / 2) - x;
		this.shift_y = (this.height / 2) - y;


		// prevent from showing empty space below and to the right
		if ((this.game.map.width - (-this.shift_x + this.width)) < 0)
			this.shift_x = -(this.game.map.width - this.width);
		if ((this.game.map.height - (-this.shift_y + this.height)) < 0)
			this.shift_y = -(this.game.map.height - this.height);

		// prevent from showing empty space above and to the left
		if (this.shift_x > 0) this.shift_x = 0;
		if (this.shift_y > 0) this.shift_y = 0;
	};

	this.resize = function(new_width, new_height) {
		this.width = new_width;
		this.height = new_height;
	};
}