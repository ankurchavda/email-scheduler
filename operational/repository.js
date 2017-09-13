require('dotenv').config({
	path: "../development.env"
});
const csv = require('csvtojson')
var async = require('async');
var fs = require('fs');
var mailjet = require('node-mailjet').connect(process.env.MJ_PUBLIC_KEY, process.env.MJ_PRIVATE_KEY);
var json2csv = require('json2csv');


var fields = ["BlockedCount",
	"BouncedCount",
	"CampaignID",
	"CampaignIsStarred",
	"CampaignSendStartAt",
	"CampaignSubject",
	"ClickedCount",
	"ContactListName",
	"DeliveredCount",
	"LastActivityAt",
	"NewsLetterID",
	"OpenedCount",
	"ProcessedCount",
	"QueuedCount",
	"SegmentName",
	"SpamComplaintCount",
	"UnsubscribedCount",
	"Sender"
]

// Welcome to the jungle O_o
module.exports.getCampaignResponse = function (User, Campaign, callback) {
	let count = 0;
	Campaign.getCampaigns(function (err, res) {
		if (err)
			return callback(err);
		else {
			var responses = []; // response for one campaign
			var campaignsToUpdate = []; // Set the campaign _id's response to true
			var cummulativeResponse = []; // Response of all the camapaigns

			// Beginning of some function inceptions *Tautology*
			function GetResponse(callback) {

				// Start of the GetResponse function execution
				async.eachSeries(res, function (value, callback1) {
					campaignsToUpdate.push(value._id);
					let arr = value.campaignID;

					// Function used in the second level of async.eachSeries
					function MailjetLooper(value1, callback2) {
						let users = value1.users;
						let id = value1.id;
						let loop = Math.ceil(users / 1000);
						let limit = 0,
							offset = 0;

						// Function used in the third level of async.eachSeries
						function LoopTheThousand(n, callback3) {
							if (users > 1000) {
								limit = 1000;
								users -= limit;
							} else {
								limit = users;
							}
							console.log(limit + " limit " + offset + " offset");
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
									var loop = 0;
									async.eachSeries(data, function (single, callback4) {
										single['retailer'] = value.retailer;
										single['campId'] = id;
										responses.push(single);
										return callback4();
									}, function (err) {
										if (err) {
											return callback3(err);
										}
										return callback3();
									})
								})
								.catch((err) => {
									console.log(err);
									return callback3(err)
								})
							offset += limit;
						}
						// *** LoopTheThousand end ***

						// Third level async.eachSeries
						async.timesSeries(loop, LoopTheThousand, function (err) {
							if (err) {
								return callback2(err);
							}
							cummulativeResponse.push({
								_id: value._id,
								response: responses
							});
							responses = [];
							return callback2()
						})
					}
					// *** MailjetLooper end ***

					// Second level async.eachSeries
					async.eachSeries(arr, MailjetLooper, function (err) {
						if (err) {
							// Throw error to the First level async.eachSeries if an err							
							return callback1(err);
						}
						//Finish if okay
						return callback1()
					})
				}, function (err) {
					if (err) {
						// Throw error for async.series
						return callback(err)
					}
					console.log(responses);
					//Successfully complete GetResponse
					return callback()
				})
			}

			// To update the campaign responses in the database and setting the responses to true
			// in campaign model

			function ResponseUpdate(callback) {
				var count = 0;

				async.eachSeries(cummulativeResponse, function (value, callback1) {
					var array = value.response;
					var _id = value._id;
					async.eachSeries(array, function (value2, _callback) {
						let jsonObj = value2;
						let email = jsonObj.ToEmail;
						jsonObj['summary'] = 'f';
						let tempObj = {};
						tempObj[jsonObj['campId']] = jsonObj;
						let options = {
							new: true
						};
						let campId = jsonObj['campId'];
						delete jsonObj.campId; // ****optimizable****

						User.addCampaignResponse(email, campId, tempObj, options, function (err, results) {
							if (err) {
								return _callback(err);
							} else {
								return _callback();
							}
						});

					}, function (err) {
						if (err) {
							console.log(err);
							return callback1(err);
						}
						Campaign.updateResponse(_id, function (err, result) {
							if (err)
								return callback1(err);
							else {
								return callback1(err, result);
							}
						})
					})
				}, function (err) {
					if (err)
						return callback(err);

					return callback();
				})

			}


			async.series([GetResponse, ResponseUpdate], function (err) {
				if (err) {
					console.log(err);
					return callback(err)
				}
				console.log("done");
				// return callback();
			})
		}
	})
	return callback(); // Note to self: find a solution
}

