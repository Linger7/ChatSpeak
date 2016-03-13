var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var isAuthed = false;
  if(req.session && req.session.auth){
    isAuthed = true;
  }

  res.render('index', { title: 'ChatSpeak', isAuthed: isAuthed });
});

module.exports = router;
