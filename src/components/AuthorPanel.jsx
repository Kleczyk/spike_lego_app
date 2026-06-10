import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import "../styles/author.css";

// Pełnoekranowy widok „O autorze” — wzorowany na panelu twórcy z umk/frontend,
// przeniesiony na nasz design system (klasy sp-author-*, paleta z :root).
// Stan otwarcia trzyma App; tu tylko overlay przez portal.

const LINKEDIN = "https://www.linkedin.com/in/daniel-kleczynski/";
const LINKEDIN_LABEL = "linkedin.com/in/daniel-kleczynski";
const EMAIL = "dkleczynski@proton.me";
const TEL = "537070200";
const TEL_LABEL = "537 070 200";

function IkonaLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" className="sp-author-ic" style={{ color: "#7FA8C9" }} fill="currentColor" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H9z" />
    </svg>
  );
}
function IkonaMail() {
  return (
    <svg viewBox="0 0 24 24" className="sp-author-ic" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IkonaTelefon() {
  return (
    <svg viewBox="0 0 24 24" className="sp-author-ic" fill="currentColor" aria-hidden>
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.1.37 2.3.57 3.5.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.2 2.4.57 3.5a1 1 0 0 1-.25 1z" />
    </svg>
  );
}

export function AuthorPanel({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="sp-author-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="O autorze">
      <button type="button" className="sp-author-close" onClick={onClose} aria-label="Zamknij">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      <div className="sp-author-center">
        <div className="sp-author-grid" onClick={(e) => e.stopPropagation()}>
          {/* Tożsamość */}
          <div className="sp-author-id">
            <img src="/daniel.png" alt="Daniel Kleczyński" className="sp-author-photo" />
            <h2 className="sp-author-name">Daniel Kleczyński</h2>
            <p className="sp-author-tag">Intelligence</p>
            <p className="sp-author-desc">
              Projektowanie i rozwój inteligentnego oprogramowania — od OCR i AI,
              przez panele biurowe szyte na miarę, po interaktywne narzędzia
              edukacyjne, takie jak to kompendium SPIKE Prime dla nauczycieli.
            </p>

            <div className="sp-author-links">
              <a href={LINKEDIN} target="_blank" rel="noreferrer" className="sp-author-link">
                <IkonaLinkedIn />
                <span>{LINKEDIN_LABEL}</span>
              </a>
              <a href={`mailto:${EMAIL}`} className="sp-author-link">
                <IkonaMail />
                <span>{EMAIL}</span>
              </a>
              <a href={`tel:${TEL}`} className="sp-author-link">
                <IkonaTelefon />
                <span className="num">{TEL_LABEL}</span>
              </a>
            </div>
          </div>

          {/* QR */}
          <div className="sp-author-qrcol">
            <a href={LINKEDIN} target="_blank" rel="noreferrer" title="Otwórz LinkedIn" className="sp-author-qr">
              <QRCodeSVG value={LINKEDIN} size={224} level="M" bgColor="#ffffff" fgColor="#2E2C29" />
            </a>
            <p className="sp-author-qrhint">Zeskanuj — profil LinkedIn</p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
