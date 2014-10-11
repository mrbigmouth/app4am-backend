Meteor.loginAs =
    function(user) {
      Accounts.callLoginMethod(
        {"methodArguments" : [ {"method" : "loginAs", "user" : user} ]
        ,"userCallback"    : function() { console.log(arguments); }
        }
      );
    };

Accounts.ui.config(
  {"passwordSignupFields" : "USERNAME_AND_OPTIONAL_EMAIL"
  }
);