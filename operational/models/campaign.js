var mongoose = require('mongoose');
module.exports = function(mon){
	var module = {};

	var Campaign = mon.model('Campaign', new mongoose.Schema({
		campaignID : [{
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
		Campaign.find({retailer: retailer , date: {$gte: new Date(from.year,from.month,from.date) , $lte: new Date(to.year,to.month,to.date)}} ,callback);
	}
	return module;
}