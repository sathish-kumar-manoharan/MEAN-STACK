var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('mongodb://admin:admin123@ds121686.mlab.com:21686/person', ['person']);
var ObjectId = mongojs.ObjectId;

const server = new express();

// Body Parse Middleware
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false}));

// Set static path
server.use(express.static(path.join(__dirname, 'public')));

// Express Validator Middleware
server.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;
        while(namespace.length){
            formParam += '[' +namespace.shift() +']';
        }
        return {
            param: formParam,
            msg  : msg,
            value: value
        };
    }

}));

// Gloab variable setup 
server.use(function(req, res, next){
    res.locals.errors = [];
    next();
});


// Set views
server.set('view engine', 'ejs');
server.set('views',path.join(__dirname,'views'));



server.get('/',(req, res)=>{
    // res.send(" This is my first testing page...");
    // res.json(people);
    db.person.find(function(err, persons){
        if(err){
            res.send(err);
        }
        res.render('index',{
            title:' MEAN stack development',
            people: persons
        });

    });

});


server.post('/people/add',(req, res)=>{
    req.checkBody('name','Name is required...').notEmpty();
    req.checkBody('age','age is required...').notEmpty();
    
    var errors = req.validationErrors();
    if(errors){
        console.log('Errors found...');
        db.person.find(function(err, persons){
            if(err){
                res.send(err);
            }
            res.render('index',{
                title:' MEAN stack development',
                people: persons
            });

        });
    }else{

        var newPerson = {
            name : req.body.name,
            age       : req.body.age,
            sex       : req.body.sex,
            DOB       : req.body.DOB
        }

        db.person.insert(newPerson, function(err, result){
            if(err){
                console.log('err');
            }
            res.redirect('/');

        });

        db.person.find(function(err, persons){
            if(err){
                res.send(err);
            }
            res.render('index',{
                title:' MEAN stack development',
                people: persons
            });

        });
    }

});

server.delete('/person/delete/:id', function(req, res){
    db.person.remove({_id: ObjectId(req.params.id)}, function(err, result){
        if(err){
            console.log(err);
        }
        res.redirect('/');
    })

});


server.listen("3000",() =>{
    console.log('Server is listening in port number: 3000');
})