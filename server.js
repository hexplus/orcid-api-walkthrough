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
app.use(require('connect-livereload')({port: 35729}));
app.use(express.static(__dirname + '/public'));

  
// index page 
app.get('/', function(req, res) {
  res.render('pages/index', {
    min: process.env.MINIMIZE == 'true' ? '.min':''
  });
});
  
//Local variables  
var my_token = '';
var get_record_msg = {
			host : 'pub.sandbox.orcid.org', 
			port : 443,
			path : '/v1.2/[orcid]/orcid-profile', 
			method : 'GET', // do GET
			headers: {				
				'Accept': 'application/vnd.orcid+xml'
			} // We will need to add the authorization header here, like this: 'Authorization': 'Bearer [bearer]',
		};
  
// Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
app.get('/get-auth', function(req, res) {
	console.log('This is working')
	// Prepare the context
	res.redirect(authorization_uri);
});

//curl -H 'Accept: application/orcid+xml' 'http://pub.sandbox.orcid.org/v2.0_rc1/0000-0002-3373-1120/activities'
// Get the access token object (the authorization code is given from the previous step).
app.get('/callback', function(req, res) {
  var token;
  var code = req.query.code;
  oauth2.authCode.getToken({
    code: code,
    redirect_uri: 'http://localhost:8000/callback'
  }, function(error, result){
    my_token = oauth2.accessToken.create(result);
    // TODO: save token here, to be read by show-work later
	console.log('my_token saved');	
	res.redirect('http://localhost:8000/show-token');		
  });
});


// TODO: make show-work page
app.get('/show-token', function(req, res) {
	console.log('Token is: ' + JSON.stringify(my_token));	
	//res.redirect('http://localhost:8000/get-record');
	res.render('pages/token', {
        'token': my_token.token.access_token
      })
});

app.get('/get-record', function(req, res){
	//Add bearer header
	get_record_msg.headers['Authorization'] = 'Bearer ' + my_token.token.access_token;
	//Replace the orcid placeholder in the path
	get_record_msg.path = get_record_msg.path.replace('[orcid]', my_token.token.orcid);
	console.log('Request will be:' + JSON.stringify(get_record_msg))
	
	var record_data = '';
	
	var req_get_record = https.request(get_record_msg, function(res) {
		console.log("statusCode: ", res.statusCode);		
		res.on('data', function(d) {
			record_data += d;			
		});
		res.on('error', function(e){
			console.error(e);
		});
		res.on('end', function(res){
			res.render('pages/record', {
				'record': record_data
			})
		}); 
	});
	
	req_get_record.end();		
});



app.listen(port, function (){
  console.log('server started on ' + port);
});
