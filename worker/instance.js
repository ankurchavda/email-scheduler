const child_process = require('child_process');

module.exports.createInstance = function (jsonObj) {
	var worker_process = child_process.fork("../scheduler/index.js"); // Path to the scheduler folder
	worker_process.send(jsonObj);
	worker_process.on('close', function (code) {
		console.log('scheduler process exited with code ' + code);
	});
}