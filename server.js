var util = require("util");
var events = require("events");

function Server() {
  events.EventEmitter.call(this);

  this.start = function () {
  	var that = this;
	setInterval(function () {
	  that.emit('tick');
	}, 100);
  };
}

util.inherits(Server, events.EventEmitter);

module.exports = Server;
