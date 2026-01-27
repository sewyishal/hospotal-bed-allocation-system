const bedStore = require('./bedStore');
const patientQueue = require('./patientQueue');
const greedyAllocator = require('./greedyAllocator');
const searchUtils = require('./searchUtils');
const { BED_STATUS, PATIENT_STATUS } = require('../utils/constants');

// Models for initialization only
const Bed = require('../models/Bed.model');
const Patient = require('../models/Patient.model');

class DSAManager {
    
    // Initialize in-memory structures from Database
    async initialize() {
        console.log("Initializing DSA Manager...");
        try {
            // Load Beds
            const beds = await Bed.find({});
            beds.forEach(bed => bedStore.addBed(bed.toObject()));
            console.log(`Loaded ${beds.length} beds into BedStore Hash Table.`);

            // Load Waiting Patients
            // Only load WAITING patients into the Priority Queue
            const waitingPatients = await Patient.find({ status: PATIENT_STATUS.WAITING });
            waitingPatients.forEach(p => patientQueue.enqueue(p.toObject()));
            console.log(`Loaded ${waitingPatients.length} patients into Priority Queue.`);
            
        } catch (error) {
            console.error("Initialization failed:", error);
            process.exit(1);
        }
    }

    // 1. Admit / Register Patient
    processPatientAdmission(patientData) {
        // Prepare patient object
        const patient = { ...patientData };

        // Step A: Check available beds using Greedy Algorithm
        // Get all beds as array for the allocator
        const allBeds = bedStore.getAllBeds(); 
        const bestBed = greedyAllocator.findBestBed(allBeds, patient.requiredWard);

        if (bestBed) {
            // Bed Found - Immediate Assignment
            console.log(`DSA: Bed found for patient ${patient.name}. Assigning Bed ${bestBed.bedId}.`);
            
            // Update In-Memory Bed Status
            bestBed.status = BED_STATUS.OCCUPIED;
            bedStore.updateBedStatus(bestBed.bedId, BED_STATUS.OCCUPIED);

            // Update Patient Status
            patient.status = PATIENT_STATUS.ADMITTED;
            patient.assignedBedId = bestBed.bedId;

            return {
                action: 'ADMITTED',
                patient: patient,
                bed: bestBed
            };
        } else {
            // No Bed Found - Enqueue
            console.log(`DSA: No bed found for patient ${patient.name}. Adding to Priority Queue.`);
            
            patient.status = PATIENT_STATUS.WAITING;
            patient.assignedBedId = null;
            patientQueue.enqueue(patient);

            return {
                action: 'QUEUED',
                patient: patient,
                bed: null
            };
        }
    }

    // 2. Release Bed
    processBedRelease(bedId) {
        if (!bedStore.hasBed(bedId)) {
            throw new Error(`Bed ${bedId} not found in store.`);
        }

        const bed = bedStore.getBed(bedId);
        
        // Mark Bed as Free
        bed.status = BED_STATUS.FREE;
        bedStore.updateBedStatus(bedId, BED_STATUS.FREE);
        
        // No explicit add back to allocator needed for stateless Greedy approach
        
        let allocatedPatient = null;

        // Check Queue for automatic assignment
        if (!patientQueue.isEmpty()) {
             // FIX: Search for the highest priority patient who MATCHES the bed type.
             const tempBuffer = [];
             let matchFound = null;

             while (!patientQueue.isEmpty()) {
                 const p = patientQueue.dequeue();
                 
                 // Check compatibility
                 if (p.requiredWard === bed.type) {
                     matchFound = p;
                     break;
                 } else {
                     tempBuffer.push(p);
                 }
             }

             // Put back the non-matching patients
             for (const p of tempBuffer) {
                 patientQueue.enqueue(p);
             }

             if (matchFound) {
                 const patient = matchFound;
                 console.log(`DSA: Bed ${bedId} released. Assigning to waiting patient ${patient.name} (Req: ${patient.requiredWard}).`);

                 patient.status = PATIENT_STATUS.ADMITTED;
                 patient.assignedBedId = bedId;
                 
                 // Bed becomes occupied again
                 bed.status = BED_STATUS.OCCUPIED;
                 bedStore.updateBedStatus(bedId, BED_STATUS.OCCUPIED);

                 allocatedPatient = patient;
             }
        }

        return {
            bed: bed,
            allocatedPatient: allocatedPatient
        };
    }

    // 3. Add New Bed (Runtime)
    addNewBed(bedData) {
        bedStore.addBed(bedData);
        // If the new bed is FREE, it's effectively the same as releasing a bed
        // We might want to see if any patient waits for it.
        // We can reuse processBedRelease logic or part of it.
        if (bedData.status === BED_STATUS.FREE) {
            return this.processBedRelease(bedData.bedId);
        }
        return { bed: bedData, allocatedPatient: null };
    }

    getAllBeds() {
        return bedStore.getAllBeds();
    }

    manualAllocation(patientId) {
        const queueArray = patientQueue.toArray();
        const patientData = queueArray.find(p => p.patientId === patientId);

        if (!patientData) {
            throw new Error('Patient not found in waiting queue');
        }

        const allBeds = bedStore.getAllBeds(); 
        const bestBed = greedyAllocator.findBestBed(allBeds, patientData.requiredWard);

        if (bestBed) {
             patientQueue.remove(patientId);

             patientData.status = PATIENT_STATUS.ADMITTED;
             patientData.assignedBedId = bestBed.bedId;
             
             bestBed.status = BED_STATUS.OCCUPIED;
             bedStore.updateBedStatus(bestBed.bedId, BED_STATUS.OCCUPIED);

             return {
                 success: true,
                 patient: patientData,
                 bed: bestBed
             };
        } else {
            return {
                success: false,
                message: 'No suitable bed found'
            };
        }
    }


    getQueueStatus() {
        return patientQueue.toArray();
    }

    searchBeds(criteria) {
        return searchUtils.searchBeds(bedStore.getAllBeds(), criteria);
    }
}

module.exports = new DSAManager();
