import { MongoClient } from 'mongodb';

class DataBase {
  constructor() {}

  static connections = {};

  static async GetDB(authToken, dbId) {
    if (!this.connections[authToken])
      this.connections[authToken] = {};
    if (this.connections[authToken][dbId])
      return this.connections[authToken][dbId];

    const requestUrl = 'https://'+process.env.API_URL+'/databases/' + dbId;
    const requestHeaders = {
      'Authorization': 'Bearer ' + authToken,
      'Accept-Version': 'genezio-webapp/0.3.0'
    };
  
    const response = await fetch(requestUrl, {headers: requestHeaders});
  
    if (!response.ok) {
      // Handle HTTP errors
      console.error(requestUrl, requestHeaders);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
   
    const data = await response.json();

    this.connections[authToken][dbId] = await MongoClient.connect(data.connectionUrl);
    this.connections[authToken][dbId].dbName = data.connectionUrl.replace(/^.*\//, '');

    return this.connections[authToken][dbId];
  }

  static async ConnectToDb(req, dbName) {
    const authToken = req.headers.authorization?.split(' ')[1];
    if (!authToken) {
      throw new Error('No authorization token provided');
    }

    const dbId = req.headers['db-id'];
    if (!dbId) {
      throw new Error('No database name provided');
    }
    const dbConn = await this.GetDB(authToken, dbId);
    const dbConnName = dbConn.db(dbName);
    dbConnName.dbName = dbConn.dbName;

    return dbConnName;
  }

  static async ConnectToCollection(req, dbName, collectionName) {
    const authToken = req.headers.authorization?.split(' ')[1];
    if (!authToken) {
      throw new Error('No authorization token provided');
    }

    const dbId = req.headers['db-id'];
    if (!dbId) {
      throw new Error('No database name provided');
    }

    const dbConn = await this.GetDB(authToken, dbId);
    return dbConn.db(dbName).collection(collectionName);
  }

}

export default DataBase;