var mongoose = require('mongoose');
var async = require('async');
module.exports = function(mon){
	var module = {};

	var User = mon.model('User', new mongoose.Schema({
		email: String,
		profile: Object,
		campaignResponse: Object,
		contactResponse: Object,
		uuid: String,
		campaignSummary: Object,
		retailer: Object
	}))

	module.getUsers = function(callback){
		User.find(callback).lean();
	}

	module.addEmails = function(email, profile, callback){
		User.findOne({email: email}, function(err, res){
			if(err)
				throw err;
			else if(res){
				callback("User already exists");
			}
			else{
				User.create({email: email, profile: profile},callback);				
			}
		})
	}
	var count = 0;
	module.addCampaignResponse = function(email,campId,update,options,callback)
	{	/*console.log(update+" "+count++);*/
	// console.log(email+" email");
	// console.log(update+" update");
		User.findOneAndUpdate({ email:email, campaignResponse: {$eq:null}}, {$set: {campaignResponse: update}},options,function(err,res){
			if(err)
				throw err;
			else{
				// console.log(res+" "+"update response");
				if(!res){
					async.waterfall([function(_callback){
						User.findOne({email:email}, function(err,result){
							if(err)
								return _callback(err)
							else{
								return _callback(err,result);
							}
						})
					}, function(result, _callback){
						if(result)
							{	
								console.log(result);
								var data =result.campaignResponse;
								// console.log(data);
								// console.log("\n-----------------------------------------------------------\n");
								data[campId]=update[campId];
								User.findOneAndUpdate({email:email}, {$set: {campaignResponse:data}},{new: true},function(err,result2){
									if(err){
										console.log(err);
										return _callback(err);
									}
									else{
										console.log("aaya");
										return _callback(err,result2);										
									}
								})
							}
					}], function(err){
						if(err){
							console.log(err);
							return callback(err)
						}
						return callback();
					})
				}
				// console.log("last");
				else{
					return callback(err,res);
				}
			}
		});
	}		

	module.createCampaignSummary = function(callback){
		User.find({campaignResponse:{$ne: null}}, function(err,res){
			if(err)
				throw err;
			else{
				for(var i =0 ; i < res.length ; i++){
					var campaingResponseObj = res[i];
					async.eachOfSeries(campaingResponseObj.campaignResponse, function(response, key,callback){
						if(response.summary=='f')
						{
							if(!campaingResponseObj.campaignSummary){
								var summary = {};
								summary['Click'] = response.Click == true ? 1 : 0;
								summary['Open'] = response.Open == true ? 1 : 0;
								summary['Bounce'] = response.Bounce == true ? 1 : 0;
								summary['Unsub'] = response.Unsub == true ? 1 : 0;
								summary['Spam'] = response.Spam == true ? 1 : 0;
								summary['Queued'] = response.Queued == true ? 1 : 0;
								summary['Sent'] = response.Sent == true ? 1 : 0;
								var temp = {};
								temp[response.retailer] = summary;
								var obj = response;
								obj['summary'] = 't';
								User.findOneAndUpdate({email: campaingResponseObj.email},{$set: {campaignSummary: temp , ['campaignResponse.'+key]: obj }},{new: true},function(err ,result2){
									if(err)
										callback(err);
									else{
										campaingResponseObj = result2;
										console.log(result2);
										callback(null, "Done");
									}
								})
							}
							else if(!campaingResponseObj.campaignSummary[response.retailer]){
								var summary = {};
								summary['Click'] = response.Click == true ? 1 : 0;
								summary['Open'] = response.Open == true ? 1 : 0;
								summary['Bounce'] = response.Bounce == true ? 1 : 0;
								summary['Unsub'] = response.Unsub == true ? 1 : 0;
								summary['Spam'] = response.Spam == true ? 1 : 0;
								summary['Queued'] = response.Queued == true ? 1 : 0;
								summary['Sent'] = response.Sent == true ? 1 : 0;
								var temp = campaingResponseObj.campaignSummary;
								temp[response.retailer] = summary;
								var obj = response;
								obj['summary'] = 't';									
								User.findOneAndUpdate({email: campaingResponseObj.email},{$set: {campaignSummary: temp, ['campaignResponse.'+key]: obj}},{new: true},function(err ,result2){
									if(err)
										console.log(err);
									else{
										campaingResponseObj = result2;
										console.log(result2);
										callback(null, "Done");
									}
								})	
							}
							else{
								var summary = campaingResponseObj.campaignSummary[response.retailer];
								summary['Click'] = response.Click == true ? summary['Click']+1 : summary['Click'];
								summary['Open'] = response.Open == true ? summary['Open']+1 : summary['Open'];
								summary['Bounce'] = response.Bounce ==true ? summary['Bounce']+1 : summary['Bounce'];
								summary['Unsub'] = response.Unsub ==true ? summary['Unsub']+1 : summary['Unsub'];
								summary['Spam'] = response.Spam ==true ? summary['Spam']+1 : summary['Spam'];
								summary['Queued'] = response.Queued ==true ? summary['Queued']+1 : summary['Queued'];
								summary['Sent'] = response.Sent ==true ? summary['Sent']+1 : summary['Sent'];
								var temp = campaingResponseObj.campaignSummary;
								temp[response.retailer] = summary;
								var obj = response;
								obj['summary'] = 't';
								User.findOneAndUpdate({email: campaingResponseObj.email},{$set: {campaignSummary: temp, ['campaignResponse.'+key]: obj}},{new: true},function(err ,result2){
									if(err)
										console.log(err);
									else{
										campaingResponseObj = result2;
										console.log(result2);
										callback(null, "Done");
									}
								})
							}
						}
					}, function(err){
						if(err){
							console.log(err);
						}
						else{console.log("All Done!")}
					});
				}
				callback(null,"Done");
			}
		})
	}

	return module;
}