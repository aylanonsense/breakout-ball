//configure requirejs
var requirejs = require('requirejs');
requirejs.config({ baseUrl: __dirname + '/javascripts', nodeRequire: require });
require = requirejs;

//dependencies
var express = require('express');
var lessMiddleware = require('less-middleware');

//set up node server
var app = express();
app.use(lessMiddleware({ src: __dirname + "/public", compress: true }));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/javascripts'));
app.listen(process.env.PORT || 3000);
