import { CodingChallenge, SessionInsights, TechnicalRole } from "./types";

export const ROLE_PROFILES: Record<
  TechnicalRole,
  {
    tagline: string;
    focusAreas: string[];
    sampleQuestions: string[];
    baselineCompetencies: {
      technical_depth: number;
      system_design: number;
      problem_solving: number;
      communication_clarity: number;
      ownership_specificity: number;
    };
  }
> = {
  "Backend Engineer": {
    tagline: "High-concurrency services, DB indexing, API contracts, and async event streaming",
    focusAreas: ["PostgreSQL / Redis", "gRPC & REST", "Kafka / Event Buses", "Locking & Concurrency", "Observability"],
    sampleQuestions: [
      "Walk me through how you identified and resolved a critical p99 latency spike in your database queries.",
      "How do you ensure idempotency across asynchronous microservices processing financial transactions?",
      "When scaling your read-heavy API by 10x, what caching invalidation strategy did you implement and why?",
    ],
    baselineCompetencies: {
      technical_depth: 0.72,
      system_design: 0.68,
      problem_solving: 0.75,
      communication_clarity: 0.70,
      ownership_specificity: 0.65,
    },
  },
  "AI/ML Systems Engineer": {
    tagline: "LLM serving pipelines, vector databases, model latency optimization, and evaluation graphs",
    focusAreas: ["vLLM / TensorRT", "RAG & Vector Stores", "LangGraph / Agents", "Quantization & Caching", "Model Evals"],
    sampleQuestions: [
      "How did you optimize your LLM inference pipeline time-to-first-token (TTFT) when streaming to 500 concurrent users?",
      "Explain your strategy for detecting hallucination and measuring retrieval precision in production RAG systems.",
      "Describe how you handle context window limits and state pruning in multi-step agent reasoning loops.",
    ],
    baselineCompetencies: {
      technical_depth: 0.76,
      system_design: 0.70,
      problem_solving: 0.78,
      communication_clarity: 0.68,
      ownership_specificity: 0.62,
    },
  },
  "Distributed Systems & SRE": {
    tagline: "Fault tolerance, consensus algorithms, partition tolerance, and Kubernetes orchestration",
    focusAreas: ["Raft / Paxos", "Circuit Breakers", "Kubernetes Operators", "eBPF / Telemetry", "Chaos Engineering"],
    sampleQuestions: [
      "Explain how your cluster detects and recovers from a network split-brain scenario without corrupting shared state.",
      "How do you design rate-limiting and token-bucket throttling across 50 independent edge gateways without a central redis bottleneck?",
      "Describe a post-mortem where an cascading outage was triggered by a misconfigured retry storm.",
    ],
    baselineCompetencies: {
      technical_depth: 0.80,
      system_design: 0.82,
      problem_solving: 0.76,
      communication_clarity: 0.65,
      ownership_specificity: 0.72,
    },
  },
  "Frontend Architect": {
    tagline: "State management at scale, rendering pipelines, bundle optimization, and design systems",
    focusAreas: ["React Server Components", "Micro-frontends", "WASM / WebGL", "Web Vitals (INP/LCP)", "State Machines"],
    sampleQuestions: [
      "How did you reduce Interaction to Next Paint (INP) below 50ms in a data-dense realtime analytics grid?",
      "Compare optimistic UI updates vs server-driven state when handling flaky mobile network connections.",
      "How do you architect a multi-package design system with token synchronization and zero runtime CSS overhead?",
    ],
    baselineCompetencies: {
      technical_depth: 0.70,
      system_design: 0.66,
      problem_solving: 0.74,
      communication_clarity: 0.78,
      ownership_specificity: 0.68,
    },
  },
  "Fullstack Platform Engineer": {
    tagline: "End-to-end product delivery, schema migrations, client-server sync, and developer tooling",
    focusAreas: ["Next.js / Node / Python", "GraphQL / REST", "Relational DBs", "Auth & RBAC", "CI/CD Pipelines"],
    sampleQuestions: [
      "How do you handle real-time collaborative editing state between browser clients and backend workers?",
      "Walk through how you designed a multi-tenant role-based access control (RBAC) model across frontend routes and database rows.",
      "Describe how you structure database migrations with zero downtime while changing column types in high-traffic tables.",
    ],
    baselineCompetencies: {
      technical_depth: 0.68,
      system_design: 0.65,
      problem_solving: 0.72,
      communication_clarity: 0.75,
      ownership_specificity: 0.70,
    },
  },
  "Data Systems Engineer": {
    tagline: "Stream processing, ETL topologies, lakehouse architecture, and analytical query engines",
    focusAreas: ["Apache Spark / Flink", "Kafka / Iceberg", "ClickHouse / DuckDB", "Data Governance", "Backfill Pipelines"],
    sampleQuestions: [
      "How do you handle late-arriving out-of-order events in stateful stream processing with watermark windows?",
      "Describe your migration from a legacy batch warehouse to a real-time Iceberg / Parquet lakehouse architecture.",
      "How do you verify data consistency and reconciliation across distributed change-data-capture (CDC) pipelines?",
    ],
    baselineCompetencies: {
      technical_depth: 0.75,
      system_design: 0.73,
      problem_solving: 0.71,
      communication_clarity: 0.67,
      ownership_specificity: 0.64,
    },
  },
};

