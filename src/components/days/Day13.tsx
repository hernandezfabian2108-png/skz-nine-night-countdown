import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "@tanstack/react-router";
import { Coffee, Disc3, Pause, RotateCw, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ARTS, DISCS, MAX_SUGAR, clampSugar, embedUrl, phraseComplete, revealedPhrase, type Art } from "./day13-cafe";

export function Day13() {
  const hydrated = useHydrated();
  const [open, setOpen] = useState(true);
  return <>
    <Button variant="native" className="candy-button grid h-28 w-28 place-items-center" aria-label="Entrar a la cafetería" onClick={() => setOpen(true)}><Coffee size={40} /></Button>
    {hydrated && open && createPortal(<Cafe onClose={() => setOpen(false)} />, document.body)}
  </>;
}

function Cafe({ onClose }: { onClose: () => void }) {
  const [poured, setPoured] = useState(false);
  const [sugar, setSugar] = useState(0);
  const [art, setArt] = useState<Art | null>(null);
  const [cups, setCups] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [ending, setEnding] = useState(false);
  const [seenEnding, setSeenEnding] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { if (ending) setEnding(false); else onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose, ending]);

  const flip = (id: number) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      if (phraseComplete(next) && !seenEnding) { setSeenEnding(true); window.setTimeout(() => setEnding(true), 900); }
      return next;
    });
  };
  // Fragments stay discovered even if a sleeve is turned back.
  const [found, setFound] = useState<Set<number>>(new Set());
  useEffect(() => { setFound((f) => new Set([...f, ...flipped])); }, [flipped]);
  const frags = revealedPhrase(found);
  const disc = DISCS.find((d) => d.id === playing);
  const newCoffee = () => { setPoured(false); setSugar(0); setArt(null); };

  return <section role="dialog" aria-modal="true" aria-label="Café y vinilos" className="cafe-scene fixed inset-0 z-[60] overflow-y-auto">
    <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-around px-10 pt-2" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => <span key={i} className="cafe-bulb" style={{ animationDelay: `${i * 0.6}s` }} />)}
    </div>
    <header className="relative z-10 flex items-start justify-between gap-3 p-5 pt-10 sm:px-8">
      <div><p className="cafe-eyebrow">DÍA 13 · CAFÉ DE COLOMBIA</p><h2 className="text-2xl italic sm:text-3xl">Café y vinilos</h2>
        <p className="cafe-hint mt-1 max-w-sm text-sm">Prepara un tinto a tu gusto, pon un disco y voltea las carátulas.</p></div>
      <Button variant="native" className="cafe-icon shrink-0" aria-label="Cerrar" onClick={onClose}><X size={20} /></Button>
    </header>

    <div className="relative z-10 mx-auto grid max-w-6xl gap-5 px-4 pb-6 lg:grid-cols-2">
      {/* Coffee station */}
      <div className="cafe-panel p-4">
        <p className="cafe-eyebrow mb-2">ESTACIÓN DE CAFÉ</p>
        <div className="flex items-end justify-center gap-4">
          <svg viewBox="0 0 90 110" className="w-20 shrink-0" aria-label="Greca">
            <path d="M25 10h40l-6 40H31z" fill="var(--cafe-wood-light)" /><rect x="22" y="48" width="46" height="8" fill="var(--cafe-wood-deep)" />
            <path d="M20 56h50l8 50H12z" fill="var(--cafe-wood-light)" /><path d="M65 20q18 4 10 30" stroke="var(--cafe-wood-deep)" strokeWidth="5" fill="none" />
            <path d="M25 10l-12 6" stroke="var(--cafe-wood-deep)" strokeWidth="4" />
          </svg>
          <Cup poured={poured} sugar={sugar} art={art} />
          <svg viewBox="0 0 60 60" className="w-14 shrink-0" aria-label="Panela"><rect x="8" y="22" width="44" height="30" rx="4" fill="var(--cafe-gold)" /><rect x="8" y="22" width="44" height="8" rx="4" fill="var(--cafe-wood-light)" /></svg>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Button variant="native" className="cafe-btn" disabled={poured} onClick={() => { setPoured(true); setCups((c) => c + 1); }}>Servir tinto</Button>
          <Button variant="native" className="cafe-btn" disabled={!poured || sugar >= MAX_SUGAR} onClick={() => setSugar((s) => clampSugar(s + 1))}>Panela ({sugar}/{MAX_SUGAR})</Button>
          <Button variant="native" className="cafe-btn" disabled={!poured || sugar === 0} onClick={() => setSugar((s) => clampSugar(s - 1))}>Menos dulce</Button>
        </div>
        <p className="cafe-hint mt-3 text-center text-xs">Manga de crema</p>
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          {ARTS.map((a) => <Button key={a.id} variant="native" className="cafe-btn" data-on={art === a.id} disabled={!poured} onClick={() => setArt(a.id)}>{a.label}</Button>)}
        </div>
        {poured && art && <div className="mt-3 flex justify-center"><Button variant="native" className="cafe-btn" onClick={newCoffee}>Preparar otro café</Button></div>}
        {cups > 1 && <p className="cafe-hint mt-2 text-center text-xs">Tazas servidas hoy: {cups}</p>}
      </div>

      {/* Record player */}
      <div className="cafe-panel p-4">
        <p className="cafe-eyebrow mb-2">TOCADISCOS</p>
        <Turntable disc={disc ?? null} spinning={!!disc} />
        {disc ? <div className="mt-3">
          <div className="mb-2 flex items-center justify-between gap-2"><span className="text-sm italic">Sonando: {disc.title}</span>
            <Button variant="native" className="cafe-btn flex items-center gap-1" onClick={() => setPlaying(null)}><Pause size={14} /> Quitar disco</Button></div>
          <iframe key={disc.id} title={`Reproductor ${disc.title}`} className="cafe-spotify w-full" src={embedUrl(disc.track)} height="80" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
        </div> : <p className="cafe-hint mt-3 text-center text-sm">Elige un disco del exhibidor para ponerlo en el plato.</p>}
      </div>
    </div>

    {/* Sleeves */}
    <div className="cafe-bar relative z-10 px-4 py-5">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        {DISCS.map((d) => <div key={d.id} className="cafe-sleeve relative" data-active={playing === d.id}>
          <div className="cafe-vinyl-peek" aria-hidden />
          <div className="cafe-sleeve-inner" data-flip={flipped.has(d.id)}>
            <button type="button" className="cafe-face block w-full" style={{ background: d.hue }} onClick={() => setPlaying(d.id)} aria-label={`Poner ${d.title}`}>
              <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden><circle cx="50" cy="50" r="30" fill="none" stroke="var(--cafe-cream)" strokeWidth="1.5" opacity=".5" /><circle cx="50" cy="50" r="18" fill="none" stroke="var(--cafe-cream)" strokeWidth="1" opacity=".4" />
                <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--cafe-cream)" fontFamily="system-ui">SKZ</text><text x="50" y="88" textAnchor="middle" fontSize="8" fill="var(--cafe-cream)" fontFamily="Georgia">{d.title}</text></svg>
            </button>
            <div className="cafe-face cafe-back">{d.back}</div>
          </div>
          <div className="mt-2 flex justify-center gap-1">
            <Button variant="native" className="cafe-btn flex items-center gap-1" onClick={() => setPlaying(d.id)} data-on={playing === d.id}><Disc3 size={14} /> Poner</Button>
            <Button variant="native" className="cafe-btn flex items-center gap-1" onClick={() => flip(d.id)} aria-label={`Girar carátula ${d.title}`}><RotateCw size={14} /> Girar</Button>
          </div>
        </div>)}
      </div>
      <div className="cafe-card mx-auto mt-5 max-w-xl px-5 py-4 text-center">
        <p className="cafe-eyebrow" style={{ color: "var(--cafe-wood)" }}>FRASE SECRETA · {found.size}/4</p>
        <p className="mt-1 min-h-[1.75rem] text-lg italic" data-testid="cafe-phrase">
          {frags.length === 0 ? <span className="opacity-50">Voltea las carátulas para descubrirla.</span> : frags.map((f, i) => <span key={f} className="cafe-frag">{i === 0 ? f : i === 1 ? `, ${f}` : ` ${f}`}</span>)}
        </p>
        {phraseComplete(found) && !ending && <Button variant="native" className="cafe-btn mt-2 inline-flex items-center gap-1" style={{ color: "var(--cafe-ink)" }} onClick={() => setEnding(true)}><Sparkles size={14} /> Ver sorpresa</Button>}
      </div>
    </div>

    {ending && <div className="fixed inset-0 z-[70] grid place-items-center bg-[color-mix(in_oklab,var(--cafe-wall-deep)_80%,transparent)] p-5" role="dialog" aria-label="Sorpresa final">
      <div className="cafe-card cafe-pop relative w-full max-w-sm p-6 text-center">
        <Felix />
        <p className="mt-3 text-lg italic">Mi amor, te dedico esto, ya lo sabes: arte al arte</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button variant="native" className="cafe-btn" style={{ color: "var(--cafe-ink)" }} onClick={() => setEnding(false)}>Seguir escuchando</Button>
          <Button variant="native" className="cafe-btn" style={{ color: "var(--cafe-ink)" }} onClick={() => { newCoffee(); setEnding(false); }}>Preparar otro café</Button>
        </div>
      </div>
    </div>}
  </section>;
}

