//configure requirejs
requirejs.config({
	baseUrl: BASE_URL,
	paths: {
		jquery: 'game/lib/jquery',
		create: 'game/lib/instanqi8'
	}
});

//start client
requirejs([
	'jquery',
	'game/Constants',
	'game/Game'
], function(
	$,
	Constants,
	Game
) {
	var ctx = $('#game-canvas')[0].getContext('2d');

	//add input listeners
	var keyboard = {};
	for(var key in Constants.KEY_BINDINGS) { keyboard[Constants.KEY_BINDINGS[key]] = false; }
	$(document).on('keydown keyup', function(evt) {
		evt.isDown = (evt.type === 'keydown');
		if(Constants.KEY_BINDINGS[evt.which] &&
			keyboard[Constants.KEY_BINDINGS[evt.which]] !== evt.isDown) {
			keyboard[Constants.KEY_BINDINGS[evt.which]] = evt.isDown;
			evt.gameKey = Constants.KEY_BINDINGS[evt.which];
			Game.onKeyboardEvent(evt, keyboard);
		}
		evt.preventDefault();
	});
	$('#game-canvas').on('mousemove mouseup mousedown', Game.onMouseEvent);

	//set up the game loop
	var prevTimestamp = performance.now();
	function loop(timestamp) {
		Game.tick((Math.min(timestamp - prevTimestamp, 100) / 1000) *
			(Constants.DEBUG_TIME_SCALE === null ? 1.0 : Constants.DEBUG_TIME_SCALE),
			1 / Constants.TARGET_FRAME_RATE);
		prevTimestamp = timestamp;
		render();
		waitForFrame(loop);
	}
	function render() {
		ctx.fillStyle = '#222';
		ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
		Game.render(ctx);
	}
	function waitForFrame(callback) {
		if(Constants.DEBUG_TIME_SCALE === 1.0 || Constants.DEBUG_TIME_SCALE === null) {
			requestAnimationFrame(callback);
		}
		else {
			setTimeout(function() {
				callback(performance.now());
			}, 1000 / Constants.TARGET_FRAME_RATE / Constants.DEBUG_TIME_SCALE);
		}
	}

	//kick off the game loop
	render();
	waitForFrame(loop);
});
