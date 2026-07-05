import React, { useState } from "react";
import { Advanced } from "../../components/Advanced.jsx";
import { MiniTable } from "../../components/MiniTable.jsx";
import { LiveLine } from "../../components/LiveLine.jsx";
import { useCopy } from "../../hooks/useCopy.js";
import { STOP_FLAGS, STOP_OPTS } from "../../data/constants.js";

export function MotorSim() {
  const [copied, copy] = useCopy();
  const [deg, setDeg] = useState(360);
  const [vel, setVel] = useState(720);
  const [angle, setAngle] = useState(0);     // skumulowany kąt wirnika
  const [dur, setDur] = useState(0);         // czas animacji bieżącego ruchu
  const [stopFlag, setStopFlag] = useState("BRAKE");

  const run = () => {
    const t = Math.abs(deg) / Math.max(60, vel);
    setDur(t);
    setAngle((a) => a + deg);
  };
  const absPos = ((Math.round(angle) % 360) + 360) % 360;
  const stopPart = stopFlag !== "BRAKE" ? `, stop=motor.${stopFlag}` : "";
  const liveText = `await motor.run_for_degrees(port.A, ${deg}, ${vel}${stopPart})`;

  const holes = [0, 60, 120, 180, 240, 300].map((a) => {
    const r = 48, rad = (a * Math.PI) / 180;
    return { left: 71 + r * Math.sin(rad) - 4.5 + "px", top: 71 - r * Math.cos(rad) - 4.5 + "px" };
  });

  return (
    <div className="sp-play" style={{ "--accent": "var(--motor)", "--accent-soft": "var(--motor-soft)" }}>
      <h3>🔁 Pojedynczy silnik: stopnie i prędkość</h3>
      <p className="hint">
        Ustaw, o ile stopni silnik ma się obrócić (360 = pełny obrót) i jak szybko,
        a potem naciśnij <b>Wykonaj</b>. Znacznik na tarczy pokazuje
        <b> pozycję bezwzględną</b> (0–359°) — tę samą, którą zwraca <b>absolute_position()</b>.
      </p>

      <div className="sp-stage">
        <div className="sp-dial">
          <div className="sp-dial-zero">0°</div>
          <div className="sp-dial-face" />
          <div className="sp-dial-rotor" style={{ transform: `rotate(${angle}deg)`, transitionDuration: dur + "s" }}>
            <div className="sp-dial-needle" />
            {holes.map((h, i) => <div key={i} className="sp-dial-hole" style={h} />)}
            <div className="sp-dial-hub" />
          </div>
        </div>
        <div className="sp-reading">
          <div className="sp-read">
            <div className="rl">absolute_position()</div>
            <div className="rv">{absPos}</div>
            <div className="ru">stopni (0–359)</div>
          </div>
          <div className="sp-read">
            <div className="rl">relative_position()</div>
            <div className="rv">{Math.round(angle)}</div>
            <div className="ru">stopni od startu</div>
          </div>
        </div>
      </div>

      <div className="sp-controls">
        <div className="sp-ctl">
          <label>Stopnie (degrees) <span>{deg}°</span></label>
          <input className="sp-range" type="range" min="-720" max="720" step="30" value={deg} onChange={(e) => setDeg(+e.target.value)} />
        </div>
        <div className="sp-ctl">
          <label>Prędkość (velocity) <span>{vel} °/s</span></label>
          <input className="sp-range" type="range" min="60" max="1050" step="30" value={vel} onChange={(e) => setVel(+e.target.value)} />
        </div>
        <button className="sp-btn" style={{ background: "var(--motor)", color: "#fff", border: "none", fontFamily: "'Fredoka'", fontSize: 15 }} onClick={run}>
          ▶ Wykonaj obrót
        </button>
      </div>

      <LiveLine text={liveText} copied={copied} onCopy={copy} id="live-motor">
        await motor.<b>run_for_degrees</b>(port.A, <span className="num">{deg}</span>, <span className="num">{vel}</span>{stopPart})
      </LiveLine>

      <Advanced>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: "4px 0 10px" }}>
          Po ruchu silnik może zachować się różnie — wybierz flagę <b>stop=</b>, a polecenie
          powyżej się zmieni. Na lekcji najlepiej pokazać różnicę między <b>BRAKE</b>,
          <b> HOLD</b> (silnik „broni” pozycji, gdy próbujesz go przekręcić ręką)
          i <b>COAST</b> (kręci się luzem).
        </p>
        <div className="sp-modebtns" style={{ justifyContent: "flex-start" }}>
          {STOP_OPTS.map(([f, o]) => (
            <button key={f} className={"sp-modebtn" + (stopFlag === f ? " act" : "")} title={o} onClick={() => setStopFlag(f)} style={{ fontSize: 12.5, padding: "6px 12px" }}>{f}</button>
          ))}
        </div>
        <MiniTable rows={STOP_FLAGS} three />
        <p style={{ fontSize: 14, color: "var(--muted)", margin: "10px 0 6px" }}>
          Płynny start i łagodne hamowanie dodasz parametrami
          <code style={{ fontSize: 12, margin: "0 4px" }}>acceleration=</code> i
          <code style={{ fontSize: 12, margin: "0 4px" }}>deceleration=</code> (1–10000, domyślnie 1000).
        </p>
      </Advanced>
    </div>
  );
}