function Cup({ poured, sugar, art }: { poured: boolean; sugar: number; art: Art | null }) {
  return <svg viewBox="0 0 120 120" className="w-36" aria-label={poured ? "Taza con café" : "Taza vacía"}>
    {poured && <g className="cafe-steam"><path d="M45 30q-6-10 0-20" /><path d="M60 28q-6-10 0-20" /><path d="M75 30q-6-10 0-20" /></g>}
    <ellipse cx="60" cy="108" rx="48" ry="7" fill="var(--cafe-cup)" opacity=".7" />
    <path d="M90 55q22 0 18 18t-22 14" fill="none" stroke="var(--cafe-cup)" strokeWidth="7" />
    <path d="M22 45h76l-8 52q-2 8-10 8H40q-8 0-10-8z" fill="var(--cafe-cup)" />
    <ellipse cx="60" cy="46" rx="38" ry="9" fill="var(--cafe-wood-deep)" />
    {poured && <ellipse cx="60" cy="46" rx="35" ry="7.5" fill={sugar > 0 ? "var(--cafe-foam)" : "var(--cafe-coffee)"} className="cafe-pour" opacity={0.75 + sugar * 0.06} />}
    {poured && art && <g key={art} className="cafe-art" transform="translate(60 46) scale(1 .3)" fill="var(--cafe-cream)" stroke="var(--cafe-coffee)" strokeWidth="1.5">
      {art === "lobo" && <path d="M-16 6l-4-22 10 10h20l10-10-4 22q-4 12-16 12t-16-12z" />}
      {art === "logo" && <text y="7" textAnchor="middle" fontSize="22" fontWeight="900" fontFamily="system-ui">SKZ</text>}
      {art === "lightstick" && <><rect x="-3" y="2" width="6" height="18" /><circle cy="-8" r="11" /></>}
      {art === "corazon" && <path d="M0 14C-22 0-12-16 0-6 12-16 22 0 0 14z" />}
    </g>}
  </svg>;
}

