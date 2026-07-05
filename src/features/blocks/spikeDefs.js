// ----------------------------------------------------------------------------
// Definicje klocków (JSON dla Blockly) — nazwy i układ jak w aplikacji LEGO
// Education SPIKE 3.6 (po polsku). Renderer „zelos" daje scratchowy wygląd
// i sześciokątne warunki. Generujemy tylko klocki, których kod Pythona jest pewny.
// ----------------------------------------------------------------------------

export const COLORS = {
  events: "#ffbf00",
  motors: "#0c98da",
  movement: "#ff4793",
  light: "#9b5de5",
  sound: "#cf63cf",
  control: "#ffab19",
  sensors: "#00b1e7",
  operators: "#59c059",
  variables: "#ff8c1a",
  shadow: "#7ac043",
};

const PORTS = [["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"], ["E", "E"], ["F", "F"]];
const DIR_CW = [["↻", "CW"], ["↺", "CCW"]];
const DIR_UD = [["↑", "UP"], ["↓", "DOWN"]];
const UNITS = [["obrotów", "ROT"], ["stopni", "DEG"], ["sekund", "SEC"]];
const COLORS_OPT = [
  ["czerwony", "RED"], ["zielony", "GREEN"], ["niebieski", "BLUE"],
  ["żółty", "YELLOW"], ["biały", "WHITE"], ["czarny", "BLACK"], ["magenta", "MAGENTA"],
];
const IMAGES = [
  ["serce", "IMAGE_HEART"], ["uśmiech", "IMAGE_HAPPY"], ["smutek", "IMAGE_SAD"],
  ["tak ✓", "IMAGE_YES"], ["nie ✗", "IMAGE_NO"], ["duch", "IMAGE_GHOST"],
  ["kaczka", "IMAGE_DUCK"], ["strzałka ↑", "IMAGE_ARROW_N"],
];
const SOUNDS = [
  ["Cat Meow 1", "Cat Meow 1"], ["Dog Bark 1", "Dog Bark 1"], ["Robot 1", "Robot 1"],
  ["Applause 1", "Applause 1"], ["Laser 1", "Laser 1"], ["Whistle 1", "Whistle 1"],
];

// Ikonki typu czujnika (białe, na kolorowym tle klocka) — jak w aplikacji.
const svg = (s) => "data:image/svg+xml;utf8," + encodeURIComponent(s);
const IC_COLOR = svg('<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="8.5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="11" cy="11" r="3.4" fill="#fff"/></svg>');
const IC_FORCE = svg('<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="12" r="7.5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="11" cy="12" r="2.7" fill="#fff"/><rect x="9.4" y="1.6" width="3.2" height="4.2" rx="1.1" fill="#fff"/></svg>');
const IC_DIST = svg('<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22"><circle cx="7" cy="11" r="4.6" fill="none" stroke="#fff" stroke-width="2"/><circle cx="15" cy="11" r="4.6" fill="none" stroke="#fff" stroke-width="2"/></svg>');
const IC_HUB = svg('<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22"><rect x="3.2" y="3.2" width="15.6" height="15.6" rx="3" fill="none" stroke="#fff" stroke-width="2"/><circle cx="8" cy="8" r="1.2" fill="#fff"/><circle cx="14" cy="8" r="1.2" fill="#fff"/><circle cx="11" cy="11" r="1.2" fill="#fff"/><circle cx="8" cy="14" r="1.2" fill="#fff"/><circle cx="14" cy="14" r="1.2" fill="#fff"/></svg>');
const IC_MOTOR = svg('<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="8.5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="11" cy="11" r="2.8" fill="#fff"/><line x1="11" y1="2.5" x2="11" y2="6" stroke="#fff" stroke-width="2"/><line x1="11" y1="16" x2="11" y2="19.5" stroke="#fff" stroke-width="2"/><line x1="2.5" y1="11" x2="6" y2="11" stroke="#fff" stroke-width="2"/><line x1="16" y1="11" x2="19.5" y2="11" stroke="#fff" stroke-width="2"/></svg>');
const icon = (src, alt) => ({ type: "field_image", src, width: 22, height: 22, alt, flipRtl: false });

