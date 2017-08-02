const fs = require('fs');
var instance = require('./instance');
var express = require('express');
var app = express();
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(fileUpload());
app.set('port', process.env.PORT || 3000);

// Enabling Cross Origin Requests
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.post('/start', function(req, res){
	if(!req.files.seed)
		res.status(400).send("Please upload the seed file");

	var file = req.files.seed;
	var obj = JSON.parse(file.data.toString('ascii'));
	console.log(obj);
	instance.createInstance(obj);
	// var json = fs.readFileSync('../seed.json', 'utf8');
	// console.log(json);

	res.status(200).send("Started....");	
});

app.listen(app.get('port'));
console.log("Listening on port "+app.get('port'));