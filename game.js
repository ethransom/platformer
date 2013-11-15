function game(w, h) {
	this.box = null;
	this.map = new Map();
	this.units = [];
	this.player = null;
	this.w = 0;
	this.h = 0;
	this.offsetX = 0;
	this.offsetY = 0;
	this.mousex = 50;
	this.mousey = 50;
	this.gametime = 0;
	this.score = 0;

	this.timer = setInterval("Game.uptimer()", 1000);
	this.uptimer = function() {
		this.gametime++;
	};
	this.lastupdate = 0;
	this.width = w;
	this.height = h;
	this.viewport = new Viewport(w, h, this);
	this.ctx = document.getElementById("canvas").getContext("2d");
	this.ctx.translate(0, 0);
	this.ctx.scale(1, 1);
	this.paused = false;
	this.fps = 0;
	this.frames = 0;
	this.last_snap = 0;
	this.draw = function() {
		var currentTime = (new Date).getTime();
		var dtime = 0;
		if (this.lastupdate) {
			dtime = (currentTime - this.lastupdate) / 1000;
		}
		this.lastupdate = currentTime;
		//dtime = .050;

		if (this.last_snap < this.gametime) {
			this.fps = this.frames;
			this.frames = 0;
			this.last_snap = this.gametime;
			$("#fps").html(this.fps);
		} else {
			this.frames++;
		}

		var c = this.ctx;

		c.fillStyle = 'white';
		c.fillRect(0, 0, Game.width, Game.height);

		c.save();

		this.viewport.center(this.player.x, this.player.y);
		this.viewport.draw(dtime, c);


		this.map.draw(dtime, c);
		for (var u = 0; u < this.units.length; u++) {
			this.units[u].draw(dtime, c);
		}
		this.player.draw(dtime, c);
		//preform scrolling calculations

		c.restore();

        c.fillStyle = 'black';
        c.font = 10 + "px monospace";
        c.textBaseline = 'hanging';
		c.fillText("shift_x: " + Game.viewport.shift_x, 20, 10);
		c.fillText("shift_y: " + Game.viewport.shift_y, 20, 20);
		c.fillText("width: " + Game.viewport.width, 20, 30);
		c.fillText("height: " + Game.viewport.height, 20, 40);
		c.fillText("map.width: " + Game.map.width, 20, 50);
		c.fillText("map.height: " + Game.map.height, 20, 60);
		c.fillText("player.x: " + Game.player.x, 20, 70);
		c.fillText("player.y: " + Game.player.y, 20, 80);

		if (!this.paused) setTimeout('Game.draw()', 0);
	};
}