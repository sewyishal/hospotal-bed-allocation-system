const mongoose = require('mongoose');
const { BED_STATUS, BED_TYPES } = require('../utils/constants');

const bedSchema = new mongoose.Schema({
    bedId: {
        type: String,
        required: true,
        unique: true
    },
    wardNumber: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: Object.values(BED_TYPES),
        default: BED_TYPES.GENERAL
    },
    status: {
        type: String,
        enum: Object.values(BED_STATUS),
        default: BED_STATUS.FREE
    }
}, { timestamps: true });

module.exports = mongoose.model('Bed', bedSchema);
