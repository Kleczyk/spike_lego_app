import React from "react";

// Blok kodu: lines to tablica — string albo { t, c } (c: klasa kw/cmt/fn).
// Białe znaki zachowuje white-space:pre (wcięcia Pythona!), Kopiuj — przez useCopy.
export function Code({ lines, onCopy, id, copied }) {
  const text = lines.map((l) => (typeof l === "string" ? l : l.t)).join("\n");
  const render = (l, i) => {
    if (typeof l === "string") return <div key={i}>{l || " "}</div>;
    return <div key={i} className={l.c || ""}>{l.t || " "}</div>;
  };
  return (
    <div className="sp-code">
      <button className={"sp-copy" + (copied === id ? " ok" : "")} onClick={() => onCopy(text, id)}>
        {copied === id ? "Skopiowano!" : "Kopiuj"}
      </button>
      {lines.map(render)}
    </div>
  );
}

