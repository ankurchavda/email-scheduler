var mainDb = require('./models/main');
module.exports.clickedUsers = function(limit,skip, condition, callback){
	mainDb.getUsersClick(limit , skip , condition,function(err, res){
		var arr= [];
		if(err)
		{
			console.log(err+" 1");
			callback(err);
		}
		else{
						// for(var i= 0; i< res.length ;i++)
						// {
						// 	for (prop in res[i].campaignResponse)
						// 	{
						// 		var str = 'camp1';
						// 		if(res[i].campaignResponse[str].click == m.condition.click)
						// 		{
						// 			arr.push({email :res[i].email});
						// 		}
						// 	}
						// }
		console.log(res);
		process.send(res[res.length-1]._id);
		for(var i = 0 ; i< res.length ; i++)
		{
			arr.push({email: res[i].email});
		}
		callback(null, arr);
		}
	});
} 