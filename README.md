# Adaptive Interview Intelligence Engine

> **An AI-powered adaptive interview system that continuously evaluates candidate competency, builds evidence, and selects the next question based on what it still needs to learn.**

[![Status](https://img.shields.io/badge/status-development-orange)]()
[![Backend](https://img.shields.io/badge/backend-FastAPI-009688)]()
[![Frontend](https://img.shields.io/badge/frontend-Next.js-black)]()
[![AI](https://img.shields.io/badge/AI-LangGraph-purple)]()
[![Database](https://img.shields.io/badge/database-PostgreSQL-blue)]()

---

## 🚀 What is this?

Most AI interview platforms generate questions, evaluate answers, and move on.

**Adaptive Interview Intelligence Engine works differently.**

It maintains a continuously updated model of the candidate and uses every response as evidence to decide what should happen next.

```text
Candidate Response
       ↓
    Evaluate
       ↓
Extract Evidence & Claims
       ↓
Update Candidate State
       ↓
Identify Weakness / Uncertainty
       ↓
Select Best Next Probe
       ↓
Pressure Test
       ↓
Candidate Response
       ↺
```

The goal is not simply to determine **whether an answer is correct**.

The system attempts to understand:

* What the candidate actually knows
* How they reason
* How independently they solve problems
* How well they communicate
* Whether their claims are supported by evidence
* How they perform under increasing interview pressure
* Which competencies remain uncertain
* How their performance changes across interviews

This makes the system an **adaptive assessment engine rather than an AI chatbot**.

---

# 🎯 Core Differentiation

The project is built around seven major ideas.

### 1. Candidate State

Instead of assigning one overall score, the system maintains a competency model for the candidate.

```json
{
  "technical": {
    "dsa": 0.82,
    "dbms": 0.54,
    "os": 0.71,
    "system_design": 0.63
  },
  "problem_solving": {
    "approach_selection": 0.86,
    "edge_cases": 0.51,
    "debugging": 0.84
  },
  "behavioral": {
    "ownership": 0.88,
    "leadership": 0.67,
    "communication": 0.76
  }
}
```

Every meaningful interaction updates this state.

### 2. Evidence Graph

Every major assessment is backed by evidence.

Instead of:

```text
Communication = 63
```

the system can explain:

```text
Communication
 ├── Question 3
 │    └── Clear explanation
 │
 ├── Question 7
 │    └── Long unstructured response
 │
 └── Question 11
      └── Strong follow-up response
```

This allows the final report to answer:

> **Why did I receive this score?**

### 3. Evidence Pressure

When candidates make quantified or significant claims, the system can probe them.

Example:

> "I improved API performance by 40%."

The interviewer may follow with:

> "What was the baseline?"

Then:

> "What was the latency after your change?"

Then:

> "How did you measure it?"

The system evaluates the **specificity, evidence, and consistency** of the claim rather than attempting to determine whether the candidate is lying.

### 4. Reasoning Trajectory

For coding interviews, the system records the candidate's process rather than only looking at the final code.

```text
Problem
   ↓
Initial Approach
   ↓
Complexity Analysis
   ↓
Alternative Approach
   ↓
Implementation
   ↓
Test Failure
   ↓
Debugging
   ↓
Final Solution
```

This distinguishes candidates who independently reasoned their way to a solution from candidates who reached the same result with significant assistance.

### 5. Cross-Answer Consistency

Claims made throughout the interview are compared.

If a candidate initially claims:

> "I designed the backend architecture."

and later says:

> "My teammate handled most of the backend."

the system identifies a **potential inconsistency** and asks for clarification.

It does not label the candidate a liar.

### 6. Adaptive Pressure

Interview pressure increases based on candidate responses.

```text
Level 1 → Normal Question
     ↓
Level 2 → Clarification
     ↓
Level 3 → Evidence Request
     ↓
Level 4 → Challenge Assumption
     ↓
Level 5 → Counterexample / Edge Case
```

### 7. Longitudinal Diagnosis

Previous interviews become part of the candidate model.

The system can identify:

* Improving skills
* Persistent weaknesses
* Regressions
* Interview-specific weaknesses

Future interviews can then focus on areas that remain uncertain or weak.

---

# 🧩 Interview Modes

## Behavioral Interviews

Evaluates:

* Communication
* Ownership
* Leadership
* Teamwork
* Conflict resolution
* Decision making
* Adaptability
* Failure handling
* Initiative
* Impact
* Self-awareness

Behavioral interviews use **STAR** as a primary framework:

```text
Situation
   ↓
Task
   ↓
Action
   ↓
Result
```

The system can continue probing an answer to test ownership, specificity, reasoning, impact, and consistency.

---

## Technical Interviews

Role-specific technical assessment.

### Software Engineering

* Data Structures & Algorithms
* DBMS
* Operating Systems
* Computer Networks
* OOP
* System Design
* Programming Fundamentals

### ML Engineering

* Machine Learning
* Statistics
* Deep Learning
* NLP
* Computer Vision
* LLMs
* MLOps

The competency framework is configurable by role.

---

## Coding Interviews

The coding engine evaluates:

* Problem understanding
* Approach selection
* Algorithm selection
* Complexity analysis
* Implementation
* Correctness
* Edge cases
* Debugging
* Adaptability
* Communication
* Hint dependency

The system evaluates the **solution trajectory**, not just whether the final code passes.

---

# 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │       Frontend       │
                         │    Next.js / React   │
                         └──────────┬───────────┘
                                    │
                              REST / WebSocket
                                    │
                         ┌──────────▼───────────┐
                         │       FastAPI        │
                         │         API          │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │ Interview Orchestrator│
                         │       LangGraph      │
                         └──────────┬───────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
             Interviewer       Evaluator          Planner
                Agent            Engine            Engine
                  │                 │                 │
                  └─────────────────┼─────────────────┘
                                    │
                         ┌──────────▼───────────┐
                         │ Candidate State +    │
                         │ Evidence Graph       │
                         └──────────┬───────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
             PostgreSQL          pgvector           Redis
                  │
                  ▼
             Interview History
```

### Coding Pipeline

```text
Candidate Code
      ↓
Coding API
      ↓
Job Queue
      ↓
Execution Worker
      ↓
Docker Sandbox
      ↓
Test Runner
      ↓
Evaluation
```

Candidate code is **never executed directly on the application server**. The sandbox uses CPU, memory, timeout, network, filesystem, and container-isolation restrictions.

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Monaco Editor
* React Flow
* WebSocket

## Backend

* Python
* FastAPI
* LangGraph
* Pydantic
* SQLAlchemy

## Database & Infrastructure

* PostgreSQL
* pgvector
* Redis
* Docker

## AI

The application uses an LLM abstraction layer so the system is not locked to a single provider.

```text
              LLM Provider
                   │
        ┌──────────┼──────────┐
        │          │          │
      Gemini     OpenAI     Claude
```

Critical LLM operations use structured outputs validated with Pydantic before application state is modified.

---

# 🧠 AI Architecture

The system intentionally avoids a huge collection of autonomous agents.

Instead, the core intelligence is divided into three components:

```text
              Interview Orchestrator
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
     Interviewer    Evaluator    Planner
        Agent        Engine       Engine
```

### Interviewer Agent

Responsible for:

* Asking questions
* Follow-ups
* Conversation context
* Interview persona
* Pressure
* Clarification
* Hints when allowed

It does **not** independently determine the final score.

### Evaluation Engine

Analyzes:

```text
Question
Candidate Response
Previous Responses
Candidate State
Expected Concepts
Competency Rubric
Interview Context
```

and produces structured evaluation.

### Planner Engine

Determines what question should come next based on:

```text
Skill Gap
+
Relevance
+
Difficulty Fit
+
Coverage
```

A future version can extend this into an information-gain based question selection system.

---

# 🔍 RAG

RAG is used for domain knowledge rather than deterministic operations.

Potential sources include:

* Interview question bank
* Technical concepts
* Competency rubrics
* Behavioral frameworks
* Coding problems
* Role requirements

```text
Query
  ↓
Embedding
  ↓
Vector Search
  ↓
Relevant Knowledge
  ↓
LLM
  ↓
Structured Evaluation
```

Deterministic operations remain deterministic.

For example:

```text
Code execution       → Deterministic
Test results         → Deterministic
Question ranking     → Application logic
Answer interpretation → LLM
Competency evaluation → LLM + Rubric
```

---

# 📊 Candidate Model

The system does not reduce a candidate to one number.

A candidate is represented as:

```text
Candidate
   │
   ├── Interview History
   ├── Competency State
   ├── Evidence
   ├── Claims
   ├── Weaknesses
   ├── Strengths
   └── Improvement Trends
```

This allows the system to understand how a candidate changes over time.

---

# 📝 Interview Replay

After an interview, candidates can inspect the reasoning behind the assessment.

```text
Question
   ↓
Your Answer
   ↓
What the system detected
   ↓
Why the follow-up was selected
   ↓
Competency being tested
   ↓
Your performance
```

Example:

```text
Competency:
Ownership

Detected:
Strong ownership
Low specificity

Follow-up:
"What exactly did you personally implement?"

Reason:
Ownership evidence was insufficient.
```

This makes the interview more than a score — it becomes a diagnostic learning experience.

---

# 🔁 Adaptive Interview Loop

The core algorithm is:

```python
while interview_active:

    response = get_candidate_response()

    evaluation = evaluate(response)

    claims = extract_claims(response)

    evidence = extract_evidence(response)

    update_candidate_state(
        evaluation,
        claims,
        evidence
    )

    update_consistency_graph()

    candidates = retrieve_possible_questions()

    ranked_questions = rank_questions(
        candidates,
        candidate_state,
        interview_objectives,
        time_remaining
    )

    next_question = select_best_question(
        ranked_questions
    )

    ask(next_question)
```

This adaptive loop is the **technical core of the project**.

---

# 📡 API

Core REST endpoints:

```text
POST /api/candidates

GET  /api/candidates/{id}

POST /api/interviews

GET  /api/interviews/{id}

POST /api/interviews/{id}/response

POST /api/interviews/{id}/code/run

GET  /api/interviews/{id}/state

GET  /api/interviews/{id}/report

GET  /api/candidates/{id}/history

GET  /api/candidates/{id}/skills

GET  /api/candidates/{id}/evidence
```

WebSocket:

```text
/ws/interview/{session_id}
```

---

# 🗄️ Database

Core entities:

```text
users
candidate_profiles
skills
candidate_skills
interview_sessions
interview_stages
questions
question_skills
responses
evaluations
evidence
claims
claim_evidence
coding_submissions
test_results
interview_events
candidate_skill_history
interview_reports
```

The event log records important state transitions such as:

```text
question_selected
response_received
evaluation_completed
claim_detected
followup_selected
difficulty_changed
hint_requested
code_submitted
test_failed
test_passed
state_updated
```

This makes the adaptive engine inspectable and debuggable.

---

# 🎤 Voice Mode

Voice interaction is an optional layer.

```text
Microphone
    ↓
Speech-to-Text
    ↓
Candidate Response
    ↓
Evaluation Engine
```

Supporting audio signals can include:

* Speaking rate
* Pause duration
* Response latency
* Filler words
* Response duration

These are **supporting signals**, not evidence of personality, honesty, confidence, or mental state.

---

# 🛡️ Safety & Fairness

This project is designed as an **interview preparation and diagnostic tool**.

It does not attempt to determine:

* Whether someone is truthful
* Whether someone will be hired
* Personality from facial expressions
* Mental state
* Intelligence from speech

The system focuses on observable, evidence-based competency signals.

There is deliberately **no facial emotion detection or OpenCV-based personality scoring** in the core system.

---

# 📈 Evaluation

The system should be evaluated against human interviewers rather than relying only on subjective claims about AI quality.

Important metrics include:

### Adaptation

Percentage of questions meaningfully conditioned on previous responses.

### Relevance

Human rating of whether follow-ups were appropriate.

### Evidence Quality

Percentage of major assessments supported by identifiable evidence.

### Question Selection

Human rating of whether the selected next question was useful.

### Coding Evaluation

Correlation between AI assessment and human interviewer assessment.

### Consistency Detection

Precision of detected potential inconsistencies.

A human-annotated mock interview dataset can be used to compare:

```text
Human Evaluation
       vs
AI Evaluation
```

This provides a measurable basis for evaluating the system.

---

# 🗺️ Roadmap

## Phase 1 — Core Interview Engine

* [ ] Candidate profiles
* [ ] Interview sessions
* [ ] Question bank
* [ ] Basic interviewer agent
* [ ] Structured evaluation
* [ ] Candidate competency state

## Phase 2 — Adaptation

* [ ] Dynamic follow-ups
* [ ] Skill-gap detection
* [ ] Adaptive question ranking
* [ ] Dynamic difficulty
* [ ] Interview state machine

## Phase 3 — Evidence Intelligence

* [ ] Evidence extraction
* [ ] Claim extraction
* [ ] Claim-evidence relationships
* [ ] Cross-answer consistency
* [ ] Evidence pressure

## Phase 4 — Coding Interviews

* [ ] Monaco editor
* [ ] Code execution queue
* [ ] Docker sandbox
* [ ] Test runner
* [ ] Debugging trajectory
* [ ] Hint dependency tracking

## Phase 5 — Longitudinal Intelligence

* [ ] Interview history
* [ ] Skill progression
* [ ] Persistent weakness detection
* [ ] Retry mechanism
* [ ] Historical candidate state

## Phase 6 — Advanced Intelligence

* [ ] Information-gain question selection
* [ ] Voice interviews
* [ ] Advanced RAG
* [ ] Human-vs-AI evaluation dataset
* [ ] Interview replay
* [ ] Advanced analytics

---

# 🎯 Product Principle

This project is **not**:

> "An LLM that asks interview questions."

It is:

> **An adaptive assessment engine that continuously updates its understanding of a candidate and selects the next interaction to reduce uncertainty about their actual ability.**

The fundamental loop is:

```text
OBSERVE
   ↓
EVALUATE
   ↓
BUILD EVIDENCE
   ↓
UPDATE CANDIDATE MODEL
   ↓
IDENTIFY UNCERTAINTY
   ↓
PROBE
   ↓
PRESSURE TEST
   ↓
OBSERVE AGAIN
   ↺
```

That adaptive loop is the core technical idea behind the entire system.
