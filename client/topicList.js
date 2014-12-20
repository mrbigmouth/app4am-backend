Meteor.subscribe("topic");

Template.topicList.helpers(
  {"sortedTopic"  :
      function() {
        return DB.topic.find({"sort" : {"$ne" : null}}, {"sort" : {"sort" : 1} });
      }
  ,"unSortTopic"  :
      function() {
        return DB.topic.find({"sort" : null}, {"sort" : {"latestTime" : -1} });
      }
  }
);

Template.topicList.events(
  {"click button" :
      function(e, ins) {
        var prompt = window.prompt
          , doc    = {}
          , tags
          ;

        doc.name = prompt("請輸入議題名稱：");
        if (! doc.name) {
          return false;
        }
        doc.topicTagSet = [];
        Meteor.call("dbInsert", "topic", doc);
      }
  }
);

Template.eachTopic.helpers(
  {"list"         :
      function(list) {
        return list.join("、");
      }
  ,"comma"        :
      function(list) {
        return list.join(",");
      }
  ,"showDate"     :
      function(date) {
        return date.format("yyyy-MM-dd");
      }
  ,"showDateTime" :
      function(date) {
        return date.format("yyyy/MM/dd HH:mm");
      }
  ,"isSorted"     :
      function(sort) {
        return ! (sort === null);
      }
  }
);

Template.eachTopic.events(
  {"click" :
      function(e, ins) {
        var $this        = $(ins.firstNode)
          , thisId       = ins.data._id
          , selectedNews = $this.closest("div.wrapper").data("selectedNews")
          , news
          , topicId
          ;

        if (! selectedNews) {
          return true;
        }
        news = DB.news.findOne(selectedNews);
        if (! news) {
          return true;
        }

        if ($this.hasClass("selected")) {
          if (_.isArray(news.topicId)) {
            topicId = _.reject(news.topicId, function(d) { return thisId.equals(d); });
          }
          else {
            topicId = [];
          }
          DB.news.update(selectedNews, {$set : {"topicId" : topicId}});
          $this.removeClass("selected");
        }
        else {
          if (_.isArray(news.topicId)) {
            topicId = _.reject(news.topicId, function(d) { return thisId.equals(d); });
            topicId.push(thisId);
          }
          else {
            topicId = [ thisId ];
          }
          DB.news.update(selectedNews, {$set : {"topicId" : topicId}});
          $this.addClass("selected");
        }
      }
  ,"click a.edit" :
      function(e, ins) {
        e.stopPropagation();
        $(e.currentTarget).closest("div.eachTopic").addClass("editing");
      }
  ,"click a.toSort" :
      function(e, ins) {
        var thisId = ins.data._id
          , sorted = DB.topic.find({"sort" : {"$ne" : null}}).count();
          ;

        e.stopPropagation();
        sorted = DB.topic.find({"sort" : {"$ne" : null}}).count();
        DB.topic.update(thisId, {"$set" : {"sort" : sorted}});
      }
  ,"click a.unSort" :
      function(e, ins) {
        var thisId = ins.data._id;

        e.stopPropagation();
        DB.topic.update(thisId, {"$set" : {"sort" : null}});
      }
  ,"click a.sortAdd" :
      function(e, ins) {
        var thisId = ins.data._id
          , next   = DB.topic.findOne({"sort" : ins.data.sort + 1})
          ;

        e.stopPropagation();
        if (next) {
          DB.topic.update(thisId, {"$inc" : {"sort" : 1}});
          DB.topic.update(next._id, {"$inc" : {"sort" : -1}});
        }
      }
  ,"click a.sortMinus" :
      function(e, ins) {
        var thisId = ins.data._id
          , prev   = DB.topic.findOne({"sort" : ins.data.sort - 1})
          ;

        e.stopPropagation();
        if (prev) {
          DB.topic.update(thisId, {"$inc" : {"sort" : -1}});
          DB.topic.update(prev._id, {"$inc" : {"sort" : 1}});
        }
      }
  //取消
  ,"click form.editor input[type=\"button\"]" :
      function(e) {
        debugger;
        $(e.currentTarget)
          .closest("form")
            .trigger("reset")
            .closest("div.eachTopic")
              .removeClass("editing");
      }
  //送出
  ,"click form.editor submit" :
      function(e, ins) {
        debugger;
        var thisId = ins.data._id
          , form   = e.currentTarget
          , doc    =
              {"name"         : form.name.value
              ,"topicTagSet"  : _.compact( form.topicTagSet.value.split(",") )
              ,"description"  : form.description.value
              ,"startDate"    : form.startDate.value
              ,"endDate"      : form.endDate.value
              }
          ;
        DB.topic.update(
          thisId
        , {"$set" : doc}
        , function() {
            $(form).closest("div.eachTopic").removeClass("editing");
          }
        );
      }
  }
)