const fs = require('fs');
var instance = require('./instance');

var obj = {
	array: [1, 1],
	recurrence: {
		second: 50,
		minute: null,
		hour: null,
		dayOfweek: null,
	},
	campaign: {
		sender: "StartUp India Yatra",
		email: "fashion@getposhaq.com",
		subject: "{Invitation} StartUp India Yatra Chapter",
		title: "StartUp India Yatra Campaign"
	},
	condition: {
		open: {
			greaterThanEqual: 1,
			lessThan: 2
		},
		campaignSummary: null
	},
	textPath: "../template.txt",
	htmlPath: "../template.html",
	path: "../emailer/index.js", // Stay awaayyyyy!
	retailerId: "4"
}

// var obj2 = {
// 	array: [1, 3, 4],
// 	recurrence: {
// 		second: 20,
// 		minute: null,
// 		hour: null,
// 		dayOfweek: null,
// 	},
// 	campaign: {
// 		sender: "PoshaQ",
// 		email: "fashion@getposhaq.com",
// 		subject: "Worker se aa rella hai bhidu!",
// 		title: "Naya!"
// 	},
// 	condition: {
// 		click: 't',
// 		open: 't',
// 		campaignResponse: null
// 	},
// 	path: "../emailer/index.js",
// 	retailerId: 4
// }
console.log(process.env.MJ_PUBLIC_KEY);
instance.createInstance(obj);
// instance.createInstance(obj2);