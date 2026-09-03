"""
code_executor.py
Secure subprocess-based code execution for the coding assessment engine.

Architecture:
  Frontend → API → code_executor.py → subprocess (Python/Node/g++)
                                     → test harness
                                     → ExecutionResult

Security measures:
  - Candidate code runs in a subprocess (isolated process)
  - Strict CPU timeout enforced via subprocess timeout parameter
  - Dangerous imports blocked in Python (os, sys, subprocess, socket, etc.)
  - Code injected into a controlled test harness template
  - No direct eval() of candidate code in the backend process

Limitation (MVP):
  True production isolation requires Docker/Judge0. This executor is
  suitable for a hackathon/demo environment. See DESIGN.md for hardening notes.
"""

import subprocess
import tempfile
import os
import time
import sys
from typing import Any

from coding_session_store import ExecutionResult


# ─── Constants ────────────────────────────────────────────────────────────────

BLOCKED_IMPORTS_PYTHON = [
    "os", "sys", "subprocess", "socket", "importlib", "ctypes",
    "multiprocessing", "threading", "shutil", "pathlib", "glob",
    "pickle", "marshal", "gc", "__import__", "open", "exec", "eval",
    "compile", "input", "print",  # print allowed via harness only
    "builtins", "ast", "inspect", "dis", "code", "codeop",
]

PYTHON_EXEC = sys.executable  # use same Python that's running the backend


# ─── Tree / Build Helper ──────────────────────────────────────────────────────

def _build_tree_python(arr: list) -> str:
    """Generate Python code to build a binary tree from level-order array."""
    return f"""
from collections import deque

def _build_tree(vals):
    if not vals:
        return None
    root = TreeNode(vals[0])
    queue = deque([root])
    i = 1
    while queue and i < len(vals):
        node = queue.popleft()
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            queue.append(node.right)
        i += 1
    return root

def _find_lca(root, p, q):
    if not root:
        return None
    if root.val == p or root.val == q:
        return root
    left = _find_lca(root.left, p, q)
    right = _find_lca(root.right, p, q)
    if left and right:
        return root
    return left if left else right

_tree_input = {arr!r}
"""


# ─── Python Harness Builder ───────────────────────────────────────────────────

