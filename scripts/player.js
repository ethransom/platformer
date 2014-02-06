//import basic unit properties and methods
Player.prototype = new Unit();
Player.prototype.constructor = Player;

function Player(x, y, w, h) {
	Unit.call(this);
	this.color = 'orange';
	this.dy = 0;
	this.x = x;
	this.y = y;
	this.w = 40;
	this.h = 40;
	this.gravity = 1000;
	this.speed = 100;
	this.thrust = -450;
	this.maxfall = 64;

	var that = this;
	$.on('playing', function () {
		console.log("purpling player");
		that.color = 'purple';
	});

	$.on('spectating', function () {
		console.log("greying player");
		that.color = '#c3c3c3';
	});
}

Player.prototype.draw = function(dtime, c) {
	var old = {
		x: this.x,
		y: this.y
	};

	if (this.falling || this.jumping) {
		this.dy += this.gravity * dtime;
	}
	if ((this.dy * dtime) > this.maxfall) {
		this.dy = this.maxfall;
		//Falling more than a block a frame can have negative impacts on collision detection. Who knew?
	}
	var ny = this.y + (this.dy * dtime);
	this.checkCorners(this.x, ny);
	var corners = this.corners;

	if (corners.bl.walkable && corners.br.walkable) {
		this.falling = true;
		//this.falling = true;
	}
	if (!corners.bl.walkable && !corners.br.walkable) {
		this.falling = false;
		this.jumping = false;
	}
	//Check new Y position
	if (this.dy < 0) { //moving up
		if (corners.tl.walkable && corners.tr.walkable) {
			this.y = ny;
		} else { //head bonk on ceilling, stop jumping and start falling
			this.y = (Math.floor(this.y / Game.map.blockheight)) * Game.map.blockheight + (this.h / 2);
			this.jumping = false;
			this.dy = 0;
			this.falling = true;
		}
	}
	if (this.dy > 0) { //moving down
		if (corners.br.walkable && corners.bl.walkable) {
			this.y = ny;
		} else { //hit ground, stop falling, jumping is okay again
			//Game.paused = true;
			this.y = ((Math.floor(this.y / Game.map.blockheight) + 1) * Game.map.blockheight - (this.h / 2)) + 1;
			this.falling = false;
			this.dy = 0;
			this.airborne = false;
		}
	}



	var dirx = 0;
	if (keys.left) {
		dirx += -1; //
	}
	if (keys.right) {
		dirx += 1;
	}
	var nx = this.x + (dirx * this.speed) * dtime;



	this.checkCorners(nx, this.y);
	var corners = this.corners;

	//Check new X position
	if (dirx == -1) { //moving left
		if (corners.lb.walkable && corners.lt.walkable) {
			this.x += (-1 * this.speed) * dtime;
		} else {
			this.x = (Math.floor(this.x / Game.map.blockwidth)) * Game.map.blockwidth + (this.w / 2);
			//ob.x = ob.xtile*game.tileW+ob.width;
		}
	}
	if (dirx == 1) { //moving right
		if (corners.rt.walkable && corners.rb.walkable) {
			this.x += (this.speed * dtime);
		} else {
			this.x = ((Math.floor(this.x / Game.map.blockwidth) + 1) * Game.map.blockwidth - (this.w / 2)) + 1;
		}
	}

	if (this.hidden) return;
	c.save();
	c.translate(this.x, this.y);
	// $('#fps').html(this.x + ", " + this.y);
	c.fillStyle = this.color;
	c.fillRect(-20, -20, 40, 40);
	c.restore();

	this.updateServer(dtime);
}

Player.prototype.jump = function() {
	if (!this.airborne && !this.jumping && !this.falling) {
		this.jumping = true;
		this.dy = this.thrust;
	}
};

var __lastUpdateBuildup = 0;
Player.prototype.updateServer = function(dtime) {
	__lastUpdateBuildup += dtime;

	if (__lastUpdateBuildup > 0.250) {
		// connection.sendUpdate(this.x, this.y);
		__lastUpdateBuildup = 0;
	}
}