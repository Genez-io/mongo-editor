import dataAccessAdapter from '../db/dataAccessAdapter.js';

class Model {
  constructor() {
  }

  async init(req, dbName, collectionName) {
    this.collection = await dataAccessAdapter.ConnectToCollection(
      req,
      dbName,
      collectionName
    );
  }

  find(query, filter = {}) {
    let records = this.collection.find(query);
    if (filter.limit) {
      records = records.limit(+filter.limit);
    }
    if (filter.skip) {
      records = records.skip(+filter.skip);
    }
    return records;
  }

  findOne(query) {
    return this.collection.findOne(query);
  }

  // insertOne(data) {
  //   return this.collection.insertOne(data);
  // }

  bulkWrite(data) {
    return this.collection.bulkWrite(data);
  }

  // updateOne(query, data) {
  //   return this.collection.updateOne(query, data);
  // }

  aggregate(query) {
    return this.collection.aggregate(query);
  }

  replaceOne(query, data) {
    return this.collection.replaceOne(query, data);
  }

  deleteOne(query) {
    return this.collection.deleteOne(query);
  }

  countDocuments(query, options) {
    return this.collection.countDocuments(query, options);
  }

  stats() {
    return this.collection.stats();
  }
}

export default Model;
