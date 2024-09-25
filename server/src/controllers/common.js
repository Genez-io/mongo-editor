import dataAccessAdapter from '../db/dataAccessAdapter.js';

function listDatabases(req, res, next) {
  const adminDB = dataAccessAdapter.ConnectToDb('test').admin();
  adminDB.listDatabases({})
    .then(data => {
      if (!req.query.includeCollections) return res.send(data);
      const promises = data.databases.map(db => new Promise((resolve, reject) => {
        const database = dataAccessAdapter.ConnectToDb(db.name);
        database.listCollections().toArray()
          .then(collections => {
            collections = collections.filter(collection => !collection.name.startsWith('system.'));
            db.collections = collections.map(collection => { 
              return { name: collection.name, stats: collection.stats }
            }).sort(function(fir, sec) {
              if (fir.name < sec.name) return -1;
              if (fir.name > sec.name) return 1;
              return 0;
            });
            resolve();
          })
          .catch(reject);
      }));

      Promise.all(promises)
        .then(() => res.send(data))
        .catch(err => res.status(400).send(err.toString()));
    })
    .catch(next);
}

function listCollections(req, res, next) {
  const dbName = req.params.dbName;
  const db = dataAccessAdapter.ConnectToDb(dbName);
  db.listCollections().toArray()
    .then((collections) => {
      collections = collections.filter(collection => !collection.name.startsWith('system.'));

      let proms = collections.map(collection => {
        // Use the 'collStats' command to get statistics for each collection
        return db.command({ collStats: collection.name })
          .then(stats => ({ name: collection.name, stats: stats }));
      });

      Promise.all(proms)
        .then((connList) => {
          db.collections = connList;
          return res.send(db.collections);
        })
        .catch(err => res.status(400).send(err.toString()));
    })
    .catch(next);
}

function createCollection(req, res, next) {
  const dbName = req.body.database || req.params.dbName;
  const collectionName = req.body.collection;
  const db = dataAccessAdapter.ConnectToDb(dbName);
  db.createCollection(collectionName)
    .then(() => res.send({ message: `A new collection: ${collectionName} has been added to database: ${dbName}` }))
    .catch(next);
}

function dropCollection(req, res, next) {
  const dbName = req.body.database;
  const collectionName = req.body.collection;
  const db = dataAccessAdapter.ConnectToDb(dbName);
  db.collection(collectionName).drop()
    .then(() => res.send({ message: 'success' }))
    .catch(next);
}

export default {
  listDatabases,
  listCollections,
  createCollection,
  dropCollection,
}