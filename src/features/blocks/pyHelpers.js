// ----------------------------------------------------------------------------
// CZYSTE funkcje budujące kod Pythona (SPIKE 3). Bez Blockly — testowalne w Node.
// Każda funkcja "leaf" zwraca POJEDYNCZĄ linię (bez \n, bez wcięcia).
// Wcięcia i struktury sterujące składa walker w pyGen.js, a całość — assembleProgram.
// ----------------------------------------------------------------------------

export const IND = "    ";
export const OP_SYM = { LT: "<", GT: ">", EQ: "==", NE: "!=", LE: "<=", GE: ">=" };
export const ARITH_SYM = { ADD: "+", SUB: "-", MUL: "*", DIV: "/" };
const UNIT_MULT = { ROT: 360, DEG: 1 };

export function asInt(expr) {
  const s = String(expr).trim();
  if (/^-?\d+$/.test(s)) return s;
  // iloczyn/suma samych liczb całkowitych jest w Pythonie i tak liczbą całkowitą
  // -> nie owijamy w int() (krótszy, czytelniejszy kod, np. 10 * 360)
  if (/^[-+*()\d ]+$/.test(s)) return s;
  return `int(${s})`;
}
export function pyStr(s) {
  return "'" + String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

// ——— SILNIKI ———
export function motorRunFor(port, dir, nExpr, unit) {
  const vel = dir === "CCW" ? `-speed_${port}` : `speed_${port}`;
  if (unit === "SEC") return `await motor.run_for_time(port.${port}, ${asInt(`${nExpr} * 1000`)}, ${vel})`;
  const m = UNIT_MULT[unit] || 1;
  const deg = m === 1 ? asInt(nExpr) : asInt(`${nExpr} * ${m}`);
  return `await motor.run_for_degrees(port.${port}, ${deg}, ${vel})`;
}
export function motorGoto(port, degExpr) {
  return `await motor.run_to_absolute_position(port.${port}, ${asInt(degExpr)}, speed_${port})`;
}
export function motorStart(port, dir) {
  const vel = dir === "CCW" ? `-speed_${port}` : `speed_${port}`;
  return `motor.run(port.${port}, ${vel})`;
}
export function motorStop(port) { return `motor.stop(port.${port})`; }
export function motorSetSpeed(port, pctExpr) { return `speed_${port} = ${pctExpr} * 10`; }
export function motorPosition(port) { return `motor.absolute_position(port.${port})`; }
export function motorVelocity(port) { return `motor.velocity(port.${port})`; }

// ——— RUCH ———
function steerOfDir(dir) { return dir === "DOWN" ? -100 : 100; } // ↑ przód / ↓ tył -> prędkość ze znakiem
export function moveForDir(dir, nExpr, unit) {
  const sign = dir === "DOWN" ? "-" : "";
  if (unit === "SEC") return `await motor_pair.move_for_time(motor_pair.PAIR_1, ${asInt(`${nExpr} * 1000`)}, 0, velocity=${sign}move_speed)`;
  const m = UNIT_MULT[unit] || 1;
  const deg = m === 1 ? asInt(nExpr) : asInt(`${nExpr} * ${m}`);
  return `await motor_pair.move_for_degrees(motor_pair.PAIR_1, ${deg}, 0, velocity=${sign}move_speed)`;
}
export function moveForSteer(steer, nExpr, unit) {
  if (unit === "SEC") return `await motor_pair.move_for_time(motor_pair.PAIR_1, ${asInt(`${nExpr} * 1000`)}, ${steer}, velocity=move_speed)`;
  const m = UNIT_MULT[unit] || 1;
  const deg = m === 1 ? asInt(nExpr) : asInt(`${nExpr} * ${m}`);
  return `await motor_pair.move_for_degrees(motor_pair.PAIR_1, ${deg}, ${steer}, velocity=move_speed)`;
}
export function moveStartDir(dir) {
  const sign = dir === "DOWN" ? "-" : "";
  return `motor_pair.move(motor_pair.PAIR_1, 0, velocity=${sign}move_speed)`;
}
export function moveStartSteer(steer) { return `motor_pair.move(motor_pair.PAIR_1, ${steer}, velocity=move_speed)`; }
export function moveStop() { return `motor_pair.stop(motor_pair.PAIR_1)`; }
export function moveSetSpeed(pctExpr) { return `move_speed = ${pctExpr} * 10`; }
export function moveSetMotors(l, r) { return `motor_pair.pair(motor_pair.PAIR_1, port.${l}, port.${r})`; }
export function moveSetDistance(valExpr) { return `# 1 obrót silnika = ${valExpr} cm (kalibrację ustaw w aplikacji SPIKE)`; }

// ——— ŚWIATŁO ———
export function lightWrite(textExpr) { return `await light_matrix.write(${textExpr})`; }
export function lightImage(img) { return `light_matrix.show_image(light_matrix.${img})`; }
export function lightOff() { return `light_matrix.clear()`; }
export function lightPixel(x, y, i) { return `light_matrix.set_pixel(${x}, ${y}, ${i})`; }
export function lightButtonColor(color) { return `light.color(light.POWER, color.${color})`; }

// ——— DŹWIĘK ———
export function soundBeep(hzExpr, msExpr) { return `await sound.beep(${asInt(hzExpr)}, ${asInt(msExpr)}, 100)`; }
export function soundPlay(name) { return `await app_sound.play(${pyStr(name)})`; }
export function soundSetVolume(pctExpr) { return `sound.volume(${asInt(pctExpr)})`; }

// ——— CZUJNIKI ———
export function sColorIs(port, color) { return `color_sensor.color(port.${port}) == color.${color}`; }
export function sColor(port) { return `color_sensor.color(port.${port})`; }
export function sReflectionCmp(port, op, nExpr) { return `color_sensor.reflection(port.${port}) ${OP_SYM[op]} ${nExpr}`; }
export function sReflection(port) { return `color_sensor.reflection(port.${port})`; }
export function sForcePressed(port, state) {
  const e = `force_sensor.pressed(port.${port})`;
  return state === "RELEASED" ? `not ${e}` : e;
}
export function sForce(port) { return `force_sensor.force(port.${port})`; }
export function sDistanceCmp(port, op, nExpr) {
  return `distance_sensor.distance(port.${port}) ${OP_SYM[op]} ${nExpr} * 20`;
}
export function sDistance(port, unit) {
  const d = `distance_sensor.distance(port.${port})`;
  return unit === "CM" ? `${d} / 10` : `${d} / 20`;
}
export function sButton(side) { return `button.pressed(button.${side}) > 0`; }
export function sTiltAngle(axis) {
  // tilt_angles() -> (yaw, pitch, roll) w decystopniach
  const idx = axis === "YAW" ? 0 : axis === "PITCH" ? 1 : 2;
  return `(motion_sensor.tilt_angles()[${idx}] / 10)`;
}
export function resetYaw() { return `motion_sensor.reset_yaw(0)`; }

// ——— WYRAŻENIA ———
export function opRandom(a, b) { return `random.randint(${asInt(a)}, ${asInt(b)})`; }
export function opArith(a, op, b) { return `(${a} ${ARITH_SYM[op]} ${b})`; }
export function opCompare(a, op, b) { return `(${a} ${OP_SYM[op]} ${b})`; }
export function opAnd(a, b) { return `(${a} and ${b})`; }
export function opOr(a, b) { return `(${a} or ${b})`; }
export function opNot(a) { return `(not ${a})`; }
export function opBetween(x, lo, hi) { return `(${lo} <= ${x} <= ${hi})`; }
export function opMod(a, b) { return `(${a} % ${b})`; }
export function opRound(a) { return `round(${a})`; }
export function opAbs(a) { return `abs(${a})`; }
export function opJoin(a, b) { return `(str(${a}) + str(${b}))`; }
export function opLength(a) { return `len(str(${a}))`; }

// ——— ZMIENNE ———
export function varSet(name, valExpr) { return `${name} = ${valExpr}`; }
export function varChange(name, valExpr) { return `${name} = ${name} + ${valExpr}`; }
export function varShow(name) { return `await light_matrix.write(str(${name}))`; }

// ——— LISTY (Scratch liczy od 1, Python od 0) ———
export function oneToZero(expr) {
  const s = String(expr).trim();
  if (/^-?\d+$/.test(s)) return String(parseInt(s, 10) - 1);
  return `${asInt(s)} - 1`;
}
export function listAdd(name, item) { return `${name}.append(${item})`; }
export function listRemove(name, idx) { return `${name}.pop(${oneToZero(idx)})`; }
export function listRemoveAll(name) { return `${name}.clear()`; }
export function listInsert(name, idx, item) { return `${name}.insert(${oneToZero(idx)}, ${item})`; }
export function listReplace(name, idx, item) { return `${name}[${oneToZero(idx)}] = ${item}`; }
export function listGet(name, idx) { return `${name}[${oneToZero(idx)}]`; }
export function listIndex(name, item) { return `(${name}.index(${item}) + 1 if ${item} in ${name} else 0)`; }
export function listLength(name) { return `len(${name})`; }
export function listContains(name, item) { return `(${item} in ${name})`; }

// ——— IMPORTY ———
const PLAIN_ORDER = ["motor", "motor_pair", "color_sensor", "distance_sensor", "force_sensor", "color", "runloop", "random", "time"];
const HUB_ORDER = ["port", "light", "light_matrix", "motion_sensor", "sound", "button"];
export function buildImportLines(tokens) {
  const has = (t) => tokens.has(t);
  const plain = PLAIN_ORDER.filter(has);
  const hub = HUB_ORDER.filter(has);
  const lines = [];
  if (plain.length) lines.push("import " + plain.join(", "));
  if (hub.length) lines.push("from hub import " + hub.join(", "));
  if (has("app_sound")) lines.push("from app import sound as app_sound");
  return lines;
}

// Złożenie całego programu w trzech trybach:
//  - "sync": jeden kapelusz, brak await -> zwykły kod bez async/runloop;
//  - "async" + 1 kapelusz -> async def main() + runloop.run(main());
//  - "async" + wiele kapeluszy -> osobne korutyny + runloop.run(m1(), m2(), ...).
function mark(prefix, line) {
  return line.trimStart().startsWith("#") ? { t: prefix + line, c: "cmt" } : prefix + line;
}
export function assembleProgram({ mode, hats, imports, motorPorts, useMove, moveExplicitPair, movePair, vars }) {
  const init = [];
  [...motorPorts].sort().forEach((p) => init.push(`speed_${p} = 750`));
  if (useMove) {
    if (!moveExplicitPair) {
      const [l, r] = movePair || ["A", "B"];
      init.push(`motor_pair.pair(motor_pair.PAIR_1, port.${l}, port.${r})`);
    }
    init.push(`move_speed = 500`);
  }
  (vars || []).forEach((v) => init.push(v.list ? `${v.name} = []` : `${v.name} = 0`));

  const imp = new Set(imports);
  if (mode === "async") imp.add("runloop");
  const importLines = buildImportLines(imp);

  const out = [];
  importLines.forEach((l) => out.push({ t: l, c: "kw" }));
  if (importLines.length) out.push("");

  // ——— SYNC: jeden kapelusz, kod na najwyższym poziomie ———
  if (mode === "sync") {
    const body = hats[0] ? hats[0].body : [];
    if (init.length) {
      out.push({ t: "# ustawienia startowe", c: "cmt" });
      init.forEach((l) => out.push(l));
      if (body.length) out.push("");
    }
    if (body.length) body.forEach((l) => out.push(mark("", l)));
    else if (!init.length) out.push("# pusty program");
    return out;
  }

  // ——— ASYNC, jeden kapelusz ———
  if (hats.length <= 1) {
    out.push("async def main():");
    const body = hats[0] ? hats[0].body : [];
    if (init.length) {
      out.push({ t: IND + "# ustawienia startowe", c: "cmt" });
      init.forEach((l) => out.push(IND + l));
      if (body.length) out.push("");
    }
    if (body.length) body.forEach((l) => out.push(mark(IND, l)));
    else if (!init.length) out.push(IND + "pass");
    out.push("");
    out.push("runloop.run(main())");
    return out;
  }

  // ——— ASYNC, wiele kapeluszy (równoległe korutyny) ———
  if (init.length) {
    out.push({ t: "# ustawienia startowe", c: "cmt" });
    init.forEach((l) => out.push(l));
    out.push("");
  }
  const names = [];
  hats.forEach((h, i) => {
    const fn = `main${i + 1}`;
    names.push(`${fn}()`);
    out.push(`async def ${fn}():`);
    const g = h.globals || [];
    if (g.length) out.push(IND + "global " + g.join(", "));
    if (h.body.length) h.body.forEach((l) => out.push(mark(IND, l)));
    else out.push(IND + "pass");
    out.push("");
  });
  out.push(`runloop.run(${names.join(", ")})`);
  return out;
}

export function linesToText(lines) {
  return lines.map((l) => (typeof l === "string" ? l : l.t)).join("\n");
}
