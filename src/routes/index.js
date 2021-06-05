const express = require('express');
const cors = require('cors');
const path = require('path')
const javalon = require('javalon')
const CryptoJS = require("crypto-js");
const cookieParser = require('cookie-parser');
const axios = require('axios')
const moment = require('moment');
const router = express.Router();

var Meta = require('html-metadata-parser');
var getSlug = require('speakingurl');
var randomstring = require("randomstring");

router.use(cookieParser());

javalon.init({api: 'https://api.dlike.network'})

var msgkey = process.env.msgKey;
var iv = "123456789"

router.get('',  async(req, res) => {let postsAPI = await axios.get(`https://api.dlike.network/new/`);res.render('index', { articles : postsAPI.data, moment: moment }) })

router.get('/post/:name/:link', async(req, res) => {
    let author = req.params.name
    let link = req.params.link
    try {
        const postAPI = await axios.get(`https://api.dlike.network/content/${author}/${link}`)
        res.render('post', { article : postAPI.data, moment: moment })
    } catch (err) {
        if(err.response) {
            res.render('post', { article : null })
            console.log(err.response.data)
            //console.log(err.response.status)
            //console.log(err.response.headers)
        } else if(err.requiest) {
            res.render('post', { article : null })
            console.log(err.requiest)
        } else {
            res.render('post', { article : null })
            console.error('Error', err.message)
        }
    } 
})

router.get('/profile/:name', async(req, res) => {
    let name = req.params.name
    //try {
        const userAPI = await axios.get(`https://api.dlike.network/account/${name}`)
        res.render('profile', { user : userAPI.data, moment: moment })
    //} catch (err) {

    //} 
})

router.get('/trending',  async(req, res) => {let postsAPI = await axios.get(`https://api.dlike.network/trending`);res.render('trending', { articles : postsAPI.data, moment: moment }) })

router.get('/tags/:tag',  async(req, res) => {let tag = req.params.tag; let postsAPI = await axios.get(`https://api.dlike.network/new?tag=${tag}`);res.render('tags', { articles: postsAPI.data, moment: moment }) })

router.get('/category/:catg',  async(req, res) => {let catg = req.params.catg; let postsAPI = await axios.get(`https://api.dlike.network/new?category=${catg}`);res.render('category', { articles: postsAPI.data, moment: moment }) })


router.get('/welcome', function(req, res) {let token = req.cookies.token;let user = req.cookies.dlike_username;
    if (!token) {res.render('welcome')}else {res.redirect('/profile/'+user);}
})

router.get('/share', function (req, res){let token = req.cookies.token;
    if (!token) {res.redirect('/welcome');} else {res.render('share')}
})


router.post('/loginuser', function(req, res){
  var user = req.body; console.log(user)
  var key = user.pivkey
  var username = user.username
  var encrypted = CryptoJS.AES.encrypt(key, msgkey,{ iv: iv});
  var token = encrypted.toString();
  var decrypted = CryptoJS.AES.decrypt(token, msgkey,{ iv: iv});
  var wifKey = decrypted.toString(CryptoJS.enc.Utf8)
  if(key == wifKey){console.log('equal');res.cookie('dlike_username', username);res.cookie('token', token);res.send({ error: false });
    //res.send({ message: 'Login success' });
  }else{res.send({ error: false  });}
});


router.post('/logout', function(req, res){
  res.clearCookie('dlike_username');
  res.clearCookie('token');
  console.log('Logout');
  res.send({ error: false  });
});


router.post('/post', function(req, res){
  let post = req.body;
  var permlink = getSlug(post.title);
  let token = req.cookies.token;
  let author = req.cookies.dlike_username;
  let link = randomstring.generate({ length: 11, capitalization: 'lowercase'});
  let content = {title:post.title, permlink:permlink, body: post.description, category: post.category,url: post.exturl, image: post.image, tags: post.tags }; 
  let newTx = {type: 4,data: {link: link,json: content}}
  console.log(newTx)
  let decrypted = CryptoJS.AES.decrypt(token, msgkey,{ iv: iv});
  let wifKey = decrypted.toString(CryptoJS.enc.Utf8)
  javalon.getAccount(author, function(error, account) {
    if (javalon.privToPub(wifKey) !== account.pub) {res.send( {error: true} )
    }else{
      newTx = javalon.sign(wifKey, author, newTx)
      console.log(newTx)
      javalon.sendTransaction(newTx, function(err, response) {
        //console.log(err,response)
        if (err === null){res.send({ error: false  });}else{res.send({ error: true, message: err['error'] });}
      })
    }
  })
});

router.post('/share', function(req, res){
  var post = req.body;var sharedUrl = post.url
  Meta.parser(sharedUrl, function (err, result) {let meta=result['og'];res.send(meta);})
});

router.post('/upvote', function(req, res){
  let post = req.body;
  let token = req.cookies.token;
  let voter = req.cookies.dlike_username;
  let newTx = {type: 5,data: {link: post.postLink,author: post.author}}
  let decrypted = CryptoJS.AES.decrypt(token, msgkey,{ iv: iv});
  let wifKey = decrypted.toString(CryptoJS.enc.Utf8)
  let pubKey = javalon.privToPub(wifKey);
  javalon.getAccount(voter, function(error, account) {
    if (pubKey !== account.pub) {res.send( {error: true } )
    }else{newTx = javalon.sign(wifKey, voter, newTx)
      javalon.sendTransaction(newTx, function(err, response) {
        //console.log(err,response)
        if (err === null){res.send({ error: false  });}else{res.send({ error: true, message: err['error']  });}
      })
    }
  })
});

router.post('/signup', function(req, res){
  let post = req.body;
  let newTx = {type: 0,data: {name: post.name,pub: post.pub,ref: post.ref}}
  let priv = process.env.privKey;
  let signedTx = javalon.sign(priv,'dlike',newTx)
  javalon.sendTransaction(signedTx, (error,result) => {
    //console.log(error,result)
    if (error === null){res.send({ error: false  });}else{res.send({ error: true, message: error['error']  });}
  })

});
module.exports = router;