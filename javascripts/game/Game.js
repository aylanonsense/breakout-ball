define([
	'game/Constants',
	'game/Player',
	'game/Ball',
	'game/Brick'
], function(
	Constants,
	Player,
	Ball,
	Brick
) {
	var isPaused = false;
	//create game objects
	var player = new Player({ x: 240, y: 300 });
	var bricks = [ new Brick({ x: 400, y: 200, color: '#f0f' }) ];
	var balls = [];
	for(var i = 0; i < 3; i++) {
		balls.push(new Ball({
			x: 100 + 500 * Math.random(),
			y: 110 + 10 * Math.random(),
			velX: 400 * Math.random() - 200,
			velY: 400 * Math.random() - 200
		}));
	}
	var objects = [ player ];
	for(i = 0; i < bricks.length; i++) { objects.push(bricks[i]); }
	for(i = 0; i < balls.length; i++) { objects.push(balls[i]); }

	function tick(realTime, frameTime) {
		if(!isPaused) {
			for(var i = 0; i < objects.length; i++) {
				objects[i].tick(frameTime);
			}
			player.checkForHits(balls);
			for(i = 0; i < balls.length; i++) {
				for(var j = 0; j < bricks.length; j++) {
					balls[i].checkForCollisionWithBrick(bricks[j]);
				}
			}
		}
	}

	function render(ctx) {
		for(var i = 0; i < objects.length; i++) {
			objects[i].render(ctx);
		}
	}

	function onKeyboardEvent(evt, keyboard) {
		if(evt.isDown && evt.gameKey === 'PAUSE') {
			isPaused = !isPaused;
		}
		else {
			player.onKeyboardEvent(evt, keyboard);
		}
	}

	function onMouseEvent(evt) {
		//TODO
	}

	return {
		tick: tick,
		render: render,
		onKeyboardEvent: onKeyboardEvent,
		onMouseEvent: onMouseEvent
	};
});