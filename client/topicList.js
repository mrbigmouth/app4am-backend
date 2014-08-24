Meteor.subscribe('topic');

Template.topicList.helpers(
  {'topic'  :
      function() {
        return DB.topic.find({}, {'sort' : {'sort' : 1} });
      }
  }
);

Template.topicList.events(
  //新增分類
  {'click button' :
      function(e, ins) {
        var prompt = window.prompt
          , doc    = {}
          , tags
          ;

        doc.name = prompt('請輸入分類名稱：');
        if (! doc.name) {
          return false;
        }
        tags = prompt('請輸入關鍵字組（以,分隔）：');
        if (! tags) {
          return tags = '';
        }
        doc.topicTagSet = tags.split(',');
        doc.sort = null;
        doc.score = null;
        Meteor.call('dbInsert', 'topic', doc);
      }
  }
);

Template.eachTopic.helpers(
  {'list'     :
      function(list) {
        return list.join('、');
      }
  ,'showDate' :
      function(date) {
        return '' + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
      }
  }
);

Template.eachTopic.events(
  //設定新聞分類
  {'click' :
      function(e, ins) {
        var $this        = $(ins.firstNode)
          , thisId       = ins.data._id
          , selectedNews = $this.closest('div.wrapper').data('selectedNews')
          , news
          , topicId
          ;
        if ($this.hasClass('selected')) {
          if (selectedNews && (news = DB.news.findOne(selectedNews)) ) {
            if (_.isArray(news.topicId)) {
              topicId = _.reject(news.topicId, function(d) { return thisId.equals(d); });
            }
            else {
              topicId = [];
            }
            DB.news.update(selectedNews, {$set : {'topicId' : topicId}});
          }
          $this.removeClass('selected');
        }
        else {
          if (selectedNews && (news = DB.news.findOne(selectedNews)) ) {
            if (_.isArray(news.topicId)) {
              topicId = _.reject(news.topicId, function(d) { return thisId.equals(d); });
              topicId.push(thisId);
            }
            else {
              topicId = [ thisId ];
            }
            DB.news.update(selectedNews, {$set : {'topicId' : topicId}});
          }
          $this.addClass('selected');
        }
      }
  ,'click a.edit' :
      function(e, ins) {
        e.stopPropagation();
        var thisId = ins.data._id
          , prompt = window.prompt
          , doc    = {}
          , tags
          ;

        doc.name = prompt('請修改分類名稱：', ins.data.name);
        if (! doc.name) {
          return false;
        }
        tags = prompt('請修改關鍵字組（以,分隔）：', ins.data.topicTagSet.join(','));
        if (! tags) {
          return false;
        }
        doc.topicTagSet = tags.split(',');
        DB.topic.update(thisId, {$set : doc});
      }
  }
)