export const SAMPLE_CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: "lru-cache-ttl",
    title: "LRU Cache with Precise TTL Expiration",
    difficulty: "Medium",
    track: "Backend Engineer",
    timeLimitMinutes: 35,
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) Cache with support for per-key Time-To-Live (TTL).

Implement the \`LRUCache\` class:
- \`LRUCache(capacity: int)\`: Initialize the LRU cache with positive size capacity.
- \`get(key: str) -> int\`: Return the value of the key if the key exists and has NOT expired. Otherwise, return -1. Accessing a non-expired key refreshes its LRU position (makes it most recently used), but does NOT reset its TTL.
- \`put(key: str, value: int, ttl_ms: int) -> None\`: Update the value of the key if the key exists, or insert the key if the key is not already present. When the number of keys exceeds the capacity from this operation, evict the least recently used key. If the key already exists, its value and TTL expiration are updated.
- \`cleanup_expired() -> int\`: Clean up any expired keys eagerly and return the count of expired keys removed.

Both \`get\` and \`put\` must operate in **O(1)** average time complexity.`,
    constraints: [
      "1 <= capacity <= 10,000",
      "0 <= key length <= 32 chars",
      "1 <= ttl_ms <= 3,600,000 (1 hour)",
      "At most 200,000 calls to get and put will be made.",
    ],
    examples: [
      {
        input: `cache = LRUCache(2)
cache.put("a", 100, 5000)
cache.put("b", 200, 5000)
cache.get("a") // returns 100
cache.put("c", 300, 5000) // evicts "b" because "a" was accessed
cache.get("b") // returns -1 (evicted)`,
        output: `[100, -1]`,
        explanation: "Key 'b' was least recently used since 'a' was accessed right before inserting 'c'.",
      },
    ],
    starterCode: {
      python: `import time
from typing import Optional, Dict

class Node:
    def __init__(self, key: str, val: int, expires_at: float):
        self.key = key
        self.val = val
        self.expires_at = expires_at
        self.prev = None
        self.next = None

class LRUCacheWithTTL:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.lookup: Dict[str, Node] = {}
        # Dummy head and tail for doubly linked list
        self.head = Node("", 0, 0)
        self.tail = Node("", 0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, key: str) -> int:
        # TODO: Implement O(1) fetch with TTL check and LRU position promotion
        pass

    def put(self, key: str, value: int, ttl_ms: int) -> None:
        # TODO: Implement O(1) insert/update and LRU eviction when exceeding capacity
        pass

    def cleanup_expired(self) -> int:
        # TODO: Eagerly evict expired keys
        pass
`,
      typescript: `interface CacheNode {
  key: string;
  val: number;
  expiresAt: number;
  prev: CacheNode | null;
  next: CacheNode | null;
}

export class LRUCacheWithTTL {
  private capacity: number;
  private lookup: Map<string, CacheNode> = new Map();
  private head: CacheNode;
  private tail: CacheNode;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head = { key: "", val: 0, expiresAt: 0, prev: null, next: null };
    this.tail = { key: "", val: 0, expiresAt: 0, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: string): number {
    // TODO: Implement O(1) get with TTL check
    return -1;
  }

  put(key: string, value: number, ttlMs: number): void {
    // TODO: Implement O(1) put and eviction
  }

  cleanupExpired(): number {
    // TODO: Cleanup expired nodes
    return 0;
  }
}
`,
      go: `package main

import "time"

type Node struct {
    key       string
    val       int
    expiresAt int64
    prev      *Node
    next      *Node
}

type LRUCacheWithTTL struct {
    capacity int
    lookup   map[string]*Node
    head     *Node
    tail     *Node
}

func NewLRUCacheWithTTL(capacity int) *LRUCacheWithTTL {
    head := &Node{}
    tail := &Node{}
    head.next = tail
    tail.prev = head
    return &LRUCacheWithTTL{
        capacity: capacity,
        lookup:   make(map[string]*Node),
        head:     head,
        tail:     tail,
    }
}

func (c *LRUCacheWithTTL) Get(key string) int {
    // TODO: Implement O(1) get
    return -1
}

func (c *LRUCacheWithTTL) Put(key string, value int, ttlMs int64) {
    // TODO: Implement O(1) put
}
`,
    },
    testCases: [
      {
        input: `put("a", 1, 10000), put("b", 2, 10000), get("a"), put("c", 3, 10000), get("b")`,
        expected: `get("a") => 1, get("b") => -1`,
      },
      {
        input: `put("x", 42, 50), sleep(100ms), get("x")`,
        expected: `get("x") => -1 (expired)`,
      },
      {
        input: `put("k", 10, 10000), put("k", 20, 10000), get("k")`,
        expected: `get("k") => 20 (updated in-place)`,
      },
    ],
    counterExamples: [
      {
        title: "Clock Skew & Monotonic Time Probe",
        scenario:
          "System clock jumps backwards by 30 seconds due to NTP synchronization while an entry with 10s TTL is stored.",
        probeQuestion:
          "How does your TTL calculation protect against wall-clock time drift or NTP leaps during high-frequency checks?",
      },
      {
        title: "O(1) Lazy Eviction Memory Leak",
        scenario:
          "A client writes 1,000,000 unique keys with 100ms TTL into a 1,000,000 capacity cache, but never calls get() on 95% of them.",
        probeQuestion:
          "If expired keys are only cleaned up during get(), memory stays allocated indefinitely. How do you balance active background sweeping vs passive lazy checks without incurring O(N) locks?",
      },
    ],
  },
  {
    id: "distributed-rate-limiter",
    title: "Sliding Window Log Distributed Rate Limiter",
    difficulty: "Hard",
    track: "Distributed Systems & SRE",
    timeLimitMinutes: 40,
    description: `Implement a high-throughput Sliding Window Rate Limiter that enforces strict per-user request quotas across overlapping microsecond time intervals.

Requirements:
- Track requests with timestamp precision down to milliseconds.
- Support atomic token acquisition: \`allow_request(user_id: str, limit: int, window_sec: int) -> bool\`
- Automatically prune timestamps older than the sliding window.
- Ensure constant memory per inactive user.`,
    constraints: [
      "Support up to 100,000 unique active user keys concurrently.",
      "Latency per check must remain < 0.5ms.",
      "Handle burst traffic up to 10x normal rate without memory exhaustion.",
    ],
    examples: [
      {
        input: `limiter = SlidingWindowLimiter()
limiter.allow("user1", limit=3, window_sec=10) // True (1/3)
limiter.allow("user1", limit=3, window_sec=10) // True (2/3)
limiter.allow("user1", limit=3, window_sec=10) // True (3/3)
limiter.allow("user1", limit=3, window_sec=10) // False (Limit exceeded)`,
        output: `[True, True, True, False]`,
      },
    ],
    starterCode: {
      python: `import time
from collections import deque
from typing import Dict

class SlidingWindowLimiter:
    def __init__(self):
        # Maps user_id -> deque of timestamps
        self.user_logs: Dict[str, deque] = {}

    def allow_request(self, user_id: str, limit: int, window_sec: int) -> bool:
        current_time = time.time()
        # TODO: Implement sliding window check and timestamp pruning
        pass
`,
      typescript: `export class SlidingWindowLimiter {
  private userLogs: Map<string, number[]> = new Map();

  allowRequest(userId: string, limit: number, windowSec: number): boolean {
    const now = Date.now();
    // TODO: Implement sliding window log check
    return true;
  }
}
`,
      go: `package main

import (
    "sync"
    "time"
)

type SlidingWindowLimiter struct {
    mu       sync.Mutex
    userLogs map[string][]int64
}

func (l *SlidingWindowLimiter) AllowRequest(userId string, limit int, windowSec int64) bool {
    // TODO: Implement sliding window check
    return true
}
`,
    },
    testCases: [
      {
        input: `allow("u1", 2, 1), allow("u1", 2, 1), allow("u1", 2, 1)`,
        expected: `[true, true, false]`,
      },
    ],
    counterExamples: [
      {
        title: "Memory Explosion under Distributed Attack",
        scenario: "An attacker rotates through 1,000,000 distinct fake user IDs sending 1 request each.",
        probeQuestion:
          "Since each unique key allocates a deque in memory, how do you prevent heap memory exhaustion from sparse single-use keys?",
      },
    ],
  },
];

