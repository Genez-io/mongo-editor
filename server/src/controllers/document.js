import mongodb from 'mongodb';
import { EJSON } from 'bson';
import Model from '../models/index.js';
const ObjectID = mongodb.ObjectID;

const getModel = async (req) => {
  const dbName = req.params.dbName;
  const collectionName = req.params.collectionName;
  const model = new Model();
  await model.init(req, dbName, collectionName);
  return model;
};

const sendResponse = (dbOperation, req, res, next) => {
  dbOperation
    .then((data) => {
      if (req.query.ContentType === 'ejson')
        data = JSON.stringify(EJSON.serialize(data));
      res.send(data);
    })
    .catch((err) => res.status(400).send(err.toString()));
};

function middleware(req, res, next) {
  try {
    req.body =
      req.query.incomingType === 'ejson' ?
        EJSON.deserialize(req.body) :
        req.body;
    if (!(req.body instanceof Array)) {
      req.documentId =
        req.body._id === null ?
          null :
          req.body._id || req.params.documentId || ObjectID();
      if (req.documentId === 'filter') req.documentId = '';
    }
    next();
  } catch (err) {
    res.status(400).send(err.toString());
  }
}

async function find(req, res, next) {
  const model = await getModel(req);
  const filter = req.body || {};
  const options = req.query || {};
  const dbOperation = model.find(filter, options).toArray();
  sendResponse(dbOperation, req, res, next);
}

async function findOne(req, res, next) {
  const model = await getModel(req);
  const documentId = req.documentId;
  const query = documentId ? {_id: documentId} : {};
  const dbOperation = model.findOne(query);
  sendResponse(dbOperation, req, res, next);
}

// function insertOne(req, res, next) {
//   const body = req.body;
//   const model = getModel(req);
//   const dbOperation = model.insertOne(body);
//   sendResponse(dbOperation, req, res, next);
// }

async function bulkWrite(req, res, next) {
  const body = Array.isArray(req.body) ? req.body : [req.body];
  const operations = [];
  body.forEach((document) => {
    document._id =
      document._id === null ?
        null :
        document._id || req.documentId || ObjectID();
    operations.push({
      replaceOne: {
        filter: {
          _id: document._id,
        },
        replacement: document,
        upsert: true,
      },
    });
  });
  const model = await getModel(req);
  const dbOperation = model.bulkWrite(operations);
  sendResponse(dbOperation, req, res, next);
}

// function updateOne(req, res, next) {
//   const model = getModel(req);
//   const documentId = req.documentId;
//   const dbOperation = model.updateOne({ _id: documentId }, { $set: req.body });
//   sendResponse(dbOperation, req, res, next);
// }

async function replaceOne(req, res, next) {
  const model = await getModel(req);
  const documentId = req.documentId;
  const dbOperation = model.replaceOne({_id: documentId}, req.body);
  sendResponse(dbOperation, req, res, next);
}

async function deleteOne(req, res, next) {
  const model = await getModel(req);
  const documentId = req.documentId;
  const dbOperation = model.deleteOne({_id: documentId});
  sendResponse(dbOperation, req, res, next);
}

const filter = async (req, res, next) => {
  let query = {};
  try {
    const model = await getModel(req);
    query = req.body || {};
    const options = req.query || {};
    const skip = Number(options.skip) || 0;
    const documentId = req.documentId;
    if (documentId) query._id = documentId;
    const documents = await model.find(query, options).toArray();
    const count = await model.countDocuments(query, options);
    // const [documents, count] = await Promise.all([getDocuments, getCount])
    let data = {
      documents,
      count,
      from: skip + 1,
      to: skip + documents.length,
      query,
    };
    if (req.query.ContentType === 'ejson')
    data = EJSON.stringify(data, {relaxed: false});
    res.send(data);
  } catch (err) {
    if (req.query.queryType === 'prompt') err.message = 'Please improve the prompt';
    return next(err);
  }
}

async function stats(req, res, next) {
  const model = await getModel(req);
  const dbOperation = model.stats();
  sendResponse(dbOperation, req, res, next);
}

async function count(req, res, next) {
  const model = await getModel(req);
  const query = req.body || {};
  const options = req.query || {};
  const dbOperation = model.countDocuments(query, options);
  dbOperation
    .then((data) => {
      data = JSON.parse('{"count" : ' + data + ' }');
      if (req.query.ContentType === 'ejson')
        data = JSON.stringify(EJSON.serialize(data));
      res.send(data);
    })
    .catch((err) => res.status(400).send(err.toString()));
}

async function aggregate(req, res, next) {
  const model = await getModel(req);
  const query = req.body || [];
  const dbOperation = model.aggregate(query).toArray();
  sendResponse(dbOperation, req, res, next);
}

export default {
  middleware,
  find,
  findOne,
  filter,
  // insertOne,
  bulkWrite,
  // updateOne,
  replaceOne,
  deleteOne,
  stats,
  count,
  aggregate,
};
