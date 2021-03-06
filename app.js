const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const AUTH = {}; // Contains temp credentials
const requestCookies = require('request-cookies');
const app = express();
const LOGIN_URL = 'https://firefly.etoncollege.org.uk/login/login.aspx?prelogin=https%3a%2f%2ffirefly.etoncollege.org.uk%2fset-tasks'
const TASKS_URL = 'https://firefly.etoncollege.org.uk/set-tasks';
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));
console.info("Server started");
app.get("/facebook", function (req, res) {
  if (req.query["hub.verify_token"] === "this_is_my_token") {
    console.info("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});

app.post('/facebook', function (req, res) {
  var data = req.body;
  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function (entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;      // Iterate over each messaging event
      entry.messaging.forEach(function (event) {
        const ed = getEventMetadata(event);
        if (pageID != ed.senderID) {
          if (event.message) {
            // const reply = getMessage(event.message.text);
            // console.log(reply);  
            receivedMessage(event);
          }
          else if (event.postback && event.postback.payload) {
            sendTextMessage(ed.senderID, 'To receive your Firefly tasks enter your username in format username: joeblogs');
          } else {
            console.log("Webhook received unknown event");
          }
        }
      })
    })
  }
  res.sendStatus(200);
});

function getEventMetadata(event) {
  return {
    senderID: event.sender.id,
    recipientID: event.recipient.id,
    timeOfMessage: event.timestamp,
    message: event.message
  }
}

function receivedMessage(event) {
  //num1jg
  var eventData = getEventMetadata(event);
  const message = getMessage(eventData.message.text, eventData.senderID);
  sendTextMessage(eventData.senderID, message)
  if (message === 'Logging you in...') {
    //sendTextMessage(eventData.recipientID, "logging you in!")
    loginFirefly(eventData);

  }
}

function getMessage(msg, recipientID) {
  //check for username
  if (msg.toLowerCase().includes('username:')) {
    if (AUTH[recipientID] && AUTH[recipientID].Password) {
      AUTH[recipientID].Username = msg.substr(9, msg.length).trim()
      return 'Logging you in...';
    } else if (AUTH[recipientID]) {
      AUTH[recipientID].Username = msg.substr(9, msg.length).trim()
      return 'Now input password (e.g. password: your_password)';
    } else {
      AUTH[recipientID] = { Username: msg.substr(9, msg.length).trim() }
      return a
    }
  }

  //check for password
  if (msg.toLowerCase().includes('password:')) {
    if (AUTH[recipientID] && AUTH[recipientID].Username) {
      AUTH[recipientID].Password = msg.substr(9, msg.length).trim()
      return 'Logging you in...';
    } else if (AUTH[recipientID]) {
      AUTH[recipientID].Password = msg.substr(9, msg.length).trim()
      return 'Now provide a username in the format \n username: my_username';
    } else {
      AUTH[recipientID] = { Password: msg.substr(9, msg.length).trim() }
      return 'Now provide a username in the format \n username: my_username';
    }
  }

  //num2
  switch (msg.toLowerCase()) {
    case 'jake':
      return 'Thaaat\'s me!';
    case 'hi':
      return 'hiya!';
    case 'help':
      return 'Welcome to the firefly chatbot: to retrieve your firefly tasks enter username as "username:<username>" then follow your instructions'
    default:
      return 'Not sure what you\'re saying'
  }
}

function loginFirefly(eventData) {
  var myjar = request.jar();
  request({
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    uri: LOGIN_URL,
    jar: myjar,
    followAllRedirects: true,
    method: 'POST',
    form: AUTH[eventData.senderID]
  }, function (error, response, body) {
    console.log("working boss!")
    if (!error && response.statusCode == 200) {
      getTasks(body, eventData)
      // AUTH[eventData.senderID] = {}
    } else {
      sendTextMessage(eventData.senderID, "Unable to login.");
      // AUTH[eventData.senderID] = {}
      console.error(response.statusCode);
    }
    var myjar = request.jar();
  });
}

function getTasks(body, eventData) {
  var $ = cheerio.load(body);
  $('a').each(function () {
    if (this.attribs && this.attribs.href) {
      const link = this.attribs.href;
      const check = link.match(/set\-tasks\/\d{6}/gm);
      if (check) {
        sendTextMessage(eventData.senderID, this.children[0].data + "\n https://firefly.etoncollege.org.uk/" + this.attribs.href)
      }
    }
  });
}


function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  console.log(messageData)
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log('Successfully sent  a message');
    } else {
      console.error("Unable to send message.");
      //console.error(response);
      console.error(error, response.statusCode);
    }
  });
}
