const Patient = require('../models/Patient.model');
const Bed = require('../models/Bed.model');
const dsaManager = require('../dsa/dsaManager');

// POST /api/patients/register
exports.registerPatient = async (req, res) => {
    try {
        const { patientId, name, severity, requiredWard } = req.body;

        // 1. Process Admission via DSA
        const decision = dsaManager.processPatientAdmission({
            patientId,
            name,
            severity,
            requiredWard,
            arrivalTime: new Date()
        });

        const { patient, bed, action } = decision;

        // 2. Persist Patient
        const newPatient = new Patient(patient);
        await newPatient.save();

        // 3. Persist Bed Update (if assigned)
        if (bed) {
            await Bed.findOneAndUpdate(
                { bedId: bed.bedId },
                { status: bed.status }
            );
        }

        res.status(201).json({
            message: action === 'ADMITTED' ? 'Patient Admitted' : 'Patient Added to Waiting Queue',
            details: decision
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/patients/queue
exports.getWaitingQueue = (req, res) => {
    // Return the Priority Queue as array
    const queue = dsaManager.getQueueStatus();
    res.json(queue);
};

// GET /api/patients/:patientId
exports.getPatient = async (req, res) => {
    try {
        const patient = await Patient.findOne({ patientId: req.params.patientId });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.allocateMetric = async (req, res) => {
    try {
        const result = dsaManager.manualAllocation(req.params.patientId);
        
        if (result.success) {
             await Patient.findOneAndUpdate(
                { patientId: result.patient.patientId },
                { 
                    status: result.patient.status,
                    assignedBedId: result.patient.assignedBedId 
                }
            );

            await Bed.findOneAndUpdate(
                { bedId: result.bed.bedId },
                { status: result.bed.status }
            );

            return res.json({ message: "Patient manually assigned to bed", ...result });
        }

        res.status(400).json({ message: result.message });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllPatients = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const patients = await Patient.find(query);
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
