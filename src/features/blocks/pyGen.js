// ----------------------------------------------------------------------------
// Generator Pythona: własny rekurencyjny obchód drzewa klocków Blockly.
// NIE używa frameworku generatora Blockly — operuje tylko na metodach klocka
// (getFieldValue / getInputTargetBlock / getNextBlock), więc jest w pełni
// testowalny w Node z atrapami i odporny na różnice wersji Blockly.
// ----------------------------------------------------------------------------

import * as H from "./pyHelpers.js";
import { asInt, IND, assembleProgram } from "./pyHelpers.js";

const PY_KW = new Set(["and","or","not","if","else","elif","while","for","def","return","import","from","as","class","True","False","None","pass","break","continue","in","is","lambda","global","nonlocal","await","async","try","except","finally","with","yield","raise","del","assert"]);
export function sanitize(name) {
  let s = (name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/[^A-Za-z0-9_]/g, "_");
  if (/^[0-9]/.test(s)) s = "_" + s;
  if (!s) s = "zmienna";
  if (PY_KW.has(s)) s += "_";
  return s;
}

const indent = (lines) => lines.map((l) => IND + l);
const hasAwait = (lines) => lines.some((l) => /\bawait\b/.test(l));

// Pauza w pętli nieskończonej: w trybie async -> await runloop.sleep_ms,
// w trybie sync -> time.sleep_ms (bez await). Gdy w pętli już jest await, nie dokładamy.
function loopSleep(ctx, body) {
  if (hasAwait(body)) return null;
  if (ctx.mode === "sync") { ctx.imports.add("time"); return "time.sleep_ms(10)"; }
  if (ctx.mode === "detect") return null;
  ctx.imports.add("runloop");
  return "await runloop.sleep_ms(10)";
}

function vname(block, field, ctx) {
  const id = block.getFieldValue(field);
  const v = ctx.ws && ctx.ws.getVariableById ? ctx.ws.getVariableById(id) : null;
  return sanitize(v ? v.name : id);
}

// ——— WYRAŻENIA (raportery / warunki) ———
function exprOf(block, ctx) {
  if (!block) return null;
  const f = (n) => block.getFieldValue(n);
  const v = (n, d) => valueExpr(block, n, ctx, d);
  const imp = (...m) => m.forEach((x) => ctx.imports.add(x));

  switch (block.type) {
    case "spike_number": return String(f("NUM"));
    case "spike_text": return H.pyStr(f("TEXT"));

    case "motor_position": imp("motor", "port"); return H.motorPosition(f("PORT"));
    case "motor_speed": imp("motor", "port"); return H.motorVelocity(f("PORT"));

    case "s_color_is": imp("color_sensor", "color", "port"); return H.sColorIs(f("PORT"), f("COLOR"));
    case "s_color": imp("color_sensor", "port"); return H.sColor(f("PORT"));
    case "s_reflection_cmp": imp("color_sensor", "port"); return H.sReflectionCmp(f("PORT"), f("OP"), v("N", "50"));
    case "s_reflection": imp("color_sensor", "port"); return H.sReflection(f("PORT"));
    case "s_force_pressed": imp("force_sensor", "port"); return H.sForcePressed(f("PORT"), f("STATE"));
    case "s_force": imp("force_sensor", "port"); return H.sForce(f("PORT"));
    case "s_distance_cmp": imp("distance_sensor", "port"); return H.sDistanceCmp(f("PORT"), f("OP"), v("N", "15"));
    case "s_distance": imp("distance_sensor", "port"); return H.sDistance(f("PORT"), f("UNIT"));
    case "s_button": imp("button"); return H.sButton(f("SIDE"));
    case "s_tilt_angle": imp("motion_sensor"); return H.sTiltAngle(f("AXIS"));

    case "op_random": imp("random"); return H.opRandom(v("A", "1"), v("B", "6"));
    case "op_arith": return H.opArith(v("A", "0"), f("OP"), v("B", "0"));
    case "op_compare": return H.opCompare(v("A", "0"), f("OP"), v("B", "0"));
    case "op_and": return H.opAnd(v("A", "False"), v("B", "False"));
    case "op_or": return H.opOr(v("A", "False"), v("B", "False"));
    case "op_not": return H.opNot(v("A", "False"));
    case "op_between": return H.opBetween(v("X", "0"), v("LO", "0"), v("HI", "0"));
    case "op_mod": return H.opMod(v("A", "0"), v("B", "1"));
    case "op_round": return H.opRound(v("A", "0"));
    case "op_abs": return H.opAbs(v("A", "0"));
    case "op_join": return H.opJoin(v("A", H.pyStr("")), v("B", H.pyStr("")));
    case "op_length": return H.opLength(v("A", H.pyStr("")));

    case "var_get": return vname(block, "VAR", ctx);

    case "list_get": return H.listGet(vname(block, "VAR", ctx), v("IDX", "1"));
    case "list_index": return H.listIndex(vname(block, "VAR", ctx), v("ITEM", H.pyStr("")));
    case "list_length": return H.listLength(vname(block, "VAR", ctx));
    case "list_contains": return H.listContains(vname(block, "VAR", ctx), v("ITEM", H.pyStr("")));
    default: return null;
  }
}

