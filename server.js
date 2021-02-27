var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
db = require('./db')();
var jwt = require('jsonwebtoken');
var cors = require('cors');
var authController = require('./auth');
var authJwtController = require('./auth_JWT')
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req){
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body",
        query: "No query"
    }

    if(req.body != null){
        json.body = req.body;
    }

    if(Object.keys(req.query).length !== 0){
        json.query = req.query;
    }

    if(req.headers != null){
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res){
    if(!req.body.username || !req.body.password){
        res.status(401).send({success: false, msg: 'Please include both username and password.'});
    }
    else{
        var newUser = {
            username: req .body.username,
            password: req.body.password
        };
        db.save(newUser); //no dupe checking
        res.json({success: true, msg: 'Successfully created new user'});
    }
    }
);

router.post('/signin', function(req, res){
    if(!req.body.username || !req.body.password){
        res.json({success: false, msg: 'Please include both username and password.'});
    }
    var user = db.findOne(req.body.username);
    if(!user){
        res.status(401).send({success:false, msg:'Authentication failed, no user with given username exists.'});
    }
    else{
        if(req.body.password === user.password){
            var userToken = {id: user.id, username: user.username};
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json({success: true, token: 'JWT ' + token});
        }
        else{
            res.status(401).send({success: false, msg:'Authentication failed, incorrect password.'});
        }
    }
}
)

router.route('/movies')
    .post(function(req, res){
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req);
        o.msg = "movie saved";
        res.json(o);
    })
    .get(function(req, res){
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req);
        o.msg = "GET movies";
        res.json(o);
    })
    .put(authJwtController.isAuthenticated, function(req, res) {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req);
        o.msg = "movie updated";
        res.json(o);
    })
    .delete(authController.isAuthenticated, function(req, res){
        res = res.status(200);
        if(req.get('Content-Type')){
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req);
        o.msg = "movie deleted";
        res.json(o);
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; //for testing only