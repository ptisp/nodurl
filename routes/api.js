require('colors');

var fs = require('fs'),
  path = require('path'),
  vendors = require('../vendors');

function upsert(urly, destination, type, callback) {
  vendors.mongo.collection('urlys').updateOne({
    'urly': urly
  }, {
    $set: {
      'destination': destination,
      'type': type
    }
  }, {
    upsert: true,
    safe: false
  }, function(err, result) {
    callback(err, result);
  });
}

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

    upsert(urly, req.body.path, 'files', function(err, result) {
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

      upsert(urly, file.name.toLowerCase(), 'files', function(err, result) {
        if (err) return res.json({
          'result': false
        });
        res.redirect('/olympus');
      });
    });
  } else {
    upsert(urly, destination, 'shorts', function(err, result) {
      if (err) return res.json({
        'result': false
      });
      res.redirect('/olympus');
    });
  }
};

exports.url = function(req, res) {
  var urly = req.params.urly;

  vendors.mongo.collection('urlys').findOne({
    'urly': urly
  }, function(err, doc) {
    if (err || !doc) {
      res.status(404).send('Not found');
    } else {
      if (doc.type === 'shorts') {
        redirect(doc, req, res);
      } else if (doc.type === 'files') {
        sendFile(doc, req, res);
      } else {
        res.status(500).send('Invalid type');
      }
    }
  });
};

exports.remove = function(req, res) {
  var urly = req.params.urly;

  vendors.mongo.collection('urlys').removeOne({
    'urly': urly
  }, {
    w: 1
  }, function(err, result) {
    res.json({
      'result': true
    });
  });
};

exports.urls = function(req, res) {
  var urly = req.params.urly;

  vendors.mongo.collection('urlys').find({}).toArray(function(err, docs) {
    res.json(docs || []);
  });
};

function sendFile(doc, req, res) {
  var filename = doc.destination;
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

}

function redirect(doc, req, res) {
  var redir = doc.destination;

  if (redirect) {
    console.log('Redirect found: %s'.green, redir);
    res.redirect(redir);
  } else {
    console.log('Redirect not found: %s'.red, redir);
    res.status(404).send('Not found');
  }
}

function makeid() {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';

  for (var i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
