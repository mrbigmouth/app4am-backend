DB.news.allow(
  {'insert' :
      function() {
        return false;
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


Meteor.publish('unAssignNews', function() {
  return DB.news.find({'topicId' : {'$size' : 0}});
});