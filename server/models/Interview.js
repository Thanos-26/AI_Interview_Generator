import mongoose from "mongoose"

const interviewSchema = new mongoose.Schema({
    userId: {
        type: String,           // "guest_123" or real user later
        required: true
    },

    role: {
        type: String,
        required: true
    },

    experience: {
        type: String,
        enum: ["Fresher", "Experienced"],
        required: true
    },

    type: {
        type: String,           // Technical / HR / Behavioral
        required: true
    },

    confidenceLevel: {
        type: Number,
        default: 0.5,
        min: 0,
        max: 1
    },

    status: {
        type: String,
        enum: ["active", "ended"],
        default: "active"
    }

}, { timestamps: true })

export default mongoose.model("Interview", interviewSchema)
