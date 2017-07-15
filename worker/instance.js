const child_process = require('child_process');

module.exports.createInstance = function(jsonObj){
	var worker_process = child_process.fork("C:/PoshaQ/Communication/email-scheduler/index.js");
	worker_process.send(jsonObj);	
	worker_process.on('close', function (code) {
		console.log('child process exited with code ' + code);
	});
}