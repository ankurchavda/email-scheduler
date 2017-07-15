const fs = require('fs');
var instance = require('./instance');

var obj = {
	array: [1,3,4],
	recurrence:{
		second: 50,
		minute: null,
		hour: null,
		dayOfweek: null,	
	},
	campaign:{
		sender:"PoshaQ",
		email: "fashion@getposhaq.com",
		subject: "Worker se aa rella hai bhidu!",
		title:"Naya!"
	},
	condition:{
		click: 'f'
	}
}

var obj2 = {
	array: [1,3,4],
	recurrence:{
		second: 20,
		minute: null,
		hour: null,
		dayOfweek: null,	
	},
	campaign:{
		sender:"PoshaQ",
		email: "fashion@getposhaq.com",
		subject: "Worker se aa rella hai bhidu!",
		title:"Naya!"
	},
	condition:{
		click: 't'
	}
}

instance.createInstance(obj);
instance.createInstance(obj2);


