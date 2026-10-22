/**
 * Cypher safety guardrail.
 *
 * LLM-generated and externally-supplied queries (researcher agents, the MCP
 * bridge) are only allowed to READ the knowledge graph. Writes go through
 * trusted, server-authored code paths (seeding, agent memory, write-back)
 * that never pass through this validator.
 *
 * The check strips string literals, backtick identifiers and comments first
 * so that a property named `created_at` or a string containing "DELETE"
 * can't produce a false positive.
 */

export class CypherSafetyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CypherSafetyError";
  }
}

/** Clauses that mutate or administer the graph. */
const DESTRUCTIVE_PATTERNS: RegExp[] = [
  /\bDETACH\s+DELETE\b/i,
  /\bDELETE\b/i,
  /\bCREATE\b/i,
  /\bMERGE\b/i,
  /\bSET\b/i,
  /\bREMOVE\b/i,
  /\bDROP\b/i,
  /\bALTER\b/i,
  /\bRENAME\b/i,
  /\bGRANT\b/i,
  /\bDENY\b/i,
  /\bFOREACH\b/i,
];

/** Queries must begin with one of these read clauses. */
const READ_START = /^\s*(MATCH|OPTIONAL\s+MATCH|WITH|RETURN|CALL|UNWIND|SHOW)\b/i;

export const MAX_CYPHER_LENGTH = 2000;

/**
 * Remove string literals, quoted identifiers and comments before scanning.
 *
 * This is a single left-to-right scan, not a sequence of independent regex
 * passes, because the constructs overlap: a `//` inside a string literal is
 * part of the literal, and a `'` inside a comment is part of the comment.
 * Stripping comments first would let a `//` in a literal swallow the rest of
 * the line — including a `DETACH DELETE` — and hide it from the guard.
 */
export function stripCypherLiterals(query: string): string {
  let out = "";
  let i = 0;
  const n = query.length;

  while (i < n) {
    const ch = query[i]!;
    const next = i + 1 < n ? query[i + 1] : "";

    // Line comment: // ... to end of line.
    if (ch === "/" && next === "/") {
      while (i < n && query[i] !== "\n") i++;
      out += " ";
      continue;
    }

    // Block comment: /* ... */
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < n && !(query[i] === "*" && query[i + 1] === "/")) i++;
      i = Math.min(n, i + 2);
      out += " ";
      continue;
    }

    // Single-quoted string literal.
    if (ch === "'") {
      i++;
      while (i < n) {
        if (query[i] === "\\") {
          i += 2;
          continue;
        }
        if (query[i] === "'") {
          i++;
          break;
        }
        i++;
      }
      out += "''";
      continue;
    }

    // Double-quoted string literal.
    if (ch === '"') {
      i++;
      while (i < n) {
        if (query[i] === "\\") {
          i += 2;
          continue;
        }
        if (query[i] === '"') {
          i++;
          break;
        }
        i++;
      }
      out += '""';
      continue;
    }

    // Backtick-quoted identifier.
    if (ch === "`") {
      i++;
      while (i < n) {
        if (query[i] === "\\") {
          i += 2;
          continue;
        }
        if (query[i] === "`") {
          i++;
          break;
        }
        i++;
      }
      out += "``";
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}

/**
 * Throw {@link CypherSafetyError} unless the query is a single read-only
 * statement. Returns the stripped query on success.
 */
export function assertReadOnlyCypher(query: string): string {
  if (!query || typeof query !== "string") {
    throw new CypherSafetyError("Query must be a non-empty string");
  }
  if (query.length > MAX_CYPHER_LENGTH) {
    throw new CypherSafetyError(
      `Query exceeds ${MAX_CYPHER_LENGTH} characters — refusing to run`
    );
  }

  const stripped = stripCypherLiterals(query);

  for (const pattern of DESTRUCTIVE_PATTERNS) {
    if (pattern.test(stripped)) {
      throw new CypherSafetyError(
        `Blocked: query contains a graph-mutating clause (${pattern.source}). ` +
          `Researchers may only read.`
      );
    }
  }

  if (!READ_START.test(stripped)) {
    throw new CypherSafetyError(
      "Blocked: query must start with a read clause (MATCH / WITH / RETURN / CALL / UNWIND)"
    );
  }

  // One statement only — a smuggled semicolon could chain a write.
  const withoutTrailing = stripped.trim().replace(/;+\s*$/, "");
  if (withoutTrailing.includes(";")) {
    throw new CypherSafetyError("Blocked: multiple Cypher statements are not allowed");
  }

  return stripped;
}

/** Non-throwing variant for previews / linting. */
export function isReadOnlyCypher(query: string): boolean {
  try {
    assertReadOnlyCypher(query);
    return true;
  } catch {
    return false;
  }
}

/** Allowed relationship types for agent write-back (whitelist, no injection). */
export const ALLOWED_WRITE_RELATIONS = [
  "WORKS_ON",
  "OWNS",
  "USES",
  "DEPENDS_ON",
  "AUTHORED",
  "MADE",
  "PART_OF",
  "EXPERT_IN",
  "AFFECTS",
  "MENTIONED_IN",
  "COLLABORATES_WITH",
] as const;

export const ALLOWED_ENTITY_LABELS = [
  "Person",
  "Project",
  "System",
  "Document",
  "Decision",
  "Team",
  "Technology",
] as const;

/** Entity names we're willing to write into the graph. */
export function isValidEntityName(name: unknown): name is string {
  return (
    typeof name === "string" &&
    name.length >= 2 &&
    name.length <= 80 &&
    /^[\w][\w .\-/@:]*$/.test(name)
  );
}
