define(function () {
	function StatsScreen() {
		Ninja.Sprite.call(this);
		console.log("StatsScreen!!!");

		this.visible = false;

		var that = this;
		$.on('ui_fadein', function () {
			that.visible = true;
		});
		$.on('ui_fadeout', function () {
			that.visible = false;
		});

		this.draw = function(dtime, c) {
			if (that.visible) {
				var width = Game.map.viewport.width / 2;
				var height = Game.map.viewport.height / 2;
				var x = width / 2;
				var y = height / 2;
				c.save();
				c.translate(x, y);
				c.fillStyle = 'black';
				c.fillRect(0, 0, width, height);

				c.fillStyle = 'white';
				c.font = 10 + "px monospace";
				c.textBaseline = 'hanging';

				c.fillText(player.score, 10, 10);
				c.fillText(player.name, 50, 10);

				var i = 0;
				for (var key in Game.ghosts) {
					var e = Game.ghosts[key];
					c.fillText(e.coins, 10, 20 + (i * 10));
					c.fillText(e.name, 50, 20 + (i * 10));
					i++;
				}

				if (i === 0) {
					c.fillText("u r forevr alone :'(", 10, 20);
				}

				c.restore();
			}
		};
	}

	StatsScreen.prototype = new Ninja.Sprite();
	StatsScreen.prototype.constructor = StatsScreen;

	return StatsScreen;
});
