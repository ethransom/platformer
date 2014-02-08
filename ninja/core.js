var Ninja = {};

// MIXINS!
Ninja.Base = function () {};
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
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};