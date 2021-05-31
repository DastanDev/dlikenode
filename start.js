const app = require('./index');
const cors = require('cors');
const path = require('path')
const bodyParser = require('body-parser')
const CryptoJS = require("crypto-js");
const cookieParser = require('cookie-parser');
const javalon = require('javalon')
var Meta = require('html-metadata-parser');
var getSlug = require('speakingurl');
var randomstring = require("randomstring");

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors());
app.use(cookieParser());

javalon.init({api: 'https://api.dlike.network'})

var msgkey = process.env.msgKey;
var iv = "123456789"


app.post('/loginuser', function(req, res){
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


app.post('/logout', function(req, res){
  res.clearCookie('dlike_username');
  res.clearCookie('token');
  console.log('Logout');
  res.send({ error: false  });
});


app.post('/post', function(req, res){
  let post = req.body;
  var permlink = getSlug(title);
  let token = req.cookies.token;
  let author = req.cookies.dlike_username;
  let link = randomstring.generate(10);
  let content = {title:post.title, permlink:permlink, body: post.description, url: post.exturl, image: post.image, tags: post.tags }; 
  let newTx = {type: 4,data: {link: link,json: content}}
  let decrypted = CryptoJS.AES.decrypt(token, msgkey,{ iv: iv});
  let wifKey = decrypted.toString(CryptoJS.enc.Utf8)
  javalon.getAccount(author, function(error, account) {
    if (javalon.privToPub(wifKey) !== account.pub) {res.send( {error: true} )
    }else{
      newTx = javalon.sign(wifKey, author, newTx)
      javalon.sendTransaction(newTx, function(err, response) {
        console.log(err,response)
        if (err === null){res.send({ error: false  });}else{res.send({ error: true  });}
      })
    }
  })
});


app.post('/share', function(req, res){
  var post = req.body;
  console.log(post)
  var sharedUrl = post.url
  Meta.parser(sharedUrl, function (err, result) {let meta=result['og'];res.send(meta);})
});


app.post('/upvote', function(req, res){
  let post = req.body;console.log(post)
  let token = req.cookies.token;
  let voter = req.cookies.dlike_username;console.log(voter)

  let newTx = {type: 5,data: {link: post.postLink,author: post.author}}
  let decrypted = CryptoJS.AES.decrypt(token, msgkey,{ iv: iv});
  let wifKey = decrypted.toString(CryptoJS.enc.Utf8)
  let pubKey = javalon.privToPub(wifKey);
  javalon.getAccount(voter, function(error, account) {
    if (pubKey !== account.pub) {res.send( {error: true } )
    }else{newTx = javalon.sign(wifKey, voter, newTx)
      javalon.sendTransaction(newTx, function(err, response) {
        console.log(err,response)
        if (err === null){res.send({ error: false  });}else{res.send({ error: true, message: err['error']  });}
      })
    }
  })
});


const server = app.listen(5000, () => {
  console.log(`Express is running on port ${server.address().port}`);
});