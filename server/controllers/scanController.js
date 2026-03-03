import Scan from '../models/Scan.js';

// @desc    Get user scans
// @route   GET /api/scans
// @access  Private
const getScans = async (req, res) => {
    try {
        const scans = await Scan.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(scans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new scan record
// @route   POST /api/scans
// @access  Private
const createScan = async (req, res) => {
    const { imageUrl, diagnosis, confidence } = req.body;

    if (!imageUrl || !diagnosis || !confidence) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const scan = await Scan.create({
            user: req.user.id,
            imageUrl,
            diagnosis,
            confidence,
        });

        res.status(201).json(scan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getScans, createScan };
