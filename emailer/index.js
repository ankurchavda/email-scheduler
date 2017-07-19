var async= require('async');
var contactId , campaignId = '';
var mongoose = require('mongoose');
var main = mongoose.createConnection('mongodb://root:Skylark9189@130.211.139.247/main');
var mainDb = require('./models/main')(main);
var mail =require('./mail');
var random = require('randomstring');
var arr = [];
var data = '';	
var baseUrl = "http://35.185.235.73:5000/";
process.on('message',(m) =>{
	
	async.series([ 
		function(callback){
			if(m.condition.click != null && m.condition.open == null)
			{
				mainDb.getUsersClick(m.limit , m.skip ,m.condition.click,function(err, res){
					if(err)
					{
						console.log(err+" 1");
						callback(err);
					}
					else{
						console.log(res);
						if(!res.length)
							process.exit();
						process.send(res[res.length-1]._id);
						for(var i = 0 ; i< res.length ; i++)
						{	var url = baseUrl+'preferences/retailer/'+m.retailerId+'/'+res[i]._id;
							arr.push({email: res[i].email, Properties:{"Url":url}});
						}
						callback(null,"Users pulled from the database");
					}
				});
			}
			else if(m.condition.click == null && m.condition.open != null)
			{
				mainDb.getUsersOpen(m.limit , m.skip ,m.condition.open,function(err, res){
					if(err)
					{
						console.log(err+" 1");
						callback(err);
					}
					else{
						console.log(res);
						if(!res.length)
							process.exit();
						process.send(res[res.length-1]._id);
						for(var i = 0 ; i< res.length ; i++)
						{
							arr.push({email: res[i].email});
						}
						callback(null,"Users pulled from the database");
					}
				});					
			}
			else if(m.condition.click != null && m.condition.open != null){
				mainDb.getUsersOpenNClick(m.limit , m.skip ,m.condition.click, m.condition.getUsersOpen,function(err, res){
					if(err)
					{
						console.log(err+" 1");
						callback(err);
					}
					else{
						console.log(res);
						if(!res.length)
							process.exit();
						process.send(res[res.length-1]._id);
						for(var i = 0 ; i< res.length ; i++)
						{
							arr.push({email: res[i].email});
						}
						callback(null,"Users pulled from the database");
					}
				});
			}
			else if(m.condition.click == null && m.condition.open == null){
				mainDb.getUsers(m.limit , m.skip ,function(err, res){
					if(err)
					{
						console.log(err+" 1");
						callback(err);
					}
					else{
						console.log(res);
						if(!res.length)
							process.exit();
						process.send(res[res.length-1]._id);
						for(var i = 0 ; i< res.length ; i++)
						{
							arr.push({email: res[i].email});
						}
						callback(null,"Users pulled from the database");
					}
				});
			}				
		},	function(callback){
			mail.createContactList(random.generate(9), function(err, result){
				if(err)
				{
					console.log(err+" 2");
					callback(err);
				}
				else{
					contactId = result.Data[0].ID;
					callback(null,"Contactlist created with Id: "+contactId);	
				} 
			});
		}, 	function(callback){
			if(arr.length){
				mail.manageContactList(contactId, arr, function(err, result){
					if(err)
						callback(err+" 3");
					else {
						callback(null, "Contacts added to the contact list with Id: "+ contactId);
					}
				});
			}
			else {
				process.exit();
			}
		}, 	function(callback){
			mail.prepareCampaign(m.campaign.sender,m.campaign.email,m.campaign.subject,contactId,m.campaign.title, function(err, result){
				if(err)
				{
					console.log(err+" 4");
					callback(err);
				}
				else
					campaignId = result.Data[0].ID;
				callback(null, "Campaign prepared with campaignId: "+ campaignId);
			});
		},	function(callback){
			mail.addBody(campaignId, function(err, result){
				if(err)
				{
					console.log(err+" 5");
					callback(err);
				}
				else {
					callback(null, "Added body to the campaign with campaignId: "+ campaignId);
				}
			});
		},	function(callback){
			mail.sendCampaign(campaignId, function(err, result){
				if(err)
				{
					console.log(err+" 6");
					callback(err);
				}
				else {
					callback(null, "Campaign sent!, Enjoy");
				}
			});
		}//,	function(callback){
		// 	mail.deleteContactList(contactId, function(err, result){
		// 		if(err)
		// 		{
		// 			console.log(err+" 7");
		// 			callback(err);
		// 		}	
		// 		else callback(null,"contact list deleted");
		// 	});
		], function(err, results){
			console.log(results+"\n\ndone............. \n\n");
			process.exit();
		});	
});

