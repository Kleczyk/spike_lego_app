import React from "react";

// Tabela parametrów funkcji; bez showAdv pokazuje tylko podstawowe wiersze
export function ParamTable({ params, showAdv }) {
  const rows = params.filter((pp) => showAdv || !pp.adv);
  if (!rows.length) return null;
  return (
    <table className="sp-ptable">
      <thead>
        <tr><th>Parametr</th><th>Typ / zakres</th><th>Domyślnie</th><th>Opis</th></tr>
      </thead>
      <tbody>
        {rows.map((pp, i) => (
          <tr key={i} className={pp.adv ? "adv" : ""}>
            <td className="pn">{pp.name}</td>
            <td className="pt">{pp.type}</td>
            <td className="pdef">{pp.def}</td>
            <td className="pd">{pp.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

