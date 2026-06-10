// ----------------------------------------------------------------------------
// DANE: całe API SPIKE 3 jako drzewo + helpery konstruktorów węzłów
// kind: group | pkg | mod | folder | fn | const | note
// Zakresy/domyślne parametrów za oficjalną dokumentacją (i ściągą PDF).
// ----------------------------------------------------------------------------

// p(name, type, def, desc, adv) — wiersz tabeli parametrów; adv=true → widoczny
// dopiero po rozwinięciu „Zaawansowane”.
const p = (name, type, def, desc, adv) => ({ name, type, def, desc, adv: !!adv });

// fn(name, sig, desc, opts) — funkcja; opts: { aw, returns, params, example }
const fn = (name, sig, desc, opts = {}) => ({
  kind: "fn", name, sig, desc,
  awaitable: !!opts.aw, returns: opts.returns,
  params: opts.params, example: opts.example,
});
const cst = (name, path, desc) => ({ kind: "const", name, path, desc });

const funcs = (path, list) => ({
  kind: "folder", name: "Funkcje", icon: "ƒ",
  children: list.map((f) => ({ ...f, path: `${path}.${f.name.split("(")[0]}` })),
});
const consts = (path, list) => ({
  kind: "folder", name: "Stałe", icon: "•",
  children: list.map((c) => (c.kind ? { ...c, path: c.path || `${path}.${c.name}` } : cst(c, `${path}.${c}`))),
});

// Powtarzalne parametry (zakresy z oficjalnej ściągi SPIKE 3)
const P_PORT   = p("port", "stała portu", "—", "gniazdo na hubie, np. port.A");
const P_VEL    = p("velocity", "int, °/s", "—", "prędkość obrotu; znak = kierunek. Zakres zależy od silnika: mały ±660, średni ±1110, duży ±1050");
const P_VELP   = p("velocity", "int, °/s", "360", "prędkość jazdy (opcjonalna); zakres jak dla silnika", true);
const P_ACC    = p("acceleration", "int, 1–10000", "1000", "przyspieszenie w °/s² — im mniejsze, tym łagodniejszy start", true);
const P_DEC    = p("deceleration", "int, 1–10000", "1000", "hamowanie w °/s² — im mniejsze, tym łagodniejsze zatrzymanie", true);
const P_STOP   = p("stop", "stała stop", "motor.BRAKE", "zachowanie po zatrzymaniu: COAST / BRAKE / HOLD / CONTINUE / SMART_*", true);
const P_PAIR   = p("pair", "stała pary", "—", "która para silników, np. motor_pair.PAIR_1");
const P_STEER  = p("steering", "int, −100…100", "—", "skręt: −100 ostro w lewo, 0 prosto, 100 ostro w prawo");

