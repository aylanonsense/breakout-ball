define([
	'game/Constants'
], function(
	Constants
) {
	var GRAVITY = 5;
	var MAX_SPEED = 999;
	var WALL_BOUNCE_PERCENT = 1.0;
	var CEILING_BOUNCE_PERCENT = 1.0;
	var FLOOR_BOUNCE_PERCENT = 1.0;

	function Ball(params) {
		this.x = params.x || 0;
		this.y = params.y || 0;
		this.radius = 5;
		this.vel = { x: params.velX || 0, y: params.velY || 0 };
		this._lastHitSwingId = null;
		this._prevPos = null;
	}
	Ball.prototype.tick = function(t) {
		this._prevPos = { x: this.x, y: this.y };

		//gravity
		this.vel.y += GRAVITY;

		//apply velocity limits
		if(this.vel.x > MAX_SPEED) { this.vel.x = MAX_SPEED; }
		else if(this.vel.x < -MAX_SPEED) { this.vel.x = -MAX_SPEED; }
		if(this.vel.y > MAX_SPEED) { this.vel.y = MAX_SPEED; }
		else if(this.vel.y < -MAX_SPEED) { this.vel.y = -MAX_SPEED; }

		//apply velocity
		this.x += this.vel.x * t;
		this.y += this.vel.y * t;

		//bounce off of bounds
		this._isAirborne = true;
		if(this.bottom >= Constants.BOUNDS.FLOOR) {
			this.bottom = Constants.BOUNDS.FLOOR;
			if(this.vel.y > 0) { this.vel.y *= -FLOOR_BOUNCE_PERCENT; }
		}
		else if(this.top <= Constants.BOUNDS.CEILING) {
			this.top = Constants.BOUNDS.CEILING;
			if(this.vel.y < 0) { this.vel.y *= -CEILING_BOUNCE_PERCENT; }
		}
		if(this.right >= Constants.BOUNDS.RIGHT_WALL) {
			this.right = Constants.BOUNDS.RIGHT_WALL;
			if(this.vel.x > 0) { this.vel.x *= -WALL_BOUNCE_PERCENT; }
		}
		else if(this.left <= Constants.BOUNDS.LEFT_WALL) {
			this.left = Constants.BOUNDS.LEFT_WALL;
			if(this.vel.x < 0) { this.vel.x *= -WALL_BOUNCE_PERCENT; }
		}
	};
	Ball.prototype.render = function(ctx) {
		ctx.fillStyle = '#0f0';
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.fill();
	};
	Ball.prototype.hit = function(player, swingId, velX, velY) {
		if(swingId !== this._lastHitSwingId) {
			this._lastHitSwingId = swingId;
			this.vel.x = velX;
			this.vel.y = velY;
			return true;
		}
		return false;
	};
	Ball.prototype.checkForCollisionWithBrick = function(brick) {
		var percentOfMovement, intermediate;

		//find ball's bounds
		var x1 = this._prevPos.x, x2 = this.x;
		var y1 = this._prevPos.y, y2 = this.y;
		var top1 = y1 - this.radius, top2 = this.top;
		var left1 = x1 - this.radius, left2 = this.left;
		var bottom1 = y1 + this.radius, bottom2 = this.bottom;
		var right1 = x1 + this.radius, right2 = this.right;

		//check for collision with bottom of brick
		if(top1 >= brick.bottom && brick.bottom > top2) {
			percentOfMovement = (brick.bottom - top1) / (top2 - top1);
			intermediate = x1 + percentOfMovement * (x2 - x1);
			if(brick.left <= intermediate && intermediate < brick.right) {
				this.x = intermediate;
				this.top = brick.bottom;
				if(this.vel.y < 0) { this.vel.y *= -1; }
				return true;
			}
		}

		//check for collision with top of brick
		if(bottom1 <= brick.top && brick.top < bottom2) {
			percentOfMovement = (brick.top - bottom1) / (bottom2 - bottom1);
			intermediate = x1 + percentOfMovement * (x2 - x1);
			if(brick.left <= intermediate && intermediate < brick.right) {
				this.x = intermediate;
				this.bottom = brick.top;
				if(this.vel.y > 0) { this.vel.y *= -1; }
				return true;
			}
		}

		//check for collision with right side of brick
		if(left1 >= brick.right && brick.right > left2) {
			percentOfMovement = (brick.right - left1) / (left2 - left1);
			intermediate = y1 + percentOfMovement * (y2 - y1);
			if(brick.top <= intermediate && intermediate < brick.bottom) {
				this.left = brick.right;
				this.y = intermediate;
				if(this.vel.x < 0) { this.vel.x *= -1; }
				return true;
			}
		}

		//check for collision with left side of brick
		if(right1 <= brick.left && brick.left < right2) {
			percentOfMovement = (brick.left - right1) / (right2 - right1);
			intermediate = y1 + percentOfMovement * (y2 - y1);
			if(brick.top <= intermediate && intermediate < brick.bottom) {
				this.right = brick.left;
				this.y = intermediate;
				if(this.vel.x > 0) { this.vel.x *= -1; }
				return true;
			}
		}

		if(this._checkForCollisionWithPoint(brick.left, brick.top)) { return true; }
		if(this._checkForCollisionWithPoint(brick.right, brick.top)) { return true; }
		if(this._checkForCollisionWithPoint(brick.left, brick.bottom)) { return true; }
		if(this._checkForCollisionWithPoint(brick.right, brick.bottom)) { return true; }

		return false;
	};
	Ball.prototype._checkForCollisionWithPoint = function(x, y) {
		//TODO add comments to MATH BLOCK
		var x1 = this._prevPos.x, x2 = this.x;
		var y1 = this._prevPos.y, y2 = this.y;
		var line = { x: x2 - x1, y: y2 - y1 };
		var vectorToPoint = { x: x - x1, y: y - y1 };
		var lineLength = Math.sqrt(line.x * line.x + line.y * line.y);
		var distToClosestPoint = line.x * vectorToPoint.x / lineLength +
			line.y * vectorToPoint.y / lineLength;
		if(distToClosestPoint < 0) { distToClosestPoint = 0; }
		else if(distToClosestPoint > lineLength) { distToClosestPoint = lineLength; }
		var closestPointVector = {
			x: line.x / lineLength * distToClosestPoint,
			y: line.y / lineLength * distToClosestPoint
		};
		var closestPoint = { x: x1 + closestPointVector.x, y: y1 + closestPointVector.y };
		var distToPointX = x - closestPoint.x;
		var distToPointY = y - closestPoint.y;
		var squareDist = distToPointX * distToPointX + distToPointY * distToPointY;
		if(squareDist < this.radius * this.radius) {
			//TODO consider a more appropriate repositioning
			this.x = this._prevPos.x;
			this.y = this._prevPos.y;
			//calc velocity
			var dir = { x: x - this.x, y: y - this.y };
			var magnitude = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
			dir.x /= magnitude;
			dir.y /= magnitude;
			var velX = this.vel.x;
			var velY = this.vel.y;
			var rotatedVelX = velY * dir.x - velX * dir.y;
			var rotatedVelY = velX * dir.x + velY * dir.y;
			rotatedVelY *= -1;
			this.vel.x = rotatedVelY * dir.x - rotatedVelX * dir.y;
			this.vel.y = rotatedVelX * dir.x + rotatedVelY * dir.y;
			return true;
		}
		return false;
	};

	//define useful properties
	Object.defineProperty(Ball.prototype, 'left', {
		get: function() { return this.x - this.radius; },
		set: function(x) { this.x = x + this.radius; }
	});
	Object.defineProperty(Ball.prototype, 'right', {
		get: function() { return this.x + this.radius; },
		set: function(x) { this.x = x - this.radius; }
	});
	Object.defineProperty(Ball.prototype, 'top', {
		get: function() { return this.y - this.radius; },
		set: function(y) { this.y = y + this.radius; }
	});
	Object.defineProperty(Ball.prototype, 'bottom', {
		get: function() { return this.y + this.radius; },
		set: function(y) { this.y = y - this.radius; }
	});

	return Ball;
});