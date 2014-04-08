(function () {
	Game.prototype = new Ninja.Base();
	Game.prototype.constuctor = Game;


	function Game(w, h) {
		this.gametime = 0;

		this.ghosts = {}; // should move this

		var children = [];

		this.timer = setInterval("Game.uptimer()", 1000);
		this.uptimer = function() {
			this.gametime++;
		};
		this.lastupdate = 0;
		this.width = w;
		this.height = h;
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
			if (dtime > 0.5) dtime = 0.5;
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

			c.fillStyle = '#CCFFFF';
			c.fillRect(0, 0, this.width, this.height);

			c.save();

			this.map.draw(dtime, c);

			this.trigger('draw', dtime, c);

			var that = this;
			this.children.forEach(function (e) {
				e.draw(c);
			})

			for (var key in this.ghosts) {
				this.ghosts[key].draw(dtime, c);
			}

			c.restore();

			this.trigger('uidraw', dtime, c);

			if (!this.paused) requestAnimationFrame(this.draw);
		};

		this.add = function (child) {
			this.children.push(child);
		};
	}

	Ninja.Game = Game;
	Ninja.Game.prototype.use(Ninja.mixins.events);
})();
