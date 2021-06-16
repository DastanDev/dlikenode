const express = require('express');
const cors = require('cors');
const path = require('path')
const breej = require('breej')
const CryptoJS = require("crypto-js");
const cookieParser = require('cookie-parser');
const axios = require('axios')
const moment = require('moment');
const router = express.Router();

var Meta = require('html-metadata-parser');
var getSlug = require('speakingurl');
var randomstring = require("randomstring");

router.use(cookieParser());
breej.init({
    api: 'https://api.dlike.network',
    bwGrowth: 3600000,
    vpGrowth: 6000000
})
var msgkey = process.env.msgKey;
var iv = "123456789"

router.get('',  async(req, res) => {let postsAPI = await axios.get(`https://api.dlike.network/new/`);let nTags = await fetchTags();res.render('index', { articles : postsAPI.data, moment: moment, trendingTags: nTags }) })
router.get('/profile/:name', async(req, res) => {let name = req.params.name;let userAPI = await axios.get(`https://api.dlike.network/account/${name}`);let act = userAPI.data;let vp=breej.votingPower(act);let bw=breej.bandwidth(act);let blogAPI = await axios.get(`https://api.dlike.network/blog/${name}`);let likesAPI = await axios.get(`https://api.dlike.network/votes/${name}`);if(req.cookies.dlike_username){loguser=req.cookies.dlike_username}else{loguser=""};res.render('profile', { user : userAPI.data, articles: blogAPI.data, likes: likesAPI.data, moment: moment, bw: bw, vp: vp, loguser: loguser, profName: name }) })
router.get('/trending',  async(req, res) => {let timeNow = new Date().getTime();let postsTime = timeNow - 86400000;let postsAPI = await axios.get(`https://api.dlike.network/trending?after=${postsTime}`);let nTags = await fetchTags();res.render('trending', { articles : postsAPI.data, moment: moment,trendingTags: nTags }) })
router.get('/tags/:tag',  async(req, res) => {let tag = req.params.tag; let postsAPI = await axios.get(`https://api.dlike.network/new?tag=${tag}`);let nTags = await fetchTags();res.render('tags', { articles: postsAPI.data, moment: moment,trendingTags: nTags }) })
router.get('/category/:catg',  async(req, res) => {let catg = req.params.catg; let postsAPI = await axios.get(`https://api.dlike.network/new?category=${catg}`);let nTags = await fetchTags();res.render('category', { articles: postsAPI.data, moment: moment,trendingTags: nTags }) })
router.get('/share', function (req, res){let token = req.cookies.token;if (!token) {res.redirect('/welcome');} else {res.render('share')}})
router.get('/witnesses', async(req, res, next) => {let witnessAPI = await axios.get(`https://api.dlike.network/rank/leaders`); let approved= [];if (req.cookies.dlike_username) {let loginUser = req.cookies.dlike_username;breej.getAccount(loginUser, (err, account) => {if (err) {next(new Error("Couldn't find user: " + err));return;}; let approved = account.approves; res.render('witnesses', { witnesses : witnessAPI.data, approved:approved}); next(); });} else {res.render('witnesses', { witnesses : witnessAPI.data,approved:approved});next();} })

router.get('/welcome', function(req, res) {let token = req.cookies.token;let user = req.cookies.dlike_username;
    if (!token) {res.render('welcome')}else {res.redirect('/profile/'+user);}
})


