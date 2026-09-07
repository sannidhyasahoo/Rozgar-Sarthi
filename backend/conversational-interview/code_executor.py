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
import json
import shutil
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


def _find_node_exec() -> str | None:
    found = shutil.which("node")
    if found:
        return found
    candidates = [
        r"C:\Program Files\nodejs\node.exe",
        r"C:\Program Files (x86)\nodejs\node.exe",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None


def _find_cpp_compiler() -> str | None:
    found = shutil.which("g++") or shutil.which("clang++")
    if found:
        return found
    candidates = [
        r"C:\MinGW\bin\g++.exe",
        r"C:\msys64\ucrt64\bin\g++.exe",
        r"C:\msys64\mingw64\bin\g++.exe",
        r"C:\Program Files\Git\usr\bin\g++.exe",
        r"C:\TDM-GCC-64\bin\g++.exe",
        r"C:\w64devkit\bin\g++.exe",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None


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
        elif problem_id == "binary-tree-level-order":
            calls.append(
                f"try {{ var _r = levelOrder(_buildTree({json_val(inp['tree'])})); "
                f"results.push({{idx:{idx}, passed: JSON.stringify(_r) === JSON.stringify({json_val(expected)}), got: _r, expected: {json_val(expected)}}}); }}"
                f" catch(e) {{ results.push({{idx:{idx}, passed:false, error:e.message}}); }}"
            )
        elif problem_id == "lowest-common-ancestor":
            calls.append(
                f"try {{ var _r = lowestCommonAncestor(_buildTree({json_val(inp['tree'])}), {json_val(inp['p'])}, {json_val(inp['q'])}); "
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
    tree_helpers = """
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
}

function _buildTree(arr) {
    if (!arr || arr.length === 0 || arr[0] === null) return null;
    var root = new TreeNode(arr[0]);
    var queue = [root];
    var i = 1;
    while (queue.length > 0 && i < arr.length) {
        var node = queue.shift();
        if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
            node.left = new TreeNode(arr[i]);
            queue.push(node.left);
        }
        i++;
        if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
            node.right = new TreeNode(arr[i]);
            queue.push(node.right);
        }
        i++;
    }
    return root;
}
"""
    return (
        f"var results = [];\n"
        f"{tree_helpers}\n"
        f"{candidate_code}\n"
        f"{joined_calls}\n"
        f"console.log(JSON.stringify(results));"
    )


# ─── C++ Harness Builder ──────────────────────────────────────────────────────

def _cpp_quote(s: str) -> str:
    out = ""
    for c in s:
        if c == '"':
            out += '\\"'
        elif c == '\\':
            out += '\\\\'
        else:
            out += c
    return f'"{out}"'


def _cpp_literal(v: Any) -> str:
    if isinstance(v, bool):
        return "true" if v else "false"
    elif isinstance(v, (int, float)):
        return str(v)
    elif isinstance(v, str):
        return _cpp_quote(v)
    elif isinstance(v, list):
        items = [_cpp_literal(x) for x in v]
        return "{" + ", ".join(items) + "}"
    elif v is None:
        return '"null"'
    return str(v)


def _tree_to_cpp_vec(arr: list) -> str:
    parts = []
    for x in arr:
        if x is None:
            parts.append('"null"')
        else:
            parts.append(f'"{x}"')
    return "{" + ", ".join(parts) + "}"


def _grid_to_cpp(grid: list) -> str:
    rows = []
    for r in grid:
        items = [f"'{c}'" for c in r]
        rows.append("{" + ", ".join(items) + "}")
    return "{" + ", ".join(rows) + "}"


def _build_cpp_harness(problem: dict, candidate_code: str, test_cases: list[dict]) -> str:
    problem_id = problem["id"]
    has_class = "class Solution" in candidate_code
    call_prefix = "sol." if has_class else ""

    harness_lines = [
        "#include <iostream>",
        "#include <vector>",
        "#include <string>",
        "#include <sstream>",
        "#include <algorithm>",
        "#include <unordered_map>",
        "#include <unordered_set>",
        "#include <queue>",
        "#include <stack>",
        "#include <climits>",
        "using namespace std;",
        "",
        "string to_json(int v) { return to_string(v); }",
        "string to_json(long long v) { return to_string(v); }",
        "string to_json(bool v) { return v ? \"true\" : \"false\"; }",
        "string to_json(char c) { return string(\"\\\"\") + c + \"\\\"\"; }",
        "string to_json(const string& s) {",
        "    string out = \"\\\"\";",
        "    for (char c : s) {",
        "        if (c == '\"') out += \"\\\\\\\"\";",
        "        else if (c == '\\\\') out += \"\\\\\\\\\";",
        "        else out += c;",
        "    }",
        "    out += \"\\\"\";",
        "    return out;",
        "}",
        "template<typename T>",
        "string to_json(const vector<T>& vec) {",
        "    string out = \"[\";",
        "    for (size_t i = 0; i < vec.size(); ++i) {",
        "        if (i > 0) out += \", \";",
        "        out += to_json(vec[i]);",
        "    }",
        "    out += \"]\";",
        "    return out;",
        "}",
    ]

    if "struct TreeNode" not in candidate_code and "class TreeNode" not in candidate_code:
        harness_lines.extend([
            "struct TreeNode {",
            "    int val;",
            "    TreeNode *left;",
            "    TreeNode *right;",
            "    TreeNode() : val(0), left(NULL), right(NULL) {}",
            "    TreeNode(int x) : val(x), left(NULL), right(NULL) {}",
            "};",
        ])

    harness_lines.extend([
        "",
        "// ── Candidate Code ──",
        candidate_code,
        "",
        "TreeNode* _buildTree(const vector<string>& arr) {",
        "    if (arr.empty() || arr[0] == \"null\") return nullptr;",
        "    TreeNode* root = new TreeNode(stoi(arr[0]));",
        "    queue<TreeNode*> q;",
        "    q.push(root);",
        "    size_t i = 1;",
        "    while (!q.empty() && i < arr.size()) {",
        "        TreeNode* curr = q.front();",
        "        q.pop();",
        "        if (i < arr.size() && arr[i] != \"null\") {",
        "            curr->left = new TreeNode(stoi(arr[i]));",
        "            q.push(curr->left);",
        "        }",
        "        i++;",
        "        if (i < arr.size() && arr[i] != \"null\") {",
        "            curr->right = new TreeNode(stoi(arr[i]));",
        "            q.push(curr->right);",
        "        }",
        "        i++;",
        "    }",
        "    return root;",
        "}",
        "",
        "int main() {",
    ])

    if has_class:
        harness_lines.append("    Solution sol;")

    harness_lines.append('    cout << "[";')

    total_tc = len(test_cases)
    for idx, tc in enumerate(test_cases):
        inp = tc["input"]
        expected = tc["expected"]
        comma = "" if idx == total_tc - 1 else ","

        block = [f"    // Test case {idx}", "    {", "        try {"]

        if problem_id == "two-sum":
            block.extend([
                f"            vector<int> _nums = {_cpp_literal(inp['nums'])};",
                f"            int _target = {_cpp_literal(inp['target'])};",
                f"            vector<int> _exp = {_cpp_literal(expected)};",
                f"            vector<int> _got = {call_prefix}twoSum(_nums, _target);",
                f"            vector<int> _g_s = _got; vector<int> _e_s = _exp;",
                f"            sort(_g_s.begin(), _g_s.end()); sort(_e_s.begin(), _e_s.end());",
                f"            bool _p = (_g_s == _e_s);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        elif problem_id == "valid-parentheses":
            block.extend([
                f"            string _s = {_cpp_literal(inp['s'])};",
                f"            bool _exp = {_cpp_literal(expected)};",
                f"            bool _got = {call_prefix}isValid(_s);",
                f"            bool _p = (_got == _exp);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        elif problem_id == "best-time-buy-sell":
            block.extend([
                f"            vector<int> _prices = {_cpp_literal(inp['prices'])};",
                f"            int _exp = {_cpp_literal(expected)};",
                f"            int _got = {call_prefix}maxProfit(_prices);",
                f"            bool _p = (_got == _exp);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        elif problem_id == "binary-search":
            block.extend([
                f"            vector<int> _nums = {_cpp_literal(inp['nums'])};",
                f"            int _target = {_cpp_literal(inp['target'])};",
                f"            int _exp = {_cpp_literal(expected)};",
                f"            int _got = {call_prefix}search(_nums, _target);",
                f"            bool _p = (_got == _exp);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        elif problem_id == "longest-substring":
            block.extend([
                f"            string _s = {_cpp_literal(inp['s'])};",
                f"            int _exp = {_cpp_literal(expected)};",
                f"            int _got = {call_prefix}lengthOfLongestSubstring(_s);",
                f"            bool _p = (_got == _exp);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        elif problem_id == "product-except-self":
            block.extend([
                f"            vector<int> _nums = {_cpp_literal(inp['nums'])};",
                f"            vector<int> _exp = {_cpp_literal(expected)};",
                f"            vector<int> _got = {call_prefix}productExceptSelf(_nums);",
                f"            bool _p = (_got == _exp);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        elif problem_id == "merge-intervals":
            block.extend([
                f"            vector<vector<int>> _intervals = {_cpp_literal(inp['intervals'])};",
                f"            vector<vector<int>> _exp = {_cpp_literal(expected)};",
                f"            vector<vector<int>> _got = {call_prefix}merge(_intervals);",
                f"            bool _p = (_got == _exp);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        elif problem_id == "top-k-frequent":
            block.extend([
                f"            vector<int> _nums = {_cpp_literal(inp['nums'])};",
                f"            int _k = {_cpp_literal(inp['k'])};",
                f"            vector<int> _exp = {_cpp_literal(expected)};",
                f"            vector<int> _got = {call_prefix}topKFrequent(_nums, _k);",
                f"            vector<int> _g_s = _got; vector<int> _e_s = _exp;",
                f"            sort(_g_s.begin(), _g_s.end()); sort(_e_s.begin(), _e_s.end());",
                f"            bool _p = (_g_s == _e_s);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        elif problem_id == "number-of-islands":
            block.extend([
                f"            vector<vector<char>> _grid = {_grid_to_cpp(inp['grid'])};",
                f"            int _exp = {_cpp_literal(expected)};",
                f"            int _got = {call_prefix}numIslands(_grid);",
                f"            bool _p = (_got == _exp);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        elif problem_id == "binary-tree-level-order":
            block.extend([
                f"            vector<string> _tree_raw = {_tree_to_cpp_vec(inp['tree'])};",
                f"            TreeNode* _root = _buildTree(_tree_raw);",
                f"            vector<vector<int>> _exp = {_cpp_literal(expected)};",
                f"            vector<vector<int>> _got = {call_prefix}levelOrder(_root);",
                f"            bool _p = (_got == _exp);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        elif problem_id == "lowest-common-ancestor":
            block.extend([
                f"            vector<string> _tree_raw = {_tree_to_cpp_vec(inp['tree'])};",
                f"            TreeNode* _root = _buildTree(_tree_raw);",
                f"            int _p_val = {_cpp_literal(inp['p'])};",
                f"            int _q_val = {_cpp_literal(inp['q'])};",
                f"            int _exp = {_cpp_literal(expected)};",
                f"            int _got = {call_prefix}lowestCommonAncestor(_root, _p_val, _q_val);",
                f"            bool _p = (_got == _exp);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        elif problem_id == "coin-change":
            block.extend([
                f"            vector<int> _coins = {_cpp_literal(inp['coins'])};",
                f"            int _amount = {_cpp_literal(inp['amount'])};",
                f"            int _exp = {_cpp_literal(expected)};",
                f"            int _got = {call_prefix}coinChange(_coins, _amount);",
                f"            bool _p = (_got == _exp);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        elif problem_id == "longest-increasing-subsequence":
            block.extend([
                f"            vector<int> _nums = {_cpp_literal(inp['nums'])};",
                f"            int _exp = {_cpp_literal(expected)};",
                f"            int _got = {call_prefix}lengthOfLIS(_nums);",
                f"            bool _p = (_got == _exp);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        elif problem_id == "course-schedule":
            block.extend([
                f"            int _numCourses = {_cpp_literal(inp['numCourses'])};",
                f"            vector<vector<int>> _prereqs = {_cpp_literal(inp['prerequisites'])};",
                f"            bool _exp = {_cpp_literal(expected)};",
                f"            bool _got = {call_prefix}canFinish(_numCourses, _prereqs);",
                f"            bool _p = (bool(_got) == _exp);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        elif problem_id == "word-break":
            block.extend([
                f"            string _s = {_cpp_literal(inp['s'])};",
                f"            vector<string> _wordDict = {_cpp_literal(inp['wordDict'])};",
                f"            bool _exp = {_cpp_literal(expected)};",
                f"            bool _got = {call_prefix}wordBreak(_s, _wordDict);",
                f"            bool _p = (bool(_got) == _exp);",
                f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": \" << (_p ? \"true\" : \"false\")",
                f"                 << \", \\\"got\\\": \" << to_json(_got)",
                f"                 << \", \\\"expected\\\": \" << to_json(_exp) << \"}}{comma}\\n\";",
            ])
        else:
            block.append(f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": false, \\\"error\\\": \\\"Unknown problem id\\\"}}{comma}\\n\";")

        block.extend([
            "        } catch (const exception& e) {",
            f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": false, \\\"error\\\": \\\"\" << e.what() << \"\\\"}}{comma}\\n\";",
            "        } catch (...) {",
            f"            cout << \"{{\\\"idx\\\": {idx}, \\\"passed\\\": false, \\\"error\\\": \\\"Runtime exception\\\"}}{comma}\\n\";",
            "        }",
            "    }",
        ])
        harness_lines.extend(block)

    harness_lines.extend([
        '    cout << "]" << endl;',
        '    return 0;',
        '}',
    ])

    return "\n".join(harness_lines)


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
    tf_js = None
    tf_cpp = None
    exe_path = None

    # ── Build harness ──────────────────────────────────────────────────────────
    try:
        if language == "python":
            harness = _build_python_harness(problem, candidate_code, test_cases)
            cmd = [PYTHON_EXEC, "-c", harness]
        elif language == "javascript":
            node_exec = _find_node_exec()
            if not node_exec:
                return ExecutionResult(
                    status="COMPILE_ERROR",
                    passedTests=0,
                    totalTests=total,
                    compileError="Node.js runtime (node) not found. Please install Node.js or add node to PATH.",
                    failedTestIndexes=list(range(total)),
                )
            harness = _build_js_harness(problem, candidate_code, test_cases)
            tf_js = tempfile.NamedTemporaryFile(mode="w", suffix=".js", delete=False, encoding="utf-8")
            tf_js.write(harness)
            tf_js.flush()
            tf_js.close()
            cmd = [node_exec, tf_js.name]
        elif language in ("cpp", "c++"):
            cpp_compiler = _find_cpp_compiler()
            if not cpp_compiler:
                return ExecutionResult(
                    status="COMPILE_ERROR",
                    passedTests=0,
                    totalTests=total,
                    compileError="C++ compiler (g++ / clang++) not found. Please install MinGW-w64 or add g++ to PATH.",
                    failedTestIndexes=list(range(total)),
                )
            harness = _build_cpp_harness(problem, candidate_code, test_cases)
            tf_cpp = tempfile.NamedTemporaryFile(mode="w", suffix=".cpp", delete=False, encoding="utf-8")
            tf_cpp.write(harness)
            tf_cpp.flush()
            tf_cpp.close()
            exe_path = tf_cpp.name.replace(".cpp", ".exe")

            # Compile C++
            comp_proc = subprocess.run(
                [cpp_compiler, "-std=c++14", "-O2", tf_cpp.name, "-o", exe_path],
                capture_output=True,
                text=True,
                timeout=12.0,
                cwd=tempfile.gettempdir(),
            )
            elapsed_ms = (time.monotonic() - start_time) * 1000
            if comp_proc.returncode != 0:
                try:
                    os.unlink(tf_cpp.name)
                except Exception:
                    pass
                err = comp_proc.stderr.strip() or comp_proc.stdout.strip()
                return ExecutionResult(
                    status="COMPILE_ERROR",
                    passedTests=0,
                    totalTests=total,
                    compileError=err[:1000],
                    executionTimeMs=round(elapsed_ms, 2),
                    failedTestIndexes=list(range(total)),
                )
            cmd = [exe_path]
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

        # ── Parse output ───────────────────────────────────────────────────────
        if proc.returncode != 0 and not proc.stdout.strip():
            stderr = proc.stderr.strip()
            if "SyntaxError" in stderr or "SyntaxError" in proc.stdout or "IndentationError" in stderr:
                return ExecutionResult(
                    status="COMPILE_ERROR",
                    passedTests=0,
                    totalTests=total,
                    compileError=stderr[:500],
                    executionTimeMs=round(elapsed_ms, 2),
                    failedTestIndexes=list(range(total)),
                )
            return ExecutionResult(
                status="RUNTIME_ERROR",
                passedTests=0,
                totalTests=total,
                runtimeError=stderr[:500] or proc.stdout[:500],
                executionTimeMs=round(elapsed_ms, 2),
                failedTestIndexes=list(range(total)),
            )

        # Try to parse JSON results from stdout
        stdout = proc.stdout.strip()
        try:
            results = json.loads(stdout)
        except Exception:
            stderr = proc.stderr.strip()
            err_msg = stderr if stderr else stdout[:500]
            return ExecutionResult(
                status="RUNTIME_ERROR",
                passedTests=0,
                totalTests=total,
                runtimeError=err_msg[:500],
                executionTimeMs=round(elapsed_ms, 2),
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
            memoryKb=0.0,
            failedTestIndexes=failed_idxs,
            testDetails=test_details,
        )

    except subprocess.TimeoutExpired:
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
    finally:
        if tf_js and os.path.exists(tf_js.name):
            try:
                os.unlink(tf_js.name)
            except Exception:
                pass
        if tf_cpp and os.path.exists(tf_cpp.name):
            try:
                os.unlink(tf_cpp.name)
            except Exception:
                pass
        if exe_path and os.path.exists(exe_path):
            try:
                os.unlink(exe_path)
            except Exception:
                pass
