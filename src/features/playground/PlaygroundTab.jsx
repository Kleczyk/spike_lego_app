import React from "react";
import { DriveSim } from "./DriveSim.jsx";
import { MotorSim } from "./MotorSim.jsx";
import { DistanceSim } from "./DistanceSim.jsx";
import { ColorSim } from "./ColorSim.jsx";
import { ForceSim } from "./ForceSim.jsx";
import { MotionSim } from "./MotionSim.jsx";
import "../../styles/playground.css";

// Zakładka PLAC ZABAW: każdy symulator „dyktuje” linię kodu pod spodem (LiveLine).
export function PlaygroundTab() {
  return (
    <div>
      <section className="sp-hero" style={{ "--accent": "var(--sense)" }}>
        <div className="sp-eyebrow">Zobacz, zanim podłączysz</div>
        <h1>Plac zabaw — symulatory napędu i czujników</h1>
        <p className="lead">
          Każdy symulator pokazuje na żywo, co robi dana funkcja, a pod spodem
          <b> „dyktuje” gotową linię kodu</b> — możesz ją skopiować prosto do programu.
          W każdym znajdziesz też sekcję <b>⚙️ Zaawansowane</b> z flagami stop,
          przyspieszeniem i dodatkowymi odczytami.
        </p>
      </section>
      <DriveSim />
      <MotorSim />
      <DistanceSim />
      <ColorSim />
      <ForceSim />
      <MotionSim />
    </div>
  );
}

