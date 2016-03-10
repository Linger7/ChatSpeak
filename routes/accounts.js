var express = require('express');
var router = express.Router();

/* GET Account Login/Register */
router.get('/', function(req, res, next) {
    //Check if signed in here

    //If not signed in then send register/login view
    res.render('login', function(err, html) {
        res.send(router.generateResponseObject('<i class="fa fa-user"></i>  Sign In or Register', html));
    });
});

/* Display Account Registration Form */
router.get('/register', function(req, res, next){
    //Check if signed in here (add middleware)

    //If not signed in then proceed to register
    res.render('register', function(err, html){
        res.send(router.generateResponseObject('<i class="fa fa-user-plus"></i> Register', html));
    });
});

/* Register an account */
router.post('/register', function(req, res, next){
    var userName = req.body.inputUserName;
    var email = req.body.email;
    var password = req.body.password;
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    //Throw a 404 to someone who bypassed clientside validation
    if(userName === null || userName.length < 4 || userName.length > 25){
        res.send(404);
    } else if(email === null || email.length > 255 || email.length == 0 || !re.test(email)){
        res.send(404);
    } else if(password === null || password.length < 6 || password.length > 128){
        res.send(404);
    }

    console.log(req.body);
});

//Create JSON Object with the Modal Title and Body
router.generateResponseObject = function(title, content){
    var responseObject = {};
    responseObject.title = title;
    responseObject.body = content;

    return responseObject;
};

module.exports = router;
