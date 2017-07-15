var mongoose = require('mongoose');
module.exports = function(mon){
	var module = {};

	var User = mon.model('User', new mongoose.Schema({
		email: String,
		campaignResponse: Object,
		contactResponse: Object,
		uuid: String,
		retailer: Object,
	}))

	module.getUsers = function(callback){
		User.find(callback).lean().select({'email': 1 , 'campaignResponse':1, '_id':0});
	}

	return module;
}