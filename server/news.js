DB.news.allow(
  {'insert' :
      function() {
        return false;
      }
  ,'update' :
      function(userId, doc) {
        DB.news.update(doc._id, {'$set' : {'updateTime' : new Date()}});
        return true;
      }
  ,'remove' :
      function() {
        return true;
      }
  }
)


Meteor.publish('unAssignNews', function() {
  return DB.news.find({},{'limit' : 50});
});
