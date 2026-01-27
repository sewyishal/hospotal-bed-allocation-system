require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dsaManager = require('./dsa/dsaManager');

const bedRoutes = require('./routes/bed.routes');
const patientRoutes = require('./routes/patient.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/beds', bedRoutes);
app.use('/api/patients', patientRoutes);

app.get('/', (req, res) => {
    res.send('Hospital Bed Allocation System API (DSA Focused)');
});

// Start Server
const startServer = async () => {
    try {
        // 1. Connect to Database
        await connectDB();
        
        // 2. Initialize DSA In-Memory Structures
        // This ensures the Heap and Hash Table are in sync with persisted data
        await dsaManager.initialize();

        // 3. Listen
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`DSA System Ready`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();