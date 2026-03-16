import type { GraphEdge, GraphNode } from "../types.js";

export function buildAdjacency(edges: GraphEdge[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (!map.has(edge.source)) map.set(edge.source, new Set());
    map.get(edge.source)?.add(edge.target);
  }
  return map;
}

export function bfsNeighborhood(
  root: string,
  adjacency: Map<string, Set<string>>,
  maxDepth: number,
): Set<string> {
  const visited = new Set<string>([root]);
  const queue: Array<{ node: string; depth: number }> = [{ node: root, depth: 0 }];

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) continue;
    if (next.depth >= maxDepth) continue;

    for (const neighbor of adjacency.get(next.node) ?? []) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      queue.push({ node: neighbor, depth: next.depth + 1 });
    }
  }

  return visited;
}

export function filterGraph(nodes: GraphNode[], edges: GraphEdge[], include: Set<string>) {
  return {
    nodes: nodes.filter((node) => include.has(node.id)),
    edges: edges.filter((edge) => include.has(edge.source) && include.has(edge.target)),
  };
}