function valueExpr(block, name, ctx, dflt) {
  const e = exprOf(block.getInputTargetBlock(name), ctx);
  return e == null ? dflt : e;
}

// ——— INSTRUKCJE (zwracają tablicę linii; wcięcie 0, zagnieżdżenia +IND) ———
function stmtLines(block, ctx) {
  const f = (n) => block.getFieldValue(n);
  const v = (n, d) => valueExpr(block, n, ctx, d);
  const stack = (n) => stackLines(block.getInputTargetBlock(n), ctx);
  const imp = (...m) => m.forEach((x) => ctx.imports.add(x));

  switch (block.type) {
    // SILNIKI
    case "motor_run_for": { const p = f("PORT"); imp("motor", "port"); ctx.motorPorts.add(p); return [H.motorRunFor(p, f("DIR"), v("DUR", "1"), f("UNIT"))]; }
    case "motor_goto": { const p = f("PORT"); imp("motor", "port"); ctx.motorPorts.add(p); return [H.motorGoto(p, v("DEG", "0"))]; }
    case "motor_start": { const p = f("PORT"); imp("motor", "port"); ctx.motorPorts.add(p); return [H.motorStart(p, f("DIR"))]; }
    case "motor_stop": imp("motor", "port"); return [H.motorStop(f("PORT"))];
    case "motor_set_speed": { const p = f("PORT"); imp("motor", "port"); ctx.motorPorts.add(p); ctx.assigned.add(`speed_${p}`); return [H.motorSetSpeed(p, v("PCT", "75"))]; }

    // RUCH
    case "move_for_dir": imp("motor_pair", "port"); ctx.useMove = true; return [H.moveForDir(f("DIR"), v("DUR", "1"), f("UNIT"))];
    case "move_for_steer": imp("motor_pair", "port"); ctx.useMove = true; return [H.moveForSteer(String(f("STEER")), v("DUR", "1"), f("UNIT"))];
    case "move_start_dir": imp("motor_pair", "port"); ctx.useMove = true; return [H.moveStartDir(f("DIR"))];
    case "move_start_steer": imp("motor_pair", "port"); ctx.useMove = true; return [H.moveStartSteer(String(f("STEER")))];
    case "move_stop": imp("motor_pair", "port"); ctx.useMove = true; return [H.moveStop()];
    case "move_set_speed": imp("motor_pair", "port"); ctx.useMove = true; ctx.assigned.add("move_speed"); return [H.moveSetSpeed(v("PCT", "50"))];
    case "move_set_motors": { imp("motor_pair", "port"); ctx.useMove = true; ctx.moveExplicitPair = true; const pr = f("PAIR"); ctx.movePair = [pr[0], pr[1]]; return [H.moveSetMotors(pr[0], pr[1])]; }
    case "move_set_distance": imp("motor_pair"); ctx.useMove = true; return [H.moveSetDistance(v("VAL", "17.5"))];

    // ŚWIATŁO
    case "light_write": imp("light_matrix"); return [H.lightWrite(v("TEXT", H.pyStr("Cześć")))];
    case "light_image": imp("light_matrix"); return [H.lightImage(f("IMG"))];
    case "light_image_for": imp("light_matrix"); return [H.lightImage(f("IMG")), `await runloop.sleep_ms(${asInt(`${v("SEC", "2")} * 1000`)})`, H.lightOff()];
    case "light_off": imp("light_matrix"); return [H.lightOff()];
    case "light_pixel": imp("light_matrix"); return [H.lightPixel(f("X"), f("Y"), f("I"))];
    case "light_button_color": imp("light", "color"); return [H.lightButtonColor(f("COLOR"))];

    // DŹWIĘK
    case "sound_beep": imp("sound"); return [H.soundBeep(v("HZ", "440"), v("MS", "500"))];
    case "sound_play": imp("app_sound"); return [H.soundPlay(f("NAME"))];
    case "sound_set_volume": imp("sound"); return [H.soundSetVolume(v("PCT", "100"))];

    // KONTROLA
    case "ctrl_wait": imp("runloop"); return [`await runloop.sleep_ms(${asInt(`${v("SEC", "1")} * 1000`)})`];
    case "ctrl_repeat": { const body = stack("DO"); return [`for _ in range(${asInt(v("TIMES", "10"))}):`, ...indent(body.length ? body : ["pass"])]; }
    case "ctrl_forever": { let body = stack("DO"); const s = loopSleep(ctx, body); if (s) body = body.concat(s); if (!body.length) body = ["pass"]; return ["while True:", ...indent(body)]; }
    case "ctrl_if": { const body = stack("DO"); return [`if ${v("COND", "True")}:`, ...indent(body.length ? body : ["pass"])]; }
    case "ctrl_if_else": { const b1 = stack("DO"); const b2 = stack("ELSE"); return [`if ${v("COND", "True")}:`, ...indent(b1.length ? b1 : ["pass"]), "else:", ...indent(b2.length ? b2 : ["pass"])]; }
    case "ctrl_wait_until": imp("runloop"); return [`await runloop.until(lambda: ${v("COND", "True")})`];
    case "ctrl_repeat_until": { let body = stack("DO"); const s = loopSleep(ctx, body); if (s) body = body.concat(s); if (!body.length) body = ["pass"]; return [`while not (${v("COND", "True")}):`, ...indent(body)]; }
    case "ctrl_stop": { const o = f("WHAT"); return o === "OTHER" ? ["# (zatrzymaj inne zadania)"] : ["return"]; }

    // CZUJNIKI (akcja)
    case "sensor_reset_yaw": imp("motion_sensor"); return [H.resetYaw()];

    // ZMIENNE
    case "var_set": { const nm = vname(block, "VAR", ctx); ctx.assigned.add(nm); return [H.varSet(nm, v("VAL", "0"))]; }
    case "var_change": { const nm = vname(block, "VAR", ctx); ctx.assigned.add(nm); return [H.varChange(nm, v("VAL", "1"))]; }
    case "var_show": imp("light_matrix"); return [H.varShow(vname(block, "VAR", ctx))];

    // LISTY (mutowane w miejscu — nie wymagają deklaracji global w korutynach)
    case "list_add": return [H.listAdd(vname(block, "VAR", ctx), v("ITEM", H.pyStr("")))];
    case "list_remove": return [H.listRemove(vname(block, "VAR", ctx), v("IDX", "1"))];
    case "list_remove_all": return [H.listRemoveAll(vname(block, "VAR", ctx))];
    case "list_insert": return [H.listInsert(vname(block, "VAR", ctx), v("IDX", "1"), v("ITEM", H.pyStr("")))];
    case "list_replace": return [H.listReplace(vname(block, "VAR", ctx), v("IDX", "1"), v("ITEM", H.pyStr("")))];

    default: return [`# (nieobsługiwany klocek: ${block.type})`];
  }
}

