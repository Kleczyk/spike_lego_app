import React, { useState } from "react";
import { Code } from "../../components/Code.jsx";
import { ParamTable } from "../../components/ParamTable.jsx";
import { Advanced } from "../../components/Advanced.jsx";
import { MiniTable } from "../../components/MiniTable.jsx";
import { useCopy } from "../../hooks/useCopy.js";
import { ACC, STOP_FLAGS, DIRECTIONS, STATUSES } from "../../data/constants.js";
import { KIND_LABEL } from "./treeUtils.js";

// Panel szczegółów — rozbudowany: parametry, zwracana wartość, przykład, Zaawansowane
export function DetailPanel({ sel }) {
  const [copied, copy] = useCopy();
  const [showAdv, setShowAdv] = useState(false);

  if (!sel) return (
    <aside className="sp-detail">
      <div className="sp-empty">
        <span className="big">👆</span>
        Kliknij dowolny element drzewa, żeby zobaczyć, jak go zaimportować, jakie ma
        parametry i jak go użyć.
      </div>
    </aside>
  );

  const accent = ACC[sel.accent] || "var(--drive)";
  const hasAdvParams = (sel.params || []).some((pp) => pp.adv);
  const hasStop = (sel.params || []).some((pp) => pp.name === "stop");
  const hasDir = (sel.params || []).some((pp) => pp.name === "direction");
  const returnsStatus = (sel.returns || "").includes("status");
  const hasAdv = hasAdvParams || hasStop || hasDir || returnsStatus;

  return (
    <aside className="sp-detail" style={{ "--accent": accent }}>
      <div>
        <div className="dk">{KIND_LABEL[sel.kind] || "element"}</div>
        <h3>{sel.path || sel.name}</h3>
        {sel.desc && <p className="dd">{sel.desc}</p>}

        {sel.import && (
          <div className="drow">
            <div className="dlab">Jak zaimportować</div>
            <span className="imp">{sel.import}</span>
          </div>
        )}
        {sel.sig && (
          <div className="drow">
            <div className="dlab">Wywołanie</div>
            <code>{sel.sig}</code>
          </div>
        )}
        {sel.params && sel.params.length > 0 && (
          <div className="drow">
            <div className="dlab">Parametry</div>
            <ParamTable params={sel.params} showAdv={showAdv} />
          </div>
        )}
        {sel.returns && (
          <div className="drow">
            <div className="dlab">Zwraca</div>
            <p className="dd" style={{ margin: 0 }}>{sel.returns}</p>
          </div>
        )}
        {sel.awaitable && (
          <div className="drow">
            <div className="dlab">Pamiętaj</div>
            <p className="dd" style={{ margin: 0 }}>
              To polecenie poprzedź słówkiem <code>await</code> — robot poczeka, aż je skończy.
            </p>
          </div>
        )}
        {sel.example && (
          <div className="drow">
            <div className="dlab">Przykład</div>
            <Code id={"ex-" + (sel.path || sel.name)} copied={copied} onCopy={copy} lines={sel.example} />
          </div>
        )}

        {hasAdv && (
          <Advanced onToggle={setShowAdv}>
            {hasAdvParams && (
              <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "4px 0 10px" }}>
                Parametry oznaczone ⚙ w tabeli wyżej są opcjonalne — podajesz je po nazwie,
                np. <code style={{ fontSize: 12 }}>stop=motor.HOLD</code>. Tabela pokazuje je teraz w komplecie.
              </p>
            )}
            {hasStop && (<>
              <div className="dlab" style={{ marginTop: 10 }}>Flagi stop — zachowanie po zatrzymaniu</div>
              <MiniTable rows={STOP_FLAGS} three />
            </>)}
            {hasDir && (<>
              <div className="dlab" style={{ marginTop: 10 }}>Kierunki (direction)</div>
              <MiniTable rows={DIRECTIONS} />
            </>)}
            {returnsStatus && (<>
              <div className="dlab" style={{ marginTop: 10 }}>Możliwe statusy ruchu</div>
              <MiniTable rows={STATUSES} />
            </>)}
          </Advanced>
        )}

        {sel.kind === "mod" && sel.children && (
          <div className="drow">
            <div className="dlab">Zawiera</div>
            <p className="dd" style={{ margin: 0 }}>
              {sel.children.map((cc) => cc.name === "Funkcje"
                ? `${cc.children.length} funkcji`
                : cc.name === "Stałe" ? `${cc.children.length} stałych` : cc.name).join(" · ")}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
