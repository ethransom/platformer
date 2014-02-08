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
})();