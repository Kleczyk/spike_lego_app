import React from "react";

// Pasek „dyktowanego" polecenia pod symulatorem — z przyciskiem Kopiuj
export function LiveLine({ text, children, copied, onCopy, id }) {
  return (
    <div className="sp-liveline">
      <button className={"sp-copy" + (copied === id ? " ok" : "")} onClick={() => onCopy(text, id)}>
        {copied === id ? "✓" : "Kopiuj"}
      </button>
      {children}
    </div>
  );
}

