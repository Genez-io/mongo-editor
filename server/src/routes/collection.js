import express from 'express';
const router = express.Router({ mergeParams: true });

import commonCtrl from '../controllers/common.js';
import documentCtrl from '../controllers/document.js';
import documentsRoute from './document.js';

router.get('/:collectionName/stats', documentCtrl.stats);

// document middleware
router.use('/:collectionName/documents', documentsRoute);

// returns all the collections available in the specified database
router.get('/', commonCtrl.listCollections);

// create new collection
router.post('/', commonCtrl.createCollection);

// drop collection
router.post('/delete', commonCtrl.dropCollection);

export default router;
