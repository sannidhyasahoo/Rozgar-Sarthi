"""
tree_sitter_analyzer.py
Static code analysis using Tree-sitter AST parsing.

Detects structural patterns from candidate code and produces
complexity estimates + code quality signals.

The analysis is evidence, not an oracle:
  - Returns confidence scores
  - Avoids claiming exact Big-O when ambiguous
  - Used to SUPPLEMENT execution results, never replace them
"""

import re
from typing import Optional
from coding_session_store import CodeAnalysis

# ─── Tree-sitter availability ─────────────────────────────────────────────────
try:
    import tree_sitter_python as tspython
    import tree_sitter_javascript as tsjavascript
    import tree_sitter_cpp as tscpp
    from tree_sitter import Language, Parser

    PY_LANGUAGE = Language(tspython.language())
    JS_LANGUAGE = Language(tsjavascript.language())
    CPP_LANGUAGE = Language(tscpp.language())
    TREE_SITTER_AVAILABLE = True
except ImportError:
    TREE_SITTER_AVAILABLE = False


# ─── Fallback regex-based analyzer (when tree-sitter not installed) ───────────

def _regex_analyze(code: str, language: str) -> CodeAnalysis:
    """
    Lightweight fallback analysis using pattern matching.
    Used when tree-sitter is not available.
    """
    signals = []
    data_structures = []
    has_recursion = False
    loop_depth = 0
    confidence = 0.4  # lower confidence for regex

    # Detect recursion by looking for function names called inside themselves
    # Simple heuristic: find def name(...): and check if name() appears in body
    func_matches = re.findall(r'def (\w+)\s*\(', code)
    for fname in func_matches:
        # Check if function calls itself
        pattern = rf'\b{re.escape(fname)}\s*\('
        calls = re.findall(pattern, code)
        if len(calls) > 1:  # more than just the definition
            has_recursion = True
            signals.append("recursive_call")

    # Count loop nesting depth
    lines = code.split('\n')
    max_depth = 0
    current_depth = 0
    for line in lines:
        stripped = line.lstrip()
        indent = len(line) - len(stripped)
        if re.match(r'^(for|while)\s', stripped):
            current_depth = indent // 4 + 1
            max_depth = max(max_depth, current_depth)
    loop_depth = max_depth

    if max_depth >= 2:
        signals.append("nested_loop")
    elif max_depth == 1:
        signals.append("single_loop")

    # Data structure detection
    if re.search(r'\bdict\b|\{.*:.*\}|defaultdict|Counter|HashMap|unordered_map', code):
        data_structures.append("hashmap")
        signals.append("hashmap_usage")
    if re.search(r'\bset\b|\bSet\b|\bunordered_set\b', code):
        data_structures.append("set")
        signals.append("set_usage")
    if re.search(r'\bdeque\b|\bqueue\b|\bQueue\b', code, re.IGNORECASE):
        data_structures.append("queue")
        signals.append("queue_usage")
    if re.search(r'\.sort\(|sorted\(|sort\(', code):
        signals.append("sorting")
    if re.search(r'bisect|binary_search|lo.*hi.*mid|left.*right.*mid', code):
        signals.append("binary_search_pattern")
    if re.search(r'heapq|heappush|heappop|priority_queue', code):
        data_structures.append("heap")
    if re.search(r'\.append\(|\.push\(|stack', code):
        data_structures.append("stack")
        signals.append("stack_usage")

    # Estimate complexity
    complexity, conf = _estimate_complexity(signals, has_recursion, loop_depth)

    return CodeAnalysis(
        estimatedTimeComplexity=complexity,
        estimatedSpaceComplexity="O(n)" if data_structures else "O(1)",
        confidence=conf,
        signals=signals,
        dataStructures=list(set(data_structures)),
        hasRecursion=has_recursion,
        functionCount=len(func_matches),
        loopDepth=loop_depth,
    )


# ─── Tree-sitter based analyzer ───────────────────────────────────────────────

