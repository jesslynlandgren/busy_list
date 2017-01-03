var express = require('express');
var bluebird = require('bluebird');
var mongoose = require('mongoose');

var app = express();
app.use(express.static('public'));
app.use(express.static('node_modules'));

mongoose.Promise = bluebird;

mongoose.connect('mongodb://localhost/getbusy');

var Users = mongoose.model('User', {
    name: {type: String, required: true, minlength: 3, maxlength: 20},
    email: {type: String, required: true, minlength: 4, maxlength: 40, validate: /[\w\d_.]+@[a-z.]+/},
    password: {type: String, required: true},
    avatar: {type: String}
});

var Lists = mongoose.model('List', {
    author_id: {type: String, required: true},
    name: {type: String, required: true, minlength: 3, maxlength: 40, validate: /[^\t\n\r]+/},
    created: {type: Date},
    updated: {type: Date},
    style: {type: String},
    collaborators: {type: [String]}
});

var Items = mongoose.model('Item', {
    list_id: {type: String, required: true},
    parent_id: {type: String},
    done: {type: Boolean, required: true},
    created: {type: Date}
});

app.post('/signup', function(request, response){

});

// function auth(request, response, next){
//
// }
//
// app.use(auth);

app.listen(3000, function (){
    console.log('Listing on 3000');
});
