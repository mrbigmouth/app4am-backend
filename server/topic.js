DB.topic.allow(
  {'insert' :
      function(userId, doc) {
        doc.latestTime = new Date();
        doc.score = null;
        doc.sort = null;
        return true;
      }
  ,'update' :
      function(userId, doc) {
        doc.latestTime = new Date();
        return true;
      }
  ,'remove' :
      function() {
        return true;
      }
  }
);


Meteor.publish('topic', function() {
  return DB.topic.find();
});