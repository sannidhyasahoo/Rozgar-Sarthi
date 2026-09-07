<p align="center">
  <h1 align="center">रोज़गार सारथी &nbsp;·&nbsp; Rozgar Sarthi</h1>
  <p align="center"><strong>Your AI-Powered Career Navigator</strong></p>
  <p align="center">
    An adaptive interview intelligence engine that continuously evaluates candidate competency,<br/>
    builds evidence, and selects the next question based on what it still needs to learn.
  </p>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/status-stable-brightgreen?style=for-the-badge" alt="Status"/></a>
  <a href="#"><img src="https://img.shields.io/badge/backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/></a>
  <a href="#"><img src="https://img.shields.io/badge/frontend-Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/></a>
  <a href="#"><img src="https://img.shields.io/badge/AI-LangGraph-7C3AED?style=for-the-badge" alt="LangGraph"/></a>
  <a href="#"><img src="https://img.shields.io/badge/voice-Vapi-FF6B35?style=for-the-badge" alt="Vapi"/></a>
  <a href="#"><img src="https://img.shields.io/badge/auth-Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk"/></a>
  <a href="#"><img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="License"/></a>
</p>

---

## The Problem

Most AI interview platforms generate questions, evaluate answers, and move on — treating every candidate the same way.

**Rozgar Sarthi works differently.**

It maintains a continuously updated competency model of the candidate and uses every response as evidence to decide what should happen next — just like a skilled human interviewer would.

```
Candidate Response → Evaluate → Extract Evidence & Claims → Update Candidate Model
         ↓
Identify Weakness / Uncertainty → Select Best Next Probe → Pressure Test → Repeat
```

> The goal is not to determine **whether an answer is correct**. The system attempts to understand what the candidate actually knows, how they reason, and whether their claims are supported by evidence.

---

## ✨ Key Features

### 🎙️ Voice-First Adaptive Interview
Real-time voice interviews powered by **Vapi** with sub-second latency. The AI interviewer adapts its questioning strategy in real-time based on detected competency gaps.

### 📊 5-Axis Competency Scoring
Every candidate is evaluated across five dimensions — updated after every response:

| Axis | What It Measures |
|------|-----------------|
| 🛠️ Technical Depth | Domain knowledge, concepts, and first-principles understanding |
| 🏗️ System Design | Architectural thinking, trade-off analysis, scalability awareness |
| 🧩 Problem Solving | Approach selection, edge-case handling, debugging methodology |
| 🗣️ Communication | Clarity, structure, and ability to explain complex ideas concisely |
| 🎯 Ownership | Specificity of contributions, quantified impact, evidence quality |

### 🔍 Evidence Graph & Claim Extraction
Every assessment is backed by traceable evidence. The system extracts specific claims from responses, tags them as substantiated or unsubstantiated, and identifies missing details — making the evaluation transparent and explainable.

### ⚡ Adaptive Pressure System
Interview pressure escalates intelligently across 5 levels:

```
Level 1 → Normal Question
Level 2 → Clarification
Level 3 → Evidence Request
Level 4 → Challenge Assumption
Level 5 → Counterexample / Edge Case
```

Candidates who make quantified claims (e.g., *"I improved API performance by 40%"*) are probed for baselines, methodology, and measurement — evaluating specificity, not truthfulness.

### 💻 Integrated Coding Assessment
Built-in code editor powered by **Monaco Editor** with LLM-based evaluation. The system assesses code correctness, efficiency, and provides constructive feedback without revealing solutions.

### 📋 AI-Generated Diagnostic Reports
Post-interview, the system generates a comprehensive 4-page diagnostic report including:
- Executive summary with hiring calibration badge
- Actionable coaching feedback (startup feedback style)
- Evidence graph & buzzword audit with claims substantiation
- Personalized study roadmap with recommended next steps

### 📄 Resume-Aware Interviewing
Upload a resume and the AI tailors questions to the candidate's background — referencing their past companies, roles, and projects for deeper, more relevant probing.

