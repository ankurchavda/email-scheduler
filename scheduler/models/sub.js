var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var random = require('randomstring');
module.exports = function(mon){
	var module = {};

	autoIncrement.initialize(mon);
	module.randomSchemaName = random.generate({
		length: 10,
		charset: 'alphabetic'
	});
	var tempSchema = new mongoose.Schema({
		email: String
	}, {strict: false});

	tempSchema.plugin(autoIncrement.plugin, module.randomSchemaName);
	var temp = mon.model(module.randomSchemaName, tempSchema);

	module.saveUsers= function(users, callback){
		temp.create(users, callback);
	}

	module.getUsers = function(limit, skip, callback){
		console.log("skip: "+skip+" "+"limit: "+limit);
		temp.find({ _id:{$gte: skip}},callback).limit(limit).sort('_id').select({'email': 1, '_id': 0});
	}
	return module;
}