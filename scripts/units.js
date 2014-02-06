function Unit() {
	Sprite.call(this);
}

Unit.prototype.draw = function(dtime, c) {
	if (this.falling) {
		this.dy += this.gravity;
	}

	// falling more than a block a frame can have negative impacts on collision detection. Who knew?
	if (this.dy > this.maxfall) {
		this.dy = this.maxfall;
	}
	var ny = this.y + (this.dy * dtime);
	this.checkCorners(this.x, ny);
	var corners = this.corners;

	if (corners.bl.walkable && corners.br.walkable) {
		this.falling = true;
	}
	if (!corners.bl.walkable && !corners.br.walkable) {
		this.falling = false;
		this.jumping = false;
	}
	//Check new Y position
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



	var nx = this.x + (this.dirx * this.speed) * dtime;
	this.checkCorners(nx, this.y);

	//Check new X position
	if (this.dirx == -1) { //moving left
		if (corners.lb.walkable && corners.lt.walkable) {
			this.x += (-1 * this.speed) * dtime;
		} else {
			this.x = (Math.floor(this.x / Game.map.blockwidth)) * Game.map.blockwidth + (this.w / 2);
			this.dirx = 1;
			//ob.x = ob.xtile*game.tileW+ob.width;
		}
	}
	if (this.dirx == 1) { //moving right
		if (corners.rt.walkable && corners.rb.walkable) {
			this.x += (this.speed * dtime);
		} else {
			this.x = ((Math.floor(this.x / Game.map.blockwidth) + 1) * Game.map.blockwidth - (this.w / 2)) + 1;
			this.dirx = -1;
		}
	}

	if (this.hidden) return;
	c.save();
	c.translate(this.x, this.y);
	c.fillStyle = this.color;
	c.fillRect(-20, -20, 40, 40);
	c.restore();
};

Unit.prototype.checkCorners = function(nx, ny) {
	var hh = this.h / 2;
	var hw = this.w / 2;
	var up = ny - hh;
	var down = ny + hh;
	var right = nx + hw;
	var left = nx - hw;
	this.corners = {
		tl: Game.map.loc(left + 2, up),
		tr: Game.map.loc(right - 2, up),
		bl: Game.map.loc(left + 2, down),
		br: Game.map.loc(right - 2, down),
		rt: Game.map.loc(right, up + 2),
		rb: Game.map.loc(right, down - 2),
		lt: Game.map.loc(left, up + 2),
		lb: Game.map.loc(left, down - 2)
	};
};

//import basic unit properties and methods
Blob.prototype = new Unit;
Blob.prototype.constructor = Blob;

function Blob(x, y, w, h) {
	Unit.call(this);
	this.dirx = 1;
	this.color = 'red';
	this.speed = 50;
	this.x = x;
	this.y = y;
	this.w = 40;
	this.h = 40;
	this.dy = 0;
	this.gravity = 5;
}
