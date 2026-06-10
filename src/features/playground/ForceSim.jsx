import React, { useState } from "react";
import { Advanced } from "../../components/Advanced.jsx";
import { Code } from "../../components/Code.jsx";
import { LiveLine } from "../../components/LiveLine.jsx";
import { useCopy } from "../../hooks/useCopy.js";

export function ForceSim() {
  const [copied, copy] = useCopy();
  const [n, setN] = useState(0); // nacisk w niutonach 0–10
  const force = Math.round(n * 10);          // 0–100 (decyniutony)
  const pressed = force >= 25;               // przycisk „kliknięty"
  const springH = 44 - (n / 10) * 30;
  const liveText = "force_sensor.force(port.D)";

  return (
    <div className="sp-play" style={{ "--accent": "var(--sense)", "--accent-soft": "var(--sense-soft)" }}>
      <h3>✊ Czujnik siły: przycisk, który czuje nacisk</h3>
      <p className="hint">
        Naciskaj suwakiem na czerwony przycisk. <b>force()</b> zwraca siłę 0–100
        (w decyniutonach, maks. ok. 10 N), a <b>pressed()</b> mówi po prostu
        True/False — czy przycisk jest wciśnięty.
      </p>

      <div className="sp-force-stage">
        <div className="sp-force-sensor">
          <div className="sp-force-cap" style={{ transform: `translateY(${(n / 10) * 26}px)` }} />
          <div className="sp-force-spring" style={{ height: springH }} />
          <div className="sp-force-base" />
        </div>
      </div>

      <div className="sp-reading">
        <div className="sp-read">
          <div className="rl">force(port.D)</div>
          <div className="rv">{force}</div>
          <div className="ru">0–100 (≈ {n.toFixed(1)} N)</div>
        </div>
        <div className="sp-read">
          <div className="rl">pressed(port.D)</div>
          <div className="rv" style={{ color: pressed ? "var(--sense)" : "var(--muted)" }}>{pressed ? "True" : "False"}</div>
          <div className="ru">{pressed ? "wciśnięty!" : "nie wciśnięty"}</div>
        </div>
      </div>

      <div className="sp-controls">
        <div className="sp-ctl">
          <label>Nacisk <span>{n.toFixed(1)} N</span></label>
          <input className="sp-range" type="range" min="0" max="10" step="0.1" value={n} onChange={(e) => setN(+e.target.value)} />
        </div>
      </div>

      <LiveLine text={liveText} copied={copied} onCopy={copy} id="live-force">
        force_sensor.<b>force</b>(port.D)  <span style={{ color: "#A79B86" }}># → {force}</span>
      </LiveLine>

      <Advanced>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: "4px 0 10px" }}>
          <b>raw()</b> zwraca surową, niekalibrowaną wartość — przydatna tylko przy
          nietypowych pomiarach. Częstszy patent: siła nacisku jako „pedał gazu” silnika.
        </p>
        <Code id="force-adv" copied={copied} onCopy={copy} lines={[
          { t: "# im mocniej naciskasz, tym szybciej kręci silnik", c: "cmt" },
          "while True:",
          "    motor.run(port.A, force_sensor.force(port.D) * 5)",
          "    await runloop.sleep_ms(1)",
        ]} />
      </Advanced>
    </div>
  );
}

