var schema = require('./schema');
var Business = schema.Business,
    User = schema.User;

exports.loadResource = function(model) {
  return function(req, res, next) {
    model.findById(req.params.id, function(err, resource) {
      if (err)
        return res.send(500, {error: "Error fetching " + model.toString()});
      else if (!resource)
        return res.send(404, {error: "Invalid id"});
      req.resource = resource;
      next();
    });
  };
};

exports.addBusiness = function(req, res) {
  var business = new Business({
    name: req.param('name'),
    pincode: req.param('pincode'),
    details: req.param('details'),
    category: req.param('category'),
    price: req.param('price'),
    workingDays: req.param('workingDays'),
    currency: req.param('currency')
  });
  business.save(function (err, business) {
    if (err)
      res.send(400, {status:'error', error: err});
    else
      res.send(200, {status:'created', id: business.id});
  });
};

exports.addUser = function(req, res) {
  var user = new User({
    phone: req.param('phone'),
    name: req.param('name'),
    email: req.param('email'),
    password: req.param('password')
  });
  user.save(function (err, user) {
    if (err)
      res.send(400, {status:'error', error: err});
    else
      res.send(200, {status:'created', id: user.id});
  });
};

exports.addNotification = function(req, res) {
  var business = req.resource;
  business.notifications.push({ title: req.param('title'), body: req.param('body') });
  business.save( function (err, business) {
    if (err) res.send(400, {status:'error', error: err});
    else res.send(200, {status:'updated'});
  });
};

exports.like = function(req, res) {
  var business = req.resource;
  var uid = req.session.uid || undefined;
  if (!uid) res.send(403, {status: 'error', error:'Authorization not provided'});
  else
    if (business.likedBy.indexOf(uid) != -1)
      res.send(400, {status:'error', error:'You already like this'});
    else {
      business.likedBy.push(uid);
      business.likes++;
      business.save(function (err, business) {
        if (err) res.send(400, {status:'error', error: err});
        else res.send(200, {status:'liked'});
      });
    }
};

exports.subscribe = function(req, res) {
  var business = req.resource;
  var uid = req.session.uid || undefined;
  if (!uid) res.send(403, {status: 'error', error:'Authorization not provided'});
  else
    if (business.subscribedBy.indexOf(uid) != -1)
      res.send(400, {status:'error', error:'You have already subscribed this'});
    else {
      business.subscribedBy.push(uid);
      business.subscribes++;
      business.save(function (err, business) {
        if (err) res.send(400, {status:'error', error: err});
        else res.send(200, {status:'subscribed'});
      });
    }
};

exports.addNotification = function(req, res) {
  var business = req.resource;
  business.notifications.push({ title: req.param('title'), body: req.param('body') });
  business.save( function (err, business) {
    if (err) res.send(400, {status:'error', error: err});
    else res.send(200, {status:'updated'});
  });
};

exports.allBusiness = function(req, res) {
  var limit = req.param('limit') || 10,
      reviewed = (req.param('reviewed') && req.param('reviewed')=="true") ? true : false;
      sortBy = req.param('sortBy') || 'timestamp';

  Business
  .find({'reviewed':reviewed})
  .limit(limit)
  .sort(sortBy)
  .select('id name pincode details category likes subscribers likedBy subscribedBy')
  .exec(function (err, businesses) {
    if(err) res.send(400, {status:'error', error: err});
    else res.send(200, {status:'ok', list: businesses});
  });
};

exports.getBusiness = function(req, res) {
  res.send(200, {business: res.resource});
};