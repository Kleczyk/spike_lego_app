import React, { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import * as Pl from "blockly/msg/pl";
import { BLOCK_DEFS, TOOLBOX } from "./spikeDefs.js";
import { spikeTheme } from "./spikeTheme.js";
import { generateProgram, lintProgram } from "./pyGen.js";
import { Code } from "../../components/Code.jsx";
import { useCopy } from "../../hooks/useCopy.js";
import "../../styles/blocks.css";

// Definicje klocków rejestrujemy globalnie tylko raz (StrictMode wywołuje
// efekt dwa razy w trybie dev).
let blocksDefined = false;
function ensureBlocks() {
  if (blocksDefined) return;
  blocksDefined = true;
  Blockly.defineBlocksWithJsonArray(BLOCK_DEFS);
}

const INITIAL_STATE = {
  variables: [],
  blocks: { blocks: [{ type: "start_program", x: 360, y: 64 }] },
};

// Dynamiczna zawartość kategorii „Zmienne": najpierw przyciski (Utwórz zmienną /
// Stwórz listę), a klocki z nazwą pojawiają się dopiero, gdy coś utworzysz.
function spikeVariablesFlyout(workspace) {
  const items = [{ kind: "button", text: "Utwórz zmienną", callbackKey: "CREATE_VARIABLE" }];
  if (workspace.getVariablesOfType("").length) {
    items.push({ kind: "block", type: "var_set", inputs: { VAL: { shadow: { type: "spike_number", fields: { NUM: 0 } } } } });
    items.push({ kind: "block", type: "var_change", inputs: { VAL: { shadow: { type: "spike_number", fields: { NUM: 1 } } } } });
    items.push({ kind: "block", type: "var_show" });
    items.push({ kind: "block", type: "var_get" });
  }
  items.push({ kind: "button", text: "Stwórz listę", callbackKey: "CREATE_LIST" });
  if (workspace.getVariablesOfType("list").length) {
    const item = () => ({ shadow: { type: "spike_text", fields: { TEXT: "obiekt" } } });
    const idx = () => ({ shadow: { type: "spike_number", fields: { NUM: 1 } } });
    items.push({ kind: "block", type: "list_add", inputs: { ITEM: item() } });
    items.push({ kind: "block", type: "list_remove", inputs: { IDX: idx() } });
    items.push({ kind: "block", type: "list_remove_all" });
    items.push({ kind: "block", type: "list_insert", inputs: { ITEM: item(), IDX: idx() } });
    items.push({ kind: "block", type: "list_replace", inputs: { IDX: idx(), ITEM: item() } });
    items.push({ kind: "block", type: "list_get", inputs: { IDX: idx() } });
    items.push({ kind: "block", type: "list_index", inputs: { ITEM: item() } });
    items.push({ kind: "block", type: "list_length" });
    items.push({ kind: "block", type: "list_contains", inputs: { ITEM: item() } });
  }
  return items;
}

// Zapis projektu w pamięci przeglądarki — po zmianie zakładki lub odświeżeniu
// strony układ klocków zostaje przywrócony.
const STORAGE_KEY = "spike_bloki_workspace_v1";
function loadWorkspace(ws) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      Blockly.serialization.workspaces.load(JSON.parse(raw), ws);
      return;
    }
  } catch (e) {
    /* uszkodzony zapis — ładujemy stan domyślny */
  }
  Blockly.serialization.workspaces.load(INITIAL_STATE, ws);
}
function saveWorkspace(ws) {
  try {
    const state = Blockly.serialization.workspaces.save(ws);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    /* np. brak miejsca / tryb prywatny — pomijamy */
  }
}

// Utrzymuje stałą wielkość klocków w palecie (flyout), niezależnie od zoomu
// planszy — jak w Scratchu: plansza się przybliża/oddala, a paleta zostaje taka
// sama. Przejmujemy samą właściwość `scale` palety (Blockly ustawia ją wprost,
// więc nadpisanie metody setScale nie wystarczało).
function getFlyoutWorkspace(ws) {
  try {
    const tb = ws.getToolbox && ws.getToolbox();
    const fl = (tb && tb.getFlyout && tb.getFlyout()) || (ws.getFlyout && ws.getFlyout());
    if (!fl) return [null, null];
    const fws = fl.getWorkspace ? fl.getWorkspace() : fl.workspace_;
    return [fl, fws || null];
  } catch (e) {
    return [null, null];
  }
}
function lockFlyoutScale(ws, fixed) {
  const [fl, fws] = getFlyoutWorkspace(ws);
  if (!fws) return false;
  if (fws.__scaleLocked) return true;
  try {
    Object.defineProperty(fws, "scale", {
      configurable: true,
      get() { return fixed; },
      set() { /* ignoruj — paleta ma stałą wielkość */ },
    });
    fws.__scaleLocked = true;
    if (fl && typeof fl.position === "function") { try { fl.position(); } catch (e) {} }
    return true;
  } catch (e) {
    try { fws.scale = fixed; } catch (e2) {}
    return false;
  }
}