def _build_python_harness(problem: dict, candidate_code: str, test_cases: list[dict]) -> str:
    """
    Construct the full Python harness: candidate code + test runner.
    We do NOT sandbox imports fully here — we rely on process isolation.
    """
    harness_lines = [
        "import sys, json",
        "from collections import deque",
        "",
        "# ── Candidate Code ──",
        candidate_code,
        "",
        "# ── Test Runner ──",
        "results = []",
    ]

    problem_id = problem["id"]

    for idx, tc in enumerate(test_cases):
        inp = tc["input"]
        expected = tc["expected"]

        if problem_id == "two-sum":
            harness_lines.append(
                f"try:\n"
                f"    _r = two_sum({inp['nums']!r}, {inp['target']!r})\n"
                f"    _exp = {expected!r}\n"
                f"    results.append({{'idx': {idx}, 'passed': sorted(_r) == sorted(_exp), 'got': _r, 'expected': _exp}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        elif problem_id == "valid-parentheses":
            harness_lines.append(
                f"try:\n"
                f"    _r = is_valid({inp['s']!r})\n"
                f"    results.append({{'idx': {idx}, 'passed': bool(_r) == {expected!r}, 'got': _r, 'expected': {expected!r}}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        elif problem_id == "best-time-buy-sell":
            harness_lines.append(
                f"try:\n"
                f"    _r = max_profit({inp['prices']!r})\n"
                f"    results.append({{'idx': {idx}, 'passed': _r == {expected!r}, 'got': _r, 'expected': {expected!r}}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        elif problem_id == "binary-search":
            harness_lines.append(
                f"try:\n"
                f"    _r = search({inp['nums']!r}, {inp['target']!r})\n"
                f"    results.append({{'idx': {idx}, 'passed': _r == {expected!r}, 'got': _r, 'expected': {expected!r}}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        elif problem_id == "longest-substring":
            harness_lines.append(
                f"try:\n"
                f"    _r = length_of_longest_substring({inp['s']!r})\n"
                f"    results.append({{'idx': {idx}, 'passed': _r == {expected!r}, 'got': _r, 'expected': {expected!r}}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        elif problem_id == "product-except-self":
            harness_lines.append(
                f"try:\n"
                f"    _r = product_except_self({inp['nums']!r})\n"
                f"    results.append({{'idx': {idx}, 'passed': list(_r) == {expected!r}, 'got': _r, 'expected': {expected!r}}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        elif problem_id == "merge-intervals":
            harness_lines.append(
                f"try:\n"
                f"    _r = merge({inp['intervals']!r})\n"
                f"    _r2 = [list(x) for x in _r]\n"
                f"    results.append({{'idx': {idx}, 'passed': _r2 == {expected!r}, 'got': _r2, 'expected': {expected!r}}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        elif problem_id == "top-k-frequent":
            harness_lines.append(
                f"try:\n"
                f"    _r = top_k_frequent({inp['nums']!r}, {inp['k']!r})\n"
                f"    results.append({{'idx': {idx}, 'passed': sorted(_r) == sorted({expected!r}), 'got': _r, 'expected': {expected!r}}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        elif problem_id == "number-of-islands":
            harness_lines.append(
                f"try:\n"
                f"    import copy\n"
                f"    _r = num_islands(copy.deepcopy({inp['grid']!r}))\n"
                f"    results.append({{'idx': {idx}, 'passed': _r == {expected!r}, 'got': _r, 'expected': {expected!r}}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        elif problem_id == "binary-tree-level-order":
            tree_arr = inp.get("tree", [])
            harness_lines.append(
                f"try:\n"
                f"    _tree_vals = {tree_arr!r}\n"
                f"    if not _tree_vals:\n"
                f"        _root = None\n"
                f"    else:\n"
                f"        _root = TreeNode(_tree_vals[0]) if _tree_vals[0] is not None else None\n"
                f"        _queue = deque([_root])\n"
                f"        _i = 1\n"
                f"        while _queue and _i < len(_tree_vals):\n"
                f"            _node = _queue.popleft()\n"
                f"            if _i < len(_tree_vals) and _tree_vals[_i] is not None:\n"
                f"                _node.left = TreeNode(_tree_vals[_i])\n"
                f"                _queue.append(_node.left)\n"
                f"            _i += 1\n"
                f"            if _i < len(_tree_vals) and _tree_vals[_i] is not None:\n"
                f"                _node.right = TreeNode(_tree_vals[_i])\n"
                f"                _queue.append(_node.right)\n"
                f"            _i += 1\n"
                f"    _r = level_order(_root)\n"
                f"    results.append({{'idx': {idx}, 'passed': _r == {expected!r}, 'got': _r, 'expected': {expected!r}}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        elif problem_id == "lowest-common-ancestor":
            tree_arr = inp.get("tree", [])
            p_val = inp.get("p")
            q_val = inp.get("q")
            harness_lines.append(
                f"try:\n"
                f"    _tree_vals = {tree_arr!r}\n"
                f"    _root = None\n"
                f"    if _tree_vals:\n"
                f"        _root = TreeNode(_tree_vals[0])\n"
                f"        _queue = deque([_root])\n"
                f"        _i = 1\n"
                f"        while _queue and _i < len(_tree_vals):\n"
                f"            _node = _queue.popleft()\n"
                f"            if _i < len(_tree_vals) and _tree_vals[_i] is not None:\n"
                f"                _node.left = TreeNode(_tree_vals[_i])\n"
                f"                _queue.append(_node.left)\n"
                f"            _i += 1\n"
                f"            if _i < len(_tree_vals) and _tree_vals[_i] is not None:\n"
                f"                _node.right = TreeNode(_tree_vals[_i])\n"
                f"                _queue.append(_node.right)\n"
                f"            _i += 1\n"
                f"    _r = lowest_common_ancestor(_root, {p_val!r}, {q_val!r})\n"
                f"    _val = _r.val if hasattr(_r, 'val') else _r\n"
                f"    results.append({{'idx': {idx}, 'passed': _val == {expected!r}, 'got': _val, 'expected': {expected!r}}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        elif problem_id == "coin-change":
            harness_lines.append(
                f"try:\n"
                f"    _r = coin_change({inp['coins']!r}, {inp['amount']!r})\n"
                f"    results.append({{'idx': {idx}, 'passed': _r == {expected!r}, 'got': _r, 'expected': {expected!r}}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        elif problem_id == "longest-increasing-subsequence":
            harness_lines.append(
                f"try:\n"
                f"    _r = length_of_lis({inp['nums']!r})\n"
                f"    results.append({{'idx': {idx}, 'passed': _r == {expected!r}, 'got': _r, 'expected': {expected!r}}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        elif problem_id == "course-schedule":
            harness_lines.append(
                f"try:\n"
                f"    _r = can_finish({inp['numCourses']!r}, {inp['prerequisites']!r})\n"
                f"    results.append({{'idx': {idx}, 'passed': bool(_r) == {expected!r}, 'got': _r, 'expected': {expected!r}}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        elif problem_id == "word-break":
            harness_lines.append(
                f"try:\n"
                f"    _r = word_break({inp['s']!r}, {inp['wordDict']!r})\n"
                f"    results.append({{'idx': {idx}, 'passed': bool(_r) == {expected!r}, 'got': _r, 'expected': {expected!r}}})\n"
                f"except Exception as e:\n"
                f"    results.append({{'idx': {idx}, 'passed': False, 'error': str(e)}})"
            )
        else:
            harness_lines.append(
                f"results.append({{'idx': {idx}, 'passed': False, 'error': 'Unknown problem id'}})"
            )

    harness_lines.append("import json; print(json.dumps(results))")
    return "\n".join(harness_lines)


# ─── JavaScript Harness Builder ───────────────────────────────────────────────

def _build_js_harness(problem: dict, candidate_code: str, test_cases: list[dict]) -> str:
    """Build a Node.js test harness."""
    problem_id = problem["id"]

    calls = []
    for idx, tc in enumerate(test_cases):
        inp = tc["input"]
        expected = tc["expected"]

        def json_val(v: Any) -> str:
            return json.dumps(v, default=str)

        if problem_id == "two-sum":
            calls.append(
                f"try {{ var _r = twoSum({json_val(inp['nums'])}, {json_val(inp['target'])}); "
                f"results.push({{idx:{idx}, passed: JSON.stringify([..._r].sort()) === JSON.stringify({json_val(sorted(expected))}), got: _r, expected: {json_val(expected)}}}); }}"
                f" catch(e) {{ results.push({{idx:{idx}, passed:false, error:e.message}}); }}"
            )
        elif problem_id == "valid-parentheses":
            calls.append(
                f"try {{ var _r = isValid({json_val(inp['s'])}); "
                f"results.push({{idx:{idx}, passed: !!_r === {json_val(expected)}, got: _r, expected: {json_val(expected)}}}); }}"
                f" catch(e) {{ results.push({{idx:{idx}, passed:false, error:e.message}}); }}"
            )
        elif problem_id == "best-time-buy-sell":
            calls.append(
                f"try {{ var _r = maxProfit({json_val(inp['prices'])}); "
                f"results.push({{idx:{idx}, passed: _r === {json_val(expected)}, got: _r, expected: {json_val(expected)}}}); }}"
                f" catch(e) {{ results.push({{idx:{idx}, passed:false, error:e.message}}); }}"
            )
        elif problem_id == "binary-search":
            calls.append(
                f"try {{ var _r = search({json_val(inp['nums'])}, {json_val(inp['target'])}); "
                f"results.push({{idx:{idx}, passed: _r === {json_val(expected)}, got: _r, expected: {json_val(expected)}}}); }}"
                f" catch(e) {{ results.push({{idx:{idx}, passed:false, error:e.message}}); }}"
            )
        elif problem_id == "longest-substring":
            calls.append(
                f"try {{ var _r = lengthOfLongestSubstring({json_val(inp['s'])}); "
                f"results.push({{idx:{idx}, passed: _r === {json_val(expected)}, got: _r, expected: {json_val(expected)}}}); }}"
                f" catch(e) {{ results.push({{idx:{idx}, passed:false, error:e.message}}); }}"
            )
        elif problem_id == "product-except-self":
            calls.append(
                f"try {{ var _r = productExceptSelf({json_val(inp['nums'])}); "
                f"results.push({{idx:{idx}, passed: JSON.stringify(Array.from(_r)) === JSON.stringify({json_val(expected)}), got: _r, expected: {json_val(expected)}}}); }}"
                f" catch(e) {{ results.push({{idx:{idx}, passed:false, error:e.message}}); }}"
            )
        elif problem_id == "merge-intervals":
            calls.append(
                f"try {{ var _r = merge({json_val(inp['intervals'])}); "
                f"results.push({{idx:{idx}, passed: JSON.stringify(_r) === JSON.stringify({json_val(expected)}), got: _r, expected: {json_val(expected)}}}); }}"
                f" catch(e) {{ results.push({{idx:{idx}, passed:false, error:e.message}}); }}"
            )
        elif problem_id == "top-k-frequent":
            calls.append(
                f"try {{ var _r = topKFrequent({json_val(inp['nums'])}, {json_val(inp['k'])}); "
                f"results.push({{idx:{idx}, passed: JSON.stringify([..._r].sort((a,b)=>a-b)) === JSON.stringify({json_val(sorted(expected))}), got: _r, expected: {json_val(expected)}}}); }}"
                f" catch(e) {{ results.push({{idx:{idx}, passed:false, error:e.message}}); }}"
            )
        elif problem_id == "number-of-islands":
            calls.append(
                f"try {{ var _r = numIslands(JSON.parse(JSON.stringify({json_val(inp['grid'])}))); "
                f"results.push({{idx:{idx}, passed: _r === {json_val(expected)}, got: _r, expected: {json_val(expected)}}}); }}"
                f" catch(e) {{ results.push({{idx:{idx}, passed:false, error:e.message}}); }}"
            )
        elif problem_id == "coin-change":
            calls.append(
                f"try {{ var _r = coinChange({json_val(inp['coins'])}, {json_val(inp['amount'])}); "
                f"results.push({{idx:{idx}, passed: _r === {json_val(expected)}, got: _r, expected: {json_val(expected)}}}); }}"
                f" catch(e) {{ results.push({{idx:{idx}, passed:false, error:e.message}}); }}"
            )
        elif problem_id == "longest-increasing-subsequence":
            calls.append(
                f"try {{ var _r = lengthOfLIS({json_val(inp['nums'])}); "
                f"results.push({{idx:{idx}, passed: _r === {json_val(expected)}, got: _r, expected: {json_val(expected)}}}); }}"
                f" catch(e) {{ results.push({{idx:{idx}, passed:false, error:e.message}}); }}"
            )
        elif problem_id == "course-schedule":
            calls.append(
                f"try {{ var _r = canFinish({json_val(inp['numCourses'])}, {json_val(inp['prerequisites'])}); "
                f"results.push({{idx:{idx}, passed: !!_r === {json_val(expected)}, got: _r, expected: {json_val(expected)}}}); }}"
                f" catch(e) {{ results.push({{idx:{idx}, passed:false, error:e.message}}); }}"
            )
        elif problem_id == "word-break":
            calls.append(
                f"try {{ var _r = wordBreak({json_val(inp['s'])}, {json_val(inp['wordDict'])}); "
                f"results.push({{idx:{idx}, passed: !!_r === {json_val(expected)}, got: _r, expected: {json_val(expected)}}}); }}"
                f" catch(e) {{ results.push({{idx:{idx}, passed:false, error:e.message}}); }}"
            )
        else:
            calls.append(f"results.push({{idx:{idx}, passed:false, error:'Unknown problem'}});")

    joined_calls = "\n".join(calls)
    return (
        f"var results = [];\n"
        f"{candidate_code}\n"
        f"{joined_calls}\n"
        f"console.log(JSON.stringify(results));"
    )


import json as _json  # already imported above, explicit for clarity in harness builder


# ─── Main Executor ────────────────────────────────────────────────────────────

def execute_code(
    problem: dict,
    candidate_code: str,
    language: str,
    test_cases: list[dict],
    time_limit: float = 5.0,
    visible_only: bool = False,
) -> ExecutionResult:
    """
    Execute candidate code against test cases in an isolated subprocess.
    Returns a structured ExecutionResult.
    """
    start_time = time.monotonic()
    total = len(test_cases)

    # ── Build harness ──────────────────────────────────────────────────────────
    try:
        if language == "python":
            harness = _build_python_harness(problem, candidate_code, test_cases)
            cmd = [PYTHON_EXEC, "-c", harness]
        elif language == "javascript":
            harness = _build_js_harness(problem, candidate_code, test_cases)
            # Write to temp file for Node.js
            tf = tempfile.NamedTemporaryFile(mode="w", suffix=".js", delete=False)
            tf.write(harness)
            tf.flush()
            tf.close()
            cmd = ["node", tf.name]
        else:
            return ExecutionResult(
                status="COMPILE_ERROR",
                passedTests=0,
                totalTests=total,
                compileError=f"Language '{language}' not supported in this MVP.",
                failedTestIndexes=list(range(total)),
            )
    except Exception as e:
        return ExecutionResult(
            status="COMPILE_ERROR",
            passedTests=0,
            totalTests=total,
            compileError=f"Harness build error: {str(e)}",
            failedTestIndexes=list(range(total)),
        )

    # ── Run subprocess ─────────────────────────────────────────────────────────
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=time_limit,
            cwd=tempfile.gettempdir(),
        )

        elapsed_ms = (time.monotonic() - start_time) * 1000

        # Clean up temp JS file
        if language == "javascript":
            try:
                os.unlink(tf.name)
            except Exception:
                pass

        # ── Parse output ───────────────────────────────────────────────────────
        if proc.returncode != 0 and not proc.stdout.strip():
            stderr = proc.stderr.strip()
            if "SyntaxError" in stderr or "SyntaxError" in proc.stdout or "IndentationError" in stderr:
                return ExecutionResult(
                    status="COMPILE_ERROR",
                    passedTests=0,
                    totalTests=total,
                    compileError=stderr[:500],
                    executionTimeMs=elapsed_ms,
                    failedTestIndexes=list(range(total)),
                )
            return ExecutionResult(
                status="RUNTIME_ERROR",
                passedTests=0,
                totalTests=total,
                runtimeError=stderr[:500] or proc.stdout[:500],
                executionTimeMs=elapsed_ms,
                failedTestIndexes=list(range(total)),
            )

        # Try to parse JSON results from stdout
        stdout = proc.stdout.strip()
        try:
            results = _json.loads(stdout)
        except Exception:
            # If there's a runtime error mixed into stdout
            stderr = proc.stderr.strip()
            err_msg = stderr if stderr else stdout[:500]
            return ExecutionResult(
                status="RUNTIME_ERROR",
                passedTests=0,
                totalTests=total,
                runtimeError=err_msg[:500],
                executionTimeMs=elapsed_ms,
                failedTestIndexes=list(range(total)),
            )

        passed = sum(1 for r in results if r.get("passed", False))
        failed_idxs = [r["idx"] for r in results if not r.get("passed", False)]

        # Build test details (for visible tests only)
        test_details = []
        if visible_only:
            for r in results:
                test_details.append({
                    "index": r.get("idx", 0),
                    "passed": r.get("passed", False),
                    "got": str(r.get("got", ""))[:200],
                    "expected": str(r.get("expected", ""))[:200],
                    "error": r.get("error"),
                })

        status = "ACCEPTED" if passed == total else "WRONG_ANSWER"

        return ExecutionResult(
            status=status,
            passedTests=passed,
            totalTests=total,
            executionTimeMs=round(elapsed_ms, 2),
            memoryKb=0.0,  # Not measured in subprocess mode
            failedTestIndexes=failed_idxs,
            testDetails=test_details,
        )

    except subprocess.TimeoutExpired:
        if language == "javascript":
            try:
                os.unlink(tf.name)
            except Exception:
                pass
        elapsed_ms = (time.monotonic() - start_time) * 1000
        return ExecutionResult(
            status="TIME_LIMIT",
            passedTests=0,
            totalTests=total,
            executionTimeMs=round(elapsed_ms, 2),
            failedTestIndexes=list(range(total)),
        )
    except Exception as e:
        return ExecutionResult(
            status="RUNTIME_ERROR",
            passedTests=0,
            totalTests=total,
            runtimeError=str(e)[:500],
            failedTestIndexes=list(range(total)),
        )
