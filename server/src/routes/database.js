import express from 'express';
const router = express.Router({ mergeParams: true });

import commonCtrl from '../controllers/common.js';
import collectionsRoute from './collection.js';

// collection middleware
router.use('/:dbName/collections', collectionsRoute);

// returns all the databases available
router.get('/', commonCtrl.listDatabases);

export default router;
