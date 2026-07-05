import React, { useState } from "react";
import { Advanced } from "../../components/Advanced.jsx";
import { Code } from "../../components/Code.jsx";
import { LiveLine } from "../../components/LiveLine.jsx";
import { useCopy } from "../../hooks/useCopy.js";

export function MotionSim() {
  const [copied, copy] = useCopy();
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [gest, setGest] = useState(null);    // "TAPPED" | "SHAKEN"
  const [anim, setAnim] = useState("");      // klasa animacji
  const [taps, setTaps] = useState(0);

  const doGesture = (g) => {
    setGest(g);
    setAnim(g === "TAPPED" ? "tap" : "shake");
    if (g === "TAPPED") setTaps((t) => t + 1);
    setTimeout(() => { setAnim(""); }, 600);
    setTimeout(() => { setGest(null); }, 2200);
  };

  const stable = Math.abs(pitch) < 4 && Math.abs(roll) < 4 && !anim;
  const upFace = Math.abs(pitch) < 50 && Math.abs(roll) < 50 ? "TOP"
    : Math.abs(pitch) >= Math.abs(roll) ? (pitch > 0 ? "FRONT" : "BACK") : (roll > 0 ? "RIGHT" : "LEFT");
  const face = [6, 8, 15, 19, 21, 22, 23]; // uśmiech na matrycy 5×5
  const liveText = "motion_sensor.tilt_angles()";

  return (
    <div className="sp-play" style={{ "--accent": "var(--sense)", "--accent-soft": "var(--sense-soft)" }}>
      <h3>🧭 Czujnik ruchu: przechylenie i gesty huba</h3>
      <p className="hint">
        Ten czujnik jest wbudowany w hub. Przechylaj go suwakami — <b>tilt_angles()</b>
        zwraca trzy kąty <b>w decystopniach</b> (czyli stopnie × 10: odczyt 450 = 45°).
        Stuknij albo potrząśnij, żeby zobaczyć <b>gesture()</b>.
      </p>

      <div className="sp-tilt-stage">
        <div className={"sp-hub " + anim} style={{ transform: `rotateX(${-pitch}deg) rotateY(${roll}deg) rotateZ(${yaw / 4}deg)` }}>
          <div className="sp-hub-grid">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className={"sp-hub-px" + (face.includes(i) ? " on" : "")} />
            ))}
          </div>
          <div className="sp-hub-btn" />
        </div>
      </div>

      <div className="sp-reading">
        <div className="sp-read">
          <div className="rl">tilt_angles()</div>
          <div className="rv" style={{ fontSize: 16 }}>({yaw * 10}, {pitch * 10}, {roll * 10})</div>
          <div className="ru">yaw, pitch, roll — decystopnie</div>
        </div>
        <div className="sp-read">
          <div className="rl">up_face()</div>
          <div className="rv" style={{ fontSize: 16 }}>{upFace}</div>
          <div className="ru">ściana skierowana do góry</div>
        </div>
        <div className="sp-read">
          <div className="rl">gesture()</div>
          <div className="rv" style={{ fontSize: 16, color: gest ? "var(--sense)" : "var(--muted)" }}>{gest || "UNKNOWN"}</div>
          <div className="ru">{gest ? "wykryto gest!" : "brak gestu"}</div>
        </div>
        <div className="sp-read">
          <div className="rl">stable()</div>
          <div className="rv" style={{ fontSize: 16 }}>{stable ? "True" : "False"}</div>
          <div className="ru">{stable ? "leży nieruchomo" : "rusza się"}</div>
        </div>
      </div>

      <div className="sp-controls">
        <div className="sp-ctl">
          <label>pitch — przód/tył <span>{pitch}°</span></label>
          <input className="sp-range" type="range" min="-60" max="60" value={pitch} onChange={(e) => setPitch(+e.target.value)} />
        </div>
        <div className="sp-ctl">
          <label>roll — boki <span>{roll}°</span></label>
          <input className="sp-range" type="range" min="-60" max="60" value={roll} onChange={(e) => setRoll(+e.target.value)} />
        </div>
        <div className="sp-ctl">
          <label>yaw — obrót <span>{yaw}°</span></label>
          <input className="sp-range" type="range" min="-180" max="180" value={yaw} onChange={(e) => setYaw(+e.target.value)} />
        </div>
        <div className="sp-modebtns" style={{ marginBottom: 0 }}>
          <button className="sp-modebtn" onClick={() => doGesture("TAPPED")}>👆 Stuknij</button>
          <button className="sp-modebtn" onClick={() => doGesture("SHAKEN")}>🫨 Potrząśnij</button>
        </div>
      </div>

      <LiveLine text={liveText} copied={copied} onCopy={copy} id="live-motion">
        motion_sensor.<b>tilt_angles</b>()  <span style={{ color: "#A79B86" }}># → ({yaw * 10}, {pitch * 10}, {roll * 10})</span>
      </LiveLine>

      <Advanced>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: "4px 0 10px" }}>
          Licznik stuknięć: <b>tap_count()</b> → {taps} (wyzerujesz przez
          <code style={{ fontSize: 12, margin: "0 4px" }}>reset_tap_count()</code>).
          Kąt yaw możesz wyzerować w dowolnym momencie — to podstawa precyzyjnych skrętów:
        </p>
        <Code id="motion-adv" copied={copied} onCopy={copy} lines={[
          { t: "# skręcaj, aż robot obróci się o 90°", c: "cmt" },
          "motion_sensor.reset_yaw(0)",
          "motor_pair.move_tank(motor_pair.PAIR_1, 200, -200)",
          "await runloop.until(lambda: abs(motion_sensor.tilt_angles()[0]) > 900)",
          "motor_pair.stop(motor_pair.PAIR_1)",
        ]} />
        <p style={{ fontSize: 14, color: "var(--muted)", margin: "8px 0 0" }}>
          Stałe gestów: TAPPED, DOUBLE_TAPPED, SHAKEN, FALLING, UNKNOWN; stałe ścian:
          TOP, FRONT, RIGHT, BOTTOM, BACK, LEFT (wszystkie jako motion_sensor.*).
        </p>
      </Advanced>
    </div>
  );
}
