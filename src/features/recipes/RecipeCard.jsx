import React from "react";
import { Code } from "../../components/Code.jsx";
import { Advanced } from "../../components/Advanced.jsx";
import { useCopy } from "../../hooks/useCopy.js";
import { ACC } from "../../data/constants.js";

export function RecipeCard({ r }) {
  const [copied, copy] = useCopy();
  const accent = ACC[r.accent] || "var(--drive)";
  return (
    <div className="sp-recipe" style={{ "--accent": accent, "--accent-soft": accent === "var(--motor)" ? "var(--motor-soft)" : accent === "var(--sense)" ? "var(--sense-soft)" : "var(--drive-soft)" }}>
      <h3><span className="em">{r.emoji}</span>{r.title}</h3>
      <p className="rintro">{r.intro}</p>
      <Code id={"r-" + r.id} copied={copied} onCopy={copy} lines={r.code} />
      {r.note && (
        <div className="sp-rnote"><span>💡</span><span>{r.note}</span></div>
      )}
      {r.adv && (
        <Advanced title="Zaawansowane — krok dalej">
          <p style={{ fontSize: 14, color: "var(--muted)", margin: "2px 0 4px" }}>{r.adv}</p>
        </Advanced>
      )}
    </div>
  );
}
