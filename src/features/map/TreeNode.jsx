import React, { useState } from "react";
import { nodeVisual, matches } from "./treeUtils.js";

export function TreeNode({ node, depth, q, onSelect, selected }) {
  const hasKids = node.children && node.children.length;
  const [open, setOpen] = useState(!!node.open || depth === 0);
  const isOpen = q ? true : open;
  if (!matches(node, q)) return null;
  const vis = nodeVisual(node);
  const dimName = node.kind === "folder" || node.kind === "group" || node.kind === "note";
  const id = node.path || node.name;

  return (
    <div className="sp-node">
      <div
        className={"sp-row" + (selected === id ? " sel" : "")}
        onClick={() => {
          if (hasKids) setOpen((o) => !o);
          if (node.kind !== "group") onSelect(node);
        }}
      >
        <span className={"sp-tw" + (hasKids && isOpen ? " open" : "")}>{hasKids ? "▶" : ""}</span>
        {node.kind !== "group" && (
          vis.emoji
            ? <span className="sp-ico emoji">{vis.ico}</span>
            : <span className="sp-ico" style={{ background: vis.bg, color: node.kind === "const" ? "#5b4a17" : "#fff" }}>{vis.ico}</span>
        )}
        <span className={"sp-name" + (dimName ? " dim" : "")}>{node.name}</span>
        {node.awaitable && <span className="sp-aw">await</span>}
      </div>
      {hasKids && isOpen && (
        <div className="sp-children">
          {node.children.map((c, i) => (
            <TreeNode key={i} node={c} depth={depth + 1} q={q} onSelect={onSelect} selected={selected} />
          ))}
        </div>
      )}
    </div>
  );
}
