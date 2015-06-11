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
	} // We will need to add the authorization header here, like this: 'Authorization': 'Bearer [bearer]',
};

var edit_work_msg = {
	host : 'api.sandbox.orcid.org', 
	port : 443,
	path : '/v2.0_rc1/[orcid]/work/[work_id]', 
	method : 'PUT',
	headers: {				
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	} // We will need to add the authorization header here, like this: 'Authorization': 'Bearer [bearer]',
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
		
	var record_data = '';	
	var req_post_work = https.request(post_work_msg, function(resp) {		
		resp.on('data', function(d) {
			record_data += d;			
		});
		resp.on('error', function(e){
			console.error(e);
		});
		resp.on('end', function(){			
			var new_work_id = (resp.headers.location).substring((resp.headers.location).lastIndexOf('/') + 1);			
			res.render('pages/add_work', { 
				'orcid': my_token.token.orcid,
				'success_message': 'Your work has been added!',
				'work_id': new_work_id
			})
		}); 
	});
	req_post_work.write(work_string);
	req_post_work.end();				
});

app.get('/edit-work', function(req, res){
	var work_id = req.query.work_id;	
	var updated = req.query.updated;
	get_work_msg.path = get_work_msg.path.replace('[orcid]', my_token.token.orcid);
	get_work_msg.path = get_work_msg.path.replace('[work_id]', work_id);
	get_work_msg.headers['Authorization'] = 'Bearer ' + my_token.token.access_token;
	var work_data = '';
	
	var req_get_work = https.request(get_work_msg, function(resp) {			
		resp.on('data', function(d) {
			work_data += d;			
		});
		resp.on('error', function(e){
			console.error(e);
		});
		resp.on('end', function(){
			var work_obj = JSON.parse(work_data);
			res.render('pages/edit_work', {				
				'work_data': work_data,
				'work_id': work_obj['put-code'],
				'title': work_obj.title.title.value,
				'type': work_obj.type,
				'visibility': work_obj.visibility,
				'updated': updated
			})
		}); 
	});
	
	req_get_work.end();			
});

app.post('/edit-work-action', function(req, res){
	var work_id = req.body.work_id;
	var work_title = req.body.title;
	var work_type = req.body.type;
	
	var edit_work = {
		'put-code': work_id,
		title : { title : work_title},
		type : work_type
	}
		
	var work_string = JSON.stringify(edit_work);
	var content_length = work_string.length
	
	console.log('content lenght: ' + content_length)
	
	//Add bearer header
	edit_work_msg.headers['Authorization'] = 'Bearer ' + my_token.token.access_token;
	//Add content length
	edit_work_msg.headers['Content-Length'] = content_length;
	//Replace the orcid place holder in the path
	edit_work_msg.path = edit_work_msg.path.replace('[orcid]', my_token.token.orcid);	
	//Replace the work_id place holder in the path
	edit_work_msg.path = edit_work_msg.path.replace('[work_id]', work_id);	
	
	console.log(JSON.stringify(edit_work_msg))
	
	var work_data = '';	
	var req_put_work = https.request(edit_work_msg, function(resp) {		
		resp.on('data', function(d) {
			work_data += d;			
		});
		resp.on('error', function(e){
			console.error(e);
		});
		resp.on('end', function(){			
			var work_obj = JSON.parse(work_data);
			console.log('Updted work obj:');
			console.log(JSON.stringify(work_obj));
			res.redirect('http://localhost:8000/edit-work?work_id=' + work_id + '&updated=true');
		}); 
	});
	req_put_work.write(work_string);
	req_put_work.end();
	
});













app.listen(port, function (){
  console.log('server started on ' + port);
});
