var Game = null;
var connection = null;

var keys = {
	down: function(e) {
		e = e.keyCode;
		if (e == 37) keys.left = true; //left
		if (e == 39) keys.right = true; //right
		if (e == 32) Game.player.jump(); //space

		//dudemove=true;
	},
	up: function(e) {
		e = e.keyCode;
		if (e == 37) keys.left = false; //left
		if (e == 39) keys.right = false; //right
	},
	init: function() {
		keys.left = false;
		keys.right = false;
	}
};

window.onload = function() {
	$.getJSON("levels/tiled_test.json", function(data) {
		var layers = data['layers'];

		var scenery_data, collision_data;

		layers.forEach(function (element) {
			if (element.name == "scenery") {
				console.log(element);
				scenery_data = element;
			} else if (element.name == "entities") {
				element['objects'].forEach(function (obj) {
					if (obj.name == "player") {
						console.log("PLAYER: " + obj.x + ", " + obj.y);
						Game.player = new Player(
							obj.x + (Game.map.blockwidth / 2),
							obj.y + (Game.map.blockwidth / 2) - 64, 
							Game.map.blockwidth, 
							Game.map.blockheight
						);
					}
				});
			} else if (element.name == 'collision') {
				collision_data = element;
			}
		});

		Game.map.load(scenery_data);
		Game.map.loadCollision(collision_data);

		// connection.open();
		Game.draw();
	});

	var foo = document.getElementById("canvas");
	var w = document.body.clientWidth;
	var h = document.body.clientHeight;
	window.addEventListener('keydown', keys.down, true);
	window.addEventListener('keyup', keys.up, true);
	keys.init();
	addEventListener('mousedown', function(e) {
		//console.log(Game.player.corners.br,Game.player.corners.tr);
		//console.log(e.pageX,e.pageY,loc(Game.player.x,Game.player.y).walkable );
	}, true);
	foo.width = w;
	foo.height = h;
	Game = new game(w, h);
	// connection = new Connection();

	Game.map = new Map();

	$(window).resize(function() {
		var width = $(window).width();
		var height = $(window).height();
		Game.viewport.resize(width, height);
		var canvas = $('#canvas').get()[0]
		canvas.width = width;
		canvas.height = height;
	});
}

function toRadians(deg) {
	return ((deg / 360) * (2 * Math.PI));
}

function toDeg(rad) {
	return (rad * (180 / Math.PI));
}

function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function Sprite() {

}

Sprite.prototype.hidden = false;