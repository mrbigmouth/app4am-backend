var padding  =
      function(i) {
        if (i < 10) {
          return "0" + i;
        }
        return "" + i;
      }
  , showDate =
      function(date) {
        return date.getFullYear() + "-" + padding(date.getMonth() + 1) + "-" + padding(date.getDate());
      }
  , showTime =
      function(date) {
        return padding(date.getHours()) + ":" + padding(date.getMinutes()) + ":" + padding(date.getSeconds());
      }
  ;

Template.unAssignNewsList.rendered =
    function() {
      this.find("input[name=\"newsDate\"]").value = showDate( new Date() );
    };

var NEWSPAPER =
      {"LTN"       : "自由時報"
      ,"Apple"     : "蘋果日報"
      ,"UDN"       : "聯合新聞網"
      ,"ChinaTime" : "中國時報"
      };
Template.unAssignNewsList.helpers(
  {"news" :
      function() {
        var date   = Session.get("newsDate") || new Date()
          , filter =
              {"newsTime" :
                  {"$gte" : new Date( date.setHours(0,0,0,0) )
                  ,"$lte" : new Date( date.setHours(23,59,59,999) )
                  }
              }
          ;
        return DB.news.find(filter, {"sort" : {"newsTime" : -1} });
      }
  }
);
Template.unAssignNewsList.events(
  {"change input[name=\"newsDate\"]" :
      function(e) {
        var date = new Date( Date.parse(e.currentTarget.value) );
        Meteor.subscribe("unAssignNews", date);
        Session.set("newsDate", date);
      }
  }
);

Template.eachNews.helpers(
  {"list" :
      function(list) {
        return _.map(list, function(id) {
          var topic = DB.topic.findOne(id);
          return topic ? topic.name : "";
        }).join("、");

      }
  ,"showDate" :
      function(date) {
        return showDate(date) + " " + showTime(date);
      }
  ,"newsPaperName" :
      function(newsPaper) {
        return NEWSPAPER[newsPaper];
      }
  }
)
Template.eachNews.events(
  //選擇新聞
  {"click" :
      function(e, ins) {
        var $news    = $(ins.firstNode)
          , $wrapper = $news.closest("div.wrapper")
          , $topic
          ;

        //取消選擇
        if ($news.hasClass("selected")) {
          $news.removeClass("selected");
          $wrapper.data("selectedNews", null);
          $wrapper.find("div.eachTopic.selected").removeClass("selected");
        }
        //選擇此新聞
        else {
          $news
            .addClass("selected")
            .closest("div.unAssignNewsList")
              .find("div.eachNews")
                .not($news)
                  .removeClass("selected")

          $wrapper.data("selectedNews", ins.data._id);

          $topic = $wrapper.find("div.topicList");
          $topic.find("div.eachTopic").removeClass("selected");
          _.each(ins.data.topicId, function(id) {
            if (id) {
              $topic.find("div.eachTopic.id" + id._str).addClass("selected");
            }
          });
        }

      }
  }
)