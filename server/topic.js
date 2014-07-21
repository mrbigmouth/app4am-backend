DB.topic.allow(
  {'insert' :
      function() {
        return true;
      }
  ,'update' :
      function() {
        return true;
      }
  ,'remove' :
      function() {
        return true;
      }
  }
)


Meteor.publish('topic', function() {
  return DB.topic.find();
});