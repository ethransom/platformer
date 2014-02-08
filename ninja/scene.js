(function () {
	function Scene() {
		this.children = [];
	}

	Scene.prototype.add = function (child) {
		this.children.push(child);
	}

	Scene.prototype.draw = function(dtime, ctx) {
		for (var r = 0; r < this.rows.length; r++) {
			for (var c = 0; c < this.rows[r].length; c++) {
				this.rows[r][c].draw(ctx);
			}
		}

		this.children.forEach(function (e) {
			e.draw(dtime, ctx);
		});
	};

	Ninja.Scene = Scene;
})();