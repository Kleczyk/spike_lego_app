import React, { useState } from "react";
import { API } from "../../data/api.js";
import { TreeNode } from "./TreeNode.jsx";
import { DetailPanel } from "./DetailPanel.jsx";
import "../../styles/map.css";

// Zakładka MAPA MODUŁÓW: wyszukiwarka + drzewo API + panel szczegółów.
export function MapTab() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const query = q.trim().toLowerCase();

  return (
    <div>
      <section className="sp-hero" style={{ "--accent": "var(--drive)" }}>
        <div className="sp-eyebrow">Co jest gdzie</div>
        <h1>Mapa modułów — drzewo pakietów i funkcji</h1>
        <p className="lead">
          Cała biblioteka SPIKE Prime poukładana w drzewo. Widać, że np. pakiet
          <b> hub</b> zawiera <b>port</b>, a w środku jest <b>port.A</b>. Klikaj elementy,
          żeby je rozwijać — po prawej zobaczysz import, <b>tabelę parametrów</b>, przykład
          i sekcję <b>⚙️ Zaawansowane</b> (flagi stop, przyspieszenie, kierunki).
        </p>
        <div className="sp-legend">
          <span><span className="sp-tag" style={{ background: "var(--drive)" }}>📦</span> pakiet</span>
          <span><span className="sp-tag" style={{ background: "var(--sense)" }}>{"{}"}</span> moduł</span>
          <span><span className="sp-tag" style={{ background: "var(--motor)" }}>ƒ</span> funkcja</span>
          <span><span className="sp-tag" style={{ background: "var(--yellow)", color: "#5b4a17" }}>•</span> stała</span>
          <span><span className="sp-aw" style={{ marginLeft: 0 }}>await</span> — poprzedź słówkiem await</span>
        </div>
      </section>

      <div className="sp-toolbar">
        <input className="sp-search" placeholder="Szukaj funkcji lub modułu, np. distance, move, port…"
          value={q} onChange={(e) => setQ(e.target.value)} />
        {q && <button className="sp-btn" onClick={() => setQ("")}>Wyczyść</button>}
      </div>

      <div className="sp-layout">
        <div className="sp-tree">
          {API.map((n, i) => (
            <TreeNode key={i} node={n} depth={0} q={query} onSelect={setSel} selected={sel ? sel.path || sel.name : null} />
          ))}
        </div>
        <DetailPanel sel={sel} />
      </div>
    </div>
  );
}
