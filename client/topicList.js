SUBSCRIBE.subscribe("topic");

var nowFilter = new ReactiveVar({});

Template.topicList.helpers(
  {"sortedTopic"  :
      function() {
        var filter      = 
              _.defaults(
                {"sort" : {"$ne" : null}}
              , nowFilter.get()
              );
          ;
        return DB.topic.find(filter, {"sort" : {"sort" : 1} });
      }
  ,"unSortTopic"  :
      function() {
        var filter      = 
              _.defaults(
                {"sort" : null}
              , nowFilter.get()
              );
          ;
        return DB.topic.find(filter, {"sort" : {"latestTime" : -1} });
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
  ,"keyup input[name=\"filter\"]" :
      function(e) {
        var value = e.currentTarget.value
          , reg
          ;
        if (value) {
          reg = new RegExp(value);
          nowFilter.set(
            {"$or" :
                [{"name"         : reg}
                ,{"topicTagSet"  : reg}
                ]
            }
          );
        }
        else {
          nowFilter.set({});
        }
      }
  }
);

Template.eachTopic.helpers(
  {"list"         :
      function(list) {
        if (list) {
          return list.join("、");
        }
        else {
          return "";
        }
      }
  ,"comma"        :
      function(list) {
        if (list) {
          return list.join(",");
        }
        else {
          return "";
        }
      }
  ,"showDate"     :
      function(date) {
        if (date) {
          return date.format("yyyy-MM-dd");
        }
        else {
          return "";
        }
      }
  ,"showDateTime" :
      function(date) {
        if (date) {
          return date.format("yyyy/MM/dd HH:mm");
        }
        else {
          return "";
        }
      }
  ,"countLine"    :
      function(text) {
        var line = 1;
        if (text) {
          line = text.split("\n").length;
        }
        return line;
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
  //自動增行
  ,"keyup form.editor textarea" :
      function(e) {
        var textarea = e.currentTarget
          , text     = textarea.value
          , line     = text.split("\n").length
          ;
        $(textarea).attr("rows", line);
      }
  //取消
  ,"click form.editor input[type=\"button\"]" :
      function(e) {
        $(e.currentTarget)
          .closest("form")
            .trigger("reset")
            .closest("div.eachTopic")
              .removeClass("editing");
      }
  //重設
  ,"reset form.editor" :
      function(e, ins) {
        var data = ins.data
          , form = e.currentTarget
          ;
        form.name.value = data.name;
        form.topicTagSet.value = data.topicTagSet.join(",");
        form.description.value = data.description || "";
        if (data.startDate) {
          form.startDate.value = data.startDate.format("yyyy-MM-dd");
        }
        if (data.endDate) {
          form.endDate.value = data.endDate.format("yyyy-MM-dd");
        }
        e.preventDefault();
      }
  //送出
  ,"submit form.editor" :
      function(e, ins) {
        var thisId = ins.data._id
          , form   = e.currentTarget
          , doc    =
              {"name"         : form.name.value
              ,"topicTagSet"  : _.compact( form.topicTagSet.value.split(",") )
              ,"description"  : form.description.value
              ,"startDate"    : new Date( Date.parse(form.startDate.value) )
              ,"endDate"      : new Date( Date.parse(form.endDate.value) )
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
