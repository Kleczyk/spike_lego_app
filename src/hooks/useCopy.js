import { useState } from "react";

// Hak kopiowania do schowka: zwraca [copied, copy]; copied to id ostatnio
// skopiowanego bloku (znika po 1,6 s) — steruje napisem na przycisku.
export function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = (text, id) => {
    try { navigator.clipboard.writeText(text); } catch (e) {}
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
  };
  return [copied, copy];
}
