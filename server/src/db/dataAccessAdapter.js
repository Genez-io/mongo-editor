import { MongoClient } from 'mongodb';

class DataBase {
  constructor() {}

  static GetDB() {
    if (typeof DataBase.mongo === 'undefined') {
      DataBase.InitDB();
    }
    return DataBase.mongo;
  }

  static InitDB(app) {
    const url = process.env.URL || 'mongodb://localhost:27017';
  
    console.log(`> Connecting to mongoDB @ ${url}`);
    MongoClient.connect(url)
      .then(client => {
        if (!client) {
          console.log('> Failed to connect mongoDB -  no client');
          process.exit();
        }
        else {
          console.log('> Connected');
          DataBase.mongo = client;
          if (app) app.emit('connectedToDB');
        }
      }).catch(err => {
        console.log(`> Failed to connect mongoDB - ${err}`);
        process.exit();
      });
  }

  static ConnectToDb(dbName) {
    return this.GetDB().db(dbName);
  }

  static ConnectToCollection(dbName, collectionName) {
    return this.GetDB().db(dbName).collection(collectionName);
  }

  static Disconnect () {
    return this.GetDB().close();
  }
}

export default DataBase;