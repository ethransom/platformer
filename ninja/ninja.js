var Ninja = {};

// MIXINS!
Ninja.Base = function () {
	this.children = [];
	this.add = function (i) {
		this.children.push(i);
	};
};
Ninja.Base.prototype.use = function (mixin) {
	_.extend(this, mixin);
	
	// TODO: find out why this doesn't work, mixins should probably be native
	// console.log(this, mixin);
 //    for (var prop in mixin) {
 //    	console.log(prop, mixin.hasOwnProperty(prop));
 //        if (!this.hasOwnProperty(this)) {
 //            this.prototype[prop] = mixin[prop];
 //        }
 //    }
};

// Utilities - TODO: Move to other file? 
Ninja.toRadians = function (deg) {
	return ((deg / 360) * (2 * Math.PI));
};

Ninja.toDeg = function (rad) {
	return (rad * (180 / Math.PI));
};

Ninja.distance = function (x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

Ninja.requestAnimFrame = (function (fn) {
	(function(){
	  return  window.requestAnimationFrame       ||
	          window.webkitRequestAnimationFrame ||
	          window.mozRequestAnimationFrame    ||
	          function( callback ){
	            window.setTimeout(callback, 0);
	          };
	})(fn);
});


  // function distance(x1, y1, x2, y2) {
    // return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  // };
// base mixins

Ninja.mixins = (function () {
	var events = {
		_events: {},
		'on': function (event, handler) {
			if (!this._events.hasOwnProperty(event)) {
				this._events[event] = [];
			}
			this._events[event].push(handler);
		},
		'trigger': function (event) {
			var that = this;
			var args = [].slice.call(arguments, 1);
			if (this._events.hasOwnProperty(event)) {
				this._events[event].forEach(function (e) {
					e.apply(that, args);
				});
			}
		}
	};

	return {
		'events': events
	};
})();﻿(function () {
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
})();(function () {
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

			if (!this.paused) setTimeout('Game.draw()', 0);
		};

		this.add = function (child) {
			this.children.push(child);
		};
	}

	Ninja.Game = Game;
	Ninja.Game.prototype.use(Ninja.mixins.events);
})();
Ninja.SpriteSheet = function (url, tile_width, tile_height) {
	var w = 0;
	var h = 0;

	if (typeof window != 'undefined') {
		this.tileSprites = new Image();
		this.loaded = false;
		this.tileSprites.onload = function () {
			this.loaded = true;

			w = this.width / tile_width;
			h = this.height / tile_height;
		};
		this.tileSprites.src = url;
	}

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
			ctx.drawImage(this.tileSprites, 
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
};(function () {
  // Basic vector class

  function Vector(x, y) {
    this.y = y;
    this.x = x;
  }

  Vector.prototype.add = function(vec) {
    this.y += vec.y;
    this.x += vec.x;

    return this;
  };

  Vector.prototype.unit_vec = function() {
    var l = this.length();
    return new Vector(this.x/l, this.y/l);
  };

  Vector.prototype.length = function() {
    return Math.pow(Math.pow(this.y, 2) + Math.pow(this.x, 2), .5)
  };

  Vector.prototype.angle = function() {
    return Math.atan2(this.y, this.x);
  };

  Vector.prototype.scalar = function(scalar) {
    this.y *= scalar;
    this.x *= scalar;

    return this;
  };

  Vector.prototype.toString = function() {
    return "<" + this.x + ", " + this.y + ">";
  };

  // static, creates vector from angle and magnitude
  Vector.from_polar = function (angle, magnitude) {
    return new Vector(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  };

  // static, random unit vector
  Vector.random_unit = function () {
    return Vector.from_polar(Math.random() * Math.PI, 1);
  };

  Ninja.Vector = Vector;
})();
Ninja.Sprite = function () {
};

Ninja.Sprite.prototype = new Ninja.Base();
Ninja.Sprite.prototype.constructor = Ninja.Sprite;

Ninja.Sprite.prototype.use(Ninja.mixins.events);

Ninja.Sprite.prototype.hidden = false;// adds node compatability

if (typeof module != 'undefined') {
	module.exports = Ninja;
}
