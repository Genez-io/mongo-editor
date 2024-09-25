import express from 'express';
const router = express.Router({ mergeParams: true });

import documentCtrl from '../controllers/document.js';

router.use('/(:documentId)?', documentCtrl.middleware);

// findAll
router.get('/', documentCtrl.find);

// findById or findOne
router.get('(/:documentId)?', documentCtrl.findOne);

// filter
router.post('/filter', documentCtrl.filter);

// count
router.post('/count', documentCtrl.count);

// createOne
// router.post('/', documentCtrl.insertOne);

// createMany
router.post('/', documentCtrl.bulkWrite);

// updateOne
// router.patch('/(:documentId)?', documentCtrl.updateOne);

// replaceOne
router.put('/(:documentId)?', documentCtrl.replaceOne);

// deleteOne
router.post('/delete', documentCtrl.deleteOne);

// aggregations
router.post('/aggregate', documentCtrl.aggregate);

export default router;
