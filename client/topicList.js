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
        tags = prompt("請輸入關鍵字組（以,分隔）：");
        if (! tags) {
          return tags = "";
        }
        doc.topicTagSet = tags.split(",");
        Meteor.call("dbInsert", "topic", doc);
      }
  }
);

Template.eachTopic.helpers(
  {"list"     :
      function(list) {
        return list.join("、");
      }
  ,"showDate" :
      function(date) {
        return date.format("yyyy/MM/dd HH:mm");
      }
  ,"isSorted" :
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
        var thisId = ins.data._id
          , prompt = window.prompt
          , doc    = {}
          , tags
          ;

        doc.name = prompt("請修改議題名稱：", ins.data.name);
        if (! doc.name) {
          return false;
        }
        tags = prompt("請修改關鍵字組（以,分隔）：", ins.data.topicTagSet.join(","));
        if (! tags) {
          return false;
        }
        doc.topicTagSet = tags.split(",");
        DB.topic.update(thisId, {"$set" : doc});
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
  }
)