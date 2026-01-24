# 🤖 AI Architecture & Intelligence (ai.md)

This document describes **all AI-related components, design decisions, models, prompts, and intelligence flow** used in the **AI Interview Generator** project.

---

## 🧠 Overview

The AI Interview Generator is an **AI-native system**, not a rule-based application.  
The AI acts as a **live interviewer**, capable of:

- Asking context-aware questions
- Listening to spoken answers
- Adapting difficulty dynamically
- Evaluating responses in real time
- Generating structured feedback and insights

The AI is deeply integrated into the interview flow rather than being a simple chatbot.

---

## 🧩 AI Stack

### 🔹 AI Provider
- **Groq Cloud**
- **Groq SDK (Node.js)**

### 🔹 Language Model
- **LLaMA 3.3 – 70B**
- High reasoning capability
- Low-latency inference via Groq

### 🔹 Why Groq + LLaMA 3.3?
- Faster inference compared to traditional LLM hosting
- Strong reasoning and evaluation capability
- Suitable for real-time applications
- Cost-effective for hackathon-scale deployments

---

## 🎯 AI Responsibilities

The AI system is responsible for:

1. **Interview Question Generation**
2. **Adaptive Follow-up Questions**
3. **Answer Evaluation**
4. **Scoring & Feedback**
5. **Context Memory Across the Session**
6. **Post-Interview Analysis**

No static question bank is used.

---

## 🔁 AI Interview Flow

```

User selects role & experience
↓
AI generates first question
↓
AI speaks question (TTS)
↓
User answers via voice (STT)
↓
AI evaluates answer
↓
AI updates interview context
↓
AI generates next question
↓
(repeats until session ends)

```

---

## 🧠 AI Context Memory

The AI maintains an internal **Interview Context Object**, which evolves throughout the session.

### Context includes:
- Target role
- Experience level
- Interview type
- Previous questions
- User answers
- Detected strengths
- Detected weaknesses
- Confidence trends

This context is **passed to the AI on every request**, allowing:

- Intelligent follow-up questions
- Progressive difficulty adjustment
- Personalized interview flow

---

## 🗣️ Speech-Based Interaction

### 🎙️ Speech-to-Text (STT)
- Browser-native **SpeechRecognition API**
- Converts spoken answers into text
- Text is sent to backend AI for analysis

### 🔊 Text-to-Speech (TTS)
- Browser-native **SpeechSynthesis API**
- AI-generated questions are spoken aloud
- Creates a realistic interview experience

> AI itself does not perform STT/TTS — it operates purely on text.  
> Voice handling is done client-side for performance and latency reasons.

---

## 📈 Answer Evaluation Logic

For each user answer, the AI generates a structured evaluation containing:

- **Score (0–100)**
- **Answer relevance**
- **Technical correctness**
- **Clarity of explanation**
- **Confidence level**
- **Detected nervousness**
- **Concise feedback**

This evaluation is **returned immediately** after each answer.

---

## 🧠 AI Persona Design

The AI is instructed to behave as:

> *A professional interviewer — neutral, objective, adaptive, and constructive.*

### Persona Characteristics:
- Does not reveal answers
- Does not give hints unless interview type allows
- Adjusts tone based on confidence
- Increases difficulty if performance is strong
- Simplifies or probes fundamentals if weaknesses are detected

---

## 🧾 Prompt Engineering Strategy

All AI behavior is controlled through **system-level prompts** defined in:

```

server/routes/aiRoutes.js

```

### Prompt Structure:
1. **System Role Definition**
2. **Interview Context Injection**
3. **Strict Output Format Instructions**
4. **Evaluation Criteria**

This ensures:
- Deterministic outputs
- Machine-readable responses
- Consistent scoring

---

## 📊 Post-Interview AI Analysis

After the interview ends, the AI performs a **session-level analysis**, producing:

### 🔹 Summary
- Overall performance assessment

### 🔹 Strong Concepts
- Topics the candidate demonstrated confidence in

### 🔹 Weak Concepts
- Areas needing improvement

### 🔹 Actionable Suggestions
- Concrete steps to improve performance

This data powers the **Dashboard & Analytics** view.

---

## 🗄️ AI Data Persistence

AI-related data stored in MongoDB includes:

- Interview metadata
- Question-answer pairs
- AI scores
- Feedback summaries
- Strength/weakness tags

### Relevant Models:
- `Interview`
- `Message`

This allows:
- Interview history tracking
- Performance comparison
- Future analytics expansion

---

## ⚠️ Limitations & Assumptions

- Emotion detection is heuristic-based (text + speech patterns)
- Facial analysis is not yet implemented
- STT accuracy depends on browser and environment
- AI responses are probabilistic, not deterministic

---

## 🔮 Planned AI Enhancements

- Facial expression analysis via webcam
- Resume-aware interview generation
- Multi-language interview support
- Emotion-aware confidence scoring
- AI-generated personalized learning paths

---

## 🏁 Summary

The AI Interview Generator uses **LLM-driven intelligence as the core system**, not an add-on.

It combines:
- Real-time reasoning
- Context-aware memory
- Speech-based interaction
- Adaptive interview logic

to deliver a **realistic, scalable, and intelligent interview experience**.

---

> This AI system is designed to scale from a hackathon prototype  
> to a production-grade interview simulation platform.

