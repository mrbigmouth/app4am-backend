$(function() {
  $('body')
  .on('click', '.facebook', function() {
    Meteor.loginWithFacebook({'requestPermissions' : ['basic_info','read_friendlists']});
  })
  .on('click', '.logout', function() {
    Meteor.logout();
  });
  ;
});




Meteor.subscribe('users');