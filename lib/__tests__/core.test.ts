import { test, expect, describe } from "bun:test";
import { extractKeywords } from "@/lib/agent/memory";
import { sanitizeTenantId } from "@/lib/falkordb";
import { ALGORITHM_CATALOG } from "@/lib/agent/algorithms";

describe("extractKeywords", () => {
  test("strips stop words and keeps signal terms", () => {
    const keywords = extractKeywords("Who on the team has worked on authentication?");
    expect(keywords).toContain("authentication");
    expect(keywords).toContain("team");
    expect(keywords).not.toContain("the");
    expect(keywords).not.toContain("who");
    expect(keywords).not.toContain("has");
  });

  test("keeps entity names", () => {
    const keywords = extractKeywords("What breaks if auth-service goes down?");
    expect(keywords.some((k) => k.includes("auth"))).toBe(true);
  });

  test("caps at 8 keywords", () => {
    const keywords = extractKeywords(
      "alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima"
    );
    expect(keywords.length).toBeLessThanOrEqual(8);
  });

  test("handles empty and punctuation-only input", () => {
    expect(extractKeywords("")).toEqual([]);
    expect(extractKeywords("!!! ??? ...")).toEqual([]);
  });

  test("lowercases everything", () => {
    const keywords = extractKeywords("Who worked on FALKORDB?");
    expect(keywords).toContain("falkordb");
  });
});

describe("tenant isolation (multigraph topology)", () => {
  test("produces distinct sanitized graph names per tenant", () => {
    const a = sanitizeTenantId("user-alice");
    const b = sanitizeTenantId("user-bob");
    expect(a).not.toBe(b);
    expect(a).toMatch(/^user_alice_/);
    expect(b).toMatch(/^user_bob_/);
  });

  test("sanitizes unsafe characters", () => {
    const sanitized = sanitizeTenantId("tenant/../../etc;drop");
    expect(sanitized).not.toMatch(/[\/.;\-]/);
    expect(sanitized.length).toBeLessThanOrEqual(64);
  });

  test("falls back to default for empty tenant", () => {
    expect(sanitizeTenantId("")).toMatch(/^default_/);
    expect(sanitizeTenantId("   ")).toMatch(/_+/);
  });

  test("ids that only differ in punctuation get different graphs", () => {
    // The whole point of the multigraph layout is that two tenants never
    // share a graph — and therefore never share memories.
    expect(sanitizeTenantId("acme-corp")).not.toBe(sanitizeTenantId("acme.corp"));
    expect(sanitizeTenantId("acme-corp")).not.toBe(sanitizeTenantId("acme corp"));
    expect(sanitizeTenantId("acme-corp")).not.toBe(sanitizeTenantId("acme/corp"));
    expect(sanitizeTenantId("user@example.com")).not.toBe(
      sanitizeTenantId("user_example_com")
    );
  });

  test("ids that only differ past the truncation point get different graphs", () => {
    const long = "a".repeat(64);
    expect(sanitizeTenantId(`${long}x`)).not.toBe(sanitizeTenantId(`${long}y`));
  });

  test("the same id always maps to the same graph", () => {
    expect(sanitizeTenantId("acme-corp")).toBe(sanitizeTenantId("acme-corp"));
  });
});

describe("graph algorithm catalog", () => {
  test("exposes the documented FalkorDB algorithms", () => {
    const names = ALGORITHM_CATALOG.map((a) => a.name);
    expect(names).toContain("shortest_path");
    expect(names).toContain("page_rank");
    expect(names).toContain("degree_centrality");
    expect(names).toContain("community_detection");
    expect(names).toContain("impact_analysis");
    expect(names).toContain("bottleneck_finder");
  });

  test("every algorithm declares params and a description", () => {
    for (const algo of ALGORITHM_CATALOG) {
      expect(algo.params.length).toBeGreaterThan(0);
      expect(algo.description.length).toBeGreaterThan(10);
    }
  });
});