const stmt = (extra) => ({ previousStatement: null, nextStatement: null, inputsInline: true, ...extra });
const numOut = (extra) => ({ output: "Number", inputsInline: true, ...extra });
const boolOut = (extra) => ({ output: "Boolean", inputsInline: true, ...extra });

export const BLOCK_DEFS = [
  // cienie
  { type: "spike_number", message0: "%1", args0: [{ type: "field_number", name: "NUM", value: 0 }], output: "Number", colour: COLORS.shadow, outputShape: 2 },
  { type: "spike_text", message0: "%1", args0: [{ type: "field_input", name: "TEXT", text: "Cześć" }], output: "String", colour: COLORS.shadow, outputShape: 2 },

  // ZDARZENIA
  { type: "start_program", message0: "kiedy uruchomi się program", nextStatement: null, colour: COLORS.events, tooltip: "Początek programu — od tego klocka wszystko się zaczyna." },

  // SILNIKI
  { type: "motor_run_for", colour: COLORS.motors, message0: "%1 %2 niech działa %3 przez %4 %5",
    args0: [icon(IC_MOTOR, "silnik"), { type: "field_dropdown", name: "PORT", options: PORTS }, { type: "field_dropdown", name: "DIR", options: DIR_CW }, { type: "input_value", name: "DUR", check: "Number" }, { type: "field_dropdown", name: "UNIT", options: UNITS }], ...stmt() },
  { type: "motor_goto", colour: COLORS.motors, message0: "%1 %2 obróć do %3 stopni najkrótszą drogą",
    args0: [icon(IC_MOTOR, "silnik"), { type: "field_dropdown", name: "PORT", options: PORTS }, { type: "input_value", name: "DEG", check: "Number" }], ...stmt() },
  { type: "motor_start", colour: COLORS.motors, message0: "%1 %2 uruchom silnik %3",
    args0: [icon(IC_MOTOR, "silnik"), { type: "field_dropdown", name: "PORT", options: PORTS }, { type: "field_dropdown", name: "DIR", options: DIR_CW }], ...stmt() },
  { type: "motor_stop", colour: COLORS.motors, message0: "%1 %2 zatrzymaj silnik",
    args0: [icon(IC_MOTOR, "silnik"), { type: "field_dropdown", name: "PORT", options: PORTS }], ...stmt() },
  { type: "motor_set_speed", colour: COLORS.motors, message0: "%1 %2 ustaw prędkość na %3 %%",
    args0: [icon(IC_MOTOR, "silnik"), { type: "field_dropdown", name: "PORT", options: PORTS }, { type: "input_value", name: "PCT", check: "Number" }], ...stmt() },
  { type: "motor_position", colour: COLORS.motors, message0: "pozycja %1", args0: [{ type: "field_dropdown", name: "PORT", options: PORTS }], ...numOut() },
  { type: "motor_speed", colour: COLORS.motors, message0: "prędkość %1", args0: [{ type: "field_dropdown", name: "PORT", options: PORTS }], ...numOut() },

  // RUCH
  { type: "move_for_dir", colour: COLORS.movement, message0: "%1 przemieszczaj %2 przez %3 %4",
    args0: [icon(IC_MOTOR, "ruch"), { type: "field_dropdown", name: "DIR", options: DIR_UD }, { type: "input_value", name: "DUR", check: "Number" }, { type: "field_dropdown", name: "UNIT", options: UNITS }], ...stmt() },
  { type: "move_for_steer", colour: COLORS.movement, message0: "%1 przemieszczaj kierownica %2 przez %3 %4",
    args0: [icon(IC_MOTOR, "ruch"), { type: "field_number", name: "STEER", value: 0, min: -100, max: 100 }, { type: "input_value", name: "DUR", check: "Number" }, { type: "field_dropdown", name: "UNIT", options: UNITS }],
    tooltip: "Kierownica: 0 = prosto, dodatnia = w prawo, ujemna = w lewo.", ...stmt() },
  { type: "move_start_dir", colour: COLORS.movement, message0: "%1 rozpocznij ruch %2",
    args0: [icon(IC_MOTOR, "ruch"), { type: "field_dropdown", name: "DIR", options: DIR_UD }], ...stmt() },
  { type: "move_start_steer", colour: COLORS.movement, message0: "%1 rozpocznij ruch kierownica %2",
    args0: [icon(IC_MOTOR, "ruch"), { type: "field_number", name: "STEER", value: 0, min: -100, max: 100 }], ...stmt() },
  { type: "move_stop", colour: COLORS.movement, message0: "%1 zakończ ruch", args0: [icon(IC_MOTOR, "ruch")], ...stmt() },
  { type: "move_set_speed", colour: COLORS.movement, message0: "%1 ustaw prędkość ruchu na %2 %%",
    args0: [icon(IC_MOTOR, "ruch"), { type: "input_value", name: "PCT", check: "Number" }], ...stmt() },
  { type: "move_set_motors", colour: COLORS.movement, message0: "%1 ustaw silniki ruchu na %2",
    args0: [icon(IC_MOTOR, "ruch"), { type: "field_dropdown", name: "PAIR", options: [["A+B", "AB"], ["C+D", "CD"], ["E+F", "EF"], ["B+A", "BA"]] }], ...stmt() },
  { type: "move_set_distance", colour: COLORS.movement, message0: "%1 ustaw 1 obrót silnika na dystans %2 cm",
    args0: [icon(IC_MOTOR, "ruch"), { type: "input_value", name: "VAL", check: "Number" }], ...stmt() },

  // ŚWIATŁO
  { type: "light_image_for", colour: COLORS.light, message0: "%1 włącz obraz %2 na %3 s",
    args0: [icon(IC_HUB, "wyświetlacz"), { type: "field_dropdown", name: "IMG", options: IMAGES }, { type: "input_value", name: "SEC", check: "Number" }], ...stmt() },
  { type: "light_image", colour: COLORS.light, message0: "%1 włącz obraz %2",
    args0: [icon(IC_HUB, "wyświetlacz"), { type: "field_dropdown", name: "IMG", options: IMAGES }], ...stmt() },
  { type: "light_write", colour: COLORS.light, message0: "%1 napisz %2",
    args0: [icon(IC_HUB, "wyświetlacz"), { type: "input_value", name: "TEXT" }], ...stmt() },
  { type: "light_off", colour: COLORS.light, message0: "%1 wyłącz wyświetlacz", args0: [icon(IC_HUB, "wyświetlacz")], ...stmt() },
  { type: "light_pixel", colour: COLORS.light, message0: "%1 ustaw piksel x %2 y %3 na %4 %%",
    args0: [icon(IC_HUB, "wyświetlacz"), { type: "field_number", name: "X", value: 0, min: 0, max: 4 }, { type: "field_number", name: "Y", value: 0, min: 0, max: 4 }, { type: "field_number", name: "I", value: 100, min: 0, max: 100 }], ...stmt() },
  { type: "light_button_color", colour: COLORS.light, message0: "%1 ustaw kolor przycisku na %2",
    args0: [icon(IC_HUB, "wyświetlacz"), { type: "field_dropdown", name: "COLOR", options: COLORS_OPT }], ...stmt() },

  // DŹWIĘK
  { type: "sound_play", colour: COLORS.sound, message0: "odtwarzaj dźwięk %1 do końca",
    args0: [{ type: "field_dropdown", name: "NAME", options: SOUNDS }], ...stmt() },
  { type: "sound_beep", colour: COLORS.sound, message0: "zagraj sygnał %1 Hz przez %2 ms",
    args0: [{ type: "input_value", name: "HZ", check: "Number" }, { type: "input_value", name: "MS", check: "Number" }], ...stmt() },
  { type: "sound_set_volume", colour: COLORS.sound, message0: "ustaw głośność na %1 %%",
    args0: [{ type: "input_value", name: "PCT", check: "Number" }], ...stmt() },

  // KONTROLA
  { type: "ctrl_wait", colour: COLORS.control, message0: "czekaj %1 sekund",
    args0: [{ type: "input_value", name: "SEC", check: "Number" }], ...stmt() },
  { type: "ctrl_repeat", colour: COLORS.control,
    message0: "powtarzaj %1", args0: [{ type: "input_value", name: "TIMES", check: "Number" }],
    message1: "%1", args1: [{ type: "input_statement", name: "DO" }],
    previousStatement: null, nextStatement: null, inputsInline: true },
  { type: "ctrl_forever", colour: COLORS.control,
    message0: "zawsze",
    message1: "%1", args1: [{ type: "input_statement", name: "DO" }],
    previousStatement: null, inputsInline: true },
  { type: "ctrl_if", colour: COLORS.control,
    message0: "jeżeli %1 to", args0: [{ type: "input_value", name: "COND", check: "Boolean" }],
    message1: "%1", args1: [{ type: "input_statement", name: "DO" }],
    previousStatement: null, nextStatement: null, inputsInline: true },
  { type: "ctrl_if_else", colour: COLORS.control,
    message0: "jeżeli %1 to", args0: [{ type: "input_value", name: "COND", check: "Boolean" }],
    message1: "%1", args1: [{ type: "input_statement", name: "DO" }],
    message2: "w przeciwnym razie",
    message3: "%1", args3: [{ type: "input_statement", name: "ELSE" }],
    previousStatement: null, nextStatement: null, inputsInline: true },
  { type: "ctrl_wait_until", colour: COLORS.control, message0: "czekaj aż %1",
    args0: [{ type: "input_value", name: "COND", check: "Boolean" }], ...stmt() },
  { type: "ctrl_repeat_until", colour: COLORS.control,
    message0: "powtarzaj aż %1", args0: [{ type: "input_value", name: "COND", check: "Boolean" }],
    message1: "%1", args1: [{ type: "input_statement", name: "DO" }],
    previousStatement: null, nextStatement: null, inputsInline: true },
  { type: "ctrl_stop", colour: COLORS.control, message0: "zatrzymaj %1",
    args0: [{ type: "field_dropdown", name: "WHAT", options: [["wszystko", "ALL"], ["ten skrypt", "THIS"], ["inne zadania", "OTHER"]] }],
    previousStatement: null, inputsInline: true },

  // CZUJNIKI
  { type: "s_color_is", colour: COLORS.sensors, message0: "%1 %2 czy kolor jest %3 ?",
    args0: [icon(IC_COLOR, "czujnik koloru"), { type: "field_dropdown", name: "PORT", options: PORTS }, { type: "field_dropdown", name: "COLOR", options: COLORS_OPT }], ...boolOut() },
  { type: "s_color", colour: COLORS.sensors, message0: "%1 %2 kolor", args0: [icon(IC_COLOR, "czujnik koloru"), { type: "field_dropdown", name: "PORT", options: PORTS }], ...numOut() },
  { type: "s_reflection_cmp", colour: COLORS.sensors, message0: "%1 %2 odbicie %3 %4 %% ?",
    args0: [icon(IC_COLOR, "czujnik koloru"), { type: "field_dropdown", name: "PORT", options: PORTS }, { type: "field_dropdown", name: "OP", options: [["<", "LT"], [">", "GT"], ["=", "EQ"]] }, { type: "input_value", name: "N", check: "Number" }], ...boolOut() },
  { type: "s_reflection", colour: COLORS.sensors, message0: "%1 %2 światło odbite", args0: [icon(IC_COLOR, "czujnik koloru"), { type: "field_dropdown", name: "PORT", options: PORTS }], ...numOut() },
  { type: "s_force_pressed", colour: COLORS.sensors, message0: "%1 %2 jest %3 ?",
    args0: [icon(IC_FORCE, "czujnik nacisku"), { type: "field_dropdown", name: "PORT", options: PORTS }, { type: "field_dropdown", name: "STATE", options: [["naciśnięty", "PRESSED"], ["zwolniony", "RELEASED"]] }], ...boolOut() },
  { type: "s_force", colour: COLORS.sensors, message0: "%1 %2 nacisk w %%", args0: [icon(IC_FORCE, "czujnik nacisku"), { type: "field_dropdown", name: "PORT", options: PORTS }], ...numOut() },
  { type: "s_distance_cmp", colour: COLORS.sensors, message0: "%1 %2 jest %3 %4 %% ?",
    args0: [icon(IC_DIST, "czujnik odległości"), { type: "field_dropdown", name: "PORT", options: PORTS }, { type: "field_dropdown", name: "OP", options: [["bliżej niż", "LT"], ["dalej niż", "GT"]] }, { type: "input_value", name: "N", check: "Number" }], ...boolOut() },
  { type: "s_distance", colour: COLORS.sensors, message0: "%1 %2 odległość w %3",
    args0: [icon(IC_DIST, "czujnik odległości"), { type: "field_dropdown", name: "PORT", options: PORTS }, { type: "field_dropdown", name: "UNIT", options: [["%", "PCT"], ["cm", "CM"]] }], ...numOut() },
  { type: "s_button", colour: COLORS.sensors, message0: "%1 czy %2 przycisk jest naciśnięty ?",
    args0: [icon(IC_HUB, "hub"), { type: "field_dropdown", name: "SIDE", options: [["lewy", "LEFT"], ["prawy", "RIGHT"]] }], ...boolOut() },
  { type: "s_tilt_angle", colour: COLORS.sensors, message0: "%1 kąt %2",
    args0: [icon(IC_HUB, "hub"), { type: "field_dropdown", name: "AXIS", options: [["pochylenie", "PITCH"], ["przechylenie", "ROLL"], ["obrót", "YAW"]] }], ...numOut() },
  { type: "sensor_reset_yaw", colour: COLORS.sensors, message0: "%1 ustaw kąt obrotu na 0", args0: [icon(IC_HUB, "hub")], ...stmt() },

  // WYRAŻENIA
  { type: "op_random", colour: COLORS.operators, message0: "losuj liczbę od %1 do %2",
    args0: [{ type: "input_value", name: "A", check: "Number" }, { type: "input_value", name: "B", check: "Number" }], ...numOut() },
  { type: "op_arith", colour: COLORS.operators, message0: "%1 %2 %3",
    args0: [{ type: "input_value", name: "A", check: "Number" }, { type: "field_dropdown", name: "OP", options: [["+", "ADD"], ["−", "SUB"], ["×", "MUL"], ["÷", "DIV"]] }, { type: "input_value", name: "B", check: "Number" }], ...numOut() },
  { type: "op_compare", colour: COLORS.operators, message0: "%1 %2 %3",
    args0: [{ type: "input_value", name: "A", check: "Number" }, { type: "field_dropdown", name: "OP", options: [["<", "LT"], ["=", "EQ"], [">", "GT"]] }, { type: "input_value", name: "B", check: "Number" }], ...boolOut() },
  { type: "op_and", colour: COLORS.operators, message0: "%1 i %2",
    args0: [{ type: "input_value", name: "A", check: "Boolean" }, { type: "input_value", name: "B", check: "Boolean" }], ...boolOut() },
  { type: "op_or", colour: COLORS.operators, message0: "%1 lub %2",
    args0: [{ type: "input_value", name: "A", check: "Boolean" }, { type: "input_value", name: "B", check: "Boolean" }], ...boolOut() },
  { type: "op_not", colour: COLORS.operators, message0: "nie %1",
    args0: [{ type: "input_value", name: "A", check: "Boolean" }], ...boolOut() },
  { type: "op_between", colour: COLORS.operators, message0: "czy %1 jest pomiędzy %2 a %3 ?",
    args0: [{ type: "input_value", name: "X", check: "Number" }, { type: "input_value", name: "LO", check: "Number" }, { type: "input_value", name: "HI", check: "Number" }], ...boolOut() },
  { type: "op_mod", colour: COLORS.operators, message0: "reszta z %1 ÷ %2",
    args0: [{ type: "input_value", name: "A", check: "Number" }, { type: "input_value", name: "B", check: "Number" }], ...numOut() },
  { type: "op_round", colour: COLORS.operators, message0: "zaokrąglij %1",
    args0: [{ type: "input_value", name: "A", check: "Number" }], ...numOut() },
  { type: "op_abs", colour: COLORS.operators, message0: "wartość bezwzględna %1",
    args0: [{ type: "input_value", name: "A", check: "Number" }], ...numOut() },
  { type: "op_join", colour: COLORS.operators, message0: "połącz %1 i %2",
    args0: [{ type: "input_value", name: "A" }, { type: "input_value", name: "B" }], output: "String", inputsInline: true },
  { type: "op_length", colour: COLORS.operators, message0: "długość %1",
    args0: [{ type: "input_value", name: "A" }], ...numOut() },

  // ZMIENNE
  { type: "var_set", colour: COLORS.variables, message0: "ustaw %1 na %2",
    args0: [{ type: "field_variable", name: "VAR", variableTypes: [""], defaultType: "" }, { type: "input_value", name: "VAL" }], ...stmt() },
  { type: "var_change", colour: COLORS.variables, message0: "zmień %1 o %2",
    args0: [{ type: "field_variable", name: "VAR", variableTypes: [""], defaultType: "" }, { type: "input_value", name: "VAL", check: "Number" }], ...stmt() },
  { type: "var_get", colour: COLORS.variables, message0: "%1", args0: [{ type: "field_variable", name: "VAR", variableTypes: [""], defaultType: "" }], output: "Number" },
  { type: "var_show", colour: COLORS.variables, message0: "pokaż %1 na wyświetlaczu",
    args0: [{ type: "field_variable", name: "VAR", variableTypes: [""], defaultType: "" }], ...stmt() },

  // LISTY
  { type: "list_add", colour: COLORS.variables, message0: "dodaj %1 do %2",
    args0: [{ type: "input_value", name: "ITEM" }, { type: "field_variable", name: "VAR", variableTypes: ["list"], defaultType: "list" }], ...stmt() },
  { type: "list_remove", colour: COLORS.variables, message0: "usuń %1 z %2",
    args0: [{ type: "input_value", name: "IDX", check: "Number" }, { type: "field_variable", name: "VAR", variableTypes: ["list"], defaultType: "list" }], ...stmt() },
  { type: "list_remove_all", colour: COLORS.variables, message0: "usuń wszystko z %1",
    args0: [{ type: "field_variable", name: "VAR", variableTypes: ["list"], defaultType: "list" }], ...stmt() },
  { type: "list_insert", colour: COLORS.variables, message0: "wstaw %1 na %2 pozycji z %3",
    args0: [{ type: "input_value", name: "ITEM" }, { type: "input_value", name: "IDX", check: "Number" }, { type: "field_variable", name: "VAR", variableTypes: ["list"], defaultType: "list" }], ...stmt() },
  { type: "list_replace", colour: COLORS.variables, message0: "zamień %1 z %2 na %3",
    args0: [{ type: "input_value", name: "IDX", check: "Number" }, { type: "field_variable", name: "VAR", variableTypes: ["list"], defaultType: "list" }, { type: "input_value", name: "ITEM" }], ...stmt() },
  { type: "list_get", colour: COLORS.variables, message0: "element %1 z %2",
    args0: [{ type: "input_value", name: "IDX", check: "Number" }, { type: "field_variable", name: "VAR", variableTypes: ["list"], defaultType: "list" }], output: null, inputsInline: true },
  { type: "list_index", colour: COLORS.variables, message0: "pozycja %1 na liście %2",
    args0: [{ type: "input_value", name: "ITEM" }, { type: "field_variable", name: "VAR", variableTypes: ["list"], defaultType: "list" }], ...numOut() },
  { type: "list_length", colour: COLORS.variables, message0: "długość %1",
    args0: [{ type: "field_variable", name: "VAR", variableTypes: ["list"], defaultType: "list" }], ...numOut() },
  { type: "list_contains", colour: COLORS.variables, message0: "%1 zawiera %2 ?",
    args0: [{ type: "field_variable", name: "VAR", variableTypes: ["list"], defaultType: "list" }, { type: "input_value", name: "ITEM" }], ...boolOut() },
];

