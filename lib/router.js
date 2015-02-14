//Router基本設定
Router.configure(
  {"yieldRegions"     :
      {"header"           : {"to" : "north"}
      }
  ,"onBeforeAction"   :
      function() {
        var controller = this;
        controller.layout("layout");
        controller.next();
      }
  }
);

//首頁
Router.route(
  "assign"
, {"path"           : "/"
  ,"waitOn"         :
      function() {
        return Meteor.subscribe("unAssignNews", new Date());
      }
  ,"fastRender"     : true
  }
);

//分析
Router.route(
  "analysis"
, {"path"           : "/topic/:_id"
  ,"waitOn"         :
      function() {
        return Meteor.subscribe("newsByTopic", this.params._id);
      }
  ,"data"           :
      function() {
        return DB.topic.findOne(new Meteor.Collection.ObjectID(this.params._id))
      }
  ,"fastRender"     : true
  }
);
