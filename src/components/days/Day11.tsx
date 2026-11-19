import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "@tanstack/react-router";
import { Moon, Sparkles, Volume2, VolumeX, Eraser, X, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import beachAsset from "@/assets/day11-beach.jpg.asset.json";
import { createBeachSound } from "@/lib/beach-sound";
import { BeachCanvas } from "./BeachCanvas";
import { FIREWORKS, type FireworkKind } from "./day11-beach";

function FireworkIcon({ kind }: { kind: FireworkKind }) {
  if (kind === "classic") return <Sparkles size={22} />;
  if (kind === "skz") return <span className="beach-skz-icon">SKZ</span>;
  return <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    {kind === "wolf" ? <><path d="M7 12 5 3 13 8h6l8-5-2 9 3 6-5 8-7 3-7-3-5-8Z"/><path d="m11 16 2 1m6 0 2-1m-7 5h4l-2 2m-4 1 4 2 4-2"/></> : <><circle cx="16" cy="11" r="9"/><path d="M13 20v10h6V20M16 4l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/></>}
  </svg>;
}
export function Day11() {
  const hydrated = useHydrated();
  const [open, setOpen] = useState(true);
  return <>
    <Button variant="native" className="candy-button grid h-28 w-28 place-items-center" aria-label="Abrir la playa nocturna" onClick={() => setOpen(true)}><Moon size={40} /></Button>
    {hydrated && open && createPortal(<NightBeach onClose={() => setOpen(false)} />, document.body)}
  </>;
}
function NightBeach({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState<FireworkKind>("classic");
  const [clearKey, setClearKey] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const sound = useRef<ReturnType<typeof createBeachSound> | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    sound.current = createBeachSound();
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { sound.current?.dispose(); document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKey); if (previousFocus instanceof HTMLElement) previousFocus.focus(); };
  }, [onClose]);
  const toggleSound = () => { if (soundOn) sound.current?.mute(); else sound.current?.start(); setSoundOn(!soundOn); };
  return <section className="night-beach fixed inset-0 z-[60] overflow-hidden" role="dialog" aria-modal="true" aria-label="Bajo el mismo cielo · Playa de Stray Kids" onKeyDown={event => {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, [tabindex='0']"));
    const first = controls[0]; const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }}>
    <img src={beachAsset.url} className="beach-background" alt="Playa ilustrada de noche, con luna, estrellas, mar turquesa y arena húmeda" draggable={false} />
    <BeachCanvas kind={kind} clearKey={clearKey} onLaunch={() => { if (soundOn) sound.current?.chime(); }} />
    <header className="beach-header pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5 sm:p-8">
      <div><p className="beach-eyebrow">STRAY KIDS · DÍA 11</p><h2 className="beach-title">Bajo el mismo cielo</h2></div>
      <Button ref={closeRef} variant="native" className="beach-control pointer-events-auto shrink-0" aria-label="Cerrar la playa" title="Cerrar la playa" onClick={onClose}><X size={20} /></Button>
    </header>
    <div className="beach-toolbar absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:bottom-9" role="toolbar" aria-label="Fuegos artificiales y ambiente">
      <div className="beach-types flex items-center gap-1">
        {FIREWORKS.map(f => <Button key={f.id} variant="native" className="beach-control beach-firework" aria-pressed={kind === f.id} aria-label={f.label} title={f.label} onClick={() => setKind(f.id)}><FireworkIcon kind={f.id} /><span className="beach-tip">{f.label}</span></Button>)}
      </div>
      <span className="beach-divider" />
      <Button variant="native" className="beach-control" aria-label="Limpiar la arena" title="Limpiar la arena" onClick={() => setClearKey(v => v + 1)}><Eraser size={21} /><span className="beach-tip">Limpiar arena</span></Button>
      <Button variant="native" className="beach-control" aria-label={soundOn ? "Silenciar el mar" : "Activar sonidos del mar"} aria-pressed={soundOn} title={soundOn ? "Silenciar" : "Sonidos del mar"} onClick={toggleSound}>{soundOn ? <Volume2 size={21} /> : <VolumeX size={21} />}<span className="beach-tip">Sonidos del mar</span></Button>
    </div>
    <div className="beach-signature pointer-events-none absolute bottom-8 right-8 hidden items-center gap-2 text-xs sm:flex"><WandSparkles size={14} /> STAY, aquí contigo</div>
  </section>;
}