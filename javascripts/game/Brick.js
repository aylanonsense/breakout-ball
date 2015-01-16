define([
	'game/Constants'
], function(
	Constants
) {
	function Brick(params) {
		this.x = params.x || 0;
		this.y = params.y || 0;
		this.width = 60;
		this.height = 80;
		this._color = params.color;
	}
	Brick.prototype.tick = function(t) {};
	Brick.prototype.render = function(ctx) {
		ctx.fillStyle = this._color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	};

	//define useful properties
	Object.defineProperty(Brick.prototype, 'left', {
		get: function() { return this.x; },
		set: function(x) { this.x = x; }
	});
	Object.defineProperty(Brick.prototype, 'right', {
		get: function() { return this.x + this.width; },
		set: function(x) { this.x = x - this.width; }
	});
	Object.defineProperty(Brick.prototype, 'top', {
		get: function() { return this.y; },
		set: function(y) { this.y = y; }
	});
	Object.defineProperty(Brick.prototype, 'bottom', {
		get: function() { return this.y + this.height; },
		set: function(y) { this.y = y - this.height; }
	});

	return Brick;
});