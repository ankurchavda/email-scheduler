var request = require('request');
var schedule = require('node-schedule');
var async= require('async');
var config = require('./config');
var url = config.url;
var contactId , campaignId = '';
var mongoose = require('mongoose');
var main = mongoose.createConnection('mongodb://localhost/main');
var sub = mongoose.createConnection('mongodb://localhost/sub');
var mainDb = require('./models/main')(main);
var subDb = require('./models/sub')(sub);
var mail =require('./mail');
var date = new Date(2017, 6, 12, 13, 6 , 0);
var i = 0 , j = -1 , skip = 0, limit = 0;
var arr = '';
var data ='';
var flag = false;
var random = require('randomstring');

process.on('message',(m) =>{
	arr = m.array;
	var rule = new schedule.RecurrenceRule();
	rule.second = m.recurrence.second;
	rule.minute = m.recurrence.minute;
	rule.hour = m.recurrence.hour;

	var job= schedule.scheduleJob(rule, function(){
	async.series([ 
		function(callback){
			if(flag == false){
				mainDb.getUsers(function(err, res){
					if(err)
					{
						console.log(err);
						callback(err);
					}
					else{
						for(var i= 0; i< res.length ;i++)
						{
							for (prop in res[i].campaignResponse)
							{
								var str = 'camp1';
								if(res[i].campaignResponse[str].click == m.condition.click)
								{
									subDb.saveUsers({email:res[i].email}, function(err, result){
										if(err)
											throw err;
										else console.log(result);
									})
								}
							}
						}	

						callback(null,"Users added to the sub collection");
					}
				})
				flag = true;
			}
			else
			{
				callback(null,"Contactlist Already added");
			}

		},	function(callback){
			mail.createContactList(random.generate(8), function(err, result){
				if(err)
				{
					console.log(err);
					callback(err);
				}
				else{
					if(j<0)
					{
						limit = arr[i];
					}
					else{
						limit= arr[i];
						skip+= arr[j];	
					}
					contactId = result.Data[0].ID;
					callback(null,"Contactlist created with Id: "+contactId);	
				} 
			});
		}, 	function(callback){
			subDb.getUsers(limit, skip , function(err , users){
				if(err)
				{
					console.log(err);
					callback(err);
				}
				else if(users.length){
					mail.manageContactList(contactId, users,function(err, result){
						if(err)
							callback(err);
						else {
							callback(null, "Contacts added to the contact list with Id: "+ contactId);
						}
					});
				}
				else {
					job.cancel();
					process.exit();
					}
			})
		}, 	function(callback){
			mail.prepareCampaign(m.campaign.sender,m.campaign.email,m.campaign.subject,contactId,m.campaign.title, function(err, result){
				if(err)
				{
					console.log(err);
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
					console.log(err);
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
					console.log(err);
					callback(err);
				}
				else {
					callback(null, "Campaign sent!, Enjoy");
				}
			});
		},	function(callback){
			mail.deleteContactList(contactId, function(err, result){
				if(err)
				{
					console.log(err);
					callback(err);
				}	
				else callback(null,"contact list deleted");
			});
		}], function(err, results){
			i++;
			j++;
			console.log(results+"\n\ndone............. \n\n");
			if(i >= arr.length)
				{	job.cancel();
					process.exit();
				}
			});	
	});
});

