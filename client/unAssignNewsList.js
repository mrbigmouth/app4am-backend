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
  , now       = new Date()
  , nowFilter =
      new ReactiveVar(
        {"newsTime" :
            {"$gte" : now.getDayStart()
            ,"$lte" : now.getDayEnd()
            }
        }
      )
  ;
Template.unAssignNewsList.helpers(
  {"news" :
      function() {
        var filter  = nowFilter.get()
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
  {"change input[name]" :
      function(e, ins) {
        var $form   = $(e.currentTarget).closest("form")
          , $date   = $form.find("[name=\"newsDate\"]")
          , filter  = {}
          , text    = $form.find("input[name=\"search\"]").val()
          , date
          , reg
          ;

        if (text) {
          reg = new RegExp(text);
          filter.$or =
              [ {"title"   : reg}
              , {"content" : reg}
              ];
        }
        else {
          text = false;
        }

        if ($date.is(":visible")) {
          date = new Date( Date.parse( $date.val() ) );
          filter.newsTime =
              {"$gte"     : date.getDayStart()
              ,"$lte"     : date.getDayEnd()
              };
        }
        else {
          date = false
        }

        $("#news-loading").show();
        Meteor.subscribe(
          "unAssignNews"
        , date
        , text
        , function() {
            $("#news-loading").hide();
          }
        );
        nowFilter.set(filter);
      }
  ,"click div.filterDate a.turn" :
      function(e) {
        var $this = $(e.currentTarget)
          , $form = $this.closest("form")
          ;

        if ($this.hasClass("on")) {
          $form.find("div.filterDate").removeClass("off").addClass("on");
        }
        else {
          $form.find("div.filterDate").removeClass("on").addClass("off");
        }
        $form.find("input[name=\"search\"]").trigger("change");
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
