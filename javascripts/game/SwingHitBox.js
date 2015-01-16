define([
	'game/Constants'
], function(
	Constants
) {
	function SwingHitBox(params) {
		this.player = params.player;
		this.x = params.x;
		this.y = params.y;
		this.width = params.width;
		this.height = params.height;
		var magnitude = Math.sqrt(params.dir.x * params.dir.x + params.dir.y * params.dir.y);
		this.dir = { x: params.dir.x / magnitude, y: params.dir.y / magnitude };
		this.speedMult = params.speedMult; //multiplier from 0.0 to possibly above 1.0
		this.stability = params.stability; //multiplier from 0.0 to 1.0
		this.minSpeed = params.minSpeed;
	}
	SwingHitBox.prototype.isHitting = function(ball) {
		return this.player.x + this.x <= ball.x &&
			ball.x < this.player.x + this.x + this.width &&
			this.player.y + this.y <= ball.y &&
			ball.y < this.player.y + this.y + this.height;
	};
	SwingHitBox.prototype.generateHit = function(ball) {
		var velX = ball.vel.x;
		var velY = ball.vel.y;

		//bounce ball vel off of effective slope
		//TODO this still isn't perfect
		var rotatedVelX = velY * this.dir.x - velX * this.dir.y;
		var rotatedVelY = velX * this.dir.x + velY * this.dir.y;
		if(rotatedVelY < 0) { rotatedVelY *= -1; }
		var bounceVelX = rotatedVelY * this.dir.x - rotatedVelX * this.dir.y;
		var bounceVelY = rotatedVelX * this.dir.x + rotatedVelY * this.dir.y;

		//if swing is perfectly stable, it will go exactly as directed
		var speed = Math.sqrt(velX * velX + velY * velY);
		var directedVelX = this.dir.x * speed;
		var directedVelY = this.dir.y * speed;

		//combine the bounce vel and the directed vel
		var combinedVelX = this.stability * directedVelX + (1 - this.stability) * bounceVelX;
		var combinedVelY = this.stability * directedVelY + (1 - this.stability) * bounceVelY;

		//put it all together
		velX = this.speedMult * combinedVelX;
		velY = this.speedMult * combinedVelY;
		speed = Math.sqrt(velX * velX + velY * velY);
		if(speed !== 0 && speed < this.minSpeed) {
			velX *= this.minSpeed / speed;
			velY *= this.minSpeed / speed;
		}
		return { vel: { x: velX, y: velY } };
	};
	SwingHitBox.prototype.render = function(ctx) {
		//fill hit box
		ctx.fillStyle = 'rgba(' +
			Math.round(255 * Math.sqrt(1 - this.stability)) + ', 0, ' +
			Math.round(255 * Math.sqrt(this.stability)) + ', 0.75)';
		ctx.fillRect(this.player.x + this.x, this.player.y + this.y,
			this.width, this.height);

		//stroke hit box
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 1;
		ctx.strokeRect(this.player.x + this.x, this.player.y + this.y,
			this.width, this.height);

		//draw direction line
		ctx.beginPath();
		ctx.moveTo(this.player.x + this.x + this.width / 2,
			this.player.y + this.y + this.height / 2);
		ctx.lineTo(this.player.x + this.x + this.width / 2 +
			this.dir.x * (this.speedMult * 20 + 5),
			this.player.y + this.y + this.height / 2 +
			this.dir.y * (this.speedMult * 20 + 5));
		ctx.stroke();
	};
	return SwingHitBox;
});