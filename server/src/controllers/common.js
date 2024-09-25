import dataAccessAdapter from '../db/dataAccessAdapter.js';

async function listDatabases(req, res, next) {
  try {
    const adminDB = (await dataAccessAdapter.ConnectToDb(req, 'test')).admin();
  } catch (error) {  
    res.status(400).send("Error connecting to the database");  
    return next();
  }
  adminDB.listDatabases({})
    .then(data => {
      if (!req.query.includeCollections) return res.send(data);
      const promises = data.databases.map(db => new Promise(async (resolve, reject) => {
        try {
          const database = await dataAccessAdapter.ConnectToDb(req, db.name);
        } catch (error) {    
          res.status(400).send("Error connecting to the database");  
          return next();
        }
      
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

async function listCollections(req, res, next) {
  const dbName = req.params.dbName;
  try {
    const db = await dataAccessAdapter.ConnectToDb(req, dbName);
  } catch (error) {    
    res.status(400).send("Error connecting to the database");  
    return next();
  }

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

async function createCollection(req, res, next) {
  const dbName = req.body.database || req.params.dbName;
  const collectionName = req.body.collection;
  try {
    const db = await dataAccessAdapter.ConnectToDb(req, dbName);
  } catch (error) {   
    res.status(400).send("Error connecting to the database");  
    return next(); 
  }

  db.createCollection(collectionName)
    .then(() => res.send({ message: `A new collection: ${collectionName} has been added to database: ${dbName}` }))
    .catch(next);
}

async function dropCollection(req, res, next) {
  const dbName = req.body.database;
  const collectionName = req.body.collection;
  try {
    const db = await dataAccessAdapter.ConnectToDb(req, dbName);
  } catch (error) {    
    res.status(400).send("Error connecting to the database");  
    return next();
  }

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