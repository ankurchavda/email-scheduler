var express = require('express');
var router = express.Router();
var Repo = require('./repository.js');

module.exports = function(User, Campaign){
	
	router.get('/campaignresponse', function(req,res){
		Repo.getCampaignResponse(User, Campaign, function(err,result){
			if(err){
				console.log(err);
				throw err;
			} else{
				res.status(200).send("Done");
			}
		});
	});

	router.get('/campaignsummary', function(req,res){
		User.createCampaignSummary(function(err,result){
			if(err)
				throw err;
			else{
				console.log(result);
				res.status(200).send("Ok");
			}
		});
	})	

	router.post('/adduser', function(req, res){
		var file = req.files.contacts;
		path = './contacts.csv';
		
		Repo.addUser(path, file, User, function(err, result){
			if(err){
				throw err;
			} else{
				res.status(200).send("Done");
			}
		})
	})

	router.post('/generateinvoice', function(req,res){
		var retailer = req.body.retailer;
		var from = req.body.from;
		var to = req.body.to;
		Repo.generateInvoice(Campaign, retailer, from, to, function(err, result){
			result.pipe(res);
			result.end();
		})
	})
	return router;
}