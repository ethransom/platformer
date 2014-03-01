(function () {
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