module.exports.addUser = function (path, file, User, callback) {
	file.mv(path, function (err) {
		if (err)
			callback(err);
		else {
			csv()
				.fromFile(path)
				.on('json', (jsonObj) => {
					var email = jsonObj.email;
					delete jsonObj.email;
					var profile = jsonObj;
					User.addEmails(email, profile, function (err, res) {
						if (err == "User already exists") {
							console.log("user already exists");
						} else {
							console.log(res);
						}
					})
				})
				.on('done', (error) => {
					console.log('end');
					fs.unlink(path);
					callback(null, "Done");
				})
		}
	})

}

module.exports.generateInvoice = function (Campaign, retailer, from, to, callback) {

	Campaign.getCampaignsBetweenDates(retailer, from, to, function (err, result) {
		if (err)
			callback(err);
		else {
			var body = [];
			var header = [];
			var isHeaderSet = false;
			async.eachOfSeries(result, function (value, index, callback) {
				var obj = {};
				var array = value.campaignID;
				async.eachOfSeries(array, function (item, key, callback) {
					var id = item.id;
					console.log(item);
					const request = mailjet.get('messagestatistics').request({
						CampaignID: id
					});
					request
						.then((data) => {
							obj['Campaign'] = value.campaign.subject;
							obj['Clicked'] = obj.Clicked == null ? data.body.Data[0].ClickedCount : obj['Clicked'] + data.body.Data[0].ClickedCount;
							obj['Opened'] = obj.Opened == null ? data.body.Data[0].OpenedCount : obj['Opened'] + data.body.Data[0].OpenedCount;
							obj['Bounced'] = obj.Bounced == null ? data.body.Data[0].BouncedCount : obj['Bounced'] + data.body.Data[0].BouncedCount;
							obj['Delivered'] = obj.Delivered == null ? data.body.Data[0].DeliveredCount : obj['Delivered'] + data.body.Data[0].DeliveredCount;
							obj['Unsubscribed'] = obj.Unsubscribed == null ? data.body.Data[0].UnsubscribedCount : obj['Unsubscribed'] + data.body.Data[0].UnsubscribedCount;
							obj['Date'] = value.date.toISOString().substring(0, 10);
							if (!isHeaderSet) {

								header = [{
										id: 'Campaign',
										header: 'Campaign',
										align: 'left'
									},
									{
										id: 'Clicked',
										header: 'Clicked',
										width: 50
									},
									{
										id: 'Opened',
										header: 'Opened',
										width: 50
									},
									{
										id: 'Bounced',
										header: 'Bounced',
										width: 50
									},
									{
										id: 'Delivered',
										header: 'Delivered',
										width: 60
									},
									{
										id: 'Unsubscribed',
										header: 'Unsubscribed',
										width: 75
									},
									{
										id: 'Date',
										header: 'Date',
										width: 70
									}
								]
								isHeaderSet = true;
							}
							callback();
						})
						.catch((err) => {
							console.log(err);
							callback(err.statusCode);
						});
				}, function (err) {
					console.log("DOne");
					body.push(obj);
					callback();
				})
			}, function (err) {
				console.log("DOne");
				var pdf = require('./pdf').create(header, body);
				callback(null, pdf);
			})
		}
	})

}

module.exports.campaignSummaryForClient = function (Campaign, retailer, from, to, callback) {
	var data = [];
	Campaign.getCampaignsBetweenDates(retailer, from, to, function (err, res) {
		if (err) {
			callback(err);
		} else {
			console.log(res);
			async.eachSeries(res, function (value, callback1) {
				var campaign = value.campaignID;
				var email = value.campaign.email;
				async.eachSeries(campaign, function (ids, callback2) {
					var campaignID = ids.id;
					const request = mailjet.get('campaignstatistics').id(campaignID).request();
					request
						.then((result) => {
							console.log(result.body);
							var response = result.body.Data[0];
							response['Sender'] = email;
							data.push(response);
							callback2();
						})
						.catch((err) => {
							console.log(err);
							callback2(err.statusCode);
						});
				}, function (err) {
					if (err) {
						callback1(err);
					} else {
						callback1()
					}
				})
			}, function (err) {
				if (err) {
					callback(err);
				} else {
					console.log(data);
					var csv = json2csv({
						data: data,
						fields: fields
					});

					fs.writeFile('file.csv', csv, function (err) {
						if (err) throw err;
						console.log('file saved');
					});
					callback();
				}
			})

		}
	})
}

module.exports.campaignStatistic = function (Campaign, retailer, id, callback) {
	const request = mailjet.get('campaignstatistics').id(id).request();
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			console.log(err);
			callback(err.statusCode);
		});
}
