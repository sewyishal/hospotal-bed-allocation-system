const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');

router.post('/register', patientController.registerPatient);
router.get('/queue', patientController.getWaitingQueue);
router.post('/:patientId/allocate', patientController.allocateMetric);
router.get('/', patientController.getAllPatients);
router.get('/:patientId', patientController.getPatient);

module.exports = router;
