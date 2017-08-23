var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('chat', { title: 'Chat' });
  res.sendfile('./views/angularjs01.html');
});

module.exports = router;