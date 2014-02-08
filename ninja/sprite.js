
Ninja.Sprite = function () {

};

Ninja.Sprite.prototype = new Ninja.Base();
Ninja.Sprite.prototype.constructor = Ninja.Sprite;

Ninja.Sprite.prototype.use(Ninja.mixins.events);

Ninja.Sprite.prototype.hidden = false;