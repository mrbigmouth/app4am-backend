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


Meteor.publish('unAssignNews', function(date) {
  var filter =
      {"newsTime" :
          {"$gte" : date.getDayStart()
          ,"$lte" : date.getDayEnd()
          }
      }
  return DB.news.find(filter);
});

Meteor.publish('newsByTopic', function(idStr) {
  var topicId = new Mongo.ObjectID(idStr)
    , filter  =
      {"topicId" : topicId
      }
  return DB.news.find(filter);
});
