define([
	'game/Constants',
	'game/SwingHitBox',
	'create!game/display/Sprite > Player',
], function(
	Constants,
	SwingHitBox,
	SPRITE
) {
	var GRAVITY = 5;
	var RUN_SPEED = 200;
	var AIR_SPEED = 50;
	var WALL_BOUNCE_SPEED = 10;
	var RUNNING_JUMP_SPEED = 300;
	var LEANING_JUMP_SPEED = 320;
	var UPWARDS_JUMP_SPEED = 340;
	var LEANING_JUMP_SPEED_PERCENT = 0.5;
	var TIME_TO_RUNNING_JUMP = 9 / 60 - 0.0001;
	var SWING_TIME = 28 / 60 - 0.0001;

	var nextSwingId = 0;
	function Player(params) {
		this.x = params.x || 0;
		this.y = params.y || 0;
		this.width = SPRITE.width;
		this.height = SPRITE.height;
		this.vel = { x: 0, y: 0 };
		this._moveDir = 0;
		this._lookDir = 0;
		this._bufferedJumpTime = 0;
		this._isAirborne = true;
		this._horizontalJumpCharge = 0;
		this._swingHitBoxes = [];
		var s = 5;
		this._swings = {
			forehand: [
				[],
				[ new SwingHitBox({ player: this, x: -7 * s, y: 12 * s,
					height: 3 * s, width: 3 * s, dir: { x: 1, y: 0.1 },
					speedMult: 1.25, minSpeed: 200, stability: 0.9 }) ],
				[ new SwingHitBox({ player: this, x: 10 * s, y: 9 * s,
					height: 4 * s, width: 3 * s, dir: { x: 1, y: -0.4 },
					speedMult: 1.25, minSpeed: 200, stability: 0.9 }) ],
				[ new SwingHitBox({ player: this, x: 9 * s, y: -1 * s,
					height: 3 * s, width: 3 * s, dir: { x: -0.1, y: -1 },
					speedMult: 1.25, minSpeed: 200, stability: 0.9 }) ],
				[ new SwingHitBox({ player: this, x: 4 * s, y: -4 * s,
					height: 3 * s, width: 3 * s, dir: { x: -1, y: -0.1 },
					speedMult: 1.25, minSpeed: 200, stability: 0.9 }) ]
			]
		};
		this._lastSwingId = 0;
		this._swingTime = 0;
		this._swingId = null;
	}
	Player.prototype.tick = function(t) {
		//gravity
		this.vel.y += GRAVITY;

		//apply vertical velocity
		this.y += this.vel.y * t;

		//check for floor/ceiling collisions (and land on the ground)
		this._isAirborne = true;
		if(this.y + this.height >= Constants.BOUNDS.FLOOR) {
			this._isAirborne = false;
			this.y = Constants.BOUNDS.FLOOR - this.height;
			if(this.vel.y > 0) { this.vel.y = 0; }
		}
		else if(this.y <= Constants.BOUNDS.CEILING) {
			this.y = Constants.BOUNDS.CEILING;
			if(this.vel.y < 0) { this.vel.y = 0; }
		}

		//adjust horizontal velocity
		if(!this._isAirborne) {
			//complete influence over horizontal velocity on the ground
			this.vel.x = RUN_SPEED * this._moveDir;
			if(this._moveDir > 0) {
				if(this._horizontalJumpCharge < 0) { this._horizontalJumpCharge = 0; }
				this._horizontalJumpCharge += t / TIME_TO_RUNNING_JUMP;
			}
			else if(this._moveDir < 0) {
				if(this._horizontalJumpCharge > 0) { this._horizontalJumpCharge = 0; }
				this._horizontalJumpCharge -= t / TIME_TO_RUNNING_JUMP;
			}
			else {
				this._horizontalJumpCharge = 0;
			}
		}
		else {
			//some influence over horizontal velocity in the air
			this.vel.x += AIR_SPEED * this._moveDir * t;
		}

		//jump off of the ground
		if(!this._isAirborne && this._bufferedJumpTime > 0) {
			//if you jump without moving, you will jump real high straight up
			if(this.vel.x === 0) {
				this.vel.y = -UPWARDS_JUMP_SPEED;
			}
			//if you attempt to jump too quickly, you will do a "slow" jump
			else if((0 < this._horizontalJumpCharge && this._horizontalJumpCharge < 1) ||
				(0 > this._horizontalJumpCharge && this._horizontalJumpCharge > -1)) {
				this.vel.x *= LEANING_JUMP_SPEED_PERCENT;
				this.vel.y = -LEANING_JUMP_SPEED;
			}
			//otherwise you will do a running jump and maintain horizontal momentum
			else {
				this.vel.y = -RUNNING_JUMP_SPEED;
			}
			this._bufferedJumpTime = 0;
			this._isAirborne = true;
		}
		this._bufferedJumpTime = (this._bufferedJumpTime < t ? 0 : this._bufferedJumpTime - t);

		//apply horizontal velocity
		if(this.vel.x < -RUN_SPEED) { this.vel.x = -RUN_SPEED; }
		else if(this.vel.x > RUN_SPEED) { this.vel.x = RUN_SPEED; }
		this.x += this.vel.x * t;

		//check for wall collisions
		if(this.x + this.width >= Constants.BOUNDS.RIGHT_WALL) {
			this.x = Constants.BOUNDS.RIGHT_WALL - this.width;
			if(this.vel.x > 0) { this.vel.x = -WALL_BOUNCE_SPEED; }
		}
		else if(this.x <= Constants.BOUNDS.LEFT_WALL) {
			this.x = Constants.BOUNDS.LEFT_WALL;
			if(this.vel.x < 0) { this.vel.x = WALL_BOUNCE_SPEED; }
		}

		//decrement timers
		this._swingTime = (this._swingTime < t ? 0 : this._swingTime - t);
		var swingFrame = null;
		if(this._swingTime === 0) { swingFrame = null; }
		else if(this._swingTime < 7 / 60 + 0.0001) { swingFrame = 4; }
		else if(this._swingTime < 14 / 60 + 0.0001) { swingFrame = 3; }
		else if(this._swingTime < 21 / 60 + 0.0001) { swingFrame = 2; }
		else if(this._swingTime < 28 / 60 + 0.0001) { swingFrame = 1; }
		else { swingFrame = null; }
		if(swingFrame === null) {
			this._swingHitBoxes = [];
		}
		else {
			this._swingHitBoxes = this._swings.forehand[swingFrame];
		}
	};
	Player.prototype.render = function(ctx) {
		ctx.fillStyle = (this._swingTime > 0 ? '#ff0' : '#f00');
		ctx.fillRect(this.x, this.y, this.width, this.height);
		var frame;
		if(this._swingTime === 0) { frame = 0; }
		else if(this._swingTime < 7 / 60 + 0.0001) { frame = 5; }
		else if(this._swingTime < 14 / 60 + 0.0001) { frame = 4; }
		else if(this._swingTime < 21 / 60 + 0.0001) { frame = 3; }
		else if(this._swingTime < 28 / 60 + 0.0001) { frame = 2; }
		SPRITE.render(ctx, { x: 0, y: 0}, this.x, this.y, frame, false);
		//render swing hit boxes
		for(var i = 0; i < this._swingHitBoxes.length; i++) {
			this._swingHitBoxes[i].render(ctx);
		}
	};
	Player.prototype.onKeyboardEvent = function(evt, keyboard) {
		if(evt.gameKey === 'MOVE_LEFT') {
			this._moveDir = (evt.isDown ? -1 : (keyboard.MOVE_RIGHT ? 1 : 0));
		}
		else if(evt.gameKey === 'MOVE_RIGHT') {
			this._moveDir = (evt.isDown ? 1 : (keyboard.MOVE_LEFT ? -1 : 0));
		}
		else if(evt.gameKey === 'LOOK_UP') {
			this._lookDir = (evt.isDown ? -1 : (keyboard.LOOK_DOWN ? 1 : 0));
		}
		else if(evt.gameKey === 'LOOK_DOWN') {
			this._lookDir = (evt.isDown ? 1 : (keyboard.LOOK_UP ? -1 : 0));
		}
		else if(evt.gameKey === 'JUMP' && evt.isDown) {
			this._bufferedJumpTime = 6.1 / 60;
		}
		else if(evt.gameKey === 'SWING') {
			if(evt.isDown) {
				//TODO
			}
			else if(this._swingTime === 0) {
				this._swingTime = SWING_TIME;
				this._swingId = nextSwingId++;
			}
		}
	};
	Player.prototype.checkForHits = function(balls) {
		if(this._swingTime > 0) {
			for(var i = 0; i < balls.length; i++) {
				var ball = balls[i];
				for(var j = 0; j < this._swingHitBoxes.length; j++) {
					var hitBox = this._swingHitBoxes[j];
					if(hitBox.isHitting(ball)) {
						var hit = hitBox.generateHit(ball);
						ball.hit(this, this._swingId, hit.vel.x, hit.vel.y);
						break;
					}
				}
			}
		}
	};
	return Player;
});