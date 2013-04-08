/* Global Templates */
var t_entry, t_business, t_search;

$.ajaxSetup({
    error: function(jqXHR, status, thrownError) {
        var resp = $.parseJSON(jqXHR.responseText);
        if(resp.error)
          if(resp.error.message)
            notify(resp.error.message, {type:'alert-error'});
          else
            notify(resp.error, {type:'alert-error'});
    }
});

function notify(text, options) {
  options = options || {};
  options.type = options.type || '';
  options.timeout = options.timeout || 3000;

  $("#status-div").addClass(options.type);
  $("#status").html(text);
  $(".status-bar").slideDown();
  setTimeout(function() {
    $(".status-bar").slideUp({
      complete: function(){
        $("#status-div").removeClass(options.type);
      },
      duration: 'fast'
    });
  }, options.timeout);
}

Handlebars.registerHelper('like', function(business) {
  var liked = false;
  if (window.user && business.likedBy.indexOf(window.user._id) != -1)
    liked = true;

  var result = '<a class="btn btn-small ';
  if (liked) result += 'disabled';
  else result += 'like-btn';
  result +='" data-id="' + Handlebars.Utils.escapeExpression(business._id);
  if (liked) result += '">';
  else result += '" onclick="like(this)">';
  result += '<i class="icon-thumbs-up"></i><span id="likes">' + business.likes + '</span> Likes </a>';

  return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('subscribe', function(business) {
  var subscribed = false;
  if (window.user && business.subscribedBy.indexOf(window.user._id) != -1)
    subscribed = true;

  var result = '<a class="btn btn-small ';
  if (subscribed) result += 'disabled';
  else result += 'subscribe-btn';
  result +='" data-id="' + Handlebars.Utils.escapeExpression(business._id);
  if (subscribed) result += '">';
  else result += '" onclick="subscribe(this)">';
  result += '<i class="icon-bookmark"></i><span id="subscribers">' + business.likes + '</span></a>';

  return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('review', function(business) {
  var result = '';
  if (business.reviewed === false)
    result = '<a class="btn btn-small" data-id="' + Handlebars.Utils.escapeExpression(business._id) +'" onclick="review(this)" data-toggle="modal" data-target="#reviewModal"><i class="icon-pencil"></i></a>';
  return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('addOffer', function() {
  if (window.user && window.user.business.indexOf(this._id) != -1) {
    var result = '<a class="btn-small link" data-id="' + Handlebars.Utils.escapeExpression(this._id);
    result += '" data-toggle="modal" data-target="#addOfferModal" onclick="addOfferModal(this)"><i class="icon-plus"></i></a>';
    return new Handlebars.SafeString(result);
  }
  return new Handlebars.SafeString('');
});

function like (el) {
  var $el = $(el);
  $.post('/api/business/' + $el.attr('data-id') + '/like')
  .done(function (resp) {
    $el.addClass('disabled');
    $el.removeAttr('onclick');
    $el.children('#likes').html(resp.likes);
  });
}
function subscribe (el) {
  var $el = $(el);
  $.post('/api/business/' + $el.attr('data-id') + '/subscribe')
  .done(function (resp) {
    $el.addClass('disabled');
    $el.removeAttr('onclick');
    $el.children('#subscribers').html(resp.subscribers);
  });
}

function addOfferModal (el) {
  var $el = $(el);
  window.addOfferFor = $el.attr('data-id');
}
function review (el) {
  var $el = $(el);
  window.reviewFor = $el.attr('data-id');
}

function login () {
	$.post('/api/user/login', $('#nonUserMenu #loginForm').serialize())
	.done(function (resp) {
		/*$('#nonUserMenu').hide();
		$('#userMenu #name').html(resp.user.name);
		$('#userMenu').show();
    window.user = resp.user;*/
    window.location.reload();
	});
  return false;
}

function showBusiness (id) {
  $.ajax('/api/business/'+ id)
  .done(function (resp) {
    resp.notifications = resp.notifications.sort(function(a, b){ return a.timestamp < b.timestamp ;});
    var html = t_business(resp);
    $('#content').html(html);
  });
}

function search(s) {
  $.ajax('/api/business/?category='+ s)
  .done(function (resp) {
    console.log(resp);
    var html = t_search(resp);
    $('#content').html(html);
  });
}

var routes = {
  '/business/:id': showBusiness,
  '/search/:s': search
};
var router = Router(routes);
router.init();

$(document).ready(function () {
  $.ajax({
    url: 'api/user/me',
    async: false,
    global: false
  }).done(function (resp) {
    $('#nonUserMenu').hide();
    $('#userMenu #name').html(resp.user.name);
    $('#userMenu').show();
    window.user = resp.user;
  });

  t_entry = Handlebars.compile($("#entry-template").html());
  t_business = Handlebars.compile($("#business-template").html());
  t_search = Handlebars.compile($("#search-template").html());

	$('#loginBtn').popover({ content: $('#login').html()});

  $('#logout').click(function (event) {
    $.ajax('/api/user/logout')
    .done(function (resp) {
      /*$('#userMenu #name').html('');
      $('#userMenu').hide();
      $('#nonUserMenu').show();
      window.user = null;*/
      window.location.reload();
    });
  });

  $('#addOfferForm .btn-primary').click(function (event) {
    event.preventDefault();
    $.post('/api/business/' + window.addOfferFor, $('#addOfferForm').serialize())
    .done(function (resp) {
      $('#addOfferModal').modal('hide');
      notify('Your offer has been added', {type:'alert-success'});
    });
  });

  $('#reviewForm .btn-primary').click(function (event) {
    event.preventDefault();
    $.post('/api/business/' + window.reviewFor + '/edit?reviewed=true', $('#reviewForm').serialize())
    .done(function (resp) {
      $('#reviewModal').modal('hide');
      //@TODO: Change fields accordingly
      notify('Thank you for reviewing this business', {type:'alert-success'});
    });
  });

  $('#signupForm .btn-primary').click(function (event) {
    event.preventDefault();
    $.post('/api/user', $('#signupForm').serialize())
    .done(function (resp) {
      $('#signupModal').modal('hide');
      notify('Succesful Signup. Please login!', {type:'alert-success'});
    });
  });

  $('#businessForm .btn-primary').click(function (event) {
    event.preventDefault();
    $.post('/api/business', $('#businessForm').serialize())
    .done(function (resp) {
      user.business.push(resp.id);
      $('#businessModal').modal('hide');
      notify('You have Succesfully created your business!', {type:'alert-success'});
      window.location.hash = '/business/' + resp.id;
    });
  });

  $('#search').keydown(function(event) {
    if(event.keyCode==13)
      window.location.hash='/search/' + $('#search').val();
  });

  setInterval(function(){
    $.ajax('/api/business?reviewed=false&count=5')
    .done(function(resp){
      var html = t_entry(resp);
      $('#not-reviewedList').html(html);
    });
  }, 2000);
  setInterval(function(){
    $.ajax('/api/business?reviewed=true&count=5')
    .done(function(resp){
      var html = t_entry(resp);
      $('#reviewedList').html(html);
    });
  }, 2000);
});