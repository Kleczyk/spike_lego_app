import React from "react";

// Mini-tabela nazwa → opis (flagi stop, kierunki, statusy)
export function MiniTable({ rows, three }) {
  return (
    <table className="sp-minitable">
      <tbody>
        {rows.map((r, i) => three ? (
          <tr key={i}><td className="mn">{r[0]}</td><td className="mv">{r[1]}</td><td>{r[2]}</td></tr>
        ) : (
          <tr key={i}><td className="mn">{r[0]}</td><td>{r[1]}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