function stackLines(block, ctx) {
  const out = [];
  let b = block;
  while (b) {
    if (!b.isEnabled || b.isEnabled()) {
      const ls = stmtLines(b, ctx);
      if (ls) for (const l of ls) out.push(l);
    }
    b = b.getNextBlock ? b.getNextBlock() : null;
  }
  return out;
}

function freshCtx(mode, ws) {
  return { imports: new Set(), motorPorts: new Set(), useMove: false, moveExplicitPair: false, movePair: ["A", "B"], assigned: new Set(), mode, ws };
}

export function generateProgram(workspace) {
  const hats = workspace.getBlocksByType("start_program", false) || [];
  if (!hats.length) {
    return [{ t: "# dodaj klocek „kiedy uruchomi się program”, aby zacząć", c: "cmt" }];
  }

  // 1) Przebieg próbny: czy gdziekolwiek pojawia się await? (bez pauz w pętlach)
  const probeAwait = hats.some((h) => hasAwait(stackLines(h.getNextBlock(), freshCtx("detect", workspace))));
  const mode = hats.length > 1 || probeAwait ? "async" : "sync";

  // 2) Przebieg właściwy w ustalonym trybie
  const motorPorts = new Set();
  const imports = new Set();
  let useMove = false, moveExplicitPair = false, movePair = ["A", "B"];
  const hatData = hats.map((h) => {
    const c = freshCtx(mode, workspace);
    const body = stackLines(h.getNextBlock(), c);
    c.imports.forEach((i) => imports.add(i));
    c.motorPorts.forEach((p) => motorPorts.add(p));
    if (c.useMove) useMove = true;
    if (c.moveExplicitPair) { moveExplicitPair = true; movePair = c.movePair; }
    return { body, assigned: c.assigned };
  });

  const allVars = workspace.getAllVariables() || [];
  const seen = new Set();
  const vars = [];
  for (const x of allVars) {
    const nm = sanitize(x.name);
    if (seen.has(nm)) continue;
    seen.add(nm);
    vars.push({ name: nm, list: x.type === "list" });
  }

  // które nazwy żyją na poziomie modułu (do deklaracji global w korutynach)
  const moduleNames = new Set([...motorPorts].map((p) => `speed_${p}`));
  if (useMove) moduleNames.add("move_speed");
  vars.forEach((vn) => moduleNames.add(vn.name));

  const hatsOut = hatData.map((h) => ({
    body: h.body,
    globals: [...h.assigned].filter((n) => moduleNames.has(n)),
  }));

  return assembleProgram({ mode, hats: hatsOut, imports, motorPorts, useMove, moveExplicitPair, movePair, vars });
}

