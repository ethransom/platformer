var Game = null;
var connection = null;
var player = new Player();
var chat = [];
var coins = [];

var keys = {
	down: function(e) {
		e = e.keyCode;
		if (e == 37) keys.left = true; //left
		if (e == 39) keys.right = true; //right
		if (e == 32) $.go('jump'); //space
		if (e === 191) $.go('get_chat');

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

function use_level(data) {
	Game.map = new Level('fu bar');

	var layers = data['layers'];

	var scenery_data, collision_data, portal_data = [];

	layers.forEach(function (element) {
		if (element.name == "scenery") {
			scenery_data = element;
		} else if (element.name == "entities") {
			element['objects'].forEach(function (obj) {
				if (obj.name == "player") {
					console.log("PLAYER: " + obj.x + ", " + obj.y);
					player.x = obj.x + (Game.map.blockwidth / 2);
					player.y = obj.y + (Game.map.blockwidth / 2) - 64;
				} else if (obj.name === 'portal') {
					portal_data.push(obj);
				}
			});
		} else if (element.name == 'collision') {
			collision_data = element;
		}
	});

	Game.map.load(scenery_data);
	Game.map.load_portals(portal_data);
	Game.map.loadCollision(collision_data);
	Game.map.add(player);
}

function switch_to_room(name) {
	Game.current_level = name;
	use_level(levels[name]);
	$.go('level_switch', name);
}

window.onload = function() {
	window.levels = {};

	$.getJSON("/level_list.json", {}, function (data) {
		var level_list = data['levels'];
		Game.current_level = data['default'];
		console.log("CURLEV", Game.current_level);

		var num_loaded = 0;
		level_list.forEach(function (e) {
			console.log("fetching ", e);
			$.getJSON("levels/" + e, {}, function(data) {
				levels[e] = data;
				num_loaded++;

				if (num_loaded == level_list.length) {
					Game.trigger('levels_loaded');
				}
			});
		});
	});

	var foo = document.getElementById("canvas");
	var w = document.body.clientWidth;
	var h = document.body.clientHeight;
	window.addEventListener('keydown', keys.down, true);
	window.addEventListener('keyup', keys.up, true);
	keys.init();
	foo.width = w;
	foo.height = h;
	Game = new Ninja.Game(w, h);
	Game.on('uidraw', function (dtime, c) {
		c.fillStyle = 'black';
		c.font = 10 + "px monospace";
		c.textBaseline = 'hanging';
		c.fillText("shift_x: " + this.map.viewport.shift_x, 20, 10);
		c.fillText("shift_y: " + this.map.viewport.shift_y, 20, 20);
		c.fillText("width: " + this.map.viewport.width, 20, 30);
		c.fillText("height: " + this.map.viewport.height, 20, 40);
		c.fillText("map.width: " + this.map.width, 20, 50);
		c.fillText("map.height: " + this.map.height, 20, 60);
		c.fillText("player.x: " + player.x, 20, 70);
		c.fillText("player.y: " + player.y, 20, 80);
		c.fillText("net id: " + connection.id, 20, 90);
		c.fillText("room: " + Game.current_level, 20, 100);

		c.fillStyle = 'black';
		c.font = 10 + "px monospace";
		c.textBaseline = 'hanging';
		for (var i = 0; i < chat.length && i < 8; i++) {
			c.fillText(chat[i], 20, 120 + (10 * i));
		}
	});
	Game.on('draw', function (dtime, c) {
		coins.forEach(function (e) {
			e.draw(dtime, c);
		});
	});

	Game.on('levels_loaded', function () {
		use_level(levels[Game.current_level]);
		connection.open();
		Game.draw();
	});
	
	connection = new Connection();

	$(window).resize(function() {
		var width = $(window).width();
		var height = $(window).height();
		Game.map.viewport.resize(width, height);
		var canvas = $('#canvas').get()[0]
		canvas.width = width;
		canvas.height = height;
	});
}
