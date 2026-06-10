import React, { useState } from "react";
import { Advanced } from "../../components/Advanced.jsx";
import { Code } from "../../components/Code.jsx";
import { LiveLine } from "../../components/LiveLine.jsx";
import { useCopy } from "../../hooks/useCopy.js";

export function DistanceSim() {
  const [copied, copy] = useCopy();
  const [mm, setMm] = useState(420);
  const reading = mm > 2000 ? -1 : mm;
  const inRange = reading !== -1;
  // pozycja ściany w scenie: tuż przy czujniku … prawa krawędź
  const pct = Math.min(1, mm / 2200);
  const liveText = `distance_sensor.distance(port.C)`;

  return (
    <div className="sp-play" style={{ "--accent": "var(--sense)", "--accent-soft": "var(--sense-soft)" }}>
      <h3>📏 Czujnik odległości: ile milimetrów do przeszkody?</h3>
      <p className="hint">
        Przysuwaj i odsuwaj ścianę. Czujnik mierzy ultradźwiękami odległość
        <b> w milimetrach</b> (1000 mm = 1 m). Gdy nic nie widzi — np. przeszkoda jest
        za daleko — zwraca <b>−1</b>. Dlatego w programach sprawdzamy „0 &lt; d”.
      </p>

      <div className="sp-dist-scene">
        <div className="sp-dist-floor" />
        <div className="sp-dist-bot">
          <div className="sp-dist-body" />
          <div className="sp-dist-eye" style={{ top: 10 }} />
          <div className="sp-dist-eye" style={{ top: 34 }} />
        </div>
        {inRange && [0, 1, 2].map((i) => (
          <div key={i} className="sp-wave" style={{
            left: 86, top: 36,
            animation: `sp-ping 1.4s ${i * 0.45}s ease-out infinite`,
          }} />
        ))}
        <div className="sp-wall" style={{ left: `calc(110px + ${pct} * (96% - 150px))`, opacity: inRange ? 1 : 0.35 }} />
      </div>

      <div className="sp-reading">
        <div className="sp-read">
          <div className="rl">distance(port.C)</div>
          <div className="rv" style={{ color: inRange ? "var(--sense)" : "#C76C5E" }}>{reading}</div>
          <div className="ru">{inRange ? `mm  (≈ ${(reading / 10).toFixed(0)} cm)` : "brak odczytu!"}</div>
        </div>
      </div>

      <div className="sp-controls">
        <div className="sp-ctl">
          <label>Odległość ściany <span>{mm > 2000 ? "poza zasięgiem" : mm + " mm"}</span></label>
          <input className="sp-range" type="range" min="40" max="2100" step="20" value={mm} onChange={(e) => setMm(+e.target.value)} />
        </div>
      </div>

      <LiveLine text={liveText} copied={copied} onCopy={copy} id="live-dist">
        distance_sensor.<b>distance</b>(port.C)  <span className="cmt" style={{ color: "#A79B86" }}># → {reading}</span>
      </LiveLine>

      <Advanced>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: "4px 0 10px" }}>
          Czujnik ma też <b>4 własne diody</b> (po dwie w każdym „oku”), którymi możesz
          świecić: <code style={{ fontSize: 12 }}>set_pixel(port.C, x, y, jasność)</code>,
          wszystkie naraz przez <code style={{ fontSize: 12 }}>show()</code>, a gasisz przez
          <code style={{ fontSize: 12, marginLeft: 4 }}>clear()</code>.
          Typowy patent na lekcję: „oczy” świecą mocniej, im bliżej jest przeszkoda.
        </p>
        <Code id="dist-adv" copied={copied} onCopy={copy} lines={[
          { t: "# im bliżej, tym jaśniejsze oczy", c: "cmt" },
          "while True:",
          "    d = distance_sensor.distance(port.C)",
          "    jasnosc = 100 if 0 < d < 300 else 20",
          "    distance_sensor.show(port.C, [jasnosc] * 4)",
          "    await runloop.sleep_ms(50)",
        ]} />
      </Advanced>
    </div>
  );
}

