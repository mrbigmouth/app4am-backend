Meteor.methods(
  //將已存在的使用者設定為backend user
  {"setBackend" :
      function(userName) {
        var user;

        //已有其他backend user時, 檢查使用者是否backend user
        if (Meteor.users.find({"isBackend" : true}).count() > 0) {
          user = Meteor.users.findOne(this.userId);
          if (! user.isBackend) {
            return false;
          }
        }
        //無任何其他backend user存在時, 設定者自動成為backend
        else {
          Meteor.users.update(
            this.userId
          , {"$set" : {"isBackend" : true}
            }
          );
        }


        user = Meteor.users.findOne({"username" : userName});
        if (user) {
          Meteor.users.update(
            user._id
          , {"$set" : {"isBackend" : true}
            }
          );
        }
      }
  }
);
