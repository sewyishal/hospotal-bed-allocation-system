const mongoose = require('mongoose');
const { PATIENT_STATUS } = require('../utils/constants');

const patientSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    severity: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    requiredWard: {
        type: String,
        required: true
    },
    arrivalTime: {
        type: Date,
        default: Date.now
    },
    assignedBedId: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: Object.values(PATIENT_STATUS),
        default: PATIENT_STATUS.WAITING
    }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
