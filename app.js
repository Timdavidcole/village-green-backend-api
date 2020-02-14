var fs = require('fs'),
  http = require('http'),
  path = require('path'),
  methods = require('methods'),
  express = require('express'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  cors = require('cors'),
  passport = require('passport'),
  errorhandler = require('errorhandler'),
  mongoose = require('mongoose');

var isProduction = true;
console.log("isProduction")

console.log(isProduction)

// Create global app object
var app = express();

app.use(cors());

// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: 'conduit',
  cookie: {
    maxAge: 60000
  },
  resave: false,
  saveUninitialized: false
}));

if (!isProduction) {
  app.use(errorhandler());
}

if (isProduction) {
  const uri = "mongodb+srv://tim:chuckles1@village-green-api-6cbik.mongodb.net/test?retryWrites=true&w=majority";
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
} else {
  mongoose.connect('mongodb://localhost/village-green', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  mongoose.set('debug', true);
}

require('./models/User');
require('./models/Notice')
require('./models/Comment');
require('./config/passport');

app.use(require('./routes'));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);

    res.json({
      'errors': {
        message: err.message,
        error: err
      }
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    'errors': {
      message: err.message,
      error: {}
    }
  });
});

// finally, let's start our server...
var server = app.listen(process.env.PORT || 3000, function() {
  console.log('Listening on port ' + server.address().port);
});
