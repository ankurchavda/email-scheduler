require('dotenv').config({path: "../development.env"});
var mongoose = require('mongoose');
var random = require('randomstring');
var async = require('async');
var contactId,
newsLetterId,
campaignId = '';
var main = mongoose.createConnection(process.env.DB_URL);
var mainDb = require('./models/main')(main);
var mail = require('./mail');
var Campaign = require('./models/campaign')(main);
var arr = [];
var data = '';
var baseUrl = 'http://35.185.235.73:5000/';
var skip = '';
var fs = require('fs');
var textPath = "../template.txt";
var htmlPath= "../template.html";
process.on('message', (m) => {
	async.series(
		[function (callback) {
			if (m.condition.open != null && m.condition.campaignSummary != null) {
				console.log("ayaaaa");
				mainDb.getUsersOpen(
					m.limit,
					m.retailerId,
					m.skip,
					m.condition.open.greaterThanEqual,
					m.condition.open.lessThan,
					function (err, res) {
						if (err) {
							console.log(err + ' 1');
							callback(err);
						} else {
							console.log(res);
							if (!res.length) process.exit();
							skip = res[res.length - 1]._id;
							for (var i = 0; i < res.length; i++) {
								var url = baseUrl + 'preferences/retailer/' + m.retailerId + '/' + res[i]._id;
								arr.push({
									email: res[i].email,
									Properties: {
										Url: url
									}
								});
							}
							callback(null, 'Users pulled from the database');
						}
					}
					);
			} else if (m.condition.campaignSummary == null) {
					console.log("holllyy shit");
					mainDb.getUsersWithNoCampaign(m.limit, m.skip, function (err, res) {
						if (err) {
							console.log(err + ' 1');
							callback(err);
						} else {
							console.log(res);
							if (!res.length) process.exit();
							skip = res[res.length - 1]._id;
							for (var i = 0; i < res.length; i++) {
								var url = baseUrl + 'preferences/retailer/' + m.retailerId + '/' + res[i]._id;
								arr.push({
									email: res[i].email,
									// Properties: {
									// 	Name: res[i].profile.name
									// }
								});
							}
							callback(null, 'Users pulled from the database');
						}
					});
				}
			},
			function (callback) {
				mail.createContactList(random.generate(9), function (err, result) {
					if (err) {
						console.log(err + ' 2');
						callback(err);
					} else {
						contactId = result.Data[0].ID;
						console.log('Contactlist created with Id: ' + contactId);
						callback(null, 'Contactlist created with Id: ' + contactId);
					}
				});
			},
			function (callback) {
				if (arr.length) {
					mail.manageContactList(contactId, arr, function (err, result) {
						if (err) callback(err + ' 3');
						else {
							console.log('Contacts added to the contact list with Id: ' + contactId);
							callback(null, 'Contacts added to the contact list with Id: ' + contactId);
						}
					});
				} else {
					process.exit();
				}
			},
			function (callback) {
				mail.prepareCampaign(
					m.campaign.sender,
					m.campaign.email,
					m.campaign.subject,
					contactId,
					m.campaign.title,
					function (err, result) {
						if (err) {
							console.log(err + ' 4');
							callback(err);
						} else newsLetterId = result.Data[0].ID;
						console.log('Campaign prepared with newsLetterId: ' + newsLetterId);
						callback(null, 'Campaign prepared with newsLetterId: ' + newsLetterId);
					}
					);
			},
			function (callback) {
				mail.addBody(m.htmlPath, m.textPath, newsLetterId, m.campaign.sender, m.campaign.email,function (err, result) {
					if (err) {
						console.log(err + ' 5');
						callback(err);
					} else {
						console.log('Added body to the campaign with newsLetterId: ' + newsLetterId)
						callback(null, 'Added body to the campaign with newsLetterId: ' + newsLetterId);
					}
				});
			},
			function (callback) {
				mail.sendCampaign(newsLetterId, function (err, result) {
					if (err) {
						console.log(err + ' 6');
						callback(err);
					} else {
						console.log('Campaign sent!, Enjoy');
						callback(null, 'Campaign sent!, Enjoy');
					}
				});
			},
			function (callback) {
				const end = Date.now() + 5000;
 					 while (Date.now() < end) {
    					const doSomethingHeavyInJavaScript = 1 + 2 + 3;
  						}
				mail.campaignStats(newsLetterId, function (err, result) {
					if (err) {
						console.log(err + ' 7');
						callback(err);
					} else {



						console.log("newsletter "+newsLetterId);
						console.log(result);
						var campaignId = result.Data[0].CampaignID;
						var campaignObj = {};
						campaignObj['subject'] = m.campaign.subject;
						campaignObj['sender'] = m.campaign.sender;
						campaignObj['email'] = m.campaign.email;
						campaignObj['title'] = m.campaign.title;
						campaignObj['text'] = fs.readFileSync(textPath, 'utf8');
						campaignObj['html'] = fs.readFileSync(htmlPath, 'utf8');
						Campaign.saveCampaign(m._id, m.limit, campaignId, m.retailerId, campaignObj, function (
							err,
							res
							) {
							if (err) throw err;
							else {
								// console.log(res);
								process.send({
									skip: skip,
									_id: res._id
								});
							}
						});
						callback(null, 'CampaignId pushed to database');
					}
				});
			},
			function (callback) {
				mail.deleteContactList(contactId, function (err, result) {
					if (err) {
						console.log(err + ' 8');
						callback(err);
					} else callback(null, 'contact list deleted');
				});
			}
			],
			function (err, results) {
				fs.unlink(textPath);
				fs.unlink(htmlPath);
				console.log(results + '\n\ndone............. \n\n');
				process.exit();
			}
			);
});
