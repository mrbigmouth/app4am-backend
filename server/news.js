DB.news.allow(
  {"insert" :
      function() {
        return false;
      }
  ,"update" :
      function(userId, doc) {
        DB.news.update(doc._id, {"$set" : {"updateTime" : new Date()}});
        return true;
        //return false;
      }
  ,"remove" :
      function() {
        //return true;
        return false;
      }
  }
)


Meteor.publish("unAssignNews", function(date) {
  var filter =
        {"newsTime" :
            {"$gte" : date.getDayStart()
            ,"$lte" : date.getDayEnd()
            }
        }
    , options =
        {"fields" :
            {"content" : 0
            ,"comment" : 0
            }
        }
    ;
  return DB.news.find(filter);
});

Meteor.publish("searchNews", function(text) {
  var filter =
        {"$or" :
            [{"title"   : new RegExp(text)}
            ,{"content" : new RegExp(text)}
            ]
        }
    , options =
        {"fields" :
            {"comment" : 0
            }
        }
    ;
  return DB.news.find(filter);
});

Meteor.publish("newsByTopic", function(idStr) {
  var topicId = new Mongo.ObjectID(idStr)
    , filter  =
      {"topicId" : topicId
      }
    , options =
        {"fields" :
            {"content" : 0
            ,"comment" : 0
            }
        }
    ;

  return DB.news.find(filter, options);
});

Meteor.publish("newsByNewspaperDate", function(newspaper, date) {
  var filter  = {}
    , options =
        {"fields" :
            {"content" : 0
            ,"comment" : 0
            }
        }
    ;

  if (newspaper) {
    filter.newspaper = newspaper;
  }
  
  filter.newsTime =
    {"$gte" : date.getDayStart()
    ,"$lte" : date.getDayEnd()
    }

  return DB.news.find(filter, options);
});
