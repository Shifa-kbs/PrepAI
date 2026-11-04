# PrepAI 🚀
### AI-Powered Placement Preparation & Technical Interview Readiness Ecosystem

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React_19_%2B_Vite-61DAFB?logo=react)](client)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwind-css)](client)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_%2B_Express-339933?logo=node.js)](server)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb)](server)
[![AI](https://img.shields.io/badge/AI_Engine-Google_Gemini-4285F4?logo=google)](server)
[![Sandbox](https://img.shields.io/badge/Code_Execution-Judge0_Isolated_Sandbox-FF6B6B)](server)

---

## 📌 Overview

**PrepAI** is a comprehensive, production-grade placement preparation platform engineered to equip students and software engineering candidates with technical interview readiness. It combines adaptive AI-driven mock interviews, a multi-language coding sandbox with isolated test execution, a complete 41-module placement curriculum, curated question banks, and deep performance telemetry.

---

## ✨ Key Features & Architectural Modules

### 1. 🎓 Complete Learning Studio (41 Modules)
- **Quantitative Aptitude (7 Modules):** Number Systems, Percentages & Profit/Loss, Time & Work, Time Speed Distance, Permutations & Combinations, Probability, Ratio & Proportions.
- **Logical Reasoning (7 Modules):** Coding-Decoding, Blood Relations, Syllogisms, Direction Sense, Seating Arrangement, Series & Analogy, Data Sufficiency.
- **Verbal Ability (5 Modules):** Reading Comprehension, Sentence Correction, Vocabulary & Idioms, Parajumbles, Critical Reasoning.
- **Data Structures & Algorithms (17 Modules):** Arrays, Strings, Linked Lists, Stacks, Queues, Binary Trees, BSTs, Heaps, Graphs, Recursion & Backtracking, Dynamic Programming, Greedy Algorithms, Bit Manipulation, Sorting & Searching, Tries, Sliding Window, Two Pointers.
- **Computer Science Fundamentals (5 Modules):** Operating Systems, Database Management Systems (SQL & ACID), Computer Networks, System Design Fundamentals, Object-Oriented Programming (OOP).
- **Curriculum Content:** Includes deep conceptual overviews, core formulas, shortcut algorithms, step-by-step solved examples, and 84+ interactive self-check MCQs with hints and detailed explanations.

### 2. 💻 Multi-Language Coding Sandbox
- **Supported Languages:** JavaScript (ES6+), Python (3.x), Java (OpenJDK), C++ (GCC).
- **Isolated Execution Engine:** Integrated with **Judge0 Container Sandbox** architecture, eliminating unsafe host OS script execution.
- **Resource Constraints:** Strict server-side execution timeout limits (wall-clock and CPU time) and memory bounds (128 MB) to prevent denial-of-service and infinite loops.
- **Production Security Gate:** Enforces zero-trust execution. If external isolated sandbox credentials are not configured in production, user execution requests return HTTP 503 (`Service Unavailable`) rather than falling back to unsafe host processes.
- **Monaco Code Editor:** Professional dark-themed Monaco editor with auto-completion, language switching, syntax highlighting, reset to starter code, and real-time pass/fail test matrix.

### 3. 🎙️ AI Mock Interview Simulation
- **Gemini Live AI:** Conducts realistic behavioral, technical, and role-specific mock interviews with dynamic follow-ups based on candidate responses.
- **Evidence-Based 3-Tier Evaluation Matrix:**
  - **Rule A (Zero Answers):** Detects no-effort sessions; sets evaluation status to *Not Evaluated* with null scores, preventing fake inflated metrics.
  - **Rule B (Partial Answers):** Awards credit strictly for answered questions, applying a *Partial Evaluation* badge with missing response flags.
  - **Rule C (Full Synthesis):** Evaluates overall communication, technical depth, and problem-solving with actionable feedback and customized recommendations.

### 4. 📝 Aptitude Hub & Topic Tests
- **Configurable Assessment Modes:** Quick quizzes (10-15 questions), full-length timed placement tests (30-60 minutes), and topic-focused drills.
- **Anti-Duplicate Selection:** Shuffled reservoir sampling algorithm preventing repeated questions across sessions.
- **Instant Analysis:** Detailed answer keys with step-by-step solutions and category breakdown.

### 5. 📊 Performance Analytics & Study Roadmap
- **PrepScore Metric:** Weighted composite readiness index aggregating coding accuracy, aptitude metrics, and mock interview ratings.
- **Strength & Weakness Heatmap:** Category-level analytics identifying high-scoring vs. high-friction areas.
- **Custom Milestone Planner:** Generates customized weekly study milestones based on targeted companies (Product vs. Service tracks) and preparation deadlines.

---

## 🛠️ Architecture & Tech Stack

```
PrepAI/
├── client/                      # React 19 + Vite Frontend SPA
│   ├── src/
│   │   ├── components/          # Reusable UI cards, navbars, modals, code editor
│   │   ├── context/             # AuthContext, Theme & State Management
│   │   ├── data/                # 41-module structured learning curriculum
│   │   ├── pages/               # Dashboard, Practice, Learning, Interview, Analytics
│   │   └── services/            # Axios API clients with auto-JWT authorization
│   ├── tailwind.config.js       # Modern Clean SaaS UI Theme Configuration
│   └── vercel.json              # Vercel SPA rewrite & security headers
│
├── server/                      # Node.js + Express.js Backend API
│   ├── config/                  # MongoDB Atlas connection with retry resilience
│   ├── controllers/             # Auth, Practice, Interview, Question, Analytics
│   ├── data/questions/          # Curated question banks (DSA, CS, Aptitude, Languages)
│   ├── middleware/              # JWT auth verification, DB health check, error handler
│   ├── models/                  # Mongoose Schemas (User, PracticeSession, MockInterview)
│   ├── routes/                  # Express REST API routes (/api/*)
│   ├── services/
│   │   ├── aiInterviewService.js     # Google Gemini API integration
│   │   └── codeExecutionService.js   # Judge0 sandbox isolated execution engine
│   └── index.js                 # Express server bootstrap & graceful shutdown
│
└── render.yaml                  # Render.com Web Service Infrastructure as Code
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas**: Cluster URI with database read/write permissions
- **Google Gemini API Key**: [Google AI Studio](https://aistudio.google.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Shifa-kbs/PrepAI.git
cd PrepAI
```

### 2. Backend Setup
```bash
cd server
npm install

# Copy environment template
cp .env.example .env
```

Configure `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Atlas Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/prepai?retryWrites=true&w=majority

# Security Secrets
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Isolated Code Execution (Judge0)
# Optional in development; required for isolated production sandbox
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_or_self_hosted_key
# ENABLE_LOCAL_UNSAFE_RUNNER=true # Dev only, never enable in production
```

Start the backend development server:
```bash
npm run dev
```
The server will start at `http://localhost:5000` with the health endpoint available at `http://localhost:5000/api/health`.

---

### 3. Frontend Setup
Open a new terminal window:
```bash
cd client
npm install

# Copy environment template
cp .env.example .env
```

Configure `client/.env`:
```env
# Local development backend API URL
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
```
The frontend application will open at `http://localhost:5173`.

---

## 🧪 Verification & Test Suite

PrepAI includes comprehensive automated verification suites covering system security, isolated execution, database resilience, and scoring integrity:

```bash
# Run full system test suite (16 comprehensive tests)
node server/verify_complete_prepai_suite.js

# Test Judge0 isolated container sandbox & security gate
node server/test_isolated_judge0_safety.js

# Run automated deployment security audit scanner
node server/security_audit_scanner.js

# Run frontend production build & lint checks
cd client
npm run build
npm run lint
```

---

## 🌐 Production Deployment

### Backend (Render.com)
The repository includes a ready-to-deploy `render.yaml` configuration:
1. Connect your GitHub repository to [Render](https://render.com).
2. Create a new **Web Service** or use **Blueprint** pointing to `render.yaml`.
3. Provide environment variables in the Render Dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `JUDGE0_API_URL` & `JUDGE0_API_KEY`
   - `CLIENT_URL` (your frontend Vercel URL)
4. Health check endpoint: `/api/health`.

### Frontend (Vercel)
The client includes `client/vercel.json` configured for SPA routing:
1. Import the repository on [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Add environment variable:
   - `VITE_API_URL`: `https://<your-render-service>.onrender.com/api`
4. Deploy!

---

## 🔒 Security Best Practices

- **Zero Untracked Secrets:** Environment files (`.env`, `.env.*`) are strictly excluded in `.gitignore`. Placeholders are documented in `.env.example`.
- **Isolated Code Runner:** Untrusted user code is executed in isolated containers (Judge0) with wall-clock, CPU, and memory limits.
- **Server-Side Validation:** All coding test-case verification and scoring occurs server-side; client-side score injection is blocked.
- **Authentication:** Passwords hashed with `bcryptjs` (salt rounds: 10), stateless session management via JSON Web Tokens (`jwt`).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
