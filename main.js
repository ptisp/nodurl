require('colors');

var express = require('express'),
  bodyParser = require('body-parser'),
  basicAuth = require('basic-auth'),
  api = require('./routes/api'),
  multer = require('multer');

var upload = multer({
  dest: __dirname + '/tmp'
});
var app = express();

app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());
app.use('/' + (process.env.NODURL_ADMINTAG || 'olympus'), express.static(__dirname + '/public'));

var auth = function(req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  }

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  }

  if (user.name === process.env.NODURL_USER && user.pass === process.env.NODURL_PASSWORD) {
    return next();
  } else {
    return unauthorized(res);
  }
};

app.get('/', function(req, res) {
  res.redirect(process.env.NODURL_HOME);
});

app.get('/urls', auth, api.urls);
app.get('/:urly', api.url);
app.delete('/remove/:urly', auth, api.remove);
app.post('/create', auth, upload.single('file'), api.create);

var port = process.env.NODURL_PORT || 80;
console.log('Listening on %d'.green, port);

app.listen(port);
