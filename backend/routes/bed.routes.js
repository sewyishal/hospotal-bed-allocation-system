const express = require('express');
const router = express.Router();
const bedController = require('../controllers/bed.controller');

router.post('/', bedController.addBed);
router.get('/', bedController.getAllBeds);
router.patch('/:bedId/status', bedController.updateBedStatus);

module.exports = router;