// ——— WALIDACJA: wykrywa typowe bezsensy w ułożeniu klocków ———
function eachDescendant(block, fn) {
  let b = block;
  while (b) {
    fn(b);
    ["DO", "ELSE"].forEach((n) => {
      const c = b.getInputTargetBlock ? b.getInputTargetBlock(n) : null;
      if (c) eachDescendant(c, fn);
    });
    b = b.getNextBlock ? b.getNextBlock() : null;
  }
}

export function lintProgram(workspace) {
  const warns = [];
  const hats = workspace.getBlocksByType("start_program", false) || [];
  const tops = (workspace.getTopBlocks ? workspace.getTopBlocks(false) : []) || [];
  const orphans = tops.filter((b) => b.type !== "start_program" && !(b.isShadow && b.isShadow()));

  if (!hats.length) {
    warns.push("Brak klocka „kiedy uruchomi się program” — dodaj go, żeby program się uruchomił.");
  }
  if (orphans.length) {
    warns.push(
      `Masz ${orphans.length === 1 ? "klocek/stos klocków" : `${orphans.length} stosy klocków`} poza kapeluszem startu — taki kod się nie wykona. Podłącz go pod „kiedy uruchomi się program”.`
    );
  }

  const condTypes = new Set(["ctrl_if", "ctrl_if_else", "ctrl_wait_until", "ctrl_repeat_until"]);
  let emptyCond = false;
  let emptyRepeat = false;
  hats.forEach((h) =>
    eachDescendant(h.getNextBlock(), (b) => {
      if (condTypes.has(b.type) && !b.getInputTargetBlock("COND")) emptyCond = true;
      if (b.type === "ctrl_repeat" && !b.getInputTargetBlock("TIMES")) emptyRepeat = true;
    })
  );
  if (emptyCond) {
    warns.push("Któryś klocek „jeżeli / czekaj aż / powtarzaj aż” ma pusty warunek (sześciokątne pole) — wstaw czujnik lub porównanie, bo inaczej działa jak „zawsze prawda”.");
  }
  if (emptyRepeat) {
    warns.push("Któryś klocek „powtarzaj” nie ma podanej liczby powtórzeń.");
  }
  return warns;
}
