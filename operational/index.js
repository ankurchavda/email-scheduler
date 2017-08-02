var mongoose = require('mongoose');
var main = mongoose.createConnection('mongodb://localhost/communication');
var express=require('express');
var app = express();
var User = require('./models/main')(main);
var bodyParser = require('body-parser');
var Campaign = require('./models/campaign')(main);
var fileUpload = require('express-fileupload');

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

var routes = require('./route')(User, Campaign);
app.use('/', routes);

app.listen(app.get('port'));
console.log("Listening on "+app.get('port'));

// csv()
// .fromFile(statsFilePath)
// .on('json',(jsonObj)=>{
// 	var email = jsonObj.To;
// 	var tempObj = {};
// 	jsonObj['retailer'] = "4";
// 	jsonObj['summary'] = "f";
// 	tempObj['camp3']=jsonObj;
// 	var options={new:true};
// 	var campId = "camp3";
// 	User.addCampaignResponse(email, campId,tempObj,options,function(err,results){
// 		if(err)
// 			throw err;
// 		else
// 			{}// console.log(results);
// 	})	
// })
// .on('done',(error)=>{
//     console.log('end');
// })