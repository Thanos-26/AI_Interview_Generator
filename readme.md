# 🎙️ AI Interview Generator  
### Real-Time, Voice-Driven AI Interview Simulation Platform

> **AI Interview Generator** is a full-stack, AI-native interview simulator that conducts **real-time, voice-based technical interviews** using large language models.  
> It mimics real interview dynamics by **speaking questions, listening to responses, adapting based on performance**, and providing actionable feedback — all automatically.

---

## 🚀 Why AI Interview Generator?

Traditional interview preparation lacks:
- Realistic pressure
- Adaptive questioning
- Immediate, objective feedback

**AI Interview Generator solves this by acting as a live interviewer**, not a static question bank.

---

## 🧠 Core Capabilities

- 🎤 **Voice-based interviews (STT + TTS)**
- 🎥 **Live webcam & microphone interaction**
- 🔄 **Fully dynamic, adaptive questioning**
- 📊 **Real-time answer evaluation**
- 🧩 **Context-aware AI interviewer persona**
- 🔐 **Secure authentication & user profiles**

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **React (Vite)**
- **TailwindCSS**
- Context API (global state & theme)
- Browser APIs:
  - SpeechRecognition (Speech-to-Text)
  - SpeechSynthesis (Text-to-Speech)
  - MediaDevices (Webcam & Microphone)

### Backend
- **Node.js**
- **Express.js**
- JWT-based authentication
- RESTful APIs

### Database
- **MongoDB**
- Mongoose ORM

### AI Engine
- **Groq SDK**
- **LLaMA 3.3 – 70B Model**
- Used for:
  - Question generation
  - Answer evaluation
  - Feedback & scoring
  - Interview context memory

---

## 🔐 Authentication & User Management

### Supported Methods
- Email & Password
- Google OAuth
- GitHub OAuth *(implemented, may be removed later)*

### Security
- Password hashing with bcrypt
- JWT-based session management
- Protected backend routes

### User Profile
- Name
- Email
- Profile picture (OAuth)
- Interview history linkage

---

## 🎯 Interview Implementation

### 1️⃣ Interview Configuration
Users select:
- **Target Role** (e.g., SDE, Data Analyst)
- **Experience Level** (Fresher / Experienced)
- **Interview Type**
  - Technical
  - Behavioral
  - HR

---

### 2️⃣ Live Interview Session

#### 🎥 Video & Audio
- Real-time webcam feed
- Microphone input
- AI speaks questions using TTS
- AI listens using STT

#### 🤖 Adaptive AI Flow
- No fixed question list
- Each question is **generated dynamically**
- AI adapts difficulty and focus based on:
  - Previous answers
  - Detected weaknesses
  - Confidence level

#### 📈 Real-Time Analysis
For every answer, the AI provides:
- Score (0–100)
- Immediate feedback
- Nervousness / confidence detection
- Clarity & relevance assessment

#### 🧠 AI Persona & Memory
- Maintains interview context
- Tracks strengths & weaknesses
- Adjusts questioning style mid-interview

---

## 📊 Dashboard & Analytics

### Interview History
- Role
- Date
- Overall score

### Detailed Insights
- Performance summary
- Strong concepts
- Weak concepts
- Actionable improvement suggestions

### Growth-Focused Feedback
- Not just scores — **clear next steps**
- Designed to help users improve systematically

---

## 📁 Project Structure

