var mailjet = require('node-mailjet').connect('f85a7eea9ded028feabf8247435c4828', 'cc24dc284df3a8449fdbc39964482794');
var fs = require('fs');
// const csvFilePath='.csv';

module.exports.createContactList = function (name, callback) {
	const request = mailjet
		.post("contactslist")
		.request({
			"Name": name
		})
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			return callback(err);
		})
}

module.exports.deleteContactList = function (id, callback) {
	const request = mailjet
		.delete("contactslist")
		.id(id)
		.request()
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			return callback(err);
		})
}

module.exports.manageContactList = function (id, emails, callback) {
	const request = mailjet
		.post("contact")
		.action("managemanycontacts")
		.request({
			"ContactsLists": [{
				"ListID": id,
				"action": "addforce"
			}],
			"Contacts": emails
		})
	request
		.then((result) => {
			console.log(emails);
			callback(null, result.body)
		})
		.catch((err) => {
			return callback(err)
		})

}

module.exports.prepareCampaign = function (sender, email, subject, contact, title, callback) {
	const request = mailjet
		.post("campaigndraft")
		.request({
			"Locale": "en_US",
			"Sender": sender,
			"SenderEmail": email,
			"Subject": subject,
			"ContactsListID": contact,
			"Title": title
		})
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			return callback(err);
		})
}

module.exports.addBody = function (id, callback) {
	const request = mailjet
		.post("campaigndraft")
		.id(id)
		.action("detailcontent")
		.request({
			"Html-part": "Hello <strong>[[data:url:\"\"]]</strong>!",
			"Text-part": "Hello world!"
		})
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			return callback(err);
		})
}

module.exports.sendCampaign = function (id, callback) {
	const request = mailjet
		.post("campaigndraft")
		.id(id)
		.action("send")
		.request()
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			return callback(err);
		})
}

module.exports.draftStatus = function (id, callback) {
	const request = mailjet
		.get("campaigndraft")
		.id(id)
		.request()
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			return callback(err);
		})
}

module.exports.jobStatus = function (jobId, callback) {
	const request = mailjet
		.get("contact")
		.action('managemanycontacts')
		.id(jobId)
		.request()
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			console.log(err);
			return callback(err);
		})
}

// module.exports.campaignStats = function(id){
// 	const request = mailjet
// 	.get("contactstatistics")
// 	.id(email)
// 	.request()
// 	request
// .then((result) => {
// 	callback(null, result.body);
// })
// .catch((err) => {
// 	return callback(err);
// })	
// }

module.exports.contactStats = function (email, callback) {
	const request = mailjet
		.get("contactstatistics")
		.id(email)
		.request()
	request
		.then((result) => {
			callback(null, result.body);
		})
		.catch((err) => {
			return callback(err);
		})
}