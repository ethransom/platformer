function Map() {
	this.blockwidth = 64;
	this.blockheight = 64;

	this.canvas = document.createElement('canvas')
	this.ctx = this.canvas.getContext('2d');
}

Map.prototype.loc = function(x, y) {
	var r = Math.floor(x / this.blockwidth);
	var c = Math.floor(y / this.blockheight);
	try {
		var loc = this.rows[c][r];
		return loc;
	} catch (e) {}
};


Map.prototype.draw = function(dtime, ctx) {
	for (var r = 0; r < this.rows.length; r++) {
		for (var c = 0; c < this.rows[r].length; c++) {
			this.rows[r][c].draw(ctx);
		}
	}
};

Map.prototype.load = function(data) {
	this.data = data.data;
	this.h = data.height;
	this.w = data.width;

	this.rows = new Array(this.h);

	for (var r = 0; r < this.h; r++) {
		this.rows[r] = new Array(this.w);
		for (var c = 0; c < this.w; c++) {
			var me = this.data.shift();
			if (me == 6)
				Game.player = new Player((c * this.blockwidth) + (this.blockwidth / 2), (r * this.blockheight) + (this.blockwidth / 2), this.blockwidth, this.blockheight);
			this.rows[r][c] = Block.from_sprite_code(me, c * this.blockwidth, r * this.blockheight, this.blockwidth, this.blockheight);
		}
	}
	Game.h = this.rows.length;
	Game.w = this.rows[0].length;

	this.width = this.rows[0].length * this.blockwidth;
	this.height = this.rows.length * this.blockheight;
};