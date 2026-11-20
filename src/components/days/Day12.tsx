import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "@tanstack/react-router";
import { Heart, MapPin, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOGOTA, CALI, COLOMBIA_PATH, LETTER, SEGMENTS, canSnap, segmentLength, type Pt } from "./day12-hilo";

export function Day12() {
  const hydrated = useHydrated();
  const [open, setOpen] = useState(true);
  return <>
    <Button variant="native" className="candy-button grid h-28 w-28 place-items-center" aria-label="Abrir el hilo rojo" onClick={() => setOpen(true)}><Heart size={40} /></Button>
    {hydrated && open && createPortal(<RedThread onClose={() => setOpen(false)} />, document.body)}
  </>;
}

type Mode = "idle" | "armed" | "dragging" | "connected";

function RedThread({ onClose }: { onClose: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const pinRef = useRef<SVGGElement>(null);
  const [mode, setModeState] = useState<Mode>("idle");
  const [letter, setLetter] = useState(false);
  const [pulse, setPulse] = useState(0);
  const modeRef = useRef<Mode>("idle");
  const target = useRef<Pt | null>(null);
  const pts = useRef<{ p: Pt; o: Pt }[]>(Array.from({ length: SEGMENTS + 1 }, (_, i) => {
    const p = { x: CALI.x + Math.sin(i / 3) * 2, y: CALI.y + i * (150 / SEGMENTS) * 0.9 };
    return { p, o: { ...p } };
  }));
  const setMode = (m: Mode) => { modeRef.current = m; setModeState(m); };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    let raf = 0;
    const step = () => {
      const list = pts.current as Array<{ p: Pt; o: Pt }> & { [i: number]: { p: Pt; o: Pt } }; const m = modeRef.current;
      const end: Pt = m === "connected" ? BOGOTA : target.current ?? list[SEGMENTS].p;
      const len = segmentLength(end, m === "connected");
      for (let i = 1; i < list.length; i++) {
        const { p, o } = list[i];
        const vx = (p.x - o.x) * 0.97, vy = (p.y - o.y) * 0.97;
        o.x = p.x; o.y = p.y;
        p.x += vx; p.y += vy + (m === "connected" ? 0.02 : 0.35);
      }
      for (let k = 0; k < 14; k++) {
        list[0].p.x = CALI.x; list[0].p.y = CALI.y;
        if (m === "connected" || target.current) { list[SEGMENTS].p.x = end.x; list[SEGMENTS].p.y = end.y; }
        for (let i = 0; i < SEGMENTS; i++) {
          const a = list[i].p, b = list[i + 1].p;
          const dx = b.x - a.x, dy = b.y - a.y; const d = Math.hypot(dx, dy) || 0.001;
          const diff = (d - len) / d / 2;
          if (i > 0) { a.x += dx * diff; a.y += dy * diff; }
          b.x -= dx * diff; b.y -= dy * diff;
        }
      }
      let d = `M${list[0].p.x} ${list[0].p.y}`;
      for (let i = 1; i < list.length - 1; i++) {
        const mx = (list[i].p.x + list[i + 1].p.x) / 2, my = (list[i].p.y + list[i + 1].p.y) / 2;
        d += ` Q${list[i].p.x} ${list[i].p.y} ${mx} ${my}`;
      }
      const last = list[SEGMENTS].p; d += ` L${last.x} ${last.y}`;
      pathRef.current?.setAttribute("d", d); glowRef.current?.setAttribute("d", d);
      if (pinRef.current) {
        const show = m === "dragging" || m === "connected";
        const at = m === "connected" ? BOGOTA : last;
        pinRef.current.style.display = show ? "" : "none";
        pinRef.current.setAttribute("transform", `translate(${at.x} ${at.y})`);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const toSvg = (e: { clientX: number; clientY: number }): Pt => {
    const svg = svgRef.current!; const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const r = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: r.x, y: r.y };
  };
  const connect = () => {
    target.current = null; setMode("connected"); setPulse(v => v + 1);
    window.setTimeout(() => setLetter(true), 1600);
  };
  const release = (p: Pt) => {
    if (canSnap(p)) connect();
    else { target.current = null; setMode("idle"); }
  };
  const vibrate = () => {
    const list = pts.current as Array<{ p: Pt; o: Pt }> & { [i: number]: { p: Pt; o: Pt } };
    for (let i = 1; i < SEGMENTS; i++) list[i].o.y -= Math.sin((i / SEGMENTS) * Math.PI) * 6 * (i % 2 ? 1 : -1);
    setPulse(v => v + 1);
  };
  const moved = useRef(false);

  return <section role="dialog" aria-modal="true" aria-label="El hilo rojo del destino" className="hilo-scene fixed inset-0 z-[60] overflow-hidden">
    <header className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-5 sm:p-8">
      <div><p className="hilo-eyebrow">DÍA 12 · BOGOTÁ Y CALI</p><h2 className="hilo-title">El hilo rojo del destino</h2>
        <p className="hilo-hint mt-1 max-w-xs text-sm">{mode === "connected" ? "Toca el hilo para hacerlo vibrar." : mode === "armed" ? "Ahora toca Bogotá en el mapa." : "Lleva el alfiler hasta Bogotá, o tócalo y luego toca Bogotá."}</p></div>
      <div className="flex gap-2">
        {mode === "connected" && !letter && <Button variant="native" className="hilo-control" aria-label="Leer la carta" onClick={() => setLetter(true)}><Mail size={20} /></Button>}
        <Button variant="native" className="hilo-control" aria-label="Cerrar" onClick={onClose}><X size={20} /></Button>
      </div>
    </header>

    <svg ref={svgRef} viewBox="0 0 400 520" className="hilo-map absolute inset-0 m-auto h-full w-full touch-none select-none"
      onPointerMove={e => { if (modeRef.current === "dragging") { moved.current = true; target.current = toSvg(e); } }}
      onPointerUp={e => {
        if (modeRef.current === "dragging") { if (moved.current) release(toSvg(e)); else { target.current = null; setMode("armed"); } }
      }}
      onClick={e => { if (modeRef.current === "armed") { const p = toSvg(e); if (canSnap(p)) connect(); } }}>
      <defs>
        <filter id="hilo-paper"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" /><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.4  0 0 0 0 0.25  0 0 0 0.12 0" /><feComposite in2="SourceGraphic" operator="in" /></filter>
        <pattern id="hilo-wool" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="6" height="6" className="hilo-wool-a" /><rect width="2" height="6" className="hilo-wool-b" /></pattern>
      </defs>
      <path d={COLOMBIA_PATH} className="hilo-land" />
      <path d={COLOMBIA_PATH} filter="url(#hilo-paper)" />
      <path d={COLOMBIA_PATH} className="hilo-coast" />
      {[{ c: CALI, n: "Cali", dx: -44 }, { c: BOGOTA, n: "Bogotá", dx: 12 }].map(({ c, n, dx }) => <g key={n}>
        {mode === "connected" && <circle key={pulse} cx={c.x} cy={c.y} r="6" className="hilo-flash" />}
        {n === "Bogotá" && mode !== "connected" && <circle cx={c.x} cy={c.y} r="14" className={mode === "dragging" || mode === "armed" ? "hilo-target active" : "hilo-target"} />}
        <circle cx={c.x} cy={c.y} r="3.5" className="hilo-city" />
        <text x={c.x + dx} y={c.y + 18} className="hilo-label">{n}</text>
      </g>)}
      <path ref={glowRef} className={mode === "connected" ? "hilo-glow on" : "hilo-glow"} />
      <path ref={pathRef} className="hilo-thread" />
      {mode === "connected" && <path d={`M${CALI.x} ${CALI.y} L${BOGOTA.x} ${BOGOTA.y}`} className="hilo-hit" role="button" aria-label="Hacer vibrar el hilo" tabIndex={0}
        onPointerDown={vibrate} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") vibrate(); }} />}
      <Pin x={CALI.x} y={CALI.y} />
      <g ref={pinRef} style={{ display: "none" }}><Pin x={0} y={0} /></g>
      {(mode === "idle" || mode === "armed") && <g className={mode === "armed" ? "hilo-tray armed" : "hilo-tray"} role="button" tabIndex={0} aria-label="Tomar el segundo alfiler"
        onPointerDown={e => { e.preventDefault(); moved.current = false; (e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture(e.pointerId); target.current = toSvg(e); setMode("dragging"); }}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") connect(); }}>
        <rect x="300" y="420" width="80" height="70" rx="14" className="hilo-tray-box" />
        <Pin x={340} y={462} />
        <text x="340" y="482" textAnchor="middle" className="hilo-tray-label">Alfiler</text>
      </g>}
    </svg>

    {letter && <div className="hilo-letter-backdrop absolute inset-0 z-20 grid place-items-center p-4" onClick={() => setLetter(false)}>
      <div className="hilo-envelope" onClick={e => e.stopPropagation()}>
        <div className="hilo-envelope-flap" />
        <article className="hilo-letter" role="document" aria-label="Carta del hilo rojo">
          <MapPin className="hilo-letter-icon" size={22} />
          <h3>Para ti, al otro lado del hilo</h3>
          {LETTER.map(p => <p key={p}>{p}</p>)}
          <p className="hilo-sign">Siempre unidos, de Bogotá a Cali.</p>
          <Button variant="native" className="hilo-close-letter" onClick={() => setLetter(false)}>Volver al mapa</Button>
        </article>
      </div>
    </div>}
  </section>;
}

function Pin({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`} className="hilo-pin">
    <line x1="0" y1="0" x2="0" y2="-14" className="hilo-pin-needle" />
    <circle cx="0" cy="-16" r="5.5" className="hilo-pin-head" />
    <circle cx="-1.6" cy="-17.6" r="1.6" className="hilo-pin-shine" />
  </g>;
}