### 🔐 Authentication & User Management
Secure authentication via **Clerk** with sign-in/sign-up flows, session management, and user-scoped data isolation.

---

## 🏗️ Architecture

```
                         ┌──────────────────────────┐
                         │        Frontend           │
                         │   Next.js 15 · React 19   │
                         │   Tailwind · Monaco        │
                         └────────────┬───────────────┘
                                      │
                              REST / Streaming SSE
                                      │
                         ┌────────────▼───────────────┐
                         │       FastAPI Backend       │
                         │   Chat · Coding · Reports   │
                         └────────────┬───────────────┘
                                      │
                         ┌────────────▼───────────────┐
                         │   Interview Orchestrator    │
                         │        LangGraph            │
                         └────────────┬───────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
            Interviewer        Evaluator           Planner
               Agent            Engine              Engine
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      │
                         ┌────────────▼───────────────┐
                         │    Candidate State +        │
                         │    Evidence Graph            │
                         └────────────────────────────┘
```

### AI Pipeline (Single-Pass Architecture)

The system uses a **unified evaluator-planner** that performs evaluation and question planning in a single LLM call — minimizing latency for voice interactions:

```
Candidate Response
       ↓
┌──────────────────────────────┐
│   Unified Evaluator-Planner  │
│                              │
│  1. Extract Claims           │
│  2. Compute Competency Δ     │
│  3. Detect Evasion           │
│  4. Set Pressure Level       │
│  5. Generate Next Question   │
└──────────────────────────────┘
       ↓
Structured Output (Pydantic-validated)
       ↓
State Update + Stream to Voice
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 15** | React framework with App Router |
| **React 19** | UI components |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **Monaco Editor** | Code editing (VS Code engine) |
| **Vapi SDK** | Voice AI integration |
| **Clerk** | Authentication |
| **Lucide React** | Icon system |
| **React Markdown** | Report rendering |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Python 3.11+** | Runtime |
| **FastAPI** | API framework with streaming support |
| **LangGraph** | Stateful AI workflow orchestration |
| **LangChain** | LLM abstraction layer |
| **Pydantic** | Data validation & structured outputs |
| **PyPDF2** | Resume parsing |
| **Uvicorn** | ASGI server |

### AI / LLM
| Provider | Usage |
|----------|-------|
| **Google Gemini** | Primary LLM (evaluation + planning) |
| **Groq** | Low-latency inference option |

> The application uses an LLM abstraction layer via LangChain — it is **not locked to a single provider**.

---

## 📁 Project Structure

```
Rozgar Sarthi/
├── frontend/                          # Next.js 15 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Landing page
│   │   │   ├── layout.tsx             # Root layout with Clerk
│   │   │   ├── interview/             # Voice interview interface
│   │   │   ├── coding/                # Code editor + assessment
│   │   │   ├── dashboard/             # User dashboard
│   │   │   ├── report/                # Diagnostic report viewer
│   │   │   ├── onboarding/            # Resume upload + setup
│   │   │   ├── sign-in/               # Auth: sign in
│   │   │   └── sign-up/               # Auth: sign up
│   │   ├── components/
│   │   │   ├── auth/                  # Auth components
│   │   │   ├── interview/             # Interview UI components
│   │   │   ├── layout/                # Layout components
│   │   │   └── shared/                # Shared UI primitives
│   │   ├── hooks/                     # Custom React hooks
│   │   └── lib/                       # Utilities
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/
│   └── conversational-interview/      # FastAPI Application
│       ├── api.py                     # Main API (chat completions, resume upload)
│       ├── engine.py                  # LangGraph interview orchestrator
│       ├── evaluator_planner.py       # Unified evaluation + question planning
│       ├── models.py                  # Pydantic data models
│       ├── coding_api.py             # Coding assessment endpoints
│       ├── report_api.py             # Report generation endpoints
│       ├── insight_logger.py         # Session insights persistence
│       ├── resume_parser.py          # PDF resume extraction
│       ├── llm_factory.py            # LLM provider abstraction
│       ├── config.py                 # Configuration management
│       ├── coding_questions.json     # Coding problem bank
│       └── pyproject.toml            # Python dependencies
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **uv** (Python package manager) — [install](https://docs.astral.sh/uv/getting-started/installation/)

### 1. Clone the Repository

```bash
git clone https://github.com/sannidhyasahoo/Rozgar-Sarthi.git
cd Rozgar-Sarthi
```

### 2. Backend Setup

```bash
cd backend/conversational-interview

# Create environment and install dependencies
uv sync

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys:
#   GOOGLE_API_KEY=your_gemini_api_key
#   GROQ_API_KEY=your_groq_api_key (optional)

# Start the backend server
uv run uvicorn api:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Create .env.local with:
#   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
#   CLERK_SECRET_KEY=your_clerk_secret
#   NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_key
#   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Start the development server
npm run dev
```

### 4. Open the App

Navigate to **http://localhost:3000** and you're ready to go.

---

## 📡 API Reference

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/completions` | OpenAI-compatible chat endpoint (streaming SSE) |
| `POST` | `/api/upload-resume` | Upload PDF resume for profile extraction |
| `GET` | `/api/report/{call_id}` | Retrieve raw interview insights JSON |
| `POST` | `/api/reset` | Clear session and candidate data |

### Coding Assessment

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/coding/questions` | Get 3 random coding problems |
| `POST` | `/api/coding/evaluate` | Submit code for LLM-based evaluation |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reports/list` | List all available interview reports |
| `GET` | `/api/reports/{call_id}/generate` | Generate full AI diagnostic report |

---

## 🧠 How the Intelligence Works

### Candidate State Model

Instead of assigning one overall score, the system maintains a live competency vector:

```json
{
  "technical_depth": 0.82,
  "system_design": 0.54,
  "problem_solving": 0.71,
  "communication_clarity": 0.76,
  "ownership_specificity": 0.63
}
```

Every meaningful interaction updates this state with bounded deltas (±0.2 per turn).

### Evidence-Based Assessment

Every claim is extracted, categorized, and tagged:

```
Claim: "I improved API performance by 40%"
├── Category: technical_depth
├── Is Quantified: ✓
├── Has Evidence: ✗
├── Missing: baseline metrics, measurement methodology
└── Signal: unsubstantiated → triggers pressure escalation
```

### Cross-Answer Consistency

Claims made throughout the interview are compared. Contradictions (e.g., *"I designed the backend"* vs. *"My teammate handled the backend"*) are flagged for clarification — not accusation.

### Evasion Detection

The system tracks consecutive evasions. Repeated dodging increases the pressure level and redirects probing to the same competency until sufficient evidence is gathered.

---

## 🎯 Design Philosophy

> **Rozgar Sarthi is not "an LLM that asks interview questions."**
>
> It is an **adaptive assessment engine** that continuously updates its understanding of a candidate and selects the next interaction to reduce uncertainty about their actual ability.

### Core Principles

1. **Evidence over Impressions** — Every score is traceable to specific moments in the interview
2. **Adaptation over Scripting** — Questions are selected dynamically, not from a fixed list
3. **Pressure with Purpose** — Escalation tests depth of knowledge, not stress tolerance
4. **Transparency** — Candidates can see exactly why they received their scores
5. **Fairness by Design** — No facial emotion detection, no personality inference, no bias proxies

---

## 🛡️ Safety & Ethics

This project is designed as an **interview preparation and diagnostic tool**. It does not attempt to determine:

- Whether someone is truthful
- Whether someone should be hired
- Personality traits from speech patterns
- Mental state or emotional condition
- Intelligence from demographic signals

The system focuses exclusively on **observable, evidence-based competency signals** and is deliberately built without facial emotion detection or OpenCV-based personality scoring.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ for the GirlGeeks Hackathon</strong><br/>
  <em>Empowering candidates to navigate their career journey with AI-driven preparation</em>
</p>
