import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interview",
    required: true
  },

  role: {
    type: String,
    enum: ["ai", "user"],
    required: true
  },

  content: {
    type: String,
    required: true
  },

  score: {
    type: Number,       // only for AI evaluation messages
    min: 0,
    max: 10
  },

  feedback: {
    type: String        // per-question feedback
  },

  nervous: {
    type: Boolean       // detected by AI
  }

}, { timestamps: true })

export default mongoose.model("Message", messageSchema)
