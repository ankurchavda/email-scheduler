var mongoose = require('mongoose');
module.exports = function(mon){
	var module = {};

	var Campaign = mon.model('Campaign', new mongoose.Schema({
		campaignID : [{
			_id: false,
			id: String,
			users: String,
			sent_date: {
				type: Date,
				default: Date.now
			}
		}],
		retailer: String,
		campaign: Object,
		response: Boolean,
		date: {
			type: Date,
			default: Date.now
			}	
	}))

	module.getCampaigns = function(callback){
		Campaign.find({response: false}, callback).select({'campaignID': 1 , 'retailer': 1}).lean();
	}

	module.updateResponse =function(id, callback){
		Campaign.findOneAndUpdate({_id : id}, {response: true}, {new: true},callback);
	}

	module.getCampaignsBetweenDates = function(retailer, from, to, callback){
		var fromDate = new Date(from.year,from.month-1,from.date);
		var toDate = new Date(to.year,to.month-1,to.date);
		console.log(fromDate);
		Campaign.find({retailer: retailer , date: {$gte: fromDate , $lte:toDate }} ,callback);
	}
	return module;
}