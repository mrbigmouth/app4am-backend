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
          {"$gte" : new Date( date.setHours(0,0,0,0) )
          ,"$lte" : new Date( date.setHours(23,59,59,999) )
          }
      }
  return DB.news.find(filter);
});
