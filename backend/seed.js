require('dotenv').config();
const mongoose = require('mongoose');
const { BED_STATUS, PATIENT_STATUS, BED_TYPES } = require('./utils/constants');
const Bed = require('./models/Bed.model');
const Patient = require('./models/Patient.model');

// Connect Database
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital-bed-allocation');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        // 1. Clear existing data
        await Bed.deleteMany({});
        await Patient.deleteMany({});
        console.log('Data Cleared...');

        // 2. Create Beds (ALL OCCUPIED to start, forcing the Queue logic)
        // We create a "Shortage" scenario
        const beds = [
            // ICU Ward (Full)
            { bedId: 'ICU-101', wardNumber: 'ICU', type: BED_TYPES.ICU, status: BED_STATUS.OCCUPIED },
            { bedId: 'ICU-102', wardNumber: 'ICU', type: BED_TYPES.ICU, status: BED_STATUS.OCCUPIED },
            
            // General Ward (Full)
            { bedId: 'GEN-201', wardNumber: 'GEN', type: BED_TYPES.GENERAL, status: BED_STATUS.OCCUPIED },
            { bedId: 'GEN-202', wardNumber: 'GEN', type: BED_TYPES.GENERAL, status: BED_STATUS.OCCUPIED },
        ];

        await Bed.insertMany(beds);
        console.log('Beds Seeded (All Occupied)...');

        // 3. Create Patients
        // A. Admitted Patients (occupying the beds above)
        const admittedPatients = [
            { patientId: 'P-101', name: 'Alice (ICU)', severity: 8, requiredWard: 'ICU', status: PATIENT_STATUS.ADMITTED, assignedBedId: 'ICU-101' },
            { patientId: 'P-102', name: 'Bob (ICU)', severity: 7, requiredWard: 'ICU', status: PATIENT_STATUS.ADMITTED, assignedBedId: 'ICU-102' },
            { patientId: 'P-201', name: 'Charlie (Gen)', severity: 4, requiredWard: 'GEN', status: PATIENT_STATUS.ADMITTED, assignedBedId: 'GEN-201' },
            { patientId: 'P-202', name: 'Diana (Gen)', severity: 3, requiredWard: 'GEN', status: PATIENT_STATUS.ADMITTED, assignedBedId: 'GEN-202' },
        ];
        
        await Patient.insertMany(admittedPatients);
        console.log('Admitted Patients Seeded...');

        // B. Waiting Queue (The interesting part for DSA)
        // We mix severity to prove the Heap works.
        // Arrival Times are slightly staggered.
        const now = new Date();
        const waitingPatients = [
            // Low Severity, arrived earliest (should be last)
            { 
                patientId: 'Wait-1', 
                name: 'Low Priority Larry', 
                severity: 2, 
                requiredWard: 'ICU', 
                status: PATIENT_STATUS.WAITING, 
                assignedBedId: null,
                arrivalTime: new Date(now.getTime() - 10000) 
            },
            // High Severity, arrived later (should be FIRST)
            { 
                patientId: 'Wait-2', 
                name: 'Critical Carl', 
                severity: 9, 
                requiredWard: 'ICU', 
                status: PATIENT_STATUS.WAITING, 
                assignedBedId: null,
                arrivalTime: new Date(now.getTime() - 5000) 
            },
            // Medium Severity
            { 
                patientId: 'Wait-3', 
                name: 'Medium Mary', 
                severity: 5, 
                requiredWard: 'GEN', 
                status: PATIENT_STATUS.WAITING, 
                assignedBedId: null,
                arrivalTime: new Date(now.getTime()) 
            }
        ];

        await Patient.insertMany(waitingPatients);
        console.log('Waiting Queue Seeded (One Critical Patient Included)...');

        console.log('-----------------------------------');
        console.log('SEEDING COMPLETE');
        console.log('Scenario Created: All Beds Occupied. Queue contains Critical Carl (Sev 9).');
        console.log('Action: Run the server, then Release a bed (e.g., ICU-101).');
        console.log('Expectation: Critical Carl should automatically get that bed.');
        console.log('-----------------------------------');

        process.exit();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
