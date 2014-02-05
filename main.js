require('colors');

var express = require('express'),
  api = require('./routes/api');

var app = express();

app.configure(function(){
  this.use(express.errorHandler({dumpException: true, showStack: true}));
});

app.configure(function(){
  this.use(express.bodyParser({uploadDir: __dirname + '/tmp'}));
  this.use('/' + (process.env.NODURL_ADMINTAG || 'olympus'), express.static(__dirname + '/public'));
  this.use(app.router);
});


var auth = express.basicAuth(function(user, pass, callback) {
  var result = (user === process.env.NODURL_USER && pass === process.env.NODURL_PASSWORD);
  callback(null, result);
});


app.get('/', function(req, res) {
  res.redirect(process.env.NODURL_HOME);
});

app.get('/urls', auth, api.urls);

app.get('/:urly', api.url);

app.del('/remove/:urly', auth, api.remove);

app.post('/create', auth, api.create);

var port = process.env.NODURL_PORT || 80;
console.log('Listening on %d'.green, port);

app.listen(port);