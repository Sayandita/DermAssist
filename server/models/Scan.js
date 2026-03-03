import mongoose from 'mongoose';

// Scan Schema to store history of AI diagnoses
const scanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    imageUrl: {
        type: String,
        required: true,
    },
    diagnosis: {
        type: String,
        required: true,
    },
    confidence: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true, // This adds createdAt and updatedAt
});

const Scan = mongoose.model('Scan', scanSchema);
export default Scan;