// ——— Przybornik z cieniami w gniazdach ———
function num(v) { return { shadow: { type: "spike_number", fields: { NUM: v } } }; }
function txt(v) { return { shadow: { type: "spike_text", fields: { TEXT: v } } }; }
function blk(type, inputs) { return inputs ? { kind: "block", type, inputs } : { kind: "block", type }; }

export const TOOLBOX = {
  kind: "categoryToolbox",
  contents: [
    { kind: "category", name: "Zdarzenia", colour: COLORS.events, contents: [blk("start_program")] },
    { kind: "category", name: "Silniki", colour: COLORS.motors, contents: [
      blk("motor_run_for", { DUR: num(1) }), blk("motor_goto", { DEG: num(0) }), blk("motor_start"),
      blk("motor_stop"), blk("motor_set_speed", { PCT: num(75) }), blk("motor_position"), blk("motor_speed"),
    ] },
    { kind: "category", name: "Ruch", colour: COLORS.movement, contents: [
      blk("move_for_dir", { DUR: num(10) }), blk("move_for_steer", { DUR: num(10) }),
      blk("move_start_dir"), blk("move_start_steer"), blk("move_stop"),
      blk("move_set_speed", { PCT: num(50) }), blk("move_set_motors"), blk("move_set_distance", { VAL: num(17.5) }),
    ] },
    { kind: "category", name: "Światło", colour: COLORS.light, contents: [
      blk("light_image_for", { SEC: num(2) }), blk("light_image"), blk("light_write", { TEXT: txt("Cześć") }),
      blk("light_off"), blk("light_pixel"), blk("light_button_color"),
    ] },
    { kind: "category", name: "Dźwięk", colour: COLORS.sound, contents: [
      blk("sound_play"), blk("sound_beep", { HZ: num(440), MS: num(500) }), blk("sound_set_volume", { PCT: num(100) }),
    ] },
    { kind: "category", name: "Kontrola", colour: COLORS.control, contents: [
      blk("ctrl_wait", { SEC: num(1) }), blk("ctrl_repeat", { TIMES: num(10) }), blk("ctrl_forever"),
      blk("ctrl_if"), blk("ctrl_if_else"), blk("ctrl_wait_until"), blk("ctrl_repeat_until"), blk("ctrl_stop"),
    ] },
    { kind: "category", name: "Czujniki", colour: COLORS.sensors, contents: [
      blk("s_color_is"), blk("s_color"), blk("s_reflection_cmp", { N: num(50) }), blk("s_reflection"),
      blk("s_force_pressed"), blk("s_force"), blk("s_distance_cmp", { N: num(15) }), blk("s_distance"),
      blk("s_button"), blk("s_tilt_angle"), blk("sensor_reset_yaw"),
    ] },
    { kind: "category", name: "Wyrażenia", colour: COLORS.operators, contents: [
      blk("op_random", { A: num(1), B: num(10) }), blk("op_arith", { A: num(0), B: num(0) }),
      blk("op_compare", { A: num(0), B: num(0) }), blk("op_and"), blk("op_or"), blk("op_not"),
      blk("op_between", { X: num(0), LO: num(1), HI: num(10) }), blk("op_mod", { A: num(0), B: num(1) }),
      blk("op_round", { A: num(0) }), blk("op_abs", { A: num(0) }),
      blk("op_join", { A: txt("cześć "), B: txt("świecie") }), blk("op_length", { A: txt("cześć") }),
    ] },
    { kind: "category", name: "Zmienne", colour: COLORS.variables, custom: "SPIKE_VARIABLES" },
  ],
};
