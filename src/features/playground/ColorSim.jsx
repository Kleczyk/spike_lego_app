import React, { useState } from "react";
import { Advanced } from "../../components/Advanced.jsx";
import { Code } from "../../components/Code.jsx";
import { LiveLine } from "../../components/LiveLine.jsx";
import { useCopy } from "../../hooks/useCopy.js";

const COLOR_TILES = [
  ["RED", 9, "#C76C5E"], ["GREEN", 6, "#7E9E76"], ["BLUE", 3, "#6A8FB3"],
  ["YELLOW", 7, "#E2B84B"], ["ORANGE", 8, "#D08A52"], ["MAGENTA", 1, "#B06A93"],
  ["AZURE", 4, "#7FA8C9"], ["TURQUOISE", 5, "#6FB0A8"], ["PURPLE", 2, "#8A7AA8"],
  ["WHITE", 10, "#EDEAE0"], ["BLACK", 0, "#4A4843"],
];
export function ColorSim() {
  const [copied, copy] = useCopy();
  const [tile, setTile] = useState(0);
  const [mode, setMode] = useState("color"); // color | reflection
  const [refl, setRefl] = useState(72);
  const [name, value, hex] = COLOR_TILES[tile];
  const reflHex = `rgb(${Math.round(40 + refl * 2.1)},${Math.round(38 + refl * 2.05)},${Math.round(34 + refl * 1.95)})`;
  const liveText = mode === "color" ? "color_sensor.color(port.C)" : "color_sensor.reflection(port.C)";

  return (
    <div className="sp-play" style={{ "--accent": "var(--sense)", "--accent-soft": "var(--sense-soft)" }}>
      <h3>🎨 Czujnik koloru: co widzi pod sobą?</h3>
      <p className="hint">
        Podsuń pod czujnik kafelek koloru — odczyt porównujesz ze stałymi z modułu
        <b> color</b> (np. color.RED). Druga funkcja, <b>reflection()</b>, mierzy tylko
        jasność odbitego światła 0–100% — to na niej opiera się jazda po linii.
      </p>

      <div className="sp-modebtns">
        <button className={"sp-modebtn" + (mode === "color" ? " act" : "")} onClick={() => setMode("color")}>Kolor</button>
        <button className={"sp-modebtn" + (mode === "reflection" ? " act" : "")} onClick={() => setMode("reflection")}>Odbicie światła</button>
      </div>

      <div className="sp-color-stage">
        <div className="sp-color-head">
          <div className="sp-color-lens" style={{
            background: mode === "color" ? hex : reflHex,
            boxShadow: `0 0 16px 3px ${mode === "color" ? hex : reflHex}`,
          }} />
        </div>
        <div className="sp-color-tile" style={{ background: mode === "color" ? hex : reflHex }} />
      </div>

      {mode === "color" ? (<>
        <div className="sp-tilebtns">
          {COLOR_TILES.map(([n, , h], i) => (
            <button key={n} className={"sp-tilebtn" + (i === tile ? " act" : "")} style={{ background: h }}
              title={"color." + n} onClick={() => setTile(i)} aria-label={"color." + n} />
          ))}
        </div>
        <div className="sp-reading">
          <div className="sp-read">
            <div className="rl">color(port.C)</div>
            <div className="rv" style={{ fontSize: 17 }}>color.{name}</div>
            <div className="ru">wartość: {value}</div>
          </div>
        </div>
      </>) : (
        <div className="sp-controls" style={{ marginTop: 4 }}>
          <div className="sp-ctl">
            <label>Jasność podłoża <span>{refl}%</span></label>
            <input className="sp-range" type="range" min="0" max="100" value={refl} onChange={(e) => setRefl(+e.target.value)} />
          </div>
          <div className="sp-reading" style={{ margin: 0 }}>
            <div className="sp-read">
              <div className="rl">reflection(port.C)</div>
              <div className="rv">{refl}</div>
              <div className="ru">% odbitego światła — czarna linia ≈ 10–20, biała kartka ≈ 80–100</div>
            </div>
          </div>
        </div>
      )}

      <LiveLine text={liveText} copied={copied} onCopy={copy} id="live-color">
        {mode === "color"
          ? <>color_sensor.<b>color</b>(port.C)  <span style={{ color: "#A79B86" }}># → color.{name}</span></>
          : <>color_sensor.<b>reflection</b>(port.C)  <span style={{ color: "#A79B86" }}># → {refl}</span></>}
      </LiveLine>

      <Advanced>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: "4px 0 10px" }}>
          <b>rgbi()</b> zwraca cztery składowe naraz: czerwoną, zieloną, niebieską i ogólną
          jasność — przydatne, gdy gotowe kolory nie wystarczają (np. odróżnianie odcieni).
        </p>
        <Code id="color-adv" copied={copied} onCopy={copy} lines={[
          "r, g, b, i = color_sensor.rgbi(port.C)",
          { t: "# np. własny próg: dużo czerwieni i mało zieleni", c: "cmt" },
          "if r > 200 and g < 100:",
          "    print(\"To chyba czerwony!\")",
        ]} />
        <p style={{ fontSize: 14, color: "var(--muted)", margin: "8px 0 0" }}>
          Pełna lista stałych koloru (z wartościami liczbowymi) jest w mapie modułów →
          moduł <b>color</b>. Nierozpoznany kolor to <code style={{ fontSize: 12 }}>color.UNKNOWN</code> (−1).
        </p>
      </Advanced>
    </div>
  );
}

