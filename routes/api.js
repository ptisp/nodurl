require('colors');

var redis = require('redis'),
  fs = require('fs'),
  path = require('path');

var redis_client = redis.createClient(process.env.NODURL_REDIS_PORT || 6379, process.env.NODURL_REDIS_IP || '127.0.0.1');


exports.create = function(req, res) {
  var urly = req.body.urly;
  var destination = req.body.destination;
  var file;
  if (req.files) file = req.files.file;

  if (urly.length === 0) urly = makeid();

  urly = urly.replace(' ', '');

  if (!urly || (!destination && !file)) res.json({
    'result': false
  });

  if (req.body.path) {
    var rootDirectory = path.resolve(__dirname + '/../files/');
    var filename = path.join(rootDirectory, req.body.path);
    if (filename.indexOf(rootDirectory) !== 0) {
      return res.json({
        'result': false
      });
    }

    redis_client.hset('files', urly, req.body.path, function(err) {
      if (err) return res.json({
        'result': false
      });
      res.redirect('/olympus');
    });
  } else if (file && file.name.length > 1) {
    var tempPath = file.path;
    var targetPath = path.resolve(__dirname + '/../files/' + file.name.toLowerCase());

    fs.rename(tempPath, targetPath, function(err) {
      if (err) return res.json({
        'result': false
      });

      redis_client.hset('files', urly, file.name.toLowerCase(), function(err) {
        if (err) return res.json({
          'result': false
        });
        res.redirect('/olympus');
      });
    });
  } else {
    redis_client.hset('shorts', urly, destination, function(err) {
      if (err) return res.json({
        'result': false
      });
      res.redirect('/olympus');
    });
  }
};


exports.url = function(req, res) {
  var urly = req.params.urly;

  redis_client.multi()
    .hexists(['shorts', urly])
    .hexists(['files', urly])
    .exec(function(err, replies) {
      if (replies[0] == 1) {
        redirect(req, res);
      } else if (replies[1] == 1) {
        sendFile(req, res);
      } else {
        res.status(404).send('Not found');
      }
    });
};

exports.remove = function(req, res) {
  var urly = req.params.urly;

  redis_client.hdel('files', urly, redis.print);
  redis_client.hdel('shorts', urly, redis.print);

  res.json({
    'result': true
  });
};


exports.urls = function(req, res) {
  var urly = req.params.urly;

  redis_client.multi()
    .hgetall('shorts')
    .hgetall('files')
    .exec(function(err, replies) {
      var output = [];

      for (var i = replies.length - 1; i >= 0; i--) {
        var obj = replies[i];
        if (obj) {
          var keys = Object.keys(obj);
          var type = 'shorts';
          if (i == 1) type = 'files';

          for (var z = keys.length - 1; z >= 0; z--) {
            output.push({
              'urly': keys[z],
              'destination': obj[keys[z]],
              'type': type
            });
          }
        }
      }

      res.json(output);
    });
};


function sendFile(req, res) {
  var urly = req.params.urly;

  redis_client.hget('files', urly, function(err, filename) {

    var filePath = path.join(__dirname + '/../files', filename);

    if (fs.existsSync(filePath)) {
      var file = fs.statSync(filePath);

      res.writeHead(200, {
        'Content-disposition': 'attachment; filename=' + filename,
        'Content-Length': file.size
      });

      console.log('File found: %s'.green, filename);

      var readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    } else {
      console.log('File not found: %s'.red, filename);
      res.status(404).send('Not found');
    }
  });
}


function redirect(req, res) {
  var urly = req.params.urly;

  redis_client.hget('shorts', urly, function(err, redirect) {
    if (redirect) {
      console.log('Redirect found: %s'.green, redirect);
      res.redirect(redirect);
    } else {
      console.log('Redirect not found: %s'.red, redirect);
      res.status(404).send('Not found');
    }
  });
}

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";

  for (var i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}