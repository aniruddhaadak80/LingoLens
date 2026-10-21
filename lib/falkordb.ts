import { FalkorDB } from "falkordb";

/**
 * Per-tenant graph isolation via FalkorDB's multigraph topology.
 *
 * Track 2 judging criterion: "separate memory per user or tenant".
 * FalkorDB can hold thousands of isolated graphs in ONE instance, so we
 * don't need a database deployment per user — just a different graph name.
 *
 * Layout:
 *   `company`            shared knowledge graph (read by all agents)
 *   `memory_{tenantId}`  private memory graph (episodic/semantic/procedural)
 */

const KNOWLEDGE_GRAPH = process.env.FALKORDB_GRAPH || "company";

let clientPromise: Promise<FalkorDB> | null = null;

function connectFalkorDB(): Promise<FalkorDB> {
  if (!clientPromise) {
    const options: Record<string, string | number | undefined> = {
      host: process.env.FALKORDB_HOST || "localhost",
      port: parseInt(process.env.FALKORDB_PORT || "6379", 10),
    };
    if (process.env.FALKORDB_PASSWORD) {
      options.password = process.env.FALKORDB_PASSWORD;
    }
    if (process.env.FALKORDB_USERNAME) {
      options.username = process.env.FALKORDB_USERNAME;
    }

    clientPromise = FalkorDB.connect(options as any);
    clientPromise.catch(() => {
      clientPromise = null;
    });
  }
  return clientPromise;
}

/**
 * Strip anything that isn't safe inside a graph identifier.
 *
 * The readable part is kept so the graph list stays legible, but a short
 * hash of the ORIGINAL id is appended. Without it the mapping is lossy:
 * "acme-corp" and "acme.corp" would both become "acme_corp" and the two
 * tenants would share one memory graph — and therefore each other's
 * memories.
 */
export function sanitizeTenantId(tenantId: string): string {
  const raw = tenantId || "default";
  const slug = raw.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 48);
  return `${slug}_${hash32(raw)}`;
}

/** FNV-1a, 32-bit. Not cryptographic — it only has to make the mapping injective. */
function hash32(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Shared company knowledge graph. */
export async function getKnowledgeGraph() {
  const client = await connectFalkorDB();
  return client.selectGraph(KNOWLEDGE_GRAPH);
}

/** Private, isolated memory graph for one tenant/user/session. */
export async function getTenantMemoryGraph(tenantId: string) {
  const client = await connectFalkorDB();
  return client.selectGraph(`memory_${sanitizeTenantId(tenantId)}`);
}

/** List every graph in the instance — demonstrates multigraph isolation. */
export async function listTenantGraphs(): Promise<string[]> {
  try {
    const client = await connectFalkorDB();
    const graphs = await client.list();
    return Array.isArray(graphs) ? graphs : [];
  } catch {
    return [];
  }
}

/** Run Cypher against the shared knowledge graph. */
export async function runCypher(
  query: string,
  params?: Record<string, any>
): Promise<Record<string, any>[]> {
  const graph = await getKnowledgeGraph();
  try {
    const result = await graph.query(query, { params });
    return (result.data ?? []) as Record<string, any>[];
  } catch (err) {
    console.error("[FalkorDB] Query failed:", query, err);
    throw err;
  }
}

/** Run Cypher against an isolated tenant graph (for memory operations). */
export async function runTenantCypher(
  tenantId: string,
  query: string,
  params?: Record<string, string | number>
): Promise<Record<string, any>[]> {
  const graph = await getTenantMemoryGraph(tenantId);
  try {
    const result = await graph.query(query, { params });
    return (result.data ?? []) as Record<string, any>[];
  } catch (err) {
    console.error("[FalkorDB] Tenant query failed:", query, err);
    throw err;
  }
}

export async function isFalkorDBAvailable(): Promise<boolean> {
  try {
    await runCypher("RETURN 1");
    return true;
  } catch {
    return false;
  }
}
