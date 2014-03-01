var environment = 'client';

var Game = null;
var connection = null;
var player = new Player();
var chat = [];
var coins = [];

// Require.js allows us to configure shortcut alias
require.config({
  // The shim config allows us to configure dependencies for
  // scripts that do not call define() to register a module
  shim: {
    'socketio': {
      exports: 'io'
    },
    // 'underscore': {
      // exports: '_'
    // },
    // 'backbone': {
      // deps: [
        // 'underscore',
        // 'jquery'
      // ],
      // exports: 'Backbone'
    // }
  },
  paths: {
    // jquery: 'jquery.min',
    // underscore: 'lodash.min',
    // backbone: 'backbone',
    socketio: '../socket.io/socket.io',
  }
});

var keys = {
	down: function(e) {
		code = e.keyCode;
		if (code == 37) keys.left = true; //left
		if (code == 39) keys.right = true; //right
		if (code == 32) $.go('jump'); //space
		if (code === 191) $.go('get_chat');
		if (code === 9) {
			$.go('ui_fadein');
			e.preventDefault();
		}
	},
	up: function(e) {
		e = e.keyCode;
		if (e == 37) keys.left = false; //left
		if (e == 39) keys.right = false; //right
		if (e === 9) $.go('ui_fadeout');
	},
	init: function() {
		keys.left = false;
		keys.right = false;
	}
};

require(['./scripts/level', './scripts/connection', './scripts/stats_screen'], function (Level, Connection, StatsScreen) {
	function use_level(data) {
		Game.map = new Level(data);
		Game.h = Game.map.rows.length;
		Game.w = Game.map.rows[0].length;
	}

	function switch_to_room(name) {
		Game.current_level = name;
		console.log("Switching out level for ", name);
		use_level(levels[name]);
		$.go('level_switch', name);
	}

	$.on('room_switch', function (e, name) {
		switch_to_room(name);
	});

	var init_fn = function() {
		window.levels = {};

		$.getJSON("/level_list.json", {}, function (data) {
			var level_list = data['levels'];
			Game.current_level = data['default'];

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
			console.log("lfsdkjflsdjf");
			Game.draw();
		});

		var ss = new StatsScreen();
		Game.on('uidraw', ss.draw);
		
		connection = new Connection();

		$('#canvas').on('contextmenu', function (e) {
			$.go('shoot', {x: e.pageX, y: e.pageY});
			e.preventDefault();
			return false;
		});

		$(window).resize(function() {
			var width = document.body.clientWidth;
			var height = document.body.clientHeight;
			Game.map.viewport.resize(width, height);
			var canvas = $('#canvas').get()[0]
			canvas.width = width;
			canvas.height = height;
			Game.width = width;
			Game.height = height;
		});
	};

	init_fn();
});
