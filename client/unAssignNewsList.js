Meteor.subscribe('unAssignNews')

Template.unAssignNewsList.helpers(
  {'news' :
      function() {
        return DB.news.find({}, {'sort' : {'updateTime' : 1} });
      }
  }
)

Template.eachNews.helpers(
  {'list' :
      function(list) {
        return _.map(list, function(id) {
          var topic = DB.topic.findOne(id);
          return topic ? topic.name : '';
        }).join('、');

      }
  ,'showDate' :
      function(date) {
        return '' + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
      }
  }
)
Template.eachNews.events(
  //選擇新聞
  {'click' :
      function(e, ins) {
        var $news    = $(ins.firstNode)
          , $wrapper = $news.closest('div.wrapper')
          , $topic
          ;

        //取消選擇
        if ($news.hasClass('selected')) {
          $news.removeClass('selected');
          $wrapper.data('selectedNews', null);
          $wrapper.find('div.eachTopic.selected').removeClass('selected');
        }
        //選擇此新聞
        else {
          $news
            .addClass('selected')
            .closest('div.unAssignNewsList')
              .find('div.eachNews')
                .not($news)
                  .removeClass('selected')

          $wrapper.data('selectedNews', ins.data._id);

          $topic = $wrapper.find('div.topicList');
          $topic.find('div.eachTopic').removeClass('selected');
          _.each(ins.data.topicId, function(id) {
            if (id) {
              $topic.find('div.eachTopic.id' + id._str).addClass('selected');
            }
          });
        }

      }
  }
)