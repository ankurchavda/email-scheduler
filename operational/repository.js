require('dotenv').config({
	path: "../development.env"
});
const csv = require('csvtojson')
var async = require('async');
var fs = require('fs');
var mailjet = require('node-mailjet').connect(process.env.MJ_PUBLIC_KEY, process.env.MJ_PRIVATE_KEY);

module.exports.getCampaignResponse = function (User, Campaign, callback) {
	let count = 0;
	Campaign.getCampaigns(function (err, res) {
		if (err)
			return callback(err);
		else {
			var responses = [];
			console.log("ep 1");

			function GetResponse(callback) {
				async.eachOfSeries(res, function (value, camp, callback1) {
					let _id = value._id;
					let arr = value.campaignID;
					async.eachOfSeries(arr, function (value1, i, callback2) {
						let users = value1.users;
						let id = value1.id;
						let loop = Math.ceil(users / 1000);
						let limit = 0,
							offset = 0;
						async.timesSeries(loop, function (n, callback3) {
							if (users > 1000) {
								limit = 1000;
								users -= limit;
							} else {
								limit = users;
							}
							console.log(limit + " limit " + offset + " offset");
							var start = Date.now();
							// while (Date.now() < start + 100) {}
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
									// var a = data.slice(0);
									// responses = responses.concat(data);
									async.eachSeries(data, function (single, callback4) {
										single['retailer'] = value.retailer;
										single['campId'] = id;
										single['_id'] = _id;
										responses.push(single);
										return callback4();
									}, function (err) {
										// console.log(responses);
										if (err) {
											return callback3(err);
										}
										return callback3();
									})
									// return callback3();
								})
								.catch((err) => {
									console.log(err);
									return callback3(err)
								})
							offset += limit;
						}, function (err) {
							if (err) {
								return callback2(err);
							}
							return callback2()
						})
					}, function (err) {
						if (err) {
							return callback1(err);
						}
						return callback1()
					})
				}, function (err) {
					if (err) {
						return callback(err)
					}
					console.log(responses);
					return callback()
				})
			}

			function ResponseUpdate(callback) {
				var count = 0;
				async.eachOfSeries(responses, function (value2, val, callback4) {
					let jsonObj = value2;
					let email = jsonObj.ToEmail;
					jsonObj['summary'] = 'f';
					let tempObj = {};
					tempObj[jsonObj['campId']] = jsonObj;
					let options = {
						new: true
					};
					let campId = jsonObj['campId'];
					let _id = jsonObj['_id'];
					delete jsonObj.campId;
					delete jsonObj._id;


					async.parallel([function (_callback) {
						User.addCampaignResponse(email, campId, tempObj, options, function (err, results) {
							if (err) {
								return _callback(err);
							} else {
								// console.log(results);
								return _callback();
							}
						})
					}, function (_callback) {
						Campaign.updateResponse(_id, function (err, results2) {
							if (err)
								return _callback(err);
							else {
								// console.log(count++);
								return _callback();
							}
						})
					}], function (err) {
						if (err) {
							return callback4(err)
						} else {
							return callback4(err)
						}
					})
				}, function (err) {
					console.log(err);
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

	return callback();
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