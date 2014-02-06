function SpriteSheet(url, tile_width, tile_height) {
	var w = 0;
	var h = 0;

	var tileSprites = new Image();
	this.loaded = false;
	tileSprites.onload = function () {
		this.loaded = true;

		w = this.width / tile_width;
		h = this.height / tile_height;
	}
	tileSprites.src = url;

	this.tile_width = tile_width;
	this.tile_height = tile_height;


	this.calculate_coords = function(num) {
		if (num <= 0) return [0, 0];
		return [
			(((num ) % (w)) * 64),
			(Math.floor((num - 1) / 18) * 64)
		];
	}

	this.draw_snip = function(ctx, num) {
		try {
			var coords = this.calculate_coords(num);
			ctx.drawImage(tileSprites, 
						coords[0],
						coords[1],
						64, 64,
						0, 0,
						64, 64);
		} catch (e) {
			var coords = this.calculate_coords(num);
			console.log("ERROR WITH SPRITE SHEET: " + num, coords);
		}
	};
};