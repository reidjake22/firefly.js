const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

app.get('/jake', function (req, res){
    console.log(res)
    res.send('Deployed!');
});

app.post('/jake', function (req, res){
    res.send('posted!');
    // h
});