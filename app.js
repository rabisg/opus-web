var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mongoose = require ('mongoose'),
    api = require('./api'),
    schema = require('./schema');

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.  
var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/opus';
var AppSecret = 's0m3R@n|)omK3y';
var port = process.env.PORT || 5000;

var Business = schema.Business,
    User = schema.User;


app.configure(function() {
  app.use(express.cookieParser());
  app.use(express.session({ secret: AppSecret }));
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.post('/api/business', api.addBusiness);
app.post('/api/business/:id', api.loadResource(Business), api.addNotification);
app.get('/api/business/:id', api.loadResource(Business), api.getBusiness);
app.post('/api/business/:id/like', api.loadResource(Business), api.like);
app.post('/api/business/:id/subscribe', api.loadResource(Business), api.subscribe);
app.get('/api/business', api.allBusiness); //limit, sortBy and reviewed params accepted
app.post('/api/user', api.addUser);

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

app.listen(port, function() {
  console.log("Listening on " + port);
});
