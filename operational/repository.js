const csv=require('csvtojson')
var async = require('async');
var fs = require('fs');
var mailjet = require('node-mailjet').connect(process.env.MJ_PUBLIC_KEY,process.env.MJ_PRIVATE_KEY);

module.exports.getCampaignResponse = function(User, Campaign, callback){
	Campaign.getCampaigns(function(err, res){
		if(err)
			callback(err);
		else{
			for(let camp= 0; camp < res.length; camp++){
				let _id = res[camp]._id;
				let arr = res[camp].campaignID;
				for(let i=0; i < arr.length ; i++){
					let users = arr[i].users;
					let id = arr[i].id;
					let loop = Math.ceil(users/1000);
					let limit = 0, offset = 0;
					for(let j = 0; j < loop ; j++ ){
						if(users> 1000){
							limit = 1000;
							users-=limit;
						} else{
							limit = users;
						}
						const request = mailjet
						.get("messagesentstatistics")
						.request({
							"CampaignID": id,
							"AllMessages": true,
							"Limit": limit,
							"Offset": offset		
						})
						request
						.then((result) => {
							let data = result.body.Data;
							for(let val = 0 ; val < result.body.Data.length; val++){
								let jsonObj = data[val];
								let email = jsonObj.ToEmail;
								jsonObj['retailer'] = res[camp].retailer;
								jsonObj['summary']= 'f';
								let tempObj = {};
								tempObj[id] = jsonObj;
								let options={new:true};
								let campId = id;
								User.addCampaignResponse(email, campId,tempObj,options,function(err,results){
									if(err){
										throw err;
									}
									else{
										Campaign.updateResponse(_id,function(err, res){
											if(err)
												throw err;
									})// console.log(results);
									}
								})	
							}	
						})
						.catch((err) => {
							console.log(err);
						})
						offset+=limit;
					}
				}
			}
			callback(null, "Response Fetched.");
		}
	})
}

module.exports.addUser = function(path, file, User,callback){
	file.mv(path, function(err){
		if(err)
			callback(err);
		else{
			csv()
			.fromFile(path)
			.on('json',(jsonObj)=>{
				var email = jsonObj.email;
				User.addEmails(email, function(err, res){
					if(err=="User already exists")
					{}
				else{
					console.log(res);
				}
			})
			})
			.on('done',(error)=>{
				console.log('end');
				fs.unlink(path);
				callback(null, "Done");
			})			
		}
	})
}

module.exports.generateInvoice = function(Campaign, retailer, from , to, callback){

	Campaign.getCampaignsBetweenDates(retailer,from ,to, function(err,result){
		if(err)
			 callback(err);
		else{
			var body=[]; var header = [];
			var isHeaderSet = false;
			async.eachOfSeries(result, function(value, index, callback){
				var obj = {};
				var array = value.campaignID;
				async.eachOfSeries(array, function(item, key, callback){
					var id = item.id;
					console.log(item);
					const request = mailjet.get('messagestatistics').request({
						CampaignID: id
					});
					request
					.then((data) => {
						obj['Campaign'] = value.campaign.subject;
						obj['Clicked'] = obj.Clicked == null ? data.body.Data[0].ClickedCount : obj['Clicked']+data.body.Data[0].ClickedCount;
						obj['Opened'] = obj.Opened == null ? data.body.Data[0].OpenedCount : obj['Opened']+data.body.Data[0].OpenedCount;
						obj['Bounced'] = obj.Bounced == null ? data.body.Data[0].BouncedCount : obj['Bounced']+data.body.Data[0].BouncedCount;
						obj['Delivered'] = obj.Delivered == null ? data.body.Data[0].DeliveredCount : obj['Delivered']+data.body.Data[0].DeliveredCount;
						obj['Unsubscribed'] = obj.Unsubscribed == null ? data.body.Data[0].UnsubscribedCount : obj['Unsubscribed']+data.body.Data[0].UnsubscribedCount;
						obj['Date'] = value.date.toISOString().substring(0,10);
						if(!isHeaderSet){

							header = [
							{ id: 'Campaign', header: 'Campaign', align: 'left' },
							{ id: 'Clicked', header: 'Clicked', width: 50 },
							{ id: 'Opened', header: 'Opened', width: 50 },
							{ id: 'Bounced', header: 'Bounced', width: 50 },
							{ id: 'Delivered', header: 'Delivered', width: 60 },
							{ id: 'Unsubscribed', header: 'Unsubscribed', width: 75 },
							{ id: 'Date', header: 'Date', width: 70 }]
							isHeaderSet = true;
						}
						callback();
					})
					.catch((err) => {
						console.log(err);
						callback(err.statusCode);
					});
				}, function(err){
					console.log("DOne");
					body.push(obj);
					callback();
				})
			}, function(err){
				console.log("DOne");
				var pdf = require('./pdf').create(header,body);
				callback(null, pdf);
			})
		}
	})
}