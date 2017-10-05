define({
	TARGET_FRAME_RATE: 60,
	CANVAS_WIDTH: 500,
	CANVAS_HEIGHT: 400,
	BOUNDS: {
		FLOOR: 385,
		CEILING: 15,
		LEFT_WALL: 15,
		RIGHT_WALL: 485
	},
	KEY_BINDINGS: {
		38: 'LOOK_UP', 87: 'LOOK_UP', //up arrow key / w key
		37: 'MOVE_LEFT', 65: 'MOVE_LEFT', //left arrow key / a key
		40: 'LOOK_DOWN', 83: 'LOOK_DOWN', //down arrow key / s key
		39: 'MOVE_RIGHT', 68: 'MOVE_RIGHT', //right arrow key / d key
		32: 'JUMP', //space bar
		90: 'SWING', //Z key
		80: 'PAUSE' //P key
	},
	DEBUG_TIME_SCALE: 1.0,
	DEBUG_TRACE_SPRITES: false,
	DEBUG_HIDE_SPRITES: false
});