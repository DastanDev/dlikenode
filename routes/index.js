const express = require('express');
const cors = require('cors');
const path = require('path')
const bodyParser = require('body-parser')
const CryptoJS = require("crypto-js");
const cookieParser = require('cookie-parser');

const router = express.Router();

//router.use(express.static(__dirname + '/public'))
router.use(cookieParser());


router.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

router.get('/welcome|welcome.html', function(req, res) {let token = req.cookies.token;
    if (!token) {res.sendFile(path.join(__dirname, '../public', 'welcome.html'))}else {res.redirect('/');}
})

router.get('/post', function (req, res){
	res.sendFile(path.join(__dirname, '../public', 'post.html'))
})

router.get('/share|share.html', function (req, res){let token = req.cookies.token;
    if (!token) {res.redirect('/login');} else {res.sendFile(path.join(__dirname, '../public', 'share.html'))}
})


module.exports = router;