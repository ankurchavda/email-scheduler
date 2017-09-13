require('dotenv').config({
	path: "../development.env"
});
var mailjet = require('node-mailjet').connect(process.env.MJ_PUBLIC_KEY, process.env.MJ_PRIVATE_KEY);
var fs = require('fs');
// const csvFilePath='.csv';

module.exports.createContactList = function (name, callback) {
	const request = mailjet.post('contactslist').request({
		Name: name
	});
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			return callback(err);
		});
};

module.exports.deleteContactList = function (id, callback) {
	const request = mailjet.delete('contactslist').id(id).request();
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			return callback(err);
		});
};

module.exports.manageContactList = function (id, emails, callback) {
	const request = mailjet.post('contact').action('managemanycontacts').request({
		ContactsLists: [{
			ListID: id,
			action: 'addforce'
		}],
		Contacts: emails
	});
	request
		.then((result) => {
			console.log(emails);
			callback(null, result.body);
		})
		.catch((err) => {
			return callback(err);
		});
};

module.exports.prepareCampaign = function (sender, email, subject, contact, title, callback) {
	const request = mailjet.post('campaigndraft').request({
		Locale: 'en_US',
		Sender: sender,
		SenderName: sender,
		SenderEmail: email,
		Subject: subject,
		ContactsListID: contact,
		Title: title
	});
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			return callback(err);
		});
};
module.exports.addBody = function (htmlPath, textPath, id, sender, email, callback) {
	var html = fs.readFileSync(htmlPath, 'utf8');
	var text = fs.readFileSync(textPath, 'utf8');
	const request = mailjet.post('campaigndraft').id(id).action('detailcontent').request({
		'Html-part': html,
		'Text-part': text
	});
	request
		.then((result) => {
			callback(null, result);
		})
		.catch((err) => {
			return callback(err);
		});
};

module.exports.sendCampaign = function (id, callback) {
	const request = mailjet.post('campaigndraft').id(id).action('send').request();
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			return callback(err);
		});
};

module.exports.draftStatus = function (id, callback) {
	const request = mailjet.get('campaigndraft').id(id).request();
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			return callback(err);
		});
};

module.exports.jobStatus = function (jobId, callback) {
	const request = mailjet.get('contact').action('managemanycontacts').id(jobId).request();
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			console.log(err);
			return callback(err);
		});
};

module.exports.campaignStats = function (id, callback) {
	const request = mailjet.get('campaignstatistics').request({
		NewsLetter: id
	});
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			console.log(err);
			callback(err.statusCode);
		});
};

module.exports.contactStats = function (email, callback) {
	const request = mailjet.get('contactstatistics').id(email).request();
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			return callback(err);
		});
};


module.exports.transactional = function (m, callback) {
	var html = fs.readFileSync(m.htmlPath, 'utf8');
	var text = fs.readFileSync(m.textPath, 'utf8');
	const request = mailjet
		.post("send", {
			'version': 'v3.1'
		})
		.request({
			"Messages": [{
				"From": {
					"Email": m.From.email,
					"Name": m.From.name
				},
				"To": [{
					"Email": m.To.email,
					"Name": m.To.name
				}],
				"Subject": m.Subject,
				"TextPart": text,
				"HTMLPart": html
			}]
		});
	request
		.then((result) => {
			return callback(null, result.body)
		})
		.catch((err) => {
			console.log("error");
			console.log(err);
			return callback(err.statusCode)
		});
};