function Turntable({ disc, spinning }: { disc: { id: number; hue: string } | null; spinning: boolean }) {
  return <svg viewBox="0 0 220 150" className="mx-auto w-full max-w-sm" aria-label={spinning ? "Tocadiscos girando" : "Tocadiscos en espera"}>
    <rect x="6" y="10" width="208" height="130" rx="12" fill="var(--cafe-wood)" stroke="var(--cafe-wood-light)" strokeWidth="3" />
    <circle cx="90" cy="75" r="56" fill="var(--cafe-wood-deep)" />
    {disc && <g key={disc.id} className="cafe-disc-in"><g className="cafe-platter" data-spin={spinning}>
      <circle cx="90" cy="75" r="52" fill="var(--cafe-vinyl)" />
      {[44, 36, 28].map((r) => <circle key={r} cx="90" cy="75" r={r} fill="none" stroke="var(--cafe-cream)" opacity=".1" />)}
      <circle cx="90" cy="75" r="16" fill={disc.hue} /><rect x="88" y="62" width="4" height="8" fill="var(--cafe-cream)" opacity=".6" />
    </g></g>}
    <circle cx="90" cy="75" r="3" fill="var(--cafe-gold)" />
    <circle cx="170" cy="30" r="9" fill="var(--cafe-gold)" />
    <g className="cafe-arm" data-down={spinning}><path d="M170 30L178 100L150 118" stroke="var(--cafe-cream)" strokeWidth="4" fill="none" strokeLinecap="round" /><rect x="142" y="112" width="14" height="9" rx="2" fill="var(--cafe-gold)" /></g>
    <circle cx="196" cy="125" r="6" fill="var(--cafe-wood-deep)" />
  </svg>;
}

/** Original chibi illustration: blond boy with freckles, smiling and winking. */
function Felix() {
  return <svg viewBox="0 0 200 200" className="mx-auto w-48" aria-label="Felix chibi sonriendo y guiñando un ojo">
    {[[30, 40], [170, 50], [25, 150], [175, 140], [100, 15]].map(([x, y], i) => <path key={i} className="cafe-sparkle" style={{ animationDelay: `${i * 0.35}s` }} d={`M${x} ${y! - 9}l3 6 6 3-6 3-3 6-3-6-6-3 6-3z`} />)}
    <g className="cafe-felix">
      <path d="M60 170q40-30 80 0v20H60z" fill="var(--cafe-disc-1)" />
      <ellipse cx="100" cy="100" rx="52" ry="50" fill="var(--cafe-skin)" />
      <path d="M46 98q-6-58 54-60 60 2 54 60-10-26-30-32-6 12-24 10 6-6 4-12-20 14-46 6-8 10-12 28z" fill="var(--cafe-hair)" />
      <ellipse cx="80" cy="105" rx="7" ry="9" fill="var(--cafe-ink)" /><circle cx="82" cy="102" r="2.5" fill="var(--cafe-cream)" />
      <path className="cafe-felix-wink" d="M112 106q8-8 16 0" stroke="var(--cafe-ink)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <ellipse cx="70" cy="122" rx="9" ry="5" fill="var(--cafe-blush)" opacity=".6" /><ellipse cx="130" cy="122" rx="9" ry="5" fill="var(--cafe-blush)" opacity=".6" />
      {[[64, 116], [70, 120], [76, 116], [124, 116], [130, 120], [136, 116]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.3" fill="var(--cafe-wood)" />)}
      <path d="M90 128q10 10 20 0" stroke="var(--cafe-ink)" strokeWidth="3" fill="var(--cafe-blush)" strokeLinecap="round" />
    </g>
  </svg>;
}