class TreeSitterAnalyzer:
    """
    AST-based code analyzer using Tree-sitter.
    Provides structural signals for complexity estimation.
    """

    def __init__(self, language: str):
        self.language_name = language
        self._parser = None
        self._tree = None
        self._code = ""

        if TREE_SITTER_AVAILABLE:
            self._parser = Parser()
            if language == "python":
                self._parser.language = PY_LANGUAGE
            elif language == "javascript":
                self._parser.language = JS_LANGUAGE
            elif language == "cpp":
                self._parser.language = CPP_LANGUAGE

    def parse(self, code: str):
        self._code = code
        if self._parser:
            self._tree = self._parser.parse(code.encode("utf-8"))
        return self

    def _walk_node(self, node, visitor):
        """DFS walk over AST nodes."""
        visitor(node)
        for child in node.children:
            self._walk_node(child, visitor)

    def _count_loop_depth(self, node, current_depth: int = 0) -> int:
        """Recursively find maximum loop nesting depth."""
        loop_types = {
            "python": ["for_statement", "while_statement"],
            "javascript": ["for_statement", "while_statement", "for_in_statement", "for_of_statement"],
            "cpp": ["for_statement", "while_statement", "do_statement"],
        }
        is_loop = node.type in loop_types.get(self.language_name, [])
        depth = current_depth + (1 if is_loop else 0)
        max_depth = depth
        for child in node.children:
            child_depth = self._count_loop_depth(child, depth)
            max_depth = max(max_depth, child_depth)
        return max_depth

    def _find_nodes_of_type(self, root, target_types: list[str]) -> list:
        """Collect all nodes matching given types."""
        found = []

        def visitor(node):
            if node.type in target_types:
                found.append(node)

        self._walk_node(root, visitor)
        return found

    def _get_node_text(self, node) -> str:
        return self._code[node.start_byte:node.end_byte]

    def analyze(self) -> CodeAnalysis:
        """Run full AST analysis and return CodeAnalysis."""
        if not TREE_SITTER_AVAILABLE or not self._tree:
            return _regex_analyze(self._code, self.language_name)

        root = self._tree.root_node
        signals = []
        data_structures = []
        has_recursion = False
        func_names = []

        # ── Loop analysis ──────────────────────────────────────────────────────
        loop_depth = self._count_loop_depth(root)
        if loop_depth >= 2:
            signals.append("nested_loop")
        elif loop_depth == 1:
            signals.append("single_loop")

        # ── Function extraction ────────────────────────────────────────────────
        func_types = {
            "python": ["function_definition"],
            "javascript": ["function_declaration", "function_expression", "arrow_function", "method_definition"],
            "cpp": ["function_definition"],
        }
        funcs = self._find_nodes_of_type(root, func_types.get(self.language_name, []))

        for func_node in funcs:
            # Get function name
            for child in func_node.children:
                if child.type in ["identifier", "property_identifier"]:
                    func_names.append(self._get_node_text(child))
                    break

        # ── Recursion detection ────────────────────────────────────────────────
        call_types = {
            "python": ["call"],
            "javascript": ["call_expression"],
            "cpp": ["call_expression"],
        }
        calls = self._find_nodes_of_type(root, call_types.get(self.language_name, []))

        called_names = set()
        for call_node in calls:
            for child in call_node.children:
                if child.type == "identifier":
                    called_names.add(self._get_node_text(child))
                    break
                elif child.type in ["attribute", "member_expression"]:
                    # method call
                    parts = self._get_node_text(child)
                    called_names.add(parts)

        for fname in func_names:
            if fname in called_names:
                has_recursion = True
                signals.append("recursive_call")
                break

        # ── Data structure detection (by identifier names + call patterns) ─────
        full_code = self._code.lower()

        if any(kw in full_code for kw in ["dict(", "defaultdict", "counter(", "{}", "hashmap", "unordered_map", "map<"]):
            data_structures.append("hashmap")
            signals.append("hashmap_usage")

        if re.search(r'\bset\(\b|set\(\)|{[^:]+}|unordered_set|Set\(', self._code):
            data_structures.append("set")
            signals.append("set_usage")

        if any(kw in full_code for kw in ["deque", "queue", "bfs", "collections.deque"]):
            data_structures.append("queue")
            signals.append("queue_usage")

        if any(kw in full_code for kw in ["heapq", "heappush", "heappop", "priority_queue", "make_heap"]):
            data_structures.append("heap")

        if any(kw in full_code for kw in ["stack", ".append(", ".push("]):
            if "stack" in full_code or (signals.count("single_loop") > 0):
                data_structures.append("stack")
                signals.append("stack_usage")

        if re.search(r'\.sort\(|sorted\(|std::sort|\.sort\b', self._code):
            signals.append("sorting")

        if re.search(r'bisect|binary.search|lo.*hi.*mid|left.*right.*mid', full_code):
            signals.append("binary_search_pattern")

        if re.search(r'dfs|bfs|graph|adjacen|neighbor|visited', full_code):
            signals.append("graph_traversal")

        if re.search(r'\.left|\.right|root\.|node\.', full_code):
            signals.append("tree_traversal")

        # ── Complexity estimation ──────────────────────────────────────────────
        complexity, confidence = _estimate_complexity(signals, has_recursion, loop_depth)

        # higher confidence with tree-sitter
        confidence = min(confidence + 0.15, 0.95)

        return CodeAnalysis(
            estimatedTimeComplexity=complexity,
            estimatedSpaceComplexity=_estimate_space(data_structures, signals),
            confidence=round(confidence, 2),
            signals=list(set(signals)),
            dataStructures=list(set(data_structures)),
            hasRecursion=has_recursion,
            functionCount=len(func_names),
            loopDepth=loop_depth,
        )