router.get('/post/:name/:link', async(req, res) => {
    let author = req.params.name
    let link = req.params.link
    try {
        const postAPI = await axios.get(`https://api.dlike.network/content/${author}/${link}`)
        let category = postAPI.data.json.category
        let simAPI = await axios.get(`https://api.dlike.network/new?category=${category}`);
        res.render('post', { article : postAPI.data, simPosts : simAPI.data, moment: moment })
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


router.post('/loginuser', function(req, res){
  var user = req.body;
  var key = user.pivkey
  var username = user.username
  var encrypted = CryptoJS.AES.encrypt(key, msgkey,{ iv: iv});
  var token = encrypted.toString();
  var decrypted = CryptoJS.AES.decrypt(token, msgkey,{ iv: iv});
  var wifKey = decrypted.toString(CryptoJS.enc.Utf8)
  if(key == wifKey){res.cookie('dlike_username', username);res.cookie('token', token);res.send({ error: false });
    //res.send({ message: 'Login success' });
  }else{res.send({ error: false  });}
});


router.post('/post', function(req, res){
  let post = req.body;
  var permlink = getSlug(post.title);
  let token = req.cookies.token;
  let author = req.cookies.dlike_username;
  //let link = randomstring.generate({ length: 11, capitalization: 'lowercase'});
  let content = {title:post.title, body: post.description, category: post.category,url: post.exturl, image: post.image, tags: post.tags }; 
  let newTx = {type: 4,data: {link: permlink,json: content}}
  let decrypted = CryptoJS.AES.decrypt(token, msgkey,{ iv: iv});
  let wifKey = decrypted.toString(CryptoJS.enc.Utf8)
  breej.getAccount(author, function(error, account) {
    if (breej.privToPub(wifKey) !== account.pub) {res.send( {error: true} )
    }else{newTx = breej.sign(wifKey, author, newTx)
      breej.sendTransaction(newTx, function(err, response) {//console.log(err,response)
        if (err === null){res.send({ error: false  });}else{res.send({ error: true, message: err['error'] });}
      })
    }
  })
});

router.post('/share', function(req, res){var post = req.body;var sharedUrl = post.url;Meta.parser(sharedUrl, function (err, result) {let meta=result['og'];res.send(meta);}) });
router.post('/logout', function(req, res){res.clearCookie('dlike_username');res.clearCookie('token');console.log('Logout');res.send({ error: false  });});

router.post('/upvote', function(req, res){let post = req.body;let token = req.cookies.token;let voter = req.cookies.dlike_username;
  let newTx = {type: 5,data: {link: post.postLink,author: post.author}}; 
  let decrypted = CryptoJS.AES.decrypt(token, msgkey,{ iv: iv});
  let wifKey = decrypted.toString(CryptoJS.enc.Utf8)
  let pubKey = breej.privToPub(wifKey);
  breej.getAccount(voter, function(error, account) {
    if (pubKey !== account.pub) {res.send( {error: true } )
    }else{newTx = breej.sign(wifKey, voter, newTx)
      breej.sendTransaction(newTx, function(err, response) {//console.log(err,response)
        if (err === null){res.send({ error: false  });}else{res.send({ error: true, message: err['error']  });}
      })
    }
  })
});

router.post('/witup', function(req, res){let post = req.body;let token = req.cookies.token;let voter=req.cookies.dlike_username;
    let newTx = {type: 1,data: {target: post.nodeName}};let decrypted = CryptoJS.AES.decrypt(token, msgkey,{ iv: iv});let wifKey = decrypted.toString(CryptoJS.enc.Utf8); let pubKey = breej.privToPub(wifKey);
    breej.getAccount(voter, function(error, account) {if (pubKey !== account.pub) {res.send( {error: true } )}else{newTx = breej.sign(wifKey, voter, newTx)
    breej.sendTransaction(newTx, function(err, response) {if (err === null){res.send({ error: false  });}else{res.send({ error: true, message: err['error']  }); } }) } })
});


router.post('/witunup', function(req, res){let post = req.body;let token = req.cookies.token;let voter=req.cookies.dlike_username;
    let newTx = {type: 2,data: {target: post.nodeName}};
    let decrypted = CryptoJS.AES.decrypt(token, msgkey,{ iv: iv});let wifKey = decrypted.toString(CryptoJS.enc.Utf8); let pubKey = breej.privToPub(wifKey);
    breej.getAccount(voter, function(error, account) {if (pubKey !== account.pub) {res.send( {error: true } )}else{newTx = breej.sign(wifKey, voter, newTx)
    breej.sendTransaction(newTx, function(err, response) { 
        if (err === null){res.send({ error: false  });}else{res.send({ error: true, message: err['error']  });}
    })
    }
  })
});


router.post('/follow', function(req, res){let post = req.body;let token = req.cookies.token;let loguser=req.cookies.dlike_username;
    let newTx = {type: 7,data: {target: post.followName}}; 
    let decrypted = CryptoJS.AES.decrypt(token, msgkey,{ iv: iv});let wifKey = decrypted.toString(CryptoJS.enc.Utf8); let pubKey = breej.privToPub(wifKey);
    breej.getAccount(loguser, function(error, account) {if (pubKey !== account.pub) {res.send( {error: true } )}else{newTx = breej.sign(wifKey, loguser, newTx)
    breej.sendTransaction(newTx, function(err, response) { 
        if (err === null){res.send({ error: false  });}else{res.send({ error: true, message: err['error']  });}
    })
    }
  })
});


router.post('/unfollow', function(req, res){let post = req.body;let token = req.cookies.token;let loguser=req.cookies.dlike_username;
    let newTx = {type: 8,data: {target: post.unfollowName}};
    let decrypted = CryptoJS.AES.decrypt(token, msgkey,{ iv: iv});let wifKey = decrypted.toString(CryptoJS.enc.Utf8); let pubKey = breej.privToPub(wifKey);
    breej.getAccount(loguser, function(error, account) {if (pubKey !== account.pub) {res.send( {error: true } )}else{newTx = breej.sign(wifKey, loguser, newTx)
    breej.sendTransaction(newTx, function(err, response) { 
        if (err === null){res.send({ error: false  });}else{res.send({ error: true, message: err['error']  });}
    })
    }
  })
});

router.post('/pupdate', function(req, res){let post = req.body;let token = req.cookies.token;let loguser=req.cookies.dlike_username;
    let content = {about:post.acc_about, website:post.acc_website, location: post.acc_location, cover_image: post.acc_cover_img,avatar: post.acc_img }; 
    let newTx = {type: 6,data: {json: {profile: content}}}; 
    let decrypted = CryptoJS.AES.decrypt(token, msgkey,{ iv: iv});let wifKey = decrypted.toString(CryptoJS.enc.Utf8); let pubKey = breej.privToPub(wifKey);
    breej.getAccount(loguser, function(error, account) {if (pubKey !== account.pub) {res.send( {error: true } )}else{newTx = breej.sign(wifKey, loguser, newTx)
    breej.sendTransaction(newTx, function(err, response) { 
        if (err === null){res.send({ error: false  });}else{res.send({ error: true, message: err['error']  });}
    })
    }
  })
});

router.post('/signup', function(req, res){let post = req.body; let newTx = {type: 0,data: {name: post.name,pub: post.pub,ref: post.ref}}; let priv = process.env.privKey; let signedTx = breej.sign(priv,'dlike',newTx)
    breej.sendTransaction(signedTx, (error,result) => { if (error === null){res.send({ error: false  });}else{res.send({ error: true, message: error['error']  });} })
});


const fetchTags = async () => {let timeNow = new Date().getTime();let postsTime = timeNow - 86400000;
    let tagsAPI = await axios.get(`https://api.dlike.network/trending?after=${postsTime}&limit=100`);let posts = tagsAPI.data;let tags = {};
    for (let p in posts) if (posts[p].json && posts[p].json.tags) {let postTags = posts[p].json.tags;
        for (let t in postTags) if (!tags[postTags[t]]){tags[postTags[t]] = 1}else{tags[postTags[t]] += 1} }
    let tagArr = [];
    for (let t in tags) tagArr.push({ m: t, v: tags[t]});tagsArr = tagArr.sort((a,b) => b.v - a.v);tagsArr = tagsArr.slice(0,4)
    let trendingTags = "";var i;for (i = 0; i < tagsArr.length; i++) {trendingTags +='<a class="nav-item nav-link" href="/tags/'+tagsArr[i].m+'">#' + tagsArr[i].m + '</a>';}
    return trendingTags
}


module.exports = router;