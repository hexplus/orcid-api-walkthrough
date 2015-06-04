var express = require('express');
var port = process.env.EXPRESSPORT != undefined ? process.env.EXPRESSPORT: '8000'


// Set the client credentials and the OAuth2 server
var credentials = {
  clientID: 'APP-LYNIW43A4OO9DH72',
  clientSecret: '43091822-851a-4b1e-8ee6-20d55ad06a40',
  site: 'https://sandbox.orcid.org',
  tokenPath:'https://api.sandbox.orcid.org/oauth/token'
};


// Initialize the OAuth2 Library
var oauth2 = require('simple-oauth2')(credentials);

// Authorization oauth2 URI
var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: 'http://localhost:8000/callback',
  scope: '/activities/update /authenticate',
  state: 'nope'
});


var app = express();
app.set('view engine', 'ejs');
app.use(require('connect-livereload')({port: 35729}));
app.use(express.static(__dirname + '/public'));

  
// index page 
app.get('/', function(req, res) {
  res.render('pages/index', {
    min: process.env.MINIMIZE == 'true' ? '.min':''
  });
});
  
  
// Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
app.get('/get-auth', function(req, res) {
  // Prepare the context
  res.redirect(authorization_uri);
});


// Get the access token object (the authorization code is given from the previous step).
app.get('/callback', function(req, res) {
  var token;
  var code = req.query.code;
  oauth2.authCode.getToken({
    code: code,
    redirect_uri: 'http://localhost:8000/callback'
  }, function(error, result){
    token = oauth2.accessToken.create(result);
    // TODO: save token here, to be read by show-work later
    res.redirect('http://localhost:8000/show-work');
  });
});


// TODO: make show-work page


app.listen(port, function (){
  console.log('server started on ' + port);
});
