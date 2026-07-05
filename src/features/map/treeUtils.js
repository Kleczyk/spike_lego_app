// Pomocnicze funkcje drzewa API (czyste — bez Reacta)

export function nodeVisual(node) {
  if (node.emoji) return { ico: node.emoji, emoji: true };
  if (node.kind === "pkg") return { ico: "📦", emoji: true };
  if (node.kind === "mod") return { ico: "{}", bg: ACC[node.accent] || "var(--neutral)" };
  if (node.kind === "folder") return { ico: node.icon || "/", bg: "var(--neutral)" };
  if (node.kind === "fn") return { ico: "ƒ", bg: "var(--motor)" };
  if (node.kind === "const") return { ico: "•", bg: "var(--yellow)" };
  if (node.kind === "note") return { ico: "…", bg: "var(--neutral)" };
  return { ico: "/", bg: "var(--neutral)" };
}

export function matches(node, q) {
  if (!q) return true;
  const hay = (node.name + " " + (node.path || "") + " " + (node.desc || "")).toLowerCase();
  if (hay.includes(q)) return true;
  return (node.children || []).some((c) => matches(c, q));
}

export const KIND_LABEL = { pkg: "pakiet", mod: "moduł", fn: "funkcja", const: "stała", note: "informacja", folder: "grupa" };
