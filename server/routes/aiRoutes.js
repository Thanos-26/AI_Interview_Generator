import Groq from "groq-sdk"
import express from "express"
import mongoose from "mongoose";
import Interview from "../models/Interview.js"
import Message from "../models/Message.js";


const router = express.Router();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
})

// function buildPrompt(interview, history, userAnswer) {
//     return `
// You are a professional technical interviewer.

// Role: ${interview.role}
// Experience: ${interview.experience}
// Interview type: ${interview.type}

// Previous Q&A:
// ${history.map(h =>
//         `Q: ${h.role === "ai" ? h.content : ""}\nA: ${h.role === "user" ? h.content : ""}\nScore: ${h.score || "N/A"}`
//     ).join("\n")}

// Current answer:
// "${userAnswer}"

// Tasks:
// 1. Evaluate the current answer (0-10)
// 2. Give 1-sentence feedback
// 3. Detect nervousness (true/false)
// 4. Ask next question (adaptive)

// Return ONLY valid JSON in this format:
// {
//   "score": number,
//   "feedback": string,
//   "nervous": boolean,
//   "nextQuestion": string
// }
// `
// }


// function buildPrompt(session, userAnswer) {
//     return `
// You are a professional technical interviewer.

// Role: ${session.role}
// Experience: ${session.experience}
// Interview type: ${session.type}

// Previous Q&A:
// ${session.history.map(h =>
//         `Q: ${h.question}\nA: ${h.answer}\nScore: ${h.score}`
//     ).join("\n")}

// Current answer:
// "${userAnswer}"

// Tasks:
// 1. Evaluate answer (0-10)
// 2. Give 1-sentence feedback
// 3. Detect nervousness (true/false)
// 4. Ask next question (adaptive)

// Return JSON:
// {
//   "score": number,
//   "feedback": string,
//   "nervous": boolean,
//   "nextQuestion": string
// }
// `
// }

function buildPrompt(interview, recentHistory, userAnswer) {
  return `
You are a professional technical interviewer.

Role: ${interview.role}
Experience: ${interview.experience}
Interview type: ${interview.type}

Candidate memory:
Strengths: ${(interview.strengths || []).join(", ") || "none"}
Weaknesses: ${(interview.weaknesses || []).join(", ") || "none"}
Confidence trend: ${interview.confidenceTrend || "stable"}

Recent Q&A:
${recentHistory.map(h =>
  `Q: ${h.role === "ai" ? h.content : ""}
A: ${h.role === "user" ? h.content : ""}
Score: ${h.score || "N/A"}`
).join("\n")}

Current answer:
"${userAnswer}"

Tasks:
1. Evaluate the current answer (0-100)
2. Give 1-sentence feedback
3. Detect nervousness (true/false)
4. Ask next question (adaptive)

Return ONLY valid JSON:
{
  "score": number,
  "feedback": string,
  "nervous": boolean,
  "nextQuestion": string
}
`
}


router.post("/start-interview", async (req, res) => {
    console.log(req.body);
    const userId = Math.random();

    const interview = await Interview.create({
        userId,
        role: req.body.role,
        experience: req.body.experience,
        type: req.body.type,
        confidenceLevel: 0.5,
        status: "active"
    })

    const firstQuestion = "Tell me about yourself."

    await Message.create({
        interviewId: interview._id,
        role: "ai",
        content: firstQuestion
    })

    res.json({
        interviewId: interview._id,
        question: firstQuestion
    })
});

router.get('/', (req, res) => res.send("AI"))
// router.post("/next-question", async (req, res) => {
//     const { interviewId, answer } = req.body

//     const interview = await Interview.findById(interviewId)
//     const history = await Message.find({ interviewId }).sort("createdAt")
//     // console.log(history);
//     const prompt = buildPrompt(interview, history, answer)

//     const completion = await groq.chat.completions.create({
//         model: "llama-3.3-70b-versatile",
//         messages: [{ role: "user", content: prompt }]
//     })

//     const ai = JSON.parse(completion.choices[0].message.content)

//     await Message.create({
//         interviewId,
//         role: "user",
//         content: answer
//     })

//     await Message.create({
//         interviewId,
//         role: "ai",
//         content: ai.nextQuestion,
//         score: ai.score,
//         feedback: ai.feedback,
//         nervous: ai.nervous
//     })

//     if (ai.nervous) interview.confidenceLevel -= 0.1
//     else interview.confidenceLevel += 0.05

//     await interview.save()

//     res.json({
//         question: ai.nextQuestion,
//         feedback: {
//             score: ai.score,
//             comment: ai.feedback
//         }
//     })
// })

router.post("/next-question", async (req, res) => {
  const { interviewId, answer } = req.body

  const interview = await Interview.findById(interviewId)
  const history = await Message.find({ interviewId }).sort("createdAt")

  // Sliding window (last 6 messages)
  const recentHistory = history.slice(-6)

  const prompt = buildPrompt(interview, recentHistory, answer)

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "Reply ONLY in valid JSON." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7
  })

  const ai = JSON.parse(completion.choices[0].message.content)
  console.log(ai);
  // Save user answer
  await Message.create({
    interviewId,
    role: "user",
    content: answer
  })

  // Save AI question + evaluation
  await Message.create({
    interviewId,
    role: "ai",
    content: ai.nextQuestion,
    score: ai.score,
    feedback: ai.feedback,
    nervous: ai.nervous
  })

  // ---- LONG TERM MEMORY UPDATE ----

  if (ai.score < 50) {
    interview.weaknesses = [...new Set([
      ...(interview.weaknesses || []),
      "Needs clearer explanations"
    ])]
  }

  if (ai.score > 70) {
    interview.strengths = [...new Set([
      ...(interview.strengths || []),
      "Good conceptual understanding"
    ])]
  }

  interview.confidenceTrend =
    ai.nervous ? "declining" :
    interview.confidenceTrend === "declining" ? "stable" :
    "improving"

  // Confidence numeric
  if (ai.nervous) interview.confidenceLevel -= 0.1
  else interview.confidenceLevel += 0.05

  await interview.save()
  // console.log(ai.nextQuestion);
  res.json({
    question: ai.nextQuestion,
    feedback: {
      score: ai.score,
      comment: ai.feedback
    }
  })
})



export default router;

// app.post("/ai/next-question", async (req, res) => {
//     const { sessionId, answer } = req.body
//     const session = sessions[sessionId]

//     const prompt = buildPrompt(session, answer)

//     const completion = await groq.chat.completions.create({
//         model: "llama-3.3-70b-versatile",
//         messages: [{ role: "user", content: prompt }],
//         temperature: 0.7
//     })

//     const ai = JSON.parse(completion.choices[0].message.content)

//     session.history.push({
//         question: session.lastQuestion,
//         answer,
//         score: ai.score,
//         notes: ai.feedback
//     })

//     if (ai.nervous) session.confidenceLevel -= 0.1
//     else session.confidenceLevel += 0.05

//     session.lastQuestion = ai.nextQuestion

//     res.json({
//         question: ai.nextQuestion,
//         feedback: {
//             score: ai.score,
//             verdict: ai.score > 7 ? "Good" : ai.score > 4 ? "Average" : "Needs Improvement",
//             comment: ai.feedback
//         }
//     })
// })