# ─── Complexity Estimation ────────────────────────────────────────────────────

def _estimate_complexity(
    signals: list[str],
    has_recursion: bool,
    loop_depth: int,
) -> tuple[str, float]:
    """
    Heuristic complexity estimation from structural signals.
    Returns (complexity_string, confidence_float).
    """
    if "nested_loop" in signals:
        if has_recursion:
            return "O(n^3)", 0.55
        return "O(n^2)", 0.75

    if has_recursion:
        if "recursive_call" in signals:
            if "binary_search_pattern" in signals:
                return "O(log n)", 0.72
            if loop_depth > 0:
                return "O(n log n)", 0.60
            return "O(n)", 0.55  # could be O(2^n) — hard to tell statically

    if "binary_search_pattern" in signals:
        return "O(log n)", 0.78

    if "sorting" in signals:
        return "O(n log n)", 0.80

    if "single_loop" in signals:
        if "hashmap_usage" in signals or "set_usage" in signals:
            return "O(n)", 0.82
        return "O(n)", 0.70

    if "graph_traversal" in signals:
        return "O(V+E)", 0.65

    if loop_depth == 0 and not has_recursion:
        return "O(1)", 0.60

    return "Unknown", 0.30


def _estimate_space(data_structures: list[str], signals: list[str]) -> str:
    if "hashmap" in data_structures or "set" in data_structures:
        return "O(n)"
    if "queue" in data_structures or "stack" in data_structures:
        return "O(n)"
    if "heap" in data_structures:
        return "O(n)"
    if "recursive_call" in signals:
        return "O(n)"  # call stack
    return "O(1)"


# ─── Public API ───────────────────────────────────────────────────────────────

def analyze_code(code: str, language: str) -> CodeAnalysis:
    """
    Primary entry point for code analysis.
    Uses Tree-sitter if available, falls back to regex heuristics.
    """
    if not code or not code.strip():
        return CodeAnalysis()

    if TREE_SITTER_AVAILABLE:
        try:
            analyzer = TreeSitterAnalyzer(language)
            analyzer.parse(code)
            return analyzer.analyze()
        except Exception:
            pass

    # Fallback
    return _regex_analyze(code, language)
