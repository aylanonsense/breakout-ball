define(function() {
	//a helper module that instantiates required modules and passes them an argument, used for sprites
	return {
		load: function(name, require, onload, config) {
			var SYMBOL = ' > ';
			var moduleName = name.substring(0, name.indexOf(SYMBOL));
			var arg = name.substring(name.indexOf(SYMBOL) + SYMBOL.length, name.length);
			require([ moduleName ], function(mod) {
				onload(new mod(arg));
			});
		}
	};
});