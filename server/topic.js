//check users
var checkUserIsBackend =
      function(userId) {
        var user;

        if (! userId) {
          return false;
        }
        user = Meteor.users.findOne(userId);

        if (! user) {
          return true;
        }

        if (! user.isBackend) {
          return true;
        }

        return false;
      };
DB.topic.deny(
  {"insert" : checkUserIsBackend
  ,"update" : checkUserIsBackend
  ,"remove" : checkUserIsBackend
  }
);
DB.topic.allow(
  {'insert' :
      function(userId, doc) {
        doc.latestTime = new Date();
        doc.score = null;
        doc.sort = null;
        return true;
        //return false;
      }
  ,'update' :
      function(userId, doc) {
        doc.latestTime = new Date();
        return true;
        //return false;
      }
  ,'remove' :
      function() {
        return true;
        //return false;
      }
  }
);


Meteor.publish('topic', function() {
  return DB.topic.find();
});