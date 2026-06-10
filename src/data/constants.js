// Wspólne stałe UI i tabele „Zaawansowane” (flagi stop, kierunki, statusy ruchu)
// Wartości za oficjalną dokumentacją SPIKE 3 (tuftsceeo.github.io/SPIKEPythonDocs).

export const STOP_FLAGS = [
  ["motor.COAST", "0", "swobodny wybieg — silnik dobiega luzem do zatrzymania"],
  ["motor.BRAKE", "1", "hamuje i utrzymuje hamowanie (ustawienie domyślne)"],
  ["motor.HOLD", "2", "aktywnie trzyma pozycję — silnik „broni” kąta, w którym stanął"],
  ["motor.CONTINUE", "3", "nie zatrzymuje się: kręci dalej z bieżącą prędkością do kolejnej komendy"],
  ["motor.SMART_COAST", "4", "hamuje, potem wybieg; kompensuje błędy przy następnej komendzie"],
  ["motor.SMART_BRAKE", "5", "hamuje i utrzymuje; kompensuje niedokładności"],
];
export const DIRECTIONS = [
  ["motor.CLOCKWISE", "obrót zgodnie z ruchem wskazówek zegara"],
  ["motor.COUNTERCLOCKWISE", "obrót przeciwnie do wskazówek zegara"],
  ["motor.SHORTEST_PATH", "do celu najkrótszą drogą"],
  ["motor.LONGEST_PATH", "do celu najdłuższą drogą"],
];
export const STATUSES = [
  ["motor.READY", "gotowy"], ["motor.RUNNING", "w ruchu"], ["motor.STALLED", "zablokowany"],
  ["motor.CANCELLED", "przerwany"], ["motor.ERROR", "błąd"], ["motor.DISCONNECTED", "odłączony"],
];


// Mapowanie akcentu znaczeniowego na zmienną CSS (amber=silniki, błękit=jazda, szałwia=czujniki)
export const ACC = { motor: "var(--motor)", drive: "var(--drive)", sense: "var(--sense)", neutral: "var(--neutral)" };

// Flagi stop jako opcje przycisków w symulatorach
export const STOP_OPTS = [
  ["BRAKE", "hamuj (domyślne)"], ["HOLD", "trzymaj pozycję"], ["COAST", "wybieg"],
  ["CONTINUE", "kręć dalej"], ["SMART_COAST", "wybieg + kompensacja"], ["SMART_BRAKE", "hamuj + kompensacja"],
];
