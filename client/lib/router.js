Router.map(function() {
  //首頁
  this.route(
    "assign"
  , {"path"   : '/'
    ,"waitOn" :
        function() {
          return [
            Meteor.subscribe("unAssignNews", new Date())
          ]
        }
    }
  );
});