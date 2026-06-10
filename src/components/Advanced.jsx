import React, { useState } from "react";

// Rozwijany panel „Zaawansowane"
export function Advanced({ title, children, onToggle }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sp-adv">
      <button className="sp-adv-head" onClick={() => { setOpen(!open); if (onToggle) onToggle(!open); }}>
        <span>⚙️</span> {title || "Zaawansowane"}
        <span className={"ar" + (open ? " open" : "")}>▶</span>
      </button>
      {open && <div className="sp-adv-body">{children}</div>}
    </div>
  );
}

