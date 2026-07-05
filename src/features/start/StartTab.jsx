import React from "react";
import { Code } from "../../components/Code.jsx";
import { useCopy } from "../../hooks/useCopy.js";
import { GLOSSARY } from "../../data/glossary.js";

// Zakładka START: jak wygląda program, porty, trzy rodziny poleceń,
// pierwszy program z czujnikiem i słowniczek pojęć.
export function StartTab({ goTab }) {
  const [copied, copy] = useCopy();
  const heart = [0,2,4,5,6,7,8,9,11,13,16,17,18,22];

  return (
    <div>
      <section className="sp-hero" style={{ "--accent": "var(--motor)" }}>
        <div className="sp-eyebrow">Kompendium dla nauczycieli</div>
        <h1>SPIKE Prime w Pythonie — wszystko w jednym miejscu</h1>
        <p className="lead" style={{ marginBottom: 26 }}>
          Krótko i po ludzku: jak uruchomić silniki, jak nauczyć robota jeździć i jak
          korzystać z czujników. Każdy przykład możesz skopiować i wkleić wprost do
          aplikacji LEGO® Education SPIKE™. Nie musisz znać programowania — zacznij
          od tej strony, a po szczegóły zaglądaj do pozostałych zakładek.
        </p>
        <div className="sp-hero-row">
          <div className="sp-matrix" aria-hidden="true">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className={"sp-dot" + (heart.includes(i) ? " on" : "")} />
            ))}
          </div>
          <div style={{ maxWidth: 380 }}>
            <p style={{ color: "var(--muted)", fontSize: 15.5 }}>
              <b>🌳 Mapa modułów</b> — co jest gdzie, z opisem każdego parametru.<br />
              <b>🎮 Plac zabaw</b> — symulatory: zobacz, co robi czujnik, zanim go użyjesz.<br />
              <b>🍳 Przepisy</b> — „chcę, żeby robot…” i gotowy kod do wklejenia.
            </p>
          </div>
        </div>
      </section>

      <section className="sp-sec" style={{ "--accent": "var(--motor)", "--accent-soft": "var(--motor-soft)" }}>
        <div className="sp-sec-head">
          <span className="sp-pill">Na początek</span>
          <h2>Jak wygląda program</h2>
        </div>
        <p className="sub">
          Każdy program składa się z trzech części: <b>importu</b> (mówimy, czego chcemy
          użyć), <b>poleceń</b> (co robot ma zrobić) i <b>uruchomienia</b>. Tyle wystarczy
          na start.
        </p>
        <Code id="skeleton" copied={copied} onCopy={copy} lines={[
          { t: "import motor", c: "kw" },
          { t: "import runloop", c: "kw" },
          { t: "from hub import port", c: "kw" },
          "",
          "async def main():",
          { t: "    # obróć silnik w porcie A o 360 stopni", c: "cmt" },
          "    await motor.run_for_degrees(port.A, 360, 720)",
          "",
          "runloop.run(main())",
        ]} />
        <div className="sp-note">
          <span className="ic">💡</span>
          <div>
            <b>Co to jest „await”?</b> To słówko, które mówi: „poczekaj, aż robot skończy
            tę czynność, zanim przejdziesz dalej”. Wpisujesz je przed poleceniami ruchu.
            Bez niego program leci od razu do następnej linijki — robot „zrobi wszystko naraz”.
          </div>
        </div>

        <h3 style={{ fontSize: 17, margin: "22px 0 10px" }}>Gdzie się wpina kabelki — porty</h3>
        <p className="sub" style={{ margin: "0 0 12px" }}>
          Hub ma sześć gniazd oznaczonych literami. W programie zapisujemy je jako
          <span className="sp-k" style={{ margin: "0 5px" }}>port.A</span>…
          <span className="sp-k" style={{ margin: "0 5px" }}>port.F</span>
          (po wcześniejszym <span className="sp-k" style={{ margin: "0 5px" }}>from hub import port</span>).
        </p>
        <div className="sp-chips">
          {["A","B","C","D","E","F"].map((l) => (
            <span key={l} className="sp-chip sp-port" style={{ color: "var(--motor)" }}>{l}</span>
          ))}
        </div>
      </section>

      <section className="sp-sec" style={{ "--accent": "var(--drive)", "--accent-soft": "var(--drive-soft)" }}>
        <div className="sp-sec-head">
          <span className="sp-pill">Trzy rodziny</span>
          <h2>Najważniejsze moduły w pigułce</h2>
        </div>
        <p className="sub">
          Prawie wszystko, co robi się na lekcjach, mieści się w trzech rodzinach poleceń.
          Kliknij kartę, żeby zobaczyć pełne szczegóły w mapie modułów.
        </p>

        <div className="sp-card" style={{ "--accent": "var(--motor)", "--accent-soft": "var(--motor-soft)", cursor: "pointer" }}
          onClick={() => goTab("mapa")} role="button" tabIndex={0}>
          <h3><span className="em">🔁</span>motor — jeden silnik</h3>
          <div className="desc">Obróć o tyle stopni, kręć przez tyle czasu albo bez przerwy. Prędkość w stopniach na sekundę (720 = dwa obroty/s).</div>
          <ul>
            <li><span className="sp-k">run_for_degrees(port.A, 360, 720)</span><span className="sp-li-txt">pełny obrót</span></li>
            <li><span className="sp-k">run_for_time(port.A, 1000, 500)</span><span className="sp-li-txt">kręć 1 sekundę</span></li>
            <li><span className="sp-k">run(...) / stop(...)</span><span className="sp-li-txt">start bez końca i stop</span></li>
          </ul>
        </div>

        <div className="sp-card" style={{ "--accent": "var(--drive)", "--accent-soft": "var(--drive-soft)", cursor: "pointer" }}
          onClick={() => goTab("mapa")} role="button" tabIndex={0}>
          <h3><span className="em">🚗</span>motor_pair — jeżdżący robot</h3>
          <div className="desc">Dwa silniki połączone w parę: podajesz tylko skręt (−100…100) i prędkość. Skręt zobaczysz „na żywo” na Placu zabaw.</div>
          <ul>
            <li><span className="sp-k">pair(PAIR_1, port.A, port.B)</span><span className="sp-li-txt">raz, na początku</span></li>
            <li><span className="sp-k">move_for_time(PAIR_1, 2000, 0)</span><span className="sp-li-txt">2 sekundy prosto</span></li>
            <li><span className="sp-k">move_tank(PAIR_1, 500, -500)</span><span className="sp-li-txt">obrót w miejscu</span></li>
          </ul>
        </div>

        <div className="sp-card" style={{ "--accent": "var(--sense)", "--accent-soft": "var(--sense-soft)", cursor: "pointer" }}
          onClick={() => goTab("plac")} role="button" tabIndex={0}>
          <h3><span className="em">👀</span>czujniki — zmysły robota</h3>
          <div className="desc">Kolor, odległość, siła nacisku i wbudowany czujnik ruchu. Każdy z nich możesz „pomacać” w symulatorach na Placu zabaw.</div>
          <ul>
            <li><span className="sp-k">color_sensor.color(port.C)</span><span className="sp-li-txt">jaki kolor widzi</span></li>
            <li><span className="sp-k">distance_sensor.distance(port.C)</span><span className="sp-li-txt">ile mm do przeszkody</span></li>
            <li><span className="sp-k">force_sensor.pressed(port.D)</span><span className="sp-li-txt">czy wciśnięty</span></li>
          </ul>
        </div>
      </section>

      <section className="sp-sec" style={{ "--accent": "var(--sense)", "--accent-soft": "var(--sense-soft)" }}>
        <div className="sp-sec-head">
          <span className="sp-pill">Krok po kroku</span>
          <h2>Pierwszy program z czujnikiem</h2>
        </div>
        <p className="sub">
          Połączmy wszystko: robot jedzie do przodu i zatrzymuje się, gdy zobaczy
          czerwony kolor. Oto pomysł rozłożony na kroki.
        </p>

        <div className="sp-step"><div className="sp-num">1</div><div>
          <div className="st">Połącz silniki w parę</div>
          <div className="sd">Raz na początku, żeby robot mógł jechać dwoma kołami.</div>
        </div></div>
        <div className="sp-step"><div className="sp-num">2</div><div>
          <div className="st">Każ robotowi jechać prosto</div>
          <div className="sd">Skręt = 0, więc oba koła kręcą się tak samo.</div>
        </div></div>
        <div className="sp-step"><div className="sp-num">3</div><div>
          <div className="st">Czekaj, aż czujnik zobaczy czerwony</div>
          <div className="sd">Program „pilnuje” koloru i reaguje sam.</div>
        </div></div>
        <div className="sp-step"><div className="sp-num">4</div><div>
          <div className="st">Zatrzymaj robota</div>
          <div className="sd">Gotowe!</div>
        </div></div>

        <Code id="first" copied={copied} onCopy={copy} lines={[
          { t: "import motor_pair, color_sensor, color, runloop", c: "kw" },
          { t: "from hub import port", c: "kw" },
          "",
          "def widzi_czerwony():",
          "    return color_sensor.color(port.C) == color.RED",
          "",
          "async def main():",
          "    motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)",
          { t: "    # jedź prosto", c: "cmt" },
          "    motor_pair.move(motor_pair.PAIR_1, 0)",
          { t: "    # czekaj na czerwony kolor", c: "cmt" },
          "    await runloop.until(widzi_czerwony)",
          "    motor_pair.stop(motor_pair.PAIR_1)",
          "",
          "runloop.run(main())",
        ]} />

        <div className="sp-note">
          <span className="ic">🎓</span>
          <div>
            <b>Wskazówka na lekcję:</b> pozwól dzieciom najpierw zmieniać tylko jedną
            liczbę (np. prędkość albo kolor) i obserwować efekt. Małe zmiany = duża
            radość z odkrywania.
          </div>
        </div>
      </section>

      <section className="sp-sec" style={{ "--accent": "var(--neutral)", "--accent-soft": "var(--neutral-soft)" }}>
        <div className="sp-sec-head">
          <span className="sp-pill">Słowniczek</span>
          <h2>Pojęcia po ludzku</h2>
        </div>
        <p className="sub">
          Krótkie wyjaśnienia słów, które pojawiają się w programach — bez żargonu.
        </p>
        <div className="sp-gloss">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="sp-gcard">
              <div className="gt"><span className="ge">{g.emoji}</span>{g.term}</div>
              <div className="gd">{g.def}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

