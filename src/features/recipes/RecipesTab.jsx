import React, { useState } from "react";
import { RECIPES, RECIPE_CATS } from "../../data/recipes.js";
import { RecipeCard } from "./RecipeCard.jsx";
import "../../styles/recipes.css";

// Zakładka PRZEPISY: wyszukiwarka „Chcę, żeby robot…” + chipy kategorii.
export function RecipesTab() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("wszystko");
  const query = q.trim().toLowerCase();

  const list = RECIPES.filter((r) => {
    if (cat !== "wszystko" && r.cat !== cat) return false;
    if (!query) return true;
    return (r.title + " " + r.keywords + " " + r.intro).toLowerCase().includes(query);
  });

  return (
    <div>
      <section className="sp-hero" style={{ "--accent": "var(--motor)" }}>
        <div className="sp-eyebrow">Gotowe rozwiązania</div>
        <h1>Przepisy: „Chcę, żeby robot…”</h1>
        <p className="lead">
          Wpisz, co chcesz osiągnąć — np. <b>„skręcić”</b>, <b>„linia”</b>, <b>„dźwięk”</b> —
          albo wybierz kategorię. Każdy przepis to <b>kompletny program</b> z importami:
          kopiujesz go w całości i wklejasz do aplikacji SPIKE.
        </p>
      </section>

      <div className="sp-toolbar" style={{ marginTop: 6 }}>
        <input className="sp-search" placeholder="Czego szukasz? np. „zatrzymać przed ścianą”, „90 stopni”, „napis”…"
          value={q} onChange={(e) => setQ(e.target.value)} />
        {q && <button className="sp-btn" onClick={() => setQ("")}>Wyczyść</button>}
      </div>
      <div className="sp-catchips">
        {RECIPE_CATS.map(([id, label, em]) => (
          <button key={id} className={"sp-catchip" + (cat === id ? " act" : "")} onClick={() => setCat(id)}>
            <span>{em}</span>{label}
          </button>
        ))}
      </div>

      <div className="sp-rgrid">
        {list.map((r) => <RecipeCard key={r.id} r={r} />)}
        {!list.length && (
          <div className="sp-empty" style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 18, padding: "40px 20px" }}>
            <span className="big">🔍</span>
            Nic nie znaleziono. Spróbuj prostszego słowa — np. „silnik”, „kolor”, „czekaj” —
            albo wybierz kategorię „Wszystko”.
          </div>
        )}
      </div>
    </div>
  );
}

