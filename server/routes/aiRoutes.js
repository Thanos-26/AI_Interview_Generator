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

// Analyze interview after completion
router.post("/analyze-interview", async (req, res) => {
  try {
    const { interviewId } = req.body

    const interview = await Interview.findById(interviewId)
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" })
    }

    // Get all messages for this interview
    const messages = await Message.find({ interviewId }).sort("createdAt")
    
    // Calculate average score from all AI messages that have scores
    const scores = messages
      .filter(m => m.role === "ai" && m.score !== null && m.score !== undefined)
      .map(m => m.score)
    
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0

    // Build Q&A pairs for analysis
    const qaPairs = []
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === "ai" && i + 1 < messages.length && messages[i + 1].role === "user") {
        qaPairs.push({
          question: messages[i].content,
          answer: messages[i + 1].content,
          score: messages[i].score
        })
      }
    }

    // Handle case where interview was ended early (few or no Q&A pairs)
    const isEarlyEnd = qaPairs.length === 0 || qaPairs.length < 3
    const contextNote = isEarlyEnd 
      ? "\nNote: This interview was ended early. Provide feedback based on the available responses, even if limited."
      : ""

    // Build analysis prompt
    const analysisPrompt = `
You are an expert interview analyst. Analyze the following interview session and provide comprehensive feedback.

Interview Details:
- Role: ${interview.role}
- Experience Level: ${interview.experience}
- Interview Type: ${interview.type}
${contextNote}

Question & Answer Pairs with Scores:
${qaPairs.length > 0 
  ? qaPairs.map((qa, idx) => `
${idx + 1}. Question: ${qa.question}
   Answer: ${qa.answer}
   Score: ${qa.score !== null && qa.score !== undefined ? qa.score : 'N/A'}/100
`).join("\n")
  : "No complete Q&A pairs available yet."
}

Average Score: ${averageScore}/100
Total Questions Answered: ${qaPairs.length}

Tasks:
1. Write a brief summary (2-3 sentences) of the overall interview performance${isEarlyEnd ? " so far" : ""}
2. Identify strong topics/concepts where the candidate performed well (provide 2-5, or fewer if limited data)
3. Identify weak topics/concepts where the candidate needs improvement (provide 2-5, or fewer if limited data)
4. Provide actionable suggestions on how to overcome errors and improve (provide 2-5 suggestions)

Return ONLY valid JSON in this format:
{
  "summary": "string (2-3 sentences)",
  "strongTopics": ["topic1", "topic2"],
  "weakTopics": ["topic1", "topic2"],
  "suggestions": ["suggestion1", "suggestion2"]
}
`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Reply ONLY in valid JSON. Do not include any markdown or code blocks." },
        { role: "user", content: analysisPrompt }
      ],
      temperature: 0.7
    })

    const analysis = JSON.parse(completion.choices[0].message.content)

    // Update interview with analysis results
    interview.averageScore = averageScore
    interview.summary = analysis.summary
    interview.strongTopics = analysis.strongTopics || []
    interview.weakTopics = analysis.weakTopics || []
    interview.suggestions = analysis.suggestions || []
    interview.status = "ended"
    
    await interview.save()

    res.json({
      success: true,
      analysis: {
        averageScore,
        summary: analysis.summary,
        strongTopics: analysis.strongTopics,
        weakTopics: analysis.weakTopics,
        suggestions: analysis.suggestions
      }
    })

  } catch (error) {
    console.error("Analysis error:", error)
    res.status(500).json({ message: "Failed to analyze interview", error: error.message })
  }
})

// Get interview analysis
router.get("/interview/:interviewId", async (req, res) => {
  try {
    const { interviewId } = req.params
    const interview = await Interview.findById(interviewId)
    
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" })
    }

    res.json({
      interview: {
        id: interview._id,
        role: interview.role,
        experience: interview.experience,
        type: interview.type,
        averageScore: interview.averageScore,
        summary: interview.summary,
        strongTopics: interview.strongTopics || [],
        weakTopics: interview.weakTopics || [],
        suggestions: interview.suggestions || [],
        status: interview.status,
        createdAt: interview.createdAt
      }
    })
  } catch (error) {
    console.error("Get interview error:", error)
    res.status(500).json({ message: "Failed to get interview", error: error.message })
  }
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
