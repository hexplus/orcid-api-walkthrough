var express = require('express');
var port = process.env.EXPRESSPORT != undefined ? process.env.EXPRESSPORT: '8000'
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
  
app.listen(port, function (){
    console.log('server started on ' + port);
});
