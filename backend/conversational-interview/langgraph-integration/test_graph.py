from graph_engine import interview_graph

# Initialize the state
state = {
    "latest_response": "",
    "candidate_vector": {"Database": 0.5, "System Design": 0.5},
    "pressure_level": 1,
    "evidence_log": [],
    "planner_directive": "",
    "next_question": "",
    "turn_count": 0      
}

print("Starting Rozgar-Sarthi Interview AI (Type 'exit' to quit)\n")

while True:
    user_input = input("\nCandidate: ").strip()
    if user_input.lower() in ["exit", "quit"]:
        print("\nSession ended.")
        break

    state["latest_response"] = user_input
    state["turn_count"] = state.get("turn_count", 0) + 1  
    
    output = interview_graph.invoke(state)
    state.update(output)

    # Check if the report is ready
    if "final_report" in state and state["final_report"]:
        print("\n" + "=" * 60)
        print("  [FINAL HIRING REPORT]")
        print("=" * 60)
        print(state["final_report"])
        print("=" * 60 + "\n")
        break

    print("\n--- [EVIDENCE GRAPH UPDATE] ---")
    print(f"Turn Count:     {state['turn_count']}/3")
    print(f"Pressure Level: {state['pressure_level']}/5")
    print(f"Competency:     {state['candidate_vector']}")
    if state["evidence_log"]:
        last = state["evidence_log"][-1]
        print(f"Claim:          {last.get('claim')}")
        print(f"Supported:      {last.get('supported')}")
    print("-" * 31)

    print(f"\nAI Interviewer: {state['next_question']}\n")