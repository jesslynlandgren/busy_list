var express = require('express');
var mongoose = require('mongoose');
var bluebird = require('bluebird');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');


var app = express();
app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(bodyParser.json());

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
    text: {type: String, required: true},
    parent_id: {type: String},
    done: {type: Boolean, required: true},
    created: {type: Date}
});

app.post('/submit_signup', function(request, response){
    var name = request.body.name;
    var email = request.body.email;
    var password = request.body.password;

    bcrypt.hash(password, 12)
    .then(function(hash) {
        Users.create({
            name: name,
            email: email,
            password: hash
        })
        .then(function(userData){
            console.log(userData);
            Lists.create({
                author_id: userData._id,
                name: 'Scratch Pad',
                created: new Date(),
                updated: new Date()
            })
            .then(function(scratchPadData){
                response.json({message:'successfully sign up', data: userData});
            });
        })
        .catch(function(err){
            console.log(err);
            response.status(400);
            response.json({message:'not signed up', error: err});
        });
    });
});

app.post('/submit_login', function(request, response){
    var email = request.body.email;
    var pwd_entered = request.body.password;

    Users.find({
        email: email
    })
    .then(function(users){
        var user = users[0];
        var pwd_hashed = user.password;
        return bcrypt.compare(pwd_entered, pwd_hashed)
        .then(function(allowed){
            if (allowed){
                response.json(user);
            } else {
                return false;
            }
        });
    })
    .catch(function(err){
        response.status(401);
        response.json({message:'invalid email or password', error: err});
    });
});

app.get('/:user_id/all_lists', function(request, response){
    Lists.find({
        author_id: request.params.user_id,
        name: {$ne: 'Scratch Pad'}
    })
    .then(function(lists){
        response.json({message:'retrieved user lists', lists: lists});
    })
    .catch(function(err){
        response.status(400);
        response.json({message:'error getting lists', error: err});
    });
});

app.post('/add_list', function(request, response){
    Lists.create({
        author_id: request.body.user_id,
        name: request.body.newListTitle,
        created: new Date(),
        updated: new Date()
    })
    .then(function(data){
        response.json({message:'list created', data: data});
    })
    .catch(function(err){
        response.status(400);
        response.json({message:'error creating list', error: err});
    });
});

app.get('/:user_id/scratch_pad', function(request, response){
    console.log(request.params.user_id);
    Lists.find({
        author_id: request.params.user_id,
        name: 'Scratch Pad'
    })
    .then(function(data){
        console.log(data);
        Items.find({
            list_id: data[0]._id
        })
        .then(function(items){
            console.log(items);
            response.json({message:'retrieved user lists', items: items});
        });
    })
    .catch(function(err){
        console.log('error');
        response.status(400);
        response.json({message:'error getting list items', error: err});
    });
});

app.post('/:user_id/scratch_pad/add', function(request, response){
    Lists.find({
        author_id: request.params.user_id,
        name: 'Scratch Pad'
    })
    .then(function(data){
        console.log(data);
        Items.create({
            list_id: data[0]._id,
            text: request.body.newItemText,
            done: false,
            created: new Date()
        })
        .then(function(items){
            console.log(items);
            response.json({message:'item added to scratch pad', items: items});
        });
    })
    .catch(function(err){
        console.log('error');
        response.status(400);
        response.json({message:'error adding item to scratch pad', error: err});
    });
});

app.get('/:user_id/:list_id', function(request, response){
    // console.log('USER', request.params.user_id);
    // console.log('LIST', request.params.list_id);
    Lists.find({
        _id: request.params.list_id,
    })
    .then(function(lists){
        Items.find({
            list_id: lists[0]._id
        })
        .then(function(items){
            response.json({message:'retrieved one list', items: items, lists: lists});
        });
    })
    .catch(function(err){
        console.log('error');
        response.status(400);
        response.json({message:'error getting the list', error: err});
    });
});


app.post('/:user_id/:list_id/add', function(request, response){
    console.log('USER', request.params.user_id);
    console.log('LIST', request.params.list_id);
    Lists.find({
        _id: request.params.list_id,
    })
    .then(function(lists){
        console.log(lists);
        Items.create({
            list_id: lists[0]._id,
            text: request.body.newItemText,
            done: false,
            created: new Date()
        })
        .then(function(items){
            console.log(items);
            response.json({message:'item added to the one list', items: items, lists: lists});
        });
    })
    .catch(function(err){
        console.log('error');
        response.status(400);
        response.json({message:'error adding item to the one list', error: err});
    });
});

app.post('/:item_id/mark', function(request, response){
    console.log('DONE?', request.params.done);
    Items.update({
        _id: request.params.item_id,
        done: !request.params.done
    })
    .then(function(items){
        response.json({message:'item deleted from the list'});
    })
    .catch(function(err){
        console.log('error');
        response.status(400);
        response.json({message:'error deleting item', error: err});
    });
});

app.post('/:item_id/delete', function(request, response){
    Items.remove({
        _id: request.params.item_id,
    })
    .then(function(items){
        response.json({message:'item deleted from the list'});
    })
    .catch(function(err){
        console.log('error');
        response.status(400);
        response.json({message:'error deleting item', error: err});
    });
});

app.listen(3000, function (){
    console.log('Listing on 3000');
});
