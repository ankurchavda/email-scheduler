var async = require('async');
var contactId, newsLetterId, campaignId = '';
var mongoose = require('mongoose');
var main = mongoose.createConnection('mongodb://localhost/communication');
var mainDb = require('./models/main')(main);
var mail = require('./mail');
var Campaign = require('./models/campaign')(main);
var random = require('randomstring');
var arr = [];
var data = '';
var baseUrl = "http://35.185.235.73:5000/";
var skip = '';
var fs = require('fs');
process.on('message', (m) => {

	async.series([
		function (callback) {
			if (m.condition.open != null && m.campaignSummary != null) {
				mainDb.getUsersOpen(m.limit, m.retailerId, m.skip, m.condition.open.greaterThanEqual, m.condition.open.lessThan, function (err, res) {
					if (err) {
						console.log(err + " 1");
						callback(err);
					} else {
						console.log(res);
						if (!res.length)
							process.exit();
						skip = res[res.length - 1]._id;
						for (var i = 0; i < res.length; i++) {
							var url = baseUrl + 'preferences/retailer/' + m.retailerId + '/' + res[i]._id;
							arr.push({
								email: res[i].email,
								Properties: {
									"Url": url
								}
							});
						}
						callback(null, "Users pulled from the database");
					}
				});
			} //else if (m.condition.click != null && m.condition.open != null) {
			// 	mainDb.getUsersOpenNClick(m.limit, m.skip, m.condition.click, m.condition.getUsersOpen, function (err, res) {
			// 		if (err) {
			// 			console.log(err + " 1");
			// 			callback(err);
			// 		} else {
			// 			console.log(res);
			// 			if (!res.length)
			// 				process.exit();
			// 			skip=res[res.length - 1]._id;
			// 			for (var i = 0; i < res.length; i++) {
			// 				var url = baseUrl + 'preferences/retailer/' + m.retailerId + '/' + res[i]._id;
			// 				arr.push({
			// 					email: res[i].email,
			// 					Properties: {
			// 						"Url": url
			// 					}
			// 				});
			// 			}
			// 			callback(null, "Users pulled from the database");
			// 		}
			// 	});
			/*}*/
			else if (m.campaignSummary == null) {
				mainDb.getUsersWithNoCampaign(m.limit, m.skip, function (err, res) {
					if (err) {
						console.log(err + " 1");
						callback(err);
					} else {
						console.log(res);
						if (!res.length)
							process.exit();
						skip = res[res.length - 1]._id;
						for (var i = 0; i < res.length; i++) {
							var url = baseUrl + 'preferences/retailer/' + m.retailerId + '/' + res[i]._id;
							arr.push({
								email: res[i].email,
								Properties: {
									"Url": url
								}
							});
						}
						callback(null, "Users pulled from the database");
					}
				});
			}
		},
		function (callback) {
			mail.createContactList(random.generate(9), function (err, result) {
				if (err) {
					console.log(err + " 2");
					callback(err);
				} else {
					contactId = result.Data[0].ID;
					callback(null, "Contactlist created with Id: " + contactId);
				}
			});
		},
		function (callback) {
			if (arr.length) {
				mail.manageContactList(contactId, arr, function (err, result) {
					if (err)
						callback(err + " 3");
					else {
						callback(null, "Contacts added to the contact list with Id: " + contactId);
					}
				});
			} else {
				process.exit();
			}
		},
		function (callback) {
			mail.prepareCampaign(m.campaign.sender, m.campaign.email, m.campaign.subject, contactId, m.campaign.title, function (err, result) {
				if (err) {
					console.log(err + " 4");
					callback(err);
				} else
					newsLetterId = result.Data[0].ID;
				callback(null, "Campaign prepared with newsLetterId: " + newsLetterId);
			});
		},
		function (callback) {
			mail.addBody(m.htmlPath, m.textPath, newsLetterId, function (err, result) {
				if (err) {
					console.log(err + " 5");
					callback(err);
				} else {
					callback(null, "Added body to the campaign with newsLetterId: " + newsLetterId);
				}
			});
		},
		function (callback) {
			mail.sendCampaign(newsLetterId, function (err, result) {
				if (err) {
					console.log(err + " 6");
					callback(err);
				} else {
					callback(null, "Campaign sent!, Enjoy");
				}
			});
		},
		function (callback) {
			mail.campaignStats(newsLetterId, function (err, res) {
				if (err) {
					console.log(err + " 7");
					callback(err);
				} else {
					var campaignId = res.Data[0].CampaignID;
					var campaignObj = {};
					campaignObj['subject'] = m.campaign.subject;
					campaignObj['sender'] = m.campaign.sender;
					campaignObj['email'] = m.campaign.email
					campaignObj['title'] = m.campaign.title
					campaignObj['text'] = fs.readFileSync(m.textPath, 'utf8');
					campaignObj['html'] = fs.readFileSync(m.htmlPath, 'utf8');
					Campaign.saveCampaign(m._id, m.limit, campaignId, m.retailerId, campaignObj, function (err, res) {
						if (err)
							throw err;
						else {
							// console.log(res);
							process.send({
								skip: skip,
								_id: res._id
							});
						}
					})
					callback(null, "CampaignId pushed to database");
				}
			})
		},
		function (callback) {
			mail.deleteContactList(contactId, function (err, result) {
				if (err) {
					console.log(err + " 8");
					callback(err);
				} else callback(null, "contact list deleted");
			});
		}
	], function (err, results) {
		console.log(results + "\n\ndone............. \n\n");
		process.exit();
	});
});