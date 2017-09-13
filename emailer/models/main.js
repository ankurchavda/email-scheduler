var mongoose = require('mongoose');
module.exports = function (mon) {
	var module = {};

	var User = mon.model(
		'User',
		new mongoose.Schema({
			email: String,
			campaignResponse: Object,
			contactResponse: Object,
			uuid: String,
			preferences: String,
			retailer: Object,
			transactional: [{
				_id: false,
				id: String,
				from: String,
				html: String,
				text: String
			}]
		})
	);

	module.getUsersClick = function (limit, skip, click, callback) {
		console.log('skip: ' + skip + ' ' + 'limit: ' + limit);
		User.find({
					_id: {
						$gt: skip
					},
					'campaignResponse.camp1.click': click
				},
				callback
			)
			.limit(limit)
			.sort('_id')
			.select({
				email: 1,
				campaignResponse: 1
			})
			.lean();
	};

	module.getUsersOpen = function (limit, retailer, skip, gt, lt, callback) {
		console.log("idhar bhi aaya!");
		console.log('skip: ' + skip + ' ' + 'limit: ' + limit);
		var id = mongoose.Types.ObjectId(skip);
		User.find({
					_id: {
						$gt: id
					},
					['campaignSummary.' + retailer + '.Open']: {
						$gte: gt,
						$lt: lt
					}
				},
				callback
			)
			.limit(limit)
			.sort('_id')
			.select({
				email: 1,
				campaignResponse: 1
			})
			.lean();
	};

	module.getUserOpenNCLick = function (limit, skip, click, open, callback) {
		console.log('skip: ' + skip + ' ' + 'limit: ' + limit);
		User.find({
					_id: {
						$gt: skip
					},
					'campaignResponse.camp1.click': click,
					'campaignResponse.camp1.open': open
				},
				callback
			)
			.limit(limit)
			.sort('_id')
			.select({
				email: 1,
				campaignResponse: 1
			})
			.lean();
	};

	module.getUsers = function (limit, skip, callback) {
		console.log('skip: ' + skip + ' ' + 'limit: ' + limit);
		User.find({
					_id: {
						$gt: skip
					}
				},
				callback
			)
			.limit(limit)
			.sort('_id')
			.select({
				email: 1,
				campaignResponse: 1
			})
			.lean();
	};

	module.updateTransactionalDetails = function (email, object, callback) {
		console.log("aya");
		User.findOneAndUpdate({"email": email},{$push: {"transactional": object}},callback);
	}


	module.getUsersWithNoCampaign = function (limit, skip, callback) {
		console.log('skip: ' + skip + ' ' + 'limit: ' + limit);
		User.find({
					_id: {
						$gt: skip
					},
					campaignSummary: {
						$eq: null
					}
				},
				callback
			)
			.limit(limit)
			.sort('_id')
			.select({
				email: 1
			})
			.lean();
	};
	return module;
};