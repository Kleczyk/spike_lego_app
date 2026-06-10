// SŁOWNICZEK — pojęcia po ludzku, karty na zakładce Start
export const GLOSSARY = [
  { term: "program", emoji: "📜", def: "Lista poleceń, które robot wykonuje po kolei, od góry do dołu. Jak przepis kulinarny — kolejność ma znaczenie." },
  { term: "import", emoji: "📥", def: "Pierwsze linijki programu: mówimy, z których „pudełek” (modułów) będziemy korzystać. Bez importu Python nie zna polecenia motor.run." },
  { term: "moduł", emoji: "📦", def: "Pudełko z poleceniami na jeden temat: motor (silniki), color_sensor (czujnik koloru) itd. Pełną listę znajdziesz w zakładce Mapa modułów." },
  { term: "funkcja", emoji: "ƒ", def: "Pojedyncze polecenie do wywołania, np. motor.run(...). Nawiasy są obowiązkowe — w nich podajemy szczegóły." },
  { term: "parametr", emoji: "🎚️", def: "Szczegół podawany funkcji w nawiasie: który port, ile stopni, jak szybko. Kolejność parametrów ma znaczenie." },
  { term: "stała", emoji: "•", def: "Gotowa, nazwana wartość, np. port.A, color.RED, motor.HOLD. Wpisujemy ją zamiast „magicznej” liczby — czytelniej i bez pomyłek." },
  { term: "async / await", emoji: "⏳", def: "async def oznacza funkcję, która umie czekać. await przed poleceniem znaczy: „poczekaj, aż robot skończy, zanim pójdziesz dalej”. Bez await program leci od razu do następnej linijki." },
  { term: "pętla", emoji: "♻️", def: "Powtarzanie poleceń: while True powtarza bez końca, for i in range(5) — pięć razy. Powtarzane linijki muszą być wcięte." },
  { term: "warunek (if)", emoji: "🔀", def: "Rozwidlenie: if sprawdza, czy coś jest prawdą — np. czy czujnik widzi czerwony — i tylko wtedy wykonuje wcięte polecenia. else to „w przeciwnym razie”." },
  { term: "zmienna", emoji: "🏷️", def: "Pudełko z nazwą na wartość, np. odbicie = color_sensor.reflection(port.C). Potem używamy nazwy zamiast powtarzać odczyt." },
  { term: "wcięcia", emoji: "↦", def: "W Pythonie wcięcie (4 spacje) pokazuje, co należy do funkcji, pętli czy warunku. Złe wcięcie = błąd albo inne działanie programu." },
  { term: "komentarz", emoji: "💬", def: "Linijka zaczynająca się od # — robot ją pomija, ale człowiek może przeczytać. Świetne na notatki dla uczniów." },
  { term: "milisekundy (ms)", emoji: "⏱️", def: "Tysięczne części sekundy: 1000 ms = 1 s. Wszystkie czasy w SPIKE podajemy w milisekundach." },
  { term: "stopnie na sekundę (°/s)", emoji: "🌀", def: "Jednostka prędkości silnika: 360 °/s to jeden pełny obrót na sekundę, 720 — dwa obroty." },
];
