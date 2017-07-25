var mongoose = require('mongoose');
module.exports = function (mon) {
	var module = {};

	var Campaign = mon.model('Campaign', new mongoose.Schema({
		campaignID: [{
			_id: false,
			id: String,
			users: String
		}],
		retailer: String,
		campaign: Object,
		response: Boolean
	}))

	module.saveCampaign = function (id, users, campID, rID, campaign, callback) {
		var query = {
			_id: id
		};
		var camp = {
			id: campID,
			users: users
		};
		var update = {
			$push: {
				campaignID: camp
			}
		};
		var options = {
			new: true
		};
		console.log("users: " + users);
		if (id == null) {
			Campaign.create({
				campaignID: [{
					id: campID,
					users: users
				}],
				retailer: rID,
				campaign: campaign,
				response: false
			}, callback)
		} else {
			Campaign.findOneAndUpdate(query, update, options, callback);
		}

	}
	return module;
}