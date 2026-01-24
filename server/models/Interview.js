import mongoose from "mongoose"

// const interviewSchema = new mongoose.Schema({
//     userId: {
//         type: String,           // "guest_123" or real user later
//         required: true
//     },

//     role: {
//         type: String,
//         required: true
//     },

//     experience: {
//         type: String,
//         enum: ["Fresher", "Experienced"],
//         required: true
//     },

//     type: {
//         type: String,           // Technical / HR / Behavioral
//         required: true
//     },

//     confidenceLevel: {
//         type: Number,
//         default: 0.5,
//         min: 0,
//         max: 1
//     },

//     status: {
//         type: String,
//         enum: ["active", "ended"],
//         default: "active"
//     }

// }, { timestamps: true })

const interviewSchema = new mongoose.Schema({
    userId: String,
    role: String,
    experience: String,
    type: String,

    confidenceLevel: {
        type: Number,
        default: 0.5
    },
    
    // NEW (AI memory)
    strengths: [String],
    weaknesses: [String],
    confidenceTrend: {
        type: String,
        enum: ["improving", "declining", "stable"],
        default: "stable"
    },

    status: {
        type: String,
        enum: ["active", "ended"],
        default: "active"
    },

    // Analysis results (populated after interview ends)
    averageScore: {
        type: Number,
        min: 0,
        max: 100
    },
    summary: {
        type: String
    },
    startedAt: {
  type: Date,
  default: Date.now
},
deadlineAt: {
  type: Date,
  required: true
},

    strongTopics: [String],
    weakTopics: [String],
    suggestions: [String]
}, { timestamps: true })

export default mongoose.model("Interview", interviewSchema)