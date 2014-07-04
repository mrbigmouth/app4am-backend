Meteor.publish('users', function() {
  var id = this.connection.id || 'null';
  console.log(id + ' subscribe news!');
  this.onStop(function() {
    console.log(id + ' was disconnected!!!');
  });
  return Meteor.users.find();
});