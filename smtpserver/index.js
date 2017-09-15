const dotenv = require('dotenv').config({
    path: '../development.env'
});
const {
    SMTPServer
} = require('smtp-server');
const fs = require('fs');
const randomstring = require('randomstring');
const {
    simpleParser
} = require('mailparser');
const request = require('request');
const async = require('async');

const server = new SMTPServer({
    logger: true,
    banner: "How may I serve you?",
    onAuth(auth, session, callback) {
        if (auth.username !== process.env.USERNAME || auth.password !== process.env.PASSWORD) {
            return callback(new Error('Invalid username or password'));
        }
        callback(null, {
            user: 123
        }); // where 123 is the user id or similar property
    },
    onConnect(session, callback) {
        console.log("Connected");
        callback(null, "connection established");
    },
    onData(stream, session, callback) {
        var random = randomstring.generate(5);
        stream.pipe(fs.createWriteStream(__dirname + '/data/eml/' + random + '.eml'));
        stream.on('end', () => {
            let input = fs.createReadStream(__dirname + '/data/eml/' + random + '.eml');

            simpleParser(input).then(mail => {

                var seed = {};
                seed["From"] = {
                    "email": mail.from.value[0].address,
                    "name": mail.from.value[0].name
                };
                seed["To"] = {
                    "email": mail.to.value[0].address,
                    "name": mail.to.value[0].name
                };
                seed["Subject"] = mail.subject;
                seed["retailerId"] = "4";

                var content = JSON.stringify(seed);

                async.parallel([(callback) => {
                    fs.writeFile(__dirname + '/data/json/' + random + '.json', content, 'utf8', (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log("json file was saved");
                        callback(null, "json file was saved");
                    })
                }, (callback) => {
                    fs.writeFile(__dirname + '/data/html/' + random + '.html', mail.html, 'utf8', (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log("html file was saved");
                        callback(null, "html file was saved");
                    })
                }, (callback) => {
                    fs.writeFile(__dirname + '/data/text/' + random + '.txt', mail.text, 'utf8', (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log("text file was saved");
                        callback(null, "text file was saved");
                    })
                }], (err) => {
                    var formdata = {
                        seed: fs.createReadStream(__dirname + '/data/json/' + random + '.json'),
                        html: fs.createReadStream(__dirname + '/data/html/' + random + '.html'),
                        text: fs.createReadStream(__dirname + '/data/text/' + random + '.txt')
                    }

                    request.post({
                        url: process.env.URL,
                        formData: formdata
                    }, (err, response, body) => {
                        if (err) {
                            return console.log('upload err:', err);
                        }
                        console.log('Upload successful!:', body);
                        callback(null, body);
                    })
                })
            })
        });
    },
    onClose(session) {
        console.log("connection closed");
    }
});

server.listen(process.env.SMTP_PORT);
console.log("Listening on " + process.env.SMTP_PORT);