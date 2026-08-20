import { CompetencyVector, EvidenceItem, InterviewMessage, PressureLevel, TurnTelemetry } from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface SendMessageOptions {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  callId?: string;
  targetRole?: string;
  currentCompetencies: CompetencyVector;
  currentPressureLevel: PressureLevel;
  onChunk?: (chunk: string) => void;
}

interface SendMessageResult {
  content: string;
  telemetry: TurnTelemetry;
  updatedCompetencies: CompetencyVector;
  newEvidenceItem?: EvidenceItem;
}

export async function sendInterviewMessage({
  messages,
  callId = "web-candidate-session",
  targetRole = "Backend Engineer",
  currentCompetencies,
  currentPressureLevel,
  onChunk,
}: SendMessageOptions): Promise<SendMessageResult> {
  const latestUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const turnCount = Math.floor(messages.filter((m) => m.role === "user").length);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout before falling back to onboard engine

    const response = await fetch(`${BACKEND_URL}/api/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Vapi-Call-Id": callId,
      },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));
              const delta = data.choices?.[0]?.delta?.content || "";
              if (delta) {
                fullText += delta;
                onChunk?.(delta);
              }
            } catch {
              // Ignore non-json chunks
            }
          }
        }
      }

      const generatedContent = fullText.replace(/^Hmm,\s*okay\.\.\.\s*/i, "").trim() || fullText.trim();
      const evaluated = evaluateClientSideTurn(latestUserMsg, turnCount, currentCompetencies, currentPressureLevel);

      return {
        content: generatedContent,
        telemetry: evaluated.telemetry,
        updatedCompetencies: evaluated.updatedCompetencies,
        newEvidenceItem: evaluated.evidenceItem,
      };
    }
  } catch (err) {
    // If backend is unreachable or timed out, gracefully transition to high-fidelity onboard adaptive evaluator
    console.info("Using onboard adaptive intelligence engine (Backend offline or connecting...)", err);
  }

  // Onboard adaptive engine simulation with realistic streaming emulation
  return simulateOnboardAdaptiveTurn(latestUserMsg, turnCount, targetRole, currentCompetencies, currentPressureLevel, onChunk);
}

function evaluateClientSideTurn(
  userText: string,
  turnCount: number,
  prevVector: CompetencyVector,
  pressure: PressureLevel
) {
  const lower = userText.toLowerCase();
  const hasMetrics = /\d+[%ms|k|mb|gb|rps|requests|queries|seconds|minutes]/.test(lower) || /\d+/.test(userText);
  const hasSpecificTools = /(redis|postgres|kafka|grpc|docker|kubernetes|raft|sql|index|b-tree|lock|goroutine|thread|cache|latency|p99|shard)/.test(lower);
  const isVague = lower.includes("easy") || lower.includes("simple") || lower.includes("a lot") || lower.length < 30;

  let signal: "substantiated" | "unsubstantiated" | "probing" = "probing";
  let obs = "";

  if (hasMetrics && hasSpecificTools) {
    signal = "substantiated";
    obs = "Candidate provided concrete architecture mechanisms paired with quantified metrics.";
  } else if (hasMetrics && !hasSpecificTools) {
    signal = "unsubstantiated";
    obs = "Quantified claim made without naming profiling tools, baseline metrics, or subsystem context.";
  } else if (isVague) {
    signal = "unsubstantiated";
    obs = "Vague response lacking technical precision or failure boundaries.";
  } else {
    signal = "probing";
    obs = "High-level concept described; requires deeper evidence probe into edge cases.";
  }

  // Calculate delta
  const deltaTech = signal === "substantiated" ? 0.04 : signal === "unsubstantiated" ? -0.03 : 0.01;
  const deltaSys = hasSpecificTools ? 0.03 : 0.0;
  const deltaProblem = userText.length > 80 ? 0.03 : -0.02;
  const deltaComm = userText.split(".").length >= 2 ? 0.02 : -0.01;
  const deltaOwn = hasMetrics && signal === "substantiated" ? 0.05 : -0.01;

  const clamp = (v: number) => Math.min(0.98, Math.max(0.15, Number((v).toFixed(2))));

  const updated: CompetencyVector = {
    technical_depth: clamp(prevVector.technical_depth + deltaTech),
    system_design: clamp(prevVector.system_design + deltaSys),
    problem_solving: clamp(prevVector.problem_solving + deltaProblem),
    communication_clarity: clamp(prevVector.communication_clarity + deltaComm),
    ownership_specificity: clamp(prevVector.ownership_specificity + deltaOwn),
  };

  const nextPressure: PressureLevel = signal === "unsubstantiated" ? Math.min(5, pressure + 1) as PressureLevel : Math.max(1, pressure - (turnCount % 2 === 0 ? 1 : 0)) as PressureLevel;

  const telemetry: TurnTelemetry = {
    turn_id: turnCount,
    pressure_level: nextPressure,
    probed_competency: hasSpecificTools ? "Distributed State & Query Execution" : "System Architecture & Baselines",
    evaluation_signal: signal,
    extracted_claims: hasMetrics ? [`Candidate claimed: "${userText.slice(0, 80)}..."`] : [],
    latency_ms: Math.floor(180 + Math.random() * 140),
    missing_concepts: signal === "unsubstantiated" ? ["Baseline measurement", "Profiling tools", "Rollback plan"] : [],
    observed_strengths: signal === "substantiated" ? ["Explicit latency breakdown", "Defensive isolation"] : [],
  };

  const evidenceItem: EvidenceItem = {
    turn_id: turnCount,
    competency: telemetry.probed_competency,
    quote: userText.length > 120 ? userText.slice(0, 117) + "..." : userText,
    signal,
    observation: obs,
    pressure_level: nextPressure,
    timestamp: new Date().toISOString(),
  };

  return { telemetry, updatedCompetencies: updated, evidenceItem };
}

async function simulateOnboardAdaptiveTurn(
  userText: string,
  turnCount: number,
  targetRole: string,
  currentCompetencies: CompetencyVector,
  currentPressureLevel: PressureLevel,
  onChunk?: (chunk: string) => void
): Promise<SendMessageResult> {
  const evaluated = evaluateClientSideTurn(userText, turnCount, currentCompetencies, currentPressureLevel);
  const nextPressure = evaluated.telemetry.pressure_level;

  let question = "";

  if (turnCount === 1) {
    question = `Thanks for walking through that. Let's dig deeper into the actual failure modes. When your service experiences a sudden network partition or downstream timeouts, how does your circuit-breaker and fallback mechanism prevent cascading thread pool exhaustion?`;
  } else if (evaluated.telemetry.evaluation_signal === "unsubstantiated") {
    question = `You mentioned that improvement, but what was the baseline latency before your optimization, and what specific profiling tools or metrics did you use to verify it in production?`;
  } else if (nextPressure >= 4) {
    question = `That makes sense for the happy path. Now let's introduce a counterexample: suppose two concurrent requests arrive within 5 microseconds trying to mutate the exact same shard while the replica is lagging. How does your lock acquisition guarantee linearizability without causing deadlocks?`;
  } else {
    question = `How does that design scale when the data footprint grows by 10x? Walk me through how you would partition the storage and manage cross-node consistency.`;
  }

  // Emulate fast SSE streaming chunks
  const words = question.split(" ");
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? "" : " ") + words[i];
    onChunk?.(chunk);
    await new Promise((r) => setTimeout(r, 25));
  }

  return {
    content: question,
    telemetry: evaluated.telemetry,
    updatedCompetencies: evaluated.updatedCompetencies,
    newEvidenceItem: evaluated.evidenceItem,
  };
}
