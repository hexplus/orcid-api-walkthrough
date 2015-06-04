var express = require('express');
var https = require('https');

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
//app.use(require('connect-livereload')({port: 35729}));
app.use(express.static(__dirname + '/public'));

  
// index page 
app.get('/', function(req, res) {
  res.render('pages/index', {
    min: process.env.MINIMIZE == 'true' ? '.min':''
  });
});
  
  
// Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
app.get('/get-auth', function(req, res) {
	console.log("This is working")
  // Prepare the context
  res.redirect(authorization_uri);
});

//curl -H "Accept: application/orcid+xml" "http://pub.sandbox.orcid.org/v2.0_rc1/0000-0002-3373-1120/activities"
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
	console.log("Token is: " + JSON.stringify(token));	
	//res.redirect('http://localhost:8000/show-work');	
	
	var optionsgetmsg = {
			host : 'pub.sandbox.orcid.org', // here only the domain name    
			port : 443,
			path : '/v2.0_rc1/0000-0001-6442-2876/activities', // the rest of the url with parameters if needed
			method : 'GET', // do GET
			headers: {
				'Authorization': 'Bearer 782c0d26-68ca-4c4b-b484-105bf5871760',
				'Accept': 'application/vnd.orcid+xml'
			}
		};
	
	console.info('Options prepared:');
	console.info(optionsgetmsg);
	console.info('Do the GET call');
	
	var reqGet = https.request(optionsgetmsg, function(res) {
		console.log("statusCode: ", res.statusCode);
		// uncomment it for header details
		//  console.log("headers: ", res.headers);
 
		res.on('data', function(d) {
			console.info('GET result after POST:\n');
			process.stdout.write(d);
			console.info('\n\nCall completed');
		});		
	});
	
	reqGet.end();
	reqGet.on('error', function(e) {
		console.error(e);
	});
	
  });
});


// TODO: make show-work page


app.listen(port, function (){
  console.log('server started on ' + port);
});