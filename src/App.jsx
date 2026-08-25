import React, { useState } from "react";
import { StartTab } from "./features/start/StartTab.jsx";
import { MapTab } from "./features/map/MapTab.jsx";
import { PlaygroundTab } from "./features/playground/PlaygroundTab.jsx";
import { BlocksTab } from "./features/blocks/BlocksTab.jsx";
import { RecipesTab } from "./features/recipes/RecipesTab.jsx";
import { AuthorPanel } from "./components/AuthorPanel.jsx";

// Korzeń aplikacji: sticky nagłówek z paskiem zakładek + treść aktywnej zakładki.
const TABS = [
  ["start", "Start", "🏠"],
  ["mapa", "Mapa modułów", "🌳"],
  ["plac", "Plac zabaw", "🎮"],
  ["bloki", "Bloki", "🧩"],
  ["przepisy", "Przepisy", "🍳"],
];

export default function App() {
  const [tab, setTab] = useState("start");
  const [authorOpen, setAuthorOpen] = useState(false);
  const goTab = (t) => { setTab(t); try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) {} };

  return (
    <div className={"sp-root" + (tab === "bloki" ? " sp-root--bloki" : "")}>

      <header className="sp-top">
        <div className="sp-top-in">
          <div className="sp-logo"><span>SP</span></div>
          <div className="sp-top-title">SPIKE Prime &middot; Python</div>
          <div className="sp-badge">kompendium dla nauczycieli</div>
          <span className="sp-author-credit">stworzył <b>Daniel Kleczyński</b></span>
          <button type="button" className="sp-author-btn" onClick={() => setAuthorOpen(true)} title="Kto stworzył tę stronę?">
            <span className="star">✦</span> O autorze
          </button>
        </div>
        <nav className="sp-tabs">
          {TABS.map(([id, label, em]) => (
            <button key={id} className={"sp-tab" + (tab === id ? " act" : "")} onClick={() => goTab(id)}>
              <span className="tem">{em}</span>{label}
            </button>
          ))}
        </nav>
      </header>

      <main className="sp-wrap">
        {tab === "start" && <StartTab goTab={goTab} />}
        {tab === "mapa" && <MapTab />}
        {tab === "plac" && <PlaygroundTab />}
        {tab === "bloki" && <BlocksTab />}
        {tab === "przepisy" && <RecipesTab />}

        {tab !== "bloki" && (
          <footer className="sp-foot">
            Na podstawie oficjalnej dokumentacji LEGO® Education SPIKE™ Prime (Python, firmware SPIKE 3).<br />
            LEGO® i SPIKE™ są znakami towarowymi Grupy LEGO. Materiał pomocniczy, nieoficjalny.
            <div className="sp-foot-author">
              Stronę stworzył Daniel Kleczyński —{" "}
              <button type="button" onClick={() => setAuthorOpen(true)}>o autorze</button>
            </div>
          </footer>
        )}
      </main>

      <AuthorPanel open={authorOpen} onClose={() => setAuthorOpen(false)} />
    </div>
  );
}
