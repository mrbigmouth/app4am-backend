Router.map(function() {
  //首頁
  this.route(
    "assign"
  , {"path"           : "/"
    ,"subscriptions"  :
        function() {
          return Meteor.subscribe("unAssignNews", new Date());
        }
    }
  );

  //分析
  this.route(
    "analysis"
  , {"path"           : "/topic/:_id"
    ,"subscriptions"  :
        function() {
          return Meteor.subscribe("newsByTopic", this.params._id);
        }
    ,"data"           :
        function() {
          return DB.topic.findOne(new Meteor.Collection.ObjectID(this.params._id))
        }
    }
  );
});