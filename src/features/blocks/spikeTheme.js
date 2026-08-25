import * as Blockly from "blockly";

// Motyw w stylu aplikacji SPIKE: renderer „zelos" + kapelusz na bloku startu
// (startHats) + zaokrąglona, czytelna czcionka. Kolory bloków ustawiamy
// bezpośrednio w definicjach (pole „colour"), więc tu wystarczy reszta.
export const spikeTheme = Blockly.Theme.defineTheme("spike", {
  base: Blockly.Themes.Classic,
  startHats: true,
  fontStyle: { family: "Nunito, Fredoka, system-ui, sans-serif", weight: "700", size: 13 },
  componentStyles: {
    workspaceBackgroundColour: "#f6f7fb",
    toolboxBackgroundColour: "#ffffff",
    toolboxForegroundColour: "#2b2f3a",
    flyoutBackgroundColour: "#eef1f7",
    flyoutForegroundColour: "#2b2f3a",
    flyoutOpacity: 1,
    scrollbarColour: "#c7ccd8",
    insertionMarkerColour: "#2b2f3a",
    insertionMarkerOpacity: 0.4,
    cursorColour: "#2b2f3a",
    selectedGlowColour: "#ffd34d",
    gridColour: "#dfe3ec",
  },
});
