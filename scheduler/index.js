var schedule = require('node-schedule');
var child_process = require('child_process');
var contactId,
	campaignId = '';
// var date = new Date(2017, 6, 12, 13, 6 , 0);
var i = 0,
	j = -1,
	skip = '599d46137015b33a69b9af43',
	limit = 0,
	_id = null;
var arr = '';

process.on('message', (m) => {

	if(m.transactional == false){

	arr = m.array;
	var rule = new schedule.RecurrenceRule();
	rule.second = m.recurrence.second;
	rule.minute = m.recurrence.minute;
	rule.hour = m.recurrence.hour;
	jsonObj = m;
	var path = jsonObj.path;
	delete jsonObj.recurrence;
	delete jsonObj.array;
	delete jsonObj.path;
	var job = schedule.scheduleJob(rule, function() {
		limit = arr[i];
		jsonObj['limit'] = limit;
		jsonObj['skip'] = skip;
		jsonObj['_id'] = _id;
		var worker_process = child_process.fork(path); // Path to the child index.js
		worker_process.send(jsonObj);
		worker_process.on('message', (message) => {
			skip = message.skip;
			_id = message._id;
		});
		worker_process.on('close', function(code) {
			i++;
			j++;
			if (i >= arr.length) {
				job.cancel();
				worker_process.kill();
				process.exit();
			}
			console.log('emailer process exited with code ' + code);
		});
	});
	}

	else{

		var worker_process = child_process.fork('../emailer/index.js');
		worker_process.send(m);
		worker_process.on('message', function(result){
			process.send(result);
		});
		worker_process.on('close', function(code){
			console.log('emailer excited with code '+code);
			process.exit();
		});
	}
});