export const INITIAL_SAMPLE_SESSION: SessionInsights = {
  session_id: "demo-adaptive-session-01",
  candidate_name: "Alex Dev",
  target_role: "Senior Backend Engineer",
  last_updated: "2026-08-20T06:45:00.000Z",
  duration_minutes: 24,
  overall_score: 0.76,
  competencies: {
    technical_depth: 0.74,
    system_design: 0.68,
    problem_solving: 0.82,
    communication_clarity: 0.71,
    ownership_specificity: 0.65,
  },
  evidence_log: [
    {
      turn_id: 1,
      competency: "API Latency Optimization",
      quote: "I improved our PostgreSQL query response times from 350ms to 45ms by adding partial composite indexes and splitting hot update tables.",
      signal: "substantiated",
      observation: "Strong quantified claim backed by specific architectural mechanism (partial composite indexing, table splitting).",
      pressure_level: 2,
    },
    {
      turn_id: 2,
      competency: "Concurrency & Distributed Locking",
      quote: "We used Redis distributed locks with Redlock algorithm to avoid double-charging during payment webhook retries.",
      signal: "probing",
      observation: "Candidate identified Redlock. Probed on clock drift edge cases and lease extension safety during slow GC pauses.",
      pressure_level: 4,
    },
    {
      turn_id: 3,
      competency: "Throughput Claims",
      quote: "We handled millions of requests without any issues.",
      signal: "unsubstantiated",
      observation: "Unsubstantiated generic throughput claim. Missing specific requests/second metrics, hardware specifications, and error budget constraints.",
      pressure_level: 3,
    },
    {
      turn_id: 4,
      competency: "Failure Domain Isolation",
      quote: "When the Kafka ingestion cluster went down, our worker fallback buffered events into disk-backed ring buffers with backpressure alerting.",
      signal: "substantiated",
      observation: "Clear evidence of resilience engineering under catastrophic dependency failure.",
      pressure_level: 5,
    },
  ],
  identified_strengths: [
    "Precise understanding of PostgreSQL query planning and index leaf node utilization.",
    "Strong instinct for graceful degradation and failure domain isolation under third-party outages.",
    "Quick recovery when challenged with edge-case race conditions during live probing.",
  ],
  areas_for_improvement: [
    "Lacked exact metrics when claiming high-throughput handling — cite specific baseline rps and p99 percentiles.",
    "Needs more concrete discussion of observability trade-offs (e.g., span sampling rates vs storage cost in distributed tracing).",
  ],
  actionable_tips: [
    "When introducing performance claims, always lead with the triad: Baseline Metric → Bottleneck Root Cause → Post-Change Benchmark.",
    "Be explicit about trade-offs: every architectural optimization introduces cost, complexity, or eventual consistency lag.",
  ],
};
