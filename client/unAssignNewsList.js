Template.unAssignNewsList.rendered =
    function() {
      this.find("input[name=\"newsDate\"]").value = ( new Date() ).format("yyyy-MM-dd");
    };

var NEWSPAPER =
      {"LTN"       : "自由時報"
      ,"Apple"     : "蘋果日報"
      ,"UDN"       : "聯合新聞網"
      ,"ChinaTime" : "中國時報"
      }
  , nowDate   = new ReactiveVar(new Date())
  ;
Template.unAssignNewsList.helpers(
  {"news" :
      function() {
        var date    = nowDate.get()
          , filter  =
              {"newsTime" :
                  {"$gte" : date.getDayStart()
                  ,"$lte" : date.getDayEnd()
                  }
              }
          , options = 
              {"sort"     :
                {"_id"        : -1
                }
              }
          ;

        return DB.news.find(filter, options);
      }
  }
);
Template.unAssignNewsList.events(
  {"change input[name=\"newsDate\"]" :
      function(e) {
        var date = new Date( Date.parse(e.currentTarget.value) );
        Meteor.subscribe("unAssignNews", date);
        nowDate.set(date);
      }
  }
);

Template.eachNews.helpers(
  {"list" :
      function(list) {
        var result =
             _.map(list, function(id) {
                var topic = DB.topic.findOne(id);
                return topic ? topic.name : "";
            });
        result = _.compact(result);
        return result.join("、");

      }
  ,"showDate" :
      function(date) {
        return date.format("yyyy/MM/dd HH:mm");
      }
  ,"newsPaperName" :
      function(newsPaper) {
        return NEWSPAPER[newsPaper];
      }
  }
);
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
              $topic.find("div.eachTopic[data-id=\"" + id._str + "\"]").addClass("selected");
            }
          });
        }

      }
  }
);