Meteor.subscribe('unAssignNews')

Template.unAssignNewsList.helpers(
  {'news' :
      function() {
        return DB.news.find({'topicId' : null}, {'sort' : {'newsTime' : -1} });
      }
  }
)

Template.eachNews.events(
  //選擇新聞
  {'click' :
      function(e, ins) {
        var $news = $(ins.firstNode)
          , data  = this
          ;
        $news
          .addClass('selected')
          .closest('div.unAssignNewsList')
            .find('div.eachNews')
              .not($news)
                .removeClass('selected')
                .end()
              .end()
            .closest('div.wrapper')
              .find('div.topicList')
                .find('input.checkbox')
                  .each(function() {
                    var $checkbox = $(this);
                    if ( _.indexOf(data.topicId, $checkbox.attr('value')) === -1 ) {
                      $checkbox.prop('checked', false);
                    }
                    else {
                      $checkbox.prop('checked', true);
                    }
                  })
          ;

      }
  }
)