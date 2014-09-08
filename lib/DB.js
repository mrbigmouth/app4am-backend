DB =
  {"users" : Meteor.users
  ,"news"  : new Meteor.Collection("News", {"idGeneration" : "MONGO"})
  ,"topic" : new Meteor.Collection("Topic", {"idGeneration" : "MONGO"})
  }

if (Meteor.isServer) {
  Meteor.methods(
    {"dbInsert" :
        function(dbName, document) {
          var db     = DB[dbName]
            , mongo  = Package.mongo.MongoInternals.NpmModule
            , userId = this.userId
            , denyRule
            , result
            , undefined
            ;

          if (! db) {
            throw new Meteor.Error(403, "Access denied because db [" + dbName + "] is not exist!");
          }
          result =
            _.some(db._validators.insert.allow, function(fn) {
              return fn.call(db, userId, document);
            });

          if (! result) {
            throw new Meteor.Error(403, "Access denied because no allow rule pass!");
          }

          result =
            _.every(db._validators.insert.deny, function(fn) {
              denyRule = fn.toString();
              return ! fn.call(db, userId, document);
            });

          if (! result) {
            throw new Meteor.Error(403, "Access denied because can\" pass deny rule!", denyRule);
          }

          if (document._id === undefined) {
            document._id = new Meteor.Collection.ObjectID( new mongo.ObjectID().toHexString().toString() );
          }
          db.insert(document);

          return true;
        }
    }
  )
}