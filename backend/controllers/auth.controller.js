const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { logActivity } = require('./activity.controller');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d'
    });
};

// Seed Admin (Called on server start)
exports.seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ username: 'Admin' });
        if (!adminExists) {
            const admin = new User({
                username: 'Admin',
                password: 'Admin123',
                role: 'ADMIN',
                isApproved: true
            });
            await admin.save();
            console.log("Admin Seeding: Super Admin 'Admin' created.");
        }
    } catch (error) {
        console.error("Admin Seeding Failed:", error);
    }
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
    const { username, password, nurseId } = req.body;

    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create Nurse (Admin can't signup via API)
        const user = await User.create({
            username,
            password,
            nurseId,
            role: 'NURSE',
            isApproved: false // Requires approval
        });

        if (user) {
            res.status(201).json({
                message: 'Signup successful. Please wait for Admin approval.'
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            if (!user.isApproved) {
                return res.status(401).json({ message: 'Account not approved yet' });
            }

            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                nurseId: user.nurseId,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/auth/pending-nurses (Admin only)
exports.getPendingNurses = async (req, res) => {
    try {
        const nurses = await User.find({ role: 'NURSE', isApproved: false }).select('-password');
        res.json(nurses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/auth/approve/:id (Admin only)
// ... (keep other imports and functions as they were)

// PATCH /api/auth/approve/:id (Admin only)
exports.approveNurse = async (req, res) => {
    try {
        // FIX: Use findByIdAndUpdate instead of user.save() 
        // This prevents the password from being double-hashed by the pre-save middleware
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        ).select('-password'); 

        const adminName = req.user ? req.user.username : 'Admin';

        if (user) {
            logActivity('NURSE_APPROVED', `Nurse ${user.username} approved by ${adminName}`, adminName, { nurseId: user.nurseId });
            res.json({ message: `Nurse ${user.username} approved`, user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};