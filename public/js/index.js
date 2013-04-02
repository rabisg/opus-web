/* Global Templates */
var t_entry, t_business;

Handlebars.registerHelper('like', function(business) {
  var liked = false;
  if (window.user && business.likedBy.indexOf(window.user._id) != -1)
    liked = true;

  var result = '<a class="btn btn-small ';
  if (liked) result += 'disabled';
  else result += 'like-btn';
  result +='" data-id="' + Handlebars.Utils.escapeExpression(business._id);
  if (liked) result += '">';
  else result += '" onclick="subscribe(this)">';
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
  if (!business.reviewed)
    result = '<a class="btn btn-small" data-id="' + Handlebars.Utils.escapeExpression(business._id) +'"><i class="icon-pencil"></i></a>';
  return new Handlebars.SafeString(result);
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
    var html = t_business(resp);
    $('#content').html(html);
  });
}

var routes = {
  '/business/:id': showBusiness
};
var router = Router(routes);
router.init();

$(document).ready(function () {
  $.ajax({
    url: 'api/user/me',
    async: false
  }).done(function (resp) {
    $('#nonUserMenu').hide();
    $('#userMenu #name').html(resp.user.name);
    $('#userMenu').show();
    window.user = resp.user;
  });

  t_entry = Handlebars.compile($("#entry-template").html());
  t_business = Handlebars.compile($("#business-template").html());

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

  $('#signupForm .btn-primary').click(function (event) {
    event.preventDefault();
    $.post('/api/user', $('#signupForm').serialize())
    .done(function (resp) {
      //@TODO: hide modal
      //@TODO: show alert of successful signup
    });
  });

  $('#businessForm .btn-primary').click(function (event) {
    event.preventDefault();
    $.post('/api/business', $('#businessForm').serialize())
    .done(function (resp) {
      //@TODO: hide modal
      //@TODO: show alert of successful creation
    });
  });

  $.ajax('/api/business?reviewed=false&count=5')
  .done(function(resp){
    var html = t_entry(resp);
    $('#not-reviewedList').html(html);
  });
  $.ajax('/api/business?reviewed=true&count=5')
  .done(function(resp){
    var html = t_entry(resp);
    $('#reviewedList').html(html);
  });
});