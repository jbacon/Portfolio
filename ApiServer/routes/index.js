var express = require('express');
var commonAuth = require('../common/authUtil.js'); 
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

module.exports = router;