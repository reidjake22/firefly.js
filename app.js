const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const TOKEN = 'EAAUi56w09j8BAJjZBGcX7qjVJcNeYdIEatq3BGNGKxOL5InZBr340cezl9E1j3XgflHBNZC9HEuGrpZAipmZAxyC1HTUDMxOL2kEZBUlhsAAp8Lg4RtP5hACKg1iDdOZAK7o8ttcVZCB4GCtXIeXGV12iGHMpkFbDIUHApQ9PiA84QZDZD';
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

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
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});
  
function receivedMessage(event) {
  // Putting a stub for now, we'll expand it in the following steps
  console.log("Message data: ", event.message);
}