const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const TOKEN = 'EAAUi56w09j8BAJjZBGcX7qjVJcNeYdIEatq3BGNGKxOL5InZBr340cezl9E1j3XgflHBNZC9HEuGrpZAipmZAxyC1HTUDMxOL2kEZBUlhsAAp8Lg4RtP5hACKg1iDdOZAK7o8ttcVZCB4GCtXIeXGV12iGHMpkFbDIUHApQ9PiA84QZDZD';
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

app.get('/facebook', function (req, res){
    res.send('Deployed!');
});

app.post('/facebook', function (req, res){
    res.send('posted!');
    // h
});