export const API = [
  {
    kind: "group", name: "Moduły importowane wprost", open: true,
    children: [
      {
        kind: "mod", name: "motor", import: "import motor", accent: "motor", emoji: "🔁",
        desc: "Sterowanie pojedynczym silnikiem podłączonym do jednego portu.",
        children: [
          funcs("motor", [
            fn("run(port, velocity)", "run(port, velocity, *, acceleration=1000)",
              "Kręć silnikiem ze stałą prędkością aż do kolejnej komendy (nie czeka).", {
              params: [P_PORT, P_VEL, P_ACC],
              example: [
                { t: "# kręć silnikiem A, po 2 sekundach zatrzymaj", c: "cmt" },
                "motor.run(port.A, 720)",
                "await runloop.sleep_ms(2000)",
                "motor.stop(port.A)",
              ],
            }),
            fn("run_for_degrees(port, degrees, velocity)", "run_for_degrees(port, degrees, velocity, *, stop=BRAKE, acceleration=1000, deceleration=1000)",
              "Obróć silnik o zadaną liczbę stopni — i zatrzymaj.", {
              aw: true, returns: "status ruchu (READY, RUNNING, STALLED, CANCELLED, ERROR, DISCONNECTED)",
              params: [P_PORT, p("degrees", "int, °", "—", "o ile obrócić; 360 = pełny obrót, znak = kierunek"), P_VEL, P_STOP, P_ACC, P_DEC],
              example: [
                { t: "# pełny obrót z prędkością 720 °/s", c: "cmt" },
                "await motor.run_for_degrees(port.A, 360, 720)",
              ],
            }),
            fn("run_for_time(port, duration, velocity)", "run_for_time(port, duration, velocity, *, stop=BRAKE, acceleration=1000, deceleration=1000)",
              "Kręć silnikiem przez podany czas (w milisekundach).", {
              aw: true, returns: "status ruchu (jak wyżej)",
              params: [P_PORT, p("duration", "int, ms", "—", "czas pracy; 1000 ms = 1 sekunda"), P_VEL, P_STOP, P_ACC, P_DEC],
              example: [
                { t: "# kręć przez 1,5 sekundy w lewo", c: "cmt" },
                "await motor.run_for_time(port.A, 1500, -500)",
              ],
            }),
            fn("run_to_absolute_position(port, position, velocity)", "run_to_absolute_position(port, position, velocity, *, direction=SHORTEST_PATH, stop=BRAKE, acceleration=1000, deceleration=1000)",
              "Obróć silnik do bezwzględnej pozycji — konkretnego kąta na tarczy.", {
              aw: true, returns: "status ruchu",
              params: [P_PORT, p("position", "int, 0–359", "—", "docelowy kąt na tarczy silnika"), P_VEL,
                p("direction", "stała", "motor.SHORTEST_PATH", "którędy do celu: CLOCKWISE, COUNTERCLOCKWISE, SHORTEST_PATH, LONGEST_PATH", true),
                P_STOP, P_ACC, P_DEC],
              example: [
                { t: "# ustaw silnik dokładnie na godzinę 12", c: "cmt" },
                "await motor.run_to_absolute_position(port.A, 0, 600)",
              ],
            }),
            fn("run_to_relative_position(port, position, velocity)", "run_to_relative_position(port, position, velocity, *, stop=BRAKE, acceleration=1000, deceleration=1000)",
              "Obróć silnik do pozycji liczonej względem aktualnej.", {
              aw: true, returns: "status ruchu",
              params: [P_PORT, p("position", "int, °", "—", "cel względem bieżącej pozycji (może być ujemny)"), P_VEL, P_STOP, P_ACC, P_DEC],
            }),
            fn("stop(port)", "stop(port, *, stop=BRAKE)",
              "Zatrzymaj silnik (domyślnie z hamowaniem).", {
              params: [P_PORT, p("stop", "stała stop", "motor.BRAKE", "jak się zatrzymać — np. motor.HOLD utrzyma pozycję", true)],
              example: [
                { t: "# zatrzymaj i aktywnie trzymaj pozycję", c: "cmt" },
                "motor.stop(port.A, stop=motor.HOLD)",
              ],
            }),
            fn("set_duty_cycle(port, pwm)", "set_duty_cycle(port, pwm)",
              "Uruchom silnik z konkretną mocą PWM — bez regulacji prędkości.", {
              params: [P_PORT, p("pwm", "int, −10000…10000", "—", "moc; znak = kierunek. Dla zaawansowanych — zwykle lepsze jest run()")],
            }),
            fn("get_duty_cycle(port)", "get_duty_cycle(port)", "Odczytaj aktualną moc PWM silnika.", {
              returns: "PWM jako liczba −10000…10000", params: [P_PORT],
            }),
            fn("velocity(port)", "velocity(port)", "Odczytaj aktualną prędkość obrotu.", {
              returns: "prędkość w °/s", params: [P_PORT],
            }),
            fn("absolute_position(port)", "absolute_position(port)", "Odczytaj pozycję bezwzględną — kąt na tarczy.", {
              returns: "kąt 0–359°", params: [P_PORT],
            }),
            fn("relative_position(port)", "relative_position(port)", "Odczytaj pozycję względną — sumę obróconych stopni od punktu odniesienia.", {
              returns: "skumulowane stopnie (int)", params: [P_PORT],
            }),
            fn("reset_relative_position(port, position)", "reset_relative_position(port, position)",
              "Ustaw nowy punkt odniesienia dla pozycji względnej.", {
              params: [P_PORT, p("position", "int, °", "—", "wartość, od której liczymy dalej (zwykle 0)")],
            }),
          ]),
          consts("motor", [
            cst("READY","motor.READY","status: gotowy"), cst("RUNNING","motor.RUNNING","status: w ruchu"),
            cst("STALLED","motor.STALLED","status: zablokowany (coś nie pozwala się kręcić)"), cst("CANCELLED","motor.CANCELLED","status: ruch przerwany (3)"),
            cst("ERROR","motor.ERROR","status: błąd"), cst("DISCONNECTED","motor.DISCONNECTED","status: silnik odłączony"),
            cst("COAST","motor.COAST","stop (0): swobodny wybieg"), cst("BRAKE","motor.BRAKE","stop (1): hamowanie — domyślne"),
            cst("HOLD","motor.HOLD","stop (2): aktywnie trzymaj pozycję"), cst("CONTINUE","motor.CONTINUE","stop (3): kręć dalej"),
            cst("SMART_COAST","motor.SMART_COAST","stop (4): wybieg z kompensacją błędów"), cst("SMART_BRAKE","motor.SMART_BRAKE","stop (5): hamowanie z kompensacją"),
            cst("CLOCKWISE","motor.CLOCKWISE","kierunek: zgodnie z zegarem"), cst("COUNTERCLOCKWISE","motor.COUNTERCLOCKWISE","kierunek: przeciwnie do zegara"),
            cst("SHORTEST_PATH","motor.SHORTEST_PATH","kierunek: najkrótszą drogą"), cst("LONGEST_PATH","motor.LONGEST_PATH","kierunek: najdłuższą drogą"),
          ]),
        ],
      },
      {
        kind: "mod", name: "motor_pair", import: "import motor_pair", accent: "drive", emoji: "🚗",
        desc: "Dwa silniki połączone w parę — napęd jeżdżącego robota. Startują i zatrzymują się razem.",
        children: [
          funcs("motor_pair", [
            fn("pair(pair, left_motor, right_motor)", "pair(pair, left_motor, right_motor)",
              "Połącz dwa silniki w parę (slot). Robimy to raz, na początku programu.", {
              params: [P_PAIR, p("left_motor", "stała portu", "—", "port lewego silnika, np. port.A"),
                p("right_motor", "stała portu", "—", "port prawego silnika, np. port.B")],
              example: [
                { t: "# silnik A (lewy) i B (prawy) jako para nr 1", c: "cmt" },
                "motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)",
              ],
            }),
            fn("unpair(pair)", "unpair(pair)", "Rozłącz parę silników.", { params: [P_PAIR] }),
            fn("move(pair, steering)", "move(pair, steering, *, velocity=360, acceleration=1000)",
              "Jedź ze sterowaniem skrętem — ze stałą prędkością aż do kolejnej komendy (nie czeka).", {
              params: [P_PAIR, P_STEER, P_VELP, P_ACC],
              example: [
                { t: "# jedź prosto, dopóki nie każemy się zatrzymać", c: "cmt" },
                "motor_pair.move(motor_pair.PAIR_1, 0)",
              ],
            }),
            fn("move_for_degrees(pair, degrees, steering)", "move_for_degrees(pair, degrees, steering, *, velocity=360, stop=BRAKE, acceleration=1000, deceleration=1000)",
              "Jedź ze skrętem przez zadaną liczbę stopni obrotu kół.", {
              aw: true, returns: "status ruchu",
              params: [P_PAIR, p("degrees", "int, °", "—", "dystans jako stopnie obrotu kół"), P_STEER, P_VELP, P_STOP, P_ACC, P_DEC],
              example: [
                { t: "# łuk w prawo przez 200 stopni obrotu kół", c: "cmt" },
                "await motor_pair.move_for_degrees(motor_pair.PAIR_1, 200, 100)",
              ],
            }),
            fn("move_for_time(pair, duration, steering)", "move_for_time(pair, duration, steering, *, velocity=360, stop=BRAKE, acceleration=1000, deceleration=1000)",
              "Jedź ze skrętem przez podany czas (ms).", {
              aw: true, returns: "status ruchu",
              params: [P_PAIR, p("duration", "int, ms", "—", "czas jazdy; 1000 ms = 1 sekunda"), P_STEER, P_VELP, P_STOP, P_ACC, P_DEC],
              example: [
                { t: "# 2 sekundy prosto", c: "cmt" },
                "await motor_pair.move_for_time(motor_pair.PAIR_1, 2000, 0)",
              ],
            }),
            fn("move_tank(pair, left_velocity, right_velocity)", "move_tank(pair, left_velocity, right_velocity, *, acceleration=1000)",
              "Tryb „czołg”: prędkość każdego koła osobno, aż do kolejnej komendy.", {
              params: [P_PAIR, p("left_velocity", "int, °/s", "—", "prędkość lewego koła"),
                p("right_velocity", "int, °/s", "—", "prędkość prawego koła; przeciwne znaki = obrót w miejscu"), P_ACC],
            }),
            fn("move_tank_for_degrees(pair, degrees, left_velocity, right_velocity)", "move_tank_for_degrees(pair, degrees, left_velocity, right_velocity, *, stop=BRAKE, acceleration=1000, deceleration=1000)",
              "Tryb „czołg” przez zadane stopnie obrotu kół.", {
              aw: true, returns: "status ruchu",
              params: [P_PAIR, p("degrees", "int, °", "—", "dystans jako stopnie obrotu kół"),
                p("left_velocity", "int, °/s", "—", "prędkość lewego koła"), p("right_velocity", "int, °/s", "—", "prędkość prawego koła"),
                P_STOP, P_ACC, P_DEC],
            }),
            fn("move_tank_for_time(pair, left_velocity, right_velocity, duration)", "move_tank_for_time(pair, left_velocity, right_velocity, duration, *, stop=BRAKE, acceleration=1000, deceleration=1000)",
              "Tryb „czołg” przez podany czas (ms).", {
              aw: true, returns: "status ruchu",
              params: [P_PAIR, p("left_velocity", "int, °/s", "—", "prędkość lewego koła"),
                p("right_velocity", "int, °/s", "—", "prędkość prawego koła"),
                p("duration", "int, ms", "—", "czas jazdy"), P_STOP, P_ACC, P_DEC],
              example: [
                { t: "# obrót w miejscu przez 2 sekundy", c: "cmt" },
                "await motor_pair.move_tank_for_time(motor_pair.PAIR_1, 1000, -1000, 2000)",
              ],
            }),
            fn("stop(pair)", "stop(pair, *, stop=BRAKE)", "Zatrzymaj oba silniki pary.", {
              params: [P_PAIR, p("stop", "stała stop", "motor.BRAKE", "zachowanie po zatrzymaniu — jak w module motor", true)],
            }),
          ]),
          consts("motor_pair", [
            cst("PAIR_1","motor_pair.PAIR_1","pierwsza para (0)"), cst("PAIR_2","motor_pair.PAIR_2","druga para (1)"), cst("PAIR_3","motor_pair.PAIR_3","trzecia para (2)"),
          ]),
        ],
      },
      {
        kind: "mod", name: "color_sensor", import: "import color_sensor", accent: "sense", sensor: true, emoji: "🎨",
        desc: "Czujnik koloru — rozpoznaje barwy i mierzy natężenie odbitego światła.",
        children: [funcs("color_sensor", [
          fn("color(port)", "color(port)", "Sprawdź, jaki kolor widzi czujnik.", {
            returns: "wykryty kolor (int) — porównuj ze stałymi z modułu color, np. color.RED",
            params: [P_PORT],
            example: [
              "import color, color_sensor",
              "if color_sensor.color(port.A) == color.RED:",
              { t: "    # zobaczył czerwony!", c: "cmt" },
              "    motor_pair.stop(motor_pair.PAIR_1)",
            ],
          }),
          fn("reflection(port)", "reflection(port)", "Zmierz natężenie odbitego światła — przydatne do jazdy po linii.", {
            returns: "odbicie 0–100% (ciemne podłoże = mało, jasne = dużo)", params: [P_PORT],
          }),
          fn("rgbi(port)", "rgbi(port)", "Odczytaj składowe koloru: czerwoną, zieloną, niebieską i ogólną jasność.", {
            returns: "krotka (red, green, blue, intensity)", params: [P_PORT],
          }),
        ])],
      },
      {
        kind: "mod", name: "distance_sensor", import: "import distance_sensor", accent: "sense", sensor: true, emoji: "📏",
        desc: "Czujnik odległości — mierzy ultradźwiękowo dystans do przeszkody i ma własne 4 diody.",
        children: [funcs("distance_sensor", [
          fn("distance(port)", "distance(port)", "Zmierz odległość do przeszkody.", {
            returns: "odległość w milimetrach (1000 mm = 1 m); −1, gdy brak poprawnego odczytu",
            params: [P_PORT],
            example: [
              { t: "# czekaj, aż przeszkoda będzie bliżej niż 10 cm", c: "cmt" },
              "await runloop.until(lambda: 0 < distance_sensor.distance(port.C) < 100)",
            ],
          }),
          fn("get_pixel(port, x, y)", "get_pixel(port, x, y)", "Odczytaj jasność wybranej diody czujnika.", {
            returns: "jasność diody", params: [P_PORT, p("x, y", "int, 0–3", "—", "współrzędne diody na czujniku")],
          }),
          fn("set_pixel(port, x, y, intensity)", "set_pixel(port, x, y, intensity)", "Ustaw jasność jednej diody czujnika.", {
            params: [P_PORT, p("x, y", "int, 0–3", "—", "współrzędne diody"), p("intensity", "int", "—", "jasność — jak mocno ma świecić")],
          }),
          fn("show(port, pixels)", "show(port, pixels)", "Ustaw wszystkie 4 diody naraz (lista wartości).", {
            params: [P_PORT, p("pixels", "lista int", "—", "jasności wszystkich diod")],
          }),
          fn("clear(port)", "clear(port)", "Zgaś wszystkie diody czujnika.", { params: [P_PORT] }),
        ])],
      },
      {
        kind: "mod", name: "force_sensor", import: "import force_sensor", accent: "sense", sensor: true, emoji: "✊",
        desc: "Czujnik siły — mierzy nacisk i działa jak przycisk.",
        children: [funcs("force_sensor", [
          fn("force(port)", "force(port)", "Zmierz siłę nacisku.", {
            returns: "siła w decyniutonach, 0–100 (maksymalnie ok. 10 N)", params: [P_PORT],
            example: [
              { t: "# im mocniej naciskasz, tym szybciej kręci silnik", c: "cmt" },
              "while True:",
              "    motor.run(port.A, force_sensor.force(port.B) * 5)",
              "    await runloop.sleep_ms(1)",
            ],
          }),
          fn("pressed(port)", "pressed(port)", "Sprawdź, czy czujnik jest wciśnięty.", {
            returns: "True / False", params: [P_PORT],
          }),
          fn("raw(port)", "raw(port)", "Odczytaj surową, niekalibrowaną wartość siły.", {
            returns: "wartość surowa (int)", params: [P_PORT],
          }),
        ])],
      },
      {
        kind: "mod", name: "color_matrix", import: "import color_matrix", accent: "sense", emoji: "🟪",
        desc: "Kolorowa matryca 3×3 (osobny element zestawu) — każdy piksel ma kolor i jasność.",
        children: [funcs("color_matrix", [
          fn("clear(port)", "clear(port)", "Zgaś wszystkie piksele.", { params: [P_PORT] }),
          fn("get_pixel(port, x, y)", "get_pixel(port, x, y)", "Odczytaj (kolor, jasność) jednego piksela.", {
            returns: "krotka (kolor, jasność)", params: [P_PORT, p("x, y", "int, 0–2", "—", "współrzędne piksela")],
          }),
          fn("set_pixel(port, x, y, pixel)", "set_pixel(port, x, y, pixel)", "Ustaw jeden piksel.", {
            params: [P_PORT, p("x, y", "int, 0–2", "—", "współrzędne piksela"), p("pixel", "krotka", "—", "(kolor, jasność), np. (color.RED, 100)")],
          }),
          fn("show(port, pixels)", "show(port, pixels)", "Ustaw wszystkie 9 pikseli naraz (lista krotek).", {
            params: [P_PORT, p("pixels", "lista krotek", "—", "9 par (kolor, jasność)")],
          }),
        ])],
      },
      {
        kind: "mod", name: "device", import: "import device", accent: "neutral", emoji: "🔌",
        desc: "Informacje o urządzeniu wpiętym w port.",
        children: [funcs("device", [
          fn("id(port)", "id(port)", "Numer typu urządzenia w porcie.", { returns: "identyfikator (int)", params: [P_PORT] }),
          fn("ready(port)", "ready(port)", "Czy urządzenie jest gotowe do pracy.", { returns: "True / False", params: [P_PORT] }),
          fn("data(port)", "data(port)", "Surowe dane LPF-2 z urządzenia.", { returns: "dane surowe", params: [P_PORT] }),
          fn("get_duty_cycle(port)", "get_duty_cycle(port)", "Odczytaj PWM urządzenia.", { returns: "0–10000", params: [P_PORT] }),
          fn("set_duty_cycle(port, duty_cycle)", "set_duty_cycle(port, duty_cycle)", "Ustaw PWM urządzenia.", {
            params: [P_PORT, p("duty_cycle", "int, 0–10000", "—", "moc PWM")],
          }),
        ])],
      },
      {
        kind: "mod", name: "color", import: "import color", accent: "sense", emoji: "🌈",
        desc: "Same stałe kolorów — używane z czujnikiem koloru, światłem i matrycami.",
        children: [consts("color", [
          cst("BLACK","color.BLACK","czarny (0)"), cst("MAGENTA","color.MAGENTA","magenta (1)"), cst("PURPLE","color.PURPLE","fioletowy (2)"),
          cst("BLUE","color.BLUE","niebieski (3)"), cst("AZURE","color.AZURE","lazurowy (4)"), cst("TURQUOISE","color.TURQUOISE","turkusowy (5)"),
          cst("GREEN","color.GREEN","zielony (6)"), cst("YELLOW","color.YELLOW","żółty (7)"), cst("ORANGE","color.ORANGE","pomarańczowy (8)"),
          cst("RED","color.RED","czerwony (9)"), cst("WHITE","color.WHITE","biały (10)"), cst("UNKNOWN","color.UNKNOWN","nierozpoznany (−1)"),
        ])],
      },
      {
        kind: "mod", name: "orientation", import: "import orientation", accent: "neutral", emoji: "🔄",
        desc: "Stałe obrotu ekranu świetlnego (używane z light_matrix).",
        children: [consts("orientation", [
          cst("UP","orientation.UP","góra (0)"), cst("RIGHT","orientation.RIGHT","prawo (1)"),
          cst("DOWN","orientation.DOWN","dół (2)"), cst("LEFT","orientation.LEFT","lewo (3)"),
        ])],
      },
      {
        kind: "mod", name: "runloop", import: "import runloop", accent: "drive", emoji: "⏳",
        desc: "Uruchamianie programu i czekanie — „pętla zdarzeń”. Każdy program startuje przez runloop.run().",
        children: [funcs("runloop", [
          fn("run(*functions)", "run(*functions)", "Uruchom jedną lub wiele funkcji async — równolegle.", {
            params: [p("*functions", "funkcje async", "—", "np. run(main()) albo run(jedz(), mrugaj()) — obie naraz")],
            example: [
              "async def main():",
              "    await motor.run_for_degrees(port.A, 360, 720)",
              "",
              "runloop.run(main())",
            ],
          }),
          fn("sleep_ms(duration)", "sleep_ms(duration)", "Pauza nieblokująca — inne zadania mogą działać dalej.", {
            aw: true, params: [p("duration", "int, ms", "—", "ile czekać; 1000 ms = 1 sekunda")],
            example: [
              { t: "# odczekaj 2 sekundy", c: "cmt" },
              "await runloop.sleep_ms(2000)",
            ],
          }),
          fn("until(function, timeout=0)", "until(function, timeout=0)", "Czekaj, aż warunek będzie spełniony.", {
            aw: true,
            params: [p("function", "funkcja → bool", "—", "funkcja zwracająca True/False — np. „czy widać czerwony?”"),
              p("timeout", "int, ms", "0", "limit czekania; 0 = bez limitu", true)],
            example: [
              "def widzi_czerwony():",
              "    return color_sensor.color(port.A) == color.RED",
              "",
              "await runloop.until(widzi_czerwony)",
            ],
          }),
        ])],
      },
    ],
  },
  {
    kind: "pkg", name: "hub", import: "from hub import ...", open: true, emoji: "🧠",
    desc: "Pakiet samego klocka-mózgu (hub): porty, przyciski, światło, ekran 5×5, czujnik ruchu i głośnik.",
    children: [
      {
        kind: "folder", name: "hub (bezpośrednio)", icon: "ƒ",
        children: [
          fn("device_uuid()", "device_uuid()", "Identyfikator urządzenia.", { returns: "tekst UUID" }),
          fn("hardware_id()", "hardware_id()", "Identyfikator sprzętu.", { returns: "identyfikator" }),
          fn("power_off()", "power_off()", "Wyłącz hub."),
          fn("temperature()", "temperature()", "Temperatura hubu.", { returns: "temperatura w decystopniach Celsjusza (÷10 = °C)" }),
        ].map((f) => ({ ...f, path: `hub.${f.name.split("(")[0]}` })),
      },
      {
        kind: "mod", name: "port", import: "from hub import port", accent: "motor", emoji: "🔠",
        desc: "Stałe portów — wskazują gniazdo A–F na hubie. Wpisujesz je wszędzie tam, gdzie funkcja pyta o port.",
        children: [consts("port", [
          cst("A","port.A","gniazdo A (0)"), cst("B","port.B","gniazdo B (1)"), cst("C","port.C","gniazdo C (2)"),
          cst("D","port.D","gniazdo D (3)"), cst("E","port.E","gniazdo E (4)"), cst("F","port.F","gniazdo F (5)"),
        ])],
      },
      {
        kind: "mod", name: "button", import: "from hub import button", accent: "neutral", emoji: "🔘",
        desc: "Przyciski na hubie (lewy i prawy).",
        children: [
          funcs("button", [
            fn("pressed(button)", "pressed(button)", "Sprawdź, jak długo przycisk jest trzymany.", {
              returns: "czas wciśnięcia w ms (0 = nie jest wciśnięty)",
              params: [p("button", "stała", "—", "który przycisk: button.LEFT albo button.RIGHT")],
            }),
          ]),
          consts("button", [cst("LEFT","button.LEFT","lewy przycisk"), cst("RIGHT","button.RIGHT","prawy przycisk")]),
        ],
      },
      {
        kind: "mod", name: "light", import: "from hub import light", accent: "sense", emoji: "💡",
        desc: "Kolor diody przy przycisku zasilania.",
        children: [
          funcs("light", [
            fn("color(light, color)", "color(light, color)", "Zmień kolor światełka na hubie.", {
              params: [p("light", "stała", "—", "które światło: light.POWER lub light.CONNECT"),
                p("color", "stała koloru", "—", "np. color.GREEN")],
              example: [
                "from hub import light",
                "import color",
                "light.color(light.POWER, color.MAGENTA)",
              ],
            }),
          ]),
          consts("light", [cst("POWER","light.POWER","światło przycisku zasilania"), cst("CONNECT","light.CONNECT","światło Bluetooth")]),
        ],
      },
      {
        kind: "mod", name: "light_matrix", import: "from hub import light_matrix", accent: "motor", emoji: "🔤",
        desc: "Ekran świetlny 5×5 na hubie — napisy, obrazki, pojedyncze piksele.",
        children: [
          funcs("light_matrix", [
            fn("write(text)", "write(text, intensity=100, time_per_character=500)", "Wyświetl przewijany napis.", {
              aw: true,
              params: [p("text", "tekst", "—", "co wyświetlić, np. \"Czesc!\" (bez polskich znaków)"),
                p("intensity", "int, 0–100", "100", "jasność", true),
                p("time_per_character", "int, ms", "500", "czas na jedną literę", true)],
              example: [
                "from hub import light_matrix",
                "await light_matrix.write(\"Witaj!\")",
              ],
            }),
            fn("show_image(image)", "show_image(image)", "Pokaż wbudowany obrazek.", {
              params: [p("image", "int, 1–67 lub stała", "—", "np. light_matrix.IMAGE_HEART, IMAGE_HAPPY")],
            }),
            fn("set_pixel(x, y, intensity)", "set_pixel(x, y, intensity)", "Ustaw jasność jednego piksela.", {
              params: [p("x, y", "int, 0–4", "—", "kolumna i wiersz piksela"), p("intensity", "int, 0–100", "—", "jasność; 0 = zgaszony")],
            }),
            fn("get_pixel(x, y)", "get_pixel(x, y)", "Odczytaj jasność piksela.", {
              returns: "jasność 0–100", params: [p("x, y", "int, 0–4", "—", "współrzędne piksela")],
            }),
            fn("show(pixels)", "show(pixels)", "Ustaw wszystkie 25 pikseli naraz.", {
              params: [p("pixels", "lista int", "—", "25 jasności, wiersz po wierszu")],
            }),
            fn("clear()", "clear()", "Zgaś cały ekran."),
            fn("set_orientation(top)", "set_orientation(top)", "Obróć ekran (gdy hub leży inaczej).", {
              params: [p("top", "stała", "—", "gdzie jest góra: orientation.UP / RIGHT / DOWN / LEFT")],
            }),
            fn("get_orientation()", "get_orientation()", "Odczytaj obrót ekranu.", { returns: "stała orientation.*" }),
          ]),
          { kind: "note", name: "Stałe IMAGE_* (67 obrazków)", desc: "Gotowe obrazki: IMAGE_HEART, IMAGE_HAPPY, IMAGE_SAD, IMAGE_DUCK, IMAGE_GHOST… (light_matrix.IMAGE_…)." },
        ],
      },
      {
        kind: "mod", name: "motion_sensor", import: "from hub import motion_sensor", accent: "sense", sensor: true, emoji: "🧭",
        desc: "Wbudowany w hub żyroskop i akcelerometr: przechylenie, gesty, orientacja, przyspieszenie.",
        children: [
          funcs("motion_sensor", [
            fn("tilt_angles()", "tilt_angles()", "Odczytaj przechylenie hubu.", {
              returns: "krotka (yaw, pitch, roll) w decystopniach — podziel przez 10, by mieć stopnie",
              example: [
                "from hub import motion_sensor",
                "yaw, pitch, roll = motion_sensor.tilt_angles()",
                { t: "# yaw/10 to obrót w stopniach", c: "cmt" },
              ],
            }),
            fn("acceleration(raw_unfiltered)", "acceleration(raw_unfiltered)", "Odczytaj przyspieszenie.", {
              returns: "krotka (x, y, z) w mili-g (1/1000 przyspieszenia ziemskiego)",
              params: [p("raw_unfiltered", "bool", "False", "True = dane surowe, bez filtrowania", true)],
            }),
            fn("angular_velocity(raw_unfiltered)", "angular_velocity(raw_unfiltered)", "Odczytaj prędkość kątową.", {
              returns: "krotka (x, y, z) w decystopniach/s",
              params: [p("raw_unfiltered", "bool", "False", "True = dane surowe", true)],
            }),
            fn("gesture()", "gesture()", "Sprawdź wykryty gest.", {
              returns: "stała: TAPPED (stuknięcie), DOUBLE_TAPPED, SHAKEN (potrząśnięcie), FALLING (spadanie), UNKNOWN",
            }),
            fn("up_face()", "up_face()", "Która ściana hubu jest skierowana do góry.", {
              returns: "stała ściany: TOP, FRONT, RIGHT, BOTTOM, BACK, LEFT",
            }),
            fn("stable()", "stable()", "Czy hub leży nieruchomo.", { returns: "True / False" }),
            fn("tap_count()", "tap_count()", "Liczba stuknięć od startu / od resetu.", { returns: "liczba stuknięć (int)" }),
            fn("reset_tap_count()", "reset_tap_count()", "Wyzeruj licznik stuknięć."),
            fn("quaternion()", "quaternion()", "Orientacja hubu jako kwaternion.", { returns: "krotka (w, x, y, z)" }),
            fn("reset_yaw(angle)", "reset_yaw(angle)", "Ustaw nowy punkt odniesienia dla kąta yaw (obrotu).", {
              params: [p("angle", "int", "—", "nowa wartość odniesienia, zwykle 0")],
            }),
            fn("get_yaw_face()", "get_yaw_face()", "Odczytaj ścianę odniesienia dla yaw.", { returns: "stała ściany" }),
            fn("set_yaw_face(up)", "set_yaw_face(up)", "Ustaw ścianę odniesienia dla yaw.", {
              params: [p("up", "stała ściany", "—", "np. motion_sensor.TOP")],
            }),
          ]),
          { kind: "note", name: "Stałe", desc: "Gesty: TAPPED, DOUBLE_TAPPED, SHAKEN, FALLING, UNKNOWN. Ściany: TOP, FRONT, RIGHT, BOTTOM, BACK, LEFT (motion_sensor.*)." },
        ],
      },
      {
        kind: "mod", name: "sound", import: "from hub import sound", accent: "motor", emoji: "🔊",
        desc: "Dźwięki grane przez głośnik samego hubu.",
        children: [
          funcs("hub.sound", [
            fn("beep(freq, duration, volume)", "beep(freq=440, duration=500, volume=100, *, attack, decay, sustain, release, transition, waveform, channel)",
              "Zagraj sygnał o danej częstotliwości.", {
              aw: true,
              params: [p("freq", "int, Hz", "440", "wysokość dźwięku (440 = ton A)"),
                p("duration", "int, ms", "500", "czas trwania"),
                p("volume", "int, 0–100", "100", "głośność"),
                p("waveform", "stała", "WAVEFORM_SINE", "kształt fali: SINE, SQUARE, SAWTOOTH, TRIANGLE", true)],
              example: [
                "from hub import sound",
                "await sound.beep(440, 500, 100)",
              ],
            }),
            fn("stop()", "stop()", "Zatrzymaj dźwięk."),
            fn("volume(volume)", "volume(volume)", "Ustaw głośność hubu.", {
              params: [p("volume", "int, 0–100", "—", "głośność")],
            }),
          ]),
          { kind: "note", name: "Stałe", desc: "ANY, DEFAULT, WAVEFORM_SINE, WAVEFORM_SQUARE, WAVEFORM_SAWTOOTH, WAVEFORM_TRIANGLE." },
        ],
      },
    ],
  },
  {
    kind: "pkg", name: "app", import: "from app import ...", emoji: "📱",
    desc: "Pakiet współpracy z aplikacją SPIKE na komputerze/tablecie: wykresy, obrazki, muzyka, dźwięki.",
    children: [
      {
        kind: "mod", name: "bargraph", import: "from app import bargraph", accent: "drive", emoji: "📊",
        desc: "Wykres słupkowy w aplikacji — każdy kolor to jeden słupek.",
        children: [funcs("bargraph", [
          fn("change(color, value)", "change(color, value)", "Zmień słupek o podaną wartość.", {
            params: [p("color", "stała koloru", "—", "który słupek, np. color.RED"), p("value", "liczba", "—", "o ile zmienić (może być ujemne)")],
          }),
          fn("set_value(color, value)", "set_value(color, value)", "Ustaw wartość słupka.", {
            params: [p("color", "stała koloru", "—", "który słupek"), p("value", "liczba", "—", "nowa wartość")],
          }),
          fn("get_value(color)", "get_value(color)", "Odczytaj wartość słupka.", { aw: true, returns: "wartość słupka", params: [p("color", "stała koloru", "—", "który słupek")] }),
          fn("clear_all()", "clear_all()", "Wyczyść cały wykres."),
          fn("show(fullscreen)", "show(fullscreen)", "Pokaż wykres w aplikacji.", { params: [p("fullscreen", "bool", "—", "True = na pełnym ekranie")] }),
          fn("hide()", "hide()", "Ukryj wykres."),
        ])],
      },
      {
        kind: "mod", name: "display", import: "from app import display", accent: "sense", emoji: "🖼️",
        desc: "Duże obrazki i tekst pokazywane w aplikacji.",
        children: [
          funcs("display", [
            fn("image(image)", "image(image)", "Pokaż obrazek.", { params: [p("image", "int, 1–21 lub stała", "—", "np. display.IMAGE_ROBOT_1")] }),
            fn("text(text)", "text(text)", "Pokaż tekst.", { params: [p("text", "tekst", "—", "co wyświetlić")] }),
            fn("show(fullscreen)", "show(fullscreen)", "Pokaż na pełnym ekranie.", { params: [p("fullscreen", "bool", "—", "True = pełny ekran")] }),
            fn("hide()", "hide()", "Ukryj."),
          ]),
          { kind: "note", name: "Stałe IMAGE_* (21)", desc: "IMAGE_ROBOT_1…, IMAGE_BEACH, IMAGE_MOON, IMAGE_CAVE… (display.IMAGE_…)." },
        ],
      },
      {
        kind: "mod", name: "linegraph", import: "from app import linegraph", accent: "drive", emoji: "📈",
        desc: "Wykres liniowy w aplikacji — świetny do pokazywania odczytów czujników w czasie.",
        children: [funcs("linegraph", [
          fn("plot(color, x, y)", "plot(color, x, y)", "Dodaj punkt na wykresie.", {
            params: [p("color", "stała koloru", "—", "która linia"), p("x, y", "liczby", "—", "współrzędne punktu")],
          }),
          fn("get_average(color)", "get_average(color)", "Średnia wartość linii.", { aw: true, returns: "średnia" }),
          fn("get_last(color)", "get_last(color)", "Ostatnia wartość linii.", { aw: true, returns: "ostatnia wartość" }),
          fn("get_min(color)", "get_min(color)", "Najmniejsza wartość linii.", { aw: true, returns: "minimum" }),
          fn("get_max(color)", "get_max(color)", "Największa wartość linii.", { aw: true, returns: "maksimum" }),
          fn("clear(color)", "clear(color)", "Wyczyść jedną linię.", { params: [p("color", "stała koloru", "—", "która linia")] }),
          fn("clear_all()", "clear_all()", "Wyczyść cały wykres."),
          fn("show(fullscreen)", "show(fullscreen)", "Pokaż wykres.", { params: [p("fullscreen", "bool", "—", "True = pełny ekran")] }),
          fn("hide()", "hide()", "Ukryj wykres."),
        ])],
      },
      {
        kind: "mod", name: "music", import: "from app import music", accent: "motor", emoji: "🎵",
        desc: "Granie instrumentów i perkusji przez aplikację.",
        children: [
          funcs("music", [
            fn("play_drum(drum)", "play_drum(drum)", "Zagraj dźwięk perkusji.", {
              params: [p("drum", "stała", "—", "np. music.DRUM_SNARE, DRUM_BASS")],
            }),
            fn("play_instrument(instrument, note, duration)", "play_instrument(instrument, note, duration)", "Zagraj nutę na instrumencie.", {
              params: [p("instrument", "stała", "—", "np. music.INSTRUMENT_PIANO"),
                p("note", "int, 0–130", "—", "wysokość nuty (60 = środkowe C)"),
                p("duration", "int, ms", "—", "czas trwania")],
            }),
          ]),
          { kind: "note", name: "Stałe", desc: "DRUM_* (np. DRUM_SNARE, DRUM_BASS, DRUM_CRASH) oraz INSTRUMENT_* (np. INSTRUMENT_PIANO, INSTRUMENT_GUITAR)." },
        ],
      },
      {
        kind: "mod", name: "sound", import: "from app import sound", accent: "sense", emoji: "🎧",
        desc: "Odtwarzanie gotowych dźwięków w aplikacji.",
        children: [funcs("app.sound", [
          fn("play(sound_name, volume, pitch, pan)", "play(sound_name, volume=100, pitch=0, pan=0)", "Zagraj nazwany dźwięk.", {
            aw: true,
            params: [p("sound_name", "tekst", "—", "nazwa dźwięku z biblioteki aplikacji"),
              p("volume", "int, 0–100", "100", "głośność"),
              p("pitch", "int", "0", "zmiana wysokości", true),
              p("pan", "int, −100…100", "0", "balans lewo/prawo", true)],
          }),
          fn("set_attributes(volume, pitch, pan)", "set_attributes(volume, pitch, pan)", "Ustaw głośność / wysokość / balans.", {
            params: [p("volume", "int, 0–100", "—", "głośność"), p("pitch", "int", "—", "wysokość"), p("pan", "int, −100…100", "—", "balans")],
          }),
          fn("stop()", "stop()", "Zatrzymaj dźwięk."),
        ])],
      },
    ],
  },
];
