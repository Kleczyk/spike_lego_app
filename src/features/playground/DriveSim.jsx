import React, { useState, useMemo } from "react";
import { Advanced } from "../../components/Advanced.jsx";
import { MiniTable } from "../../components/MiniTable.jsx";
import { LiveLine } from "../../components/LiveLine.jsx";
import { useCopy } from "../../hooks/useCopy.js";
import { STOP_FLAGS, STOP_OPTS } from "../../data/constants.js";

// Symulator jazdy (stół testowy): skręt −100…100 vs tryb czołg.
// Sedno dydaktyczne: s = steer/100; s ≥ 0 zwalnia prawe koło, s < 0 — lewe.
export function DriveSim() {
  const [copied, copy] = useCopy();
  const [mode, setMode] = useState("steering");
  const [steer, setSteer] = useState(0);
  const [speed, setSpeed] = useState(500);
  const [tankL, setTankL] = useState(500);
  const [tankR, setTankR] = useState(500);
  const [accel, setAccel] = useState(1000);
  const [stopFlag, setStopFlag] = useState("BRAKE");

  const { left, right } = useMemo(() => {
    if (mode === "tank") return { left: tankL, right: tankR };
    const s = steer / 100;
    let l = speed, r = speed;
    if (s >= 0) r = Math.round(speed * (1 - 2 * s));
    else l = Math.round(speed * (1 + 2 * s));
    return { left: l, right: r };
  }, [mode, steer, speed, tankL, tankR]);

  const turn = Math.max(-22, Math.min(22, (left - right) / 30));
  const status = useMemo(() => {
    if (left === 0 && right === 0) return "Robot stoi w miejscu";
    if (left === right && left > 0) return "Robot jedzie prosto do przodu";
    if (left === right && left < 0) return "Robot jedzie prosto do tyłu";
    if (left === -right) return "Robot obraca się w miejscu";
    return left > right ? "Robot skręca w prawo" : "Robot skręca w lewo";
  }, [left, right]);

  const wheelStyle = (v) => {
    const dur = v === 0 ? "0s" : Math.max(0.18, 90 / Math.abs(v)) + "s";
    return {
      animation: v === 0 ? "none" : `sp-roll ${dur} linear infinite`,
      animationDirection: v < 0 ? "reverse" : "normal",
    };
  };
  const fillStyle = (v) => {
    const h = Math.min(50, (Math.abs(v) / 1000) * 50);
    return v >= 0
      ? { bottom: "50%", height: h + "%" }
      : { top: "50%", height: h + "%", background: "#C2895C" };
  };

  const extra = (accel !== 1000 ? `, acceleration=${accel}` : "");
  const liveText = mode === "tank"
    ? `motor_pair.move_tank(motor_pair.PAIR_1, ${tankL}, ${tankR}${extra})`
    : `motor_pair.move(motor_pair.PAIR_1, ${steer}, velocity=${speed}${extra})`;

  return (
    <div className="sp-play" style={{ "--accent": "var(--drive)", "--accent-soft": "var(--drive-soft)" }}>
      <h3>🚗 Jazda: jak działa skręt</h3>
      <p className="hint">
        Przesuwaj suwaki i patrz na koła. <b>Skręt</b> to jedna liczba od −100 do 100:
        0 — prosto, −100 — ostro w lewo, 100 — ostro w prawo. Tryb „czołg” pozwala
        ustawić każde koło osobno (przeciwne wartości = obrót w miejscu).
      </p>

      <div className="sp-modebtns">
        <button className={"sp-modebtn" + (mode === "steering" ? " act" : "")} onClick={() => setMode("steering")}>Skręt</button>
        <button className={"sp-modebtn" + (mode === "tank" ? " act" : "")} onClick={() => setMode("tank")}>Tryb „czołg”</button>
      </div>

      <div className="sp-stage">
        <div className="sp-meter">
          <span className="lab">Lewe koło</span>
          <div className="sp-bar"><div className="sp-fill" style={fillStyle(left)} /></div>
          <span className="sp-name" style={{ color: "var(--drive)" }}>{left}</span>
        </div>
        <div className="sp-robot" style={{ transform: `rotate(${turn}deg)` }}>
          <div className="sp-body" />
          <div className="sp-eye" style={{ left: 52 }} />
          <div className="sp-eye" style={{ left: 88 }} />
          <div className="sp-wheel" style={{ left: 18 }}><div className="tread" style={wheelStyle(left)} /></div>
          <div className="sp-wheel" style={{ right: 18 }}><div className="tread" style={wheelStyle(right)} /></div>
        </div>
        <div className="sp-meter">
          <span className="lab">Prawe koło</span>
          <div className="sp-bar"><div className="sp-fill" style={fillStyle(right)} /></div>
          <span className="sp-name" style={{ color: "var(--drive)" }}>{right}</span>
        </div>
      </div>

      <div className="sp-status">{status}</div>

      <div className="sp-controls">
        {mode === "steering" ? (<>
          <div className="sp-ctl">
            <label>Skręt (steering) <span>{steer}</span></label>
            <input className="sp-range" type="range" min="-100" max="100" value={steer} onChange={(e) => setSteer(+e.target.value)} />
          </div>
          <div className="sp-ctl">
            <label>Prędkość (velocity) <span>{speed} °/s</span></label>
            <input className="sp-range" type="range" min="0" max="1000" step="20" value={speed} onChange={(e) => setSpeed(+e.target.value)} />
          </div>
        </>) : (<>
          <div className="sp-ctl">
            <label>Lewe koło <span>{tankL} °/s</span></label>
            <input className="sp-range" type="range" min="-1000" max="1000" step="20" value={tankL} onChange={(e) => setTankL(+e.target.value)} />
          </div>
          <div className="sp-ctl">
            <label>Prawe koło <span>{tankR} °/s</span></label>
            <input className="sp-range" type="range" min="-1000" max="1000" step="20" value={tankR} onChange={(e) => setTankR(+e.target.value)} />
          </div>
        </>)}
      </div>

      <LiveLine text={liveText} copied={copied} onCopy={copy} id="live-drive">
        {mode === "tank"
          ? <>motor_pair.<b>move_tank</b>(PAIR_1, <span className="num">{tankL}</span>, <span className="num">{tankR}</span>{extra})</>
          : <>motor_pair.<b>move</b>(PAIR_1, <span className="num">{steer}</span>, velocity=<span className="num">{speed}</span>{extra})</>}
      </LiveLine>

      <Advanced>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: "4px 0 12px" }}>
          <b>acceleration</b> (1–10000, domyślnie 1000) mówi, jak gwałtownie robot nabiera
          prędkości — mniejsza wartość = łagodniejszy start, mniej poślizgu kół.
          Gdy zmienisz suwak, parametr pojawi się w poleceniu powyżej.
        </p>
        <div className="sp-ctl" style={{ maxWidth: 380 }}>
          <label>acceleration <span style={{ fontFamily: "'JetBrains Mono'" }}>{accel} °/s²</span></label>
          <input className="sp-range" type="range" min="100" max="10000" step="100" value={accel} onChange={(e) => setAccel(+e.target.value)} />
        </div>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: "14px 0 8px" }}>
          Przy zatrzymywaniu (np. <code style={{ fontSize: 12 }}>motor_pair.stop(PAIR_1, stop=motor.{stopFlag})</code>)
          możesz wybrać zachowanie:
        </p>
        <div className="sp-modebtns" style={{ justifyContent: "flex-start" }}>
          {STOP_OPTS.map(([f]) => (
            <button key={f} className={"sp-modebtn" + (stopFlag === f ? " act" : "")} onClick={() => setStopFlag(f)} style={{ fontSize: 12.5, padding: "6px 12px" }}>{f}</button>
          ))}
        </div>
        <MiniTable rows={STOP_FLAGS} three />
      </Advanced>
    </div>
  );
}

