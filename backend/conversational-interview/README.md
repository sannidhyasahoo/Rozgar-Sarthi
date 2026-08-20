# Rozgar Sarthi Backend (Conversational Interview Engine)

This is the backend for Rozgar Sarthi, an adaptive, evidence-based interview intelligence engine built using **LangGraph**, **LangChain**, and **FastAPI**. It is designed to evaluate technical claims in real-time, scale pressure dynamically, and bridge directly into **Vapi.ai** for voice interactions.

## Core Features

- **Adaptive Brain & Logic Engine:** Uses LangGraph to orchestrate a cyclical state machine (`evaluate_node` -> `plan_node`). 
- **Dynamic Pressure Scaling:** Detects vague or unsubstantiated claims and automatically pivots to targeted follow-up probes (escalating pressure levels).
- **Vapi Voice Bridge:** Exposes an OpenAI-compatible `/api/chat/completions` SSE streaming endpoint.
- **Zero-Latency Filler Injection:** Immediately streams filler words (e.g., *"Hmm, okay... "*) to mask LLM processing latency, creating a seamless real-time voice experience.
- **Continuous Insight Checkpointing:** Runs a background task after every turn to extract strengths, weaknesses, and actionable tips, logging them to `reports/{session_id}_insights.json`.
- **Multi-LLM Support:** Seamlessly switches between Google Gemini and Groq depending on your environment variables.

## Project Structure

```text
conversational-interview/
├── api.py                   # FastAPI application & Vapi Voice Bridge endpoint
├── config.py                # Environment configuration using pydantic-settings
├── engine.py                # LangGraph workflow orchestration & MemorySaver state persistence
├── evaluator.py             # LLM logic for claim extraction and competency scoring
├── insight_logger.py        # Background task for writing insights to the reports/ directory
├── llm_factory.py           # Instantiates ChatGoogleGenerativeAI or ChatGroq models
├── models.py                # Pydantic v2 schemas for strict structured outputs
├── pyproject.toml           # uv project configuration and dependencies
└── simulate_interview.py    # Interactive terminal CLI simulator with rich telemetry
```

## Setup Instructions

### 1. Prerequisites
- Install [uv](https://github.com/astral-sh/uv), the fast Python package installer and resolver.
- Python 3.10+

### 2. Installation
Navigate to this directory and sync the dependencies:
```bash
uv sync
```

### 3. Environment Variables
Copy the example environment file and configure your keys:
```bash
cp .env.example .env
```
Ensure you set **either** `GEMINI_API_KEY` or `GROQ_API_KEY`, and set `LLM_PROVIDER` accordingly.

## Usage

### Testing Locally (CLI Simulation)
You can test the logic engine and the pressure scaling without the voice bridge using the interactive terminal simulator:
```bash
uv run simulate_interview.py
```
*Try giving a vague technical response (e.g., "I optimized the database") and watch the AI increase pressure to ask for metrics and tools.*

### Running the API (Vapi Voice Bridge)
To start the FastAPI server for Vapi.ai integration:
```bash
uv run uvicorn api:app --reload
```
The server will start on `http://127.0.0.1:8000`. 

**Connecting to Vapi:**
1. Expose the port using ngrok: `ngrok http 8000`
2. In your Vapi.ai dashboard, set the Assistant's Custom LLM URL to: `https://<your-ngrok-url>/api/chat/completions`

## Telemetry & Insights
As conversations progress, the `insight_logger` automatically extracts the `CompetencyVector` and `EvidenceGraph`. These are compiled into a comprehensive breakdown of strengths and weaknesses and saved in the root `reports/` directory as `{call_id}_insights.json`.
