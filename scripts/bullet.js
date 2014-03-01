define(function () {
	var counter = 0;

	function Bullet(x, y, target_x, target_y, level) {
		Ninja.Sprite.call(this);

		if (typeof x == 'object') {
			var o = x;
			this.pos = new Ninja.Vector(o.x, o.y);
			this.id = o.id;

			return;
		}

		this.velocity = (new Ninja.Vector(target_x - x, target_y - y)).unit_vec();

		this.pos = new Ninja.Vector(x, y);

		this.velocity.scalar(8);

		this.level = level;

		this.id = counter;
		counter++;

		this.alive = true;

		if (environment === 'server') {
			io.sockets.emit('create_bullet!', {id: this.id, x: this.pos.x, y: this.pos.y});
		}
	}

	Bullet.prototype = new Ninja.Sprite();
	Bullet.prototype.constructor = Bullet;

	Bullet.prototype.kill = function () {
		this.alive = false;
		if (environment === 'server') io.sockets.emit("delete_bullet!", {id: this.id});
	}

	Bullet.prototype.draw = function(c) {
		c.save();
		c.translate(this.pos.x, this.pos.y);
		c.fillStyle = 'red';
		c.fillRect(-2, -2, 4, 4);
		c.restore();
	};

	Bullet.prototype.update = function (dtime, level) {
		this.pos.add(this.velocity);

		if (this.pos.x > (this.level.width * this.level.blockwidth)
			|| this.pos.x < 0
			|| this.pos.y > (this.level.height * this.level.blockheight)
			|| this.pos.y < 0) {

			this.kill();
			return;
		}

		if (this.level.loc(this.pos.x, this.pos.y).walkable != true) {
			this.kill();
		}

		if (environment === 'server') io.sockets.emit("move_bullet!", {id: this.id, x: this.pos.x, y: this.pos.y});
	};

	return Bullet;
});
