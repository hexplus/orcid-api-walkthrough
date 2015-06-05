var express = require('express');
var https = require('https');
var bodyParser = require('body-parser')

var port = process.env.EXPRESSPORT != undefined ? process.env.EXPRESSPORT: '8000'

var app = express();
app.set('view engine', 'ejs');
app.use(require('connect-livereload')({port: 35729}));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))
  
// Set the client credentials and the OAuth2 server
var credentials = {
  clientID: '',
  clientSecret: '',
  site: 'https://sandbox.orcid.org',
  tokenPath:'https://api.sandbox.orcid.org/oauth/token'
};

// Initialize the OAuth2 Library
var oauth2 = require('simple-oauth2')(credentials);  
  
//Local variables  
var access_code = '';
var my_token = '';
var new_work_id = '';

var get_record_msg = {
	host : 'api.sandbox.orcid.org', 
	port : 443,
	path : '/v1.2/[orcid]/orcid-profile', 
	method : 'GET',
	headers: {				
		'Accept': 'application/vnd.orcid+xml'
	} // We will need to add the authorization header here, like this: 'Authorization': 'Bearer [bearer]',
};  

var post_work_msg = {
	host : 'api.sandbox.orcid.org', 
	port : 443,
	path : '/v2.0_rc1/[orcid]/work', 
	method : 'POST',
	headers: {				
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	} // We will need to add the authorization header here, like this: 'Authorization': 'Bearer [bearer]',
};		

var get_work_msg = {
	host : 'api.sandbox.orcid.org', 
	port : 443,
	path : '/v2.0_rc1/[orcid]/work/[work_id]', 
	method : 'GET',
	headers: {				
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	}
};

var edit_work_msg = {
	host : 'api.sandbox.orcid.org', 
	port : 443,
	path : '/v2.0_rc1/[orcid]/work/[work_id]', 
	method : 'PUT',
	headers: {				
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	}
};
  
// index page 
app.get('/', function(req, res) {
  res.render('pages/index', {
    min: process.env.MINIMIZE == 'true' ? '.min':''
  });
});
  
app.get('/introduction', function(req, res) {
	res.render('pages/introduction');
});
  
app.get('/accessing-api', function(req, res) {
	res.render('pages/accessing_api');
});  

app.get('/using-api', function(req, res) {
	res.render('pages/using_api');
});    

app.get('/get-authorization-code', function(req, res) {
	res.render('pages/get_authorization_code');
});

app.post('/get-authorization-code-action', function(req, res) {
	credentials.clientID = req.body.client_id;
	credentials.clientSecret = req.body.secret;
	
	var authorization_uri = oauth2.authCode.authorizeURL({
		redirect_uri: 'http://localhost:8000/callback',
		scope: '/activities/update /activities/read-limited /orcid-profile/read-limited',
		state: 'nope'
	});  
	
	res.redirect(authorization_uri);
});  

// Get the access token object (the authorization code is given from the previous step).
app.get('/callback', function(req, res) {
	access_code = req.query.code;
	res.render('pages/show_authorization_code', {
		'access_code' : access_code
	});
});

app.get('/get-access-token', function(req, res) {
	console.log('access code: ' + access_code);
	oauth2.authCode.getToken({
		code: access_code,
		redirect_uri: 'http://localhost:8000/callback'
	}, function(error, result){
		my_token = oauth2.accessToken.create(result);
		res.redirect('http://localhost:8000/show-token');		
	});
});

app.get('/show-token', function(req, res) {
	res.render('pages/token', {
        'access_token': my_token.token.access_token,
		'token_type': my_token.token.token_type,
		'expires_in': my_token.token.expires_in,
		'scope': my_token.token.scope,
		'orcid': my_token.token.orcid,
		'name': my_token.token.name,
		'expires_at': my_token.token.expires_at
      })
});

app.get('/get-record', function(req, res){
	//Add bearer header
	get_record_msg.headers['Authorization'] = 'Bearer ' + my_token.token.access_token;
	//Replace the orcid placeholder in the path
	get_record_msg.path = get_record_msg.path.replace('[orcid]', my_token.token.orcid);
	console.log('Request will be:' + JSON.stringify(get_record_msg))
	
	var record_data = '';
	
	var req_get_record = https.request(get_record_msg, function(resp) {			
		resp.on('data', function(d) {
			record_data += d;			
		});
		resp.on('error', function(e){
			console.error(e);
		});
		resp.on('end', function(){
			res.render('pages/record', {
				'record': record_data,
				'orcid': my_token.token.orcid
			})
		}); 
	});
	
	req_get_record.end();		
});

app.get('/add-work', function(req, res){	
	res.render('pages/add_work', {
        'orcid': my_token.token.orcid,
		'success_message': ''		
      })
});

app.post('/add-work-action', function(req, res){
	var new_work = {
		title : { title : req.body.title},
		type : req.body.type
	}
		
	var work_string = JSON.stringify(new_work);
	var content_length = work_string.length
	
	//Add bearer header
	post_work_msg.headers['Authorization'] = 'Bearer ' + my_token.token.access_token;
	//Add content length
	post_work_msg.headers['Content-Length'] = content_length;
	//Replace the orcid placeholder in the path
	post_work_msg.path = post_work_msg.path.replace('[orcid]', my_token.token.orcid);	
	console.log('Request will be:' + JSON.stringify(post_work_msg))
	
	var record_data = '';
	var variable1 = 'This test';
	var req_post_work = https.request(post_work_msg, function(resp) {
		console.log('statusCode: ', res.statusCode);		
		resp.on('data', function(d) {
			record_data += d;			
		});
		resp.on('error', function(e){
			console.error(e);
		});
		resp.on('end', function(){
			new_work_id = (resp.headers.location).lastIndexOf('/') + 1;
			res.render('pages/add_work', {
				'orcid': my_token.token.orcid,
				'success_message': 'Your work has been added!'
			})
		}); 
	});
	req_post_work.write(work_string);
	req_post_work.end();				
});

app.get('/edit-work', function(req, res){
	get_work_msg.path = get_work_msg.path.replace('[orcid]', my_token.token.orcid);
	get_work_msg.path = get_work_msg.path.replace('[work_id]', new_work_id);
	console.log('Request will be:' + JSON.stringify(get_work_msg))
	console.log('Getting work info');
	var work_data = '';
	
	var req_get_work = https.request(get_work_msg, function(resp) {			
		resp.on('data', function(d) {
			console.log('More data');
			work_data += d;			
		});
		resp.on('error', function(e){
			console.error(e);
		});
		resp.on('end', function(){
			res.render('pages/edit_work', {				
				'work_data': work_data
			})
		}); 
	});
	
	req_get_work.end();			
});






app.post('/edit-work-action', function(req, res){
});













app.listen(port, function (){
  console.log('server started on ' + port);
});
