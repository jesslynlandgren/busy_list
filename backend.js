var express = require('express');
var bluebird = require('bluebird');
var mongoose = require('mongoose');

var app = express();
app.use(express.static('public'));

mongoose.Promise = bluebird;


app.listen(3000, function (){
    console.log('Listing on 3000');
});