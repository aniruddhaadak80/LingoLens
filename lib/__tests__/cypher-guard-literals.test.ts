import { test, expect, describe } from "bun:test";
import {
  assertReadOnlyCypher,
  stripCypherLiterals,
  CypherSafetyError,
} from "@/lib/cypher-guard";

describe("Cypher guardrail — string literals vs comments", () => {
  test("a // inside a string literal does not hide a destructive clause", () => {
    // The URL makes the literal contain "//". Stripping comments before
    // literals used to remove the rest of the line — including the
    // DETACH DELETE — from the text the guard analyses.
    const query = "MATCH (n) WHERE n.url = 'http://x' DETACH DELETE n";
    expect(stripCypherLiterals(query)).toContain("DETACH DELETE");
    expect(() => assertReadOnlyCypher(query)).toThrow(CypherSafetyError);
  });

  test("a // inside a string literal does not hide a SET clause", () => {
    const query = "MATCH (n) WHERE n.url = 'https://example.com' SET n.pwned = true";
    expect(() => assertReadOnlyCypher(query)).toThrow(CypherSafetyError);
  });

  test("a // inside a string literal does not hide a second statement", () => {
    const query = "MATCH (n) WHERE n.url = 'http://x'; MATCH (m) DETACH DELETE m";
    expect(() => assertReadOnlyCypher(query)).toThrow(CypherSafetyError);
  });

  test("a quote inside a comment does not start a string literal", () => {
    // "don't" must not open a string that swallows the rest of the query.
    const query = "MATCH (n) // don't do this\nRETURN n";
    const stripped = stripCypherLiterals(query);
    expect(stripped).toContain("RETURN n");
    expect(() => assertReadOnlyCypher(query)).not.toThrow();
  });

  test("a destructive clause after a quoted comment is still caught", () => {
    const query = "MATCH (n) /* don't worry */ DETACH DELETE n";
    expect(() => assertReadOnlyCypher(query)).toThrow(CypherSafetyError);
  });

  test("an escaped quote inside a literal does not end it early", () => {
    const query = "MATCH (n) WHERE n.note = 'it\\'s fine' RETURN n";
    expect(stripCypherLiterals(query)).not.toContain("it's fine");
    expect(() => assertReadOnlyCypher(query)).not.toThrow();
  });

  test("a backtick identifier is still neutralised", () => {
    const query = "MATCH (n:`created_at`) RETURN n";
    expect(() => assertReadOnlyCypher(query)).not.toThrow();
  });
});
