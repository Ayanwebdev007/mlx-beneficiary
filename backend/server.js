const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB (mlx_beneficiaries_db)'))
    .catch(err => console.error('MongoDB connection error:', err));

// Models
const BeneficiarySchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true }, // State
    gender: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    comment: { type: String, default: '' },
    groupId: { type: Number, required: true, min: 1, max: 9 },
    createdAt: { type: Date, default: Date.now }
});
const Beneficiary = mongoose.model('Beneficiary', BeneficiarySchema);

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }
});
const User = mongoose.model('User', UserSchema);

const AdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' }
});
const Admin = mongoose.model('Admin', AdminSchema);

const ConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true }
});
const Config = mongoose.model('Config', ConfigSchema);

const GroupStatusSchema = new mongoose.Schema({
    groupId: { type: Number, required: true, unique: true },
    isTerminated: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    reason: { type: String, default: '' }
});
const GroupStatus = mongoose.model('GroupStatus', GroupStatusSchema);

// Auth Middleware
const auth = (role) => (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && (authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer ')) 
        ? authHeader.slice(7) 
        : authHeader;
    
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('--- AUTH DEBUG ---');
        console.log('Path:', req.path);
        console.log('Method:', req.method);
        console.log('Required Role:', role);
        console.log('Token Role:', decoded.role);
        console.log('------------------');

        if (role && String(decoded.role).toLowerCase() !== String(role).toLowerCase()) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET);
        res.json({ token, role: 'user' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET);
        res.json({ token, role: 'admin' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Beneficiary Routes (Protected)
app.get('/api/beneficiaries', auth(), async (req, res) => {
    try {
        const beneficiaries = await Beneficiary.find();
        res.json(beneficiaries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/beneficiaries', auth('admin'), async (req, res) => {
    const { groupId } = req.body;
    try {
        // Enforce 10 users per group limit
        const groupCount = await Beneficiary.countDocuments({ groupId });
        if (groupCount >= 10) {
            return res.status(400).json({ message: `Group ${groupId} is full (max 10 users)` });
        }

        const beneficiary = new Beneficiary(req.body);
        const newBeneficiary = await beneficiary.save();
        res.status(201).json(newBeneficiary);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/beneficiaries/:id', auth(), async (req, res) => {
    try {
        const beneficiary = await Beneficiary.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!beneficiary) return res.status(404).json({ message: 'Beneficiary not found' });
        res.json(beneficiary);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/beneficiaries/:id', auth('admin'), async (req, res) => {
    try {
        const beneficiary = await Beneficiary.findByIdAndDelete(req.params.id);
        if (!beneficiary) return res.status(404).json({ message: 'Beneficiary not found' });
        res.json({ message: 'Beneficiary deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin-only Route
app.get('/api/admin/stats', auth('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBeneficiaries = await Beneficiary.countDocuments();
        res.json({ totalUsers, totalBeneficiaries });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Config Routes
app.get('/api/config/:key', auth(), async (req, res) => {
    try {
        const config = await Config.findOne({ key: req.params.key });
        res.json(config || { key: req.params.key, value: 'NOT SET' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/config', auth('admin'), async (req, res) => {
    const { key, value } = req.body;
    try {
        const config = await Config.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
        res.json(config);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Group Status Routes
app.get('/api/group-status', auth(), async (req, res) => {
    try {
        const statuses = await GroupStatus.find();
        res.json(statuses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/group-status', auth('admin'), async (req, res) => {
    const { groupId, isTerminated, isHidden, reason } = req.body;
    try {
        const status = await GroupStatus.findOneAndUpdate(
            { groupId }, 
            { isTerminated, isHidden, reason }, 
            { upsert: true, new: true }
        );
        res.json(status);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Seed Initial Admin (for testing)
app.post('/api/admin/seed', async (req, res) => {
    try {
        const existing = await Admin.findOne({ email: 'admin@mlx.com' });
        if (existing) return res.status(400).json({ message: 'Admin already exists' });
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new Admin({ email: 'admin@mlx.com', password: hashedPassword });
        await admin.save();
        res.json({ message: 'Admin seeded: admin@mlx.com / admin123' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Seed Initial User (for testing)
app.post('/api/auth/seed', async (req, res) => {
    try {
        const existing = await User.findOne({ email: 'user@mlx.com' });
        if (existing) return res.status(400).json({ message: 'User already exists' });
        
        const hashedPassword = await bcrypt.hash('user123', 10);
        const user = new User({ email: 'user@mlx.com', password: hashedPassword });
        await user.save();
        res.json({ message: 'User seeded: user@mlx.com / user123' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
