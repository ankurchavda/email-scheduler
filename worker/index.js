const fs = require('fs');
const instance = require('./instance');
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const logger = require('morgan');
const async = require('async');
const _ = require('lodash');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(fileUpload());
app.set('port', process.env.PORT || 3000);

// Enabling Cross Origin Requests
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.post('/start', function (req, res) {
	if (!req.files.seed || !req.files.html || !req.files.text)
		res.status(400).send("Please upload all the required files");

	var file = req.files.seed;
	var html = req.files.html;
	var text = req.files.text;
	html.mv('../template.html', function (err) {
		if (err)
			throw err;
	})
	text.mv('../template.txt', function (err) {
		if (err)
			throw err;
	});
	var obj = JSON.parse(file.data.toString('ascii'));
	obj['transactional'] = false;
	console.log(obj);
	instance.createInstance(obj);
	res.status(200).send("Started....");
});

app.post('/transactional', function (req, res) {
	if (!req.files.seed || !req.files.html || !req.files.text)
		res.status(400).send("Please upload all the required files");

	var file = req.files.seed;
	var html = req.files.html;
	var text = req.files.text;
	html.mv('../template.html', function (err) {
		if (err)
			throw err;
	})
	text.mv('../template.txt', function (err) {
		if (err)
			throw err;
	});
	var obj = JSON.parse(file.data.toString('ascii'));
	var counter=0;
	_.forEach(obj, function (value, key) {
		if (value == null || value == "") {
			return res.send(key + " parameter is empty");
		}
		counter++;
		if (counter === _.size(obj)) {
			console.log(obj);
			obj['transactional'] = true;
			obj['textPath'] = "../template.txt";
			obj['htmlPath'] = "../template.html";
			instance.createTransactionInstance(obj, function (err, result) {
				if (err)
					res.send(err);
				else {
					res.status(200).send("Email Sent Successfully!");
				}
			});
		}
	})
})

app.listen(app.get('port'));
console.log("Listening on port " + app.get('port'));