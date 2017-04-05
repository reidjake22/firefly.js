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
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});

app.post("/webhook", function (req, res) {
  console.log(req.body);
  // Make sure this is a page subscription
  if (req.body.object == "page") {
    // Iterate over each entry
    // There may be multiple entries if batched
    req.body.entry.forEach(function(entry) {
      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.postback) {
          console.log(event);
          processPostback(event);
        }
      });
    });

    res.sendStatus(200);
  }
});

