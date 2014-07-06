Meteor.subscribe('topic')

Template.topicList.helpers(
  {'topic' :
      function() {
        return DB.topic.find({'sort' : {'latestTime' : -1} });
      }
  }
)

Template.topicList.events(
  {'click' :
      function(e, ins) {
      }
  }
)