export function BlocksTab() {
  const hostRef = useRef(null);
  const stageRef = useRef(null);
  const codeRef = useRef(null);
  const wsRef = useRef(null);
  const linesRef = useRef([]);
  const [lines, setLines] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [copied, copy] = useCopy();

  useEffect(() => {
    Blockly.setLocale(Pl);
    ensureBlocks();

    const ws = Blockly.inject(hostRef.current, {
      toolbox: TOOLBOX,
      theme: spikeTheme,
      renderer: "zelos",
      trashcan: true,
      sounds: false,
      grid: { spacing: 28, length: 2, colour: "#e7eaf2", snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.95, maxScale: 1.5, minScale: 0.35, scaleSpeed: 1.1 },
      move: { scrollbars: true, drag: true, wheel: false },
    });
    wsRef.current = ws;

    ws.registerButtonCallback("CREATE_VARIABLE", (button) => {
      Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace());
    });
    ws.registerButtonCallback("CREATE_LIST", (button) => {
      Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), null, "list");
    });
    ws.registerToolboxCategoryCallback("SPIKE_VARIABLES", spikeVariablesFlyout);

    loadWorkspace(ws);

    // Stała wielkość palety, niezależna od zoomu planszy.
    const FLYOUT_SCALE = 0.9;
    lockFlyoutScale(ws, FLYOUT_SCALE);
    setTimeout(() => lockFlyoutScale(ws, FLYOUT_SCALE), 300);

    // Dopasowanie rozmiaru czcionki kodu, by najdłuższa linia mieściła się
    // w jednej linii (bez zawijania i przewijania w bok).
    const fitFont = () => {
      const el = codeRef.current;
      if (!el) return;
      let longest = 0;
      for (const l of linesRef.current) {
        const s = typeof l === "string" ? l : (l.t || "");
        if (s.length > longest) longest = s.length;
      }
      const avail = el.clientWidth - 36; // obramowanie + wewnętrzny padding panelu
      if (!longest || avail <= 0) { el.style.setProperty("--code-fs", "15px"); return; }
      const CHAR = 0.62; // szerokość znaku JetBrains Mono względem rozmiaru czcionki
      const fs = Math.max(11, Math.min(15, avail / (longest * CHAR)));
      el.style.setProperty("--code-fs", fs.toFixed(1) + "px");
    };

    // Scena wypełnia ekran — bez przewijania strony. Liczymy wysokość od
    // górnej krawędzi sceny do dołu okna.
    const fit = () => {
      const st = stageRef.current;
      if (!st) return;
      const top = st.getBoundingClientRect().top;
      const h = Math.max(360, Math.round(window.innerHeight - top - 16));
      st.style.height = h + "px";
      if (wsRef.current) Blockly.svgResize(wsRef.current);
      fitFont();
    };
    fit();
    const t0 = setTimeout(fit, 250); // po doładowaniu czcionek
    window.addEventListener("resize", fit);

    let t;
    const regen = () => {
      try {
        const out = generateProgram(ws);
        linesRef.current = out;
        setLines(out);
        setWarnings(lintProgram(ws));
        fitFont();
      } catch (err) {
        console.error(err);
        const out = [{ t: "# (nie udało się wygenerować kodu — napisz, co ułożyłeś)", c: "cmt" }];
        linesRef.current = out;
        setLines(out);
        setWarnings([]);
        fitFont();
      }
    };
    ws.addChangeListener((e) => {
      lockFlyoutScale(ws, FLYOUT_SCALE); // idempotentne — łapie moment powstania palety
      if (e && e.isUiEvent) return;
      if (ws.isDragging()) return;
      clearTimeout(t);
      t = setTimeout(() => { regen(); saveWorkspace(ws); }, 120);
    });
    regen();

    const ro = new ResizeObserver(() => {
      if (wsRef.current) Blockly.svgResize(wsRef.current);
    });
    if (stageRef.current) ro.observe(stageRef.current);

    return () => {
      clearTimeout(t);
      clearTimeout(t0);
      window.removeEventListener("resize", fit);
      ro.disconnect();
      saveWorkspace(ws);
      ws.dispose();
      wsRef.current = null;
    };
  }, []);

  const clearAll = () => {
    const ws = wsRef.current;
    if (!ws) return;
    Blockly.serialization.workspaces.load(INITIAL_STATE, ws);
    saveWorkspace(ws);
  };

  return (
    <div className="bloki">
      <div className="bloki-head">
        <h2>🧩 Bloki</h2>
        <span className="bloki-credit">
          Konwerter stworzył{" "}
          <a href="https://www.linkedin.com/in/mgrabowskii" target="_blank" rel="noopener noreferrer">
            Mateusz Grabowski
          </a>
          .
        </span>
        <div className="bloki-actions">
          <button className="bloki-btn" onClick={clearAll}>Wyczyść</button>
        </div>
      </div>

      <div className="bloki-stage" ref={stageRef}>
        <div className="bloki-canvas" ref={hostRef} />
        <div className="bloki-code" ref={codeRef}>
          <div className="bloki-code-bar">Python — SPIKE 3</div>
          {warnings.length > 0 && (
            <ul className="bloki-warn">
              {warnings.map((w, i) => (
                <li key={i}>⚠ {w}</li>
              ))}
            </ul>
          )}
          <Code lines={lines} onCopy={copy} id="bloki-py" copied={copied} />
        </div>
      </div>
    </div>
  );
}
