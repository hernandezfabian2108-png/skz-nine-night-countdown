import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { getStroke } from "perfect-freehand";
import { beachZone, clampBeachPoint, shapePoints, type BeachPoint, type FireworkKind } from "./day11-beach";

type Stroke = BeachPoint[];
type Burst = { x: number; y: number; born: number; kind: FireworkKind; points: BeachPoint[]; color: string };
type Props = { kind: FireworkKind; clearKey: number; onLaunch: () => void };

export function BeachCanvas({ kind, clearKey, onLaunch }: Props) {
  const sandRef = useRef<HTMLCanvasElement>(null);
  const effectsRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const bursts = useRef<Burst[]>([]);
  const keyboardPoint = useRef<BeachPoint>({ x: 0.5, y: 0.17 });
  const keyboardDrawing = useRef(false);
  const redraw = useRef<() => void>(() => {});
  const colors = useRef<string[]>([]);

  useEffect(() => {
    const sand = sandRef.current;
    const effects = effectsRef.current;
    const ctx = sand?.getContext("2d");
    const fx = effects?.getContext("2d");
    if (!sand || !effects || !ctx || !fx) return;
    const css = getComputedStyle(sand);
    const color = (name: string) => css.getPropertyValue(name).trim();
    colors.current = [color("--beach-spark-gold"), color("--beach-spark-mint"), color("--beach-spark-rose"), color("--beach-foam")];
    const groove = color("--beach-groove");
    const ridge = color("--beach-ridge");
    const foam = color("--beach-foam");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 1;
    let height = 1;
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (const stroke of strokes.current) {
        const points = getStroke(stroke.map(p => [p.x * width, p.y * height, 0.5]), { size: 5, thinning: 0, smoothing: 0.7, streamline: 0.45, simulatePressure: false });
        if (!points.length) continue;
        const path = new Path2D();
        points.forEach((p, i) => i === 0 ? path.moveTo(p[0] ?? 0, p[1] ?? 0) : path.lineTo(p[0] ?? 0, p[1] ?? 0));
        path.closePath();
        ctx.save();
        ctx.translate(0, 2);
        ctx.fillStyle = ridge;
        ctx.fill(path);
        ctx.restore();
        ctx.shadowColor = groove;
        ctx.shadowBlur = 2;
        ctx.fillStyle = groove;
        ctx.fill(path);
        ctx.shadowBlur = 0;
      }
      sand.dataset['strokeCount'] = String(strokes.current.length);
    };
    redraw.current = draw;
    const resize = () => {
      const bounds = sand.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const dpr = Math.min(devicePixelRatio, 2);
      for (const canvas of [sand, effects]) { canvas.width = width * dpr; canvas.height = height * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(sand);
    resize();
    const animate = (now: number) => {
      fx.clearRect(0, 0, width, height);
      fx.strokeStyle = foam;
      fx.lineWidth = 1.4;
      for (let line = 0; line < 3; line++) {
        fx.globalAlpha = 0.09 + line * 0.035;
        fx.beginPath();
        for (let x = 0; x <= width; x += 6) {
          const y = height * (0.405 + line * 0.009) + Math.sin(x / 90 + (reduce ? 0 : now / 2400) + line) * 3;
          if (x === 0) fx.moveTo(x, y); else fx.lineTo(x, y);
        }
        fx.stroke();
      }
      bursts.current = bursts.current.filter(b => now - b.born < 4800);
      effects.dataset['burstCount'] = String(bursts.current.length);
      for (const burst of bursts.current) {
        const age = (now - burst.born) / 1000;
        const x = burst.x * width;
        const y = burst.y * height;
        const radius = Math.min(width * 0.14, height * 0.11, 105);
        fx.strokeStyle = burst.color;
        fx.fillStyle = burst.color;
        fx.shadowColor = burst.color;
        fx.shadowBlur = 8;
        if (age < 0.6 && !reduce) {
          const rocketY = height * 0.31 + (y - height * 0.31) * age / 0.6;
          fx.globalAlpha = 0.8;
          fx.beginPath(); fx.moveTo(x, rocketY + 18); fx.lineTo(x, rocketY); fx.stroke();
          continue;
        }
        const t = Math.max(0, age - (reduce ? 0 : 0.6));
        const expansion = burst.kind === "classic" ? 1 - Math.exp(-t * 3) : 1 - Math.exp(-t * 8);
        const alpha = Math.min(1, t * 8) * Math.max(0, 1 - t / 4.2);
        for (let i = 0; i < burst.points.length; i++) {
          const p = burst.points[i];
          if (!p) continue;
          const px = x + p.x * radius * expansion;
          const py = y + p.y * radius * expansion + (burst.kind === "classic" ? t * t * 3 : t * 1.5);
          fx.globalAlpha = alpha * (0.7 + 0.3 * Math.sin(i + now / 130));
          fx.beginPath(); fx.arc(px, py, i % 7 === 0 ? 1.9 : 1.15, 0, Math.PI * 2); fx.fill();
          if (burst.kind === "classic" && t < 1.3) {
            fx.globalAlpha = alpha * 0.2;
            fx.beginPath(); fx.moveTo(px, py); fx.lineTo(x + p.x * radius * expansion * 0.78, y + p.y * radius * expansion * 0.78); fx.stroke();
          }
          fx.globalAlpha = alpha * 0.22;
          const ry = height * 0.3 + (height * 0.29 - py) * 0.24;
          if (ry > height * 0.29 && ry < height * 0.41) fx.fillRect(px + Math.sin(now / 500 + i) * 4, ry, 4 + i % 6, 1.3);
        }
        fx.shadowBlur = 0;
      }
      fx.globalAlpha = 1;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => { strokes.current = []; current.current = null; keyboardDrawing.current = false; redraw.current(); }, [clearKey]);

  function launch(point: BeachPoint) {
    let points: BeachPoint[];
    if (kind === "skz") {
      const mask = document.createElement("canvas"); mask.width = 360; mask.height = 130;
      const ctx = mask.getContext("2d");
      points = [];
      if (ctx) {
        ctx.fillStyle = colors.current[3] ?? "currentColor";
        ctx.font = "italic 900 58px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("STRAY", 180, 55); ctx.fillText("KIDS", 180, 112);
        const pixels = ctx.getImageData(0, 0, 360, 130).data;
        for (let y = 0; y < 130; y += 4) for (let x = 0; x < 360; x += 4) {
          if ((pixels[(y * 360 + x) * 4 + 3] ?? 0) > 120) points.push({ x: (x - 180) / 110, y: (y - 65) / 85 });
        }
      }
    } else points = shapePoints(kind);
    bursts.current.push({ ...point, born: performance.now(), kind, points, color: colors.current[bursts.current.length % 4] ?? "currentColor" });
    onLaunch();
  }
  const pointFromEvent = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return clampBeachPoint({ x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height });
  };
  function down(event: PointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0) return;
    const point = pointFromEvent(event);
    if (beachZone(point.y) === "sky") { launch(point); return; }
    if (beachZone(point.y) !== "sand") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    current.current = [point]; strokes.current.push(current.current); redraw.current();
  }
  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!current.current) return;
    const point = clampBeachPoint(pointFromEvent(event), true);
    current.current.push(point); redraw.current();
  }
  function key(event: KeyboardEvent<HTMLCanvasElement>) {
    if (event.key === "Enter") { event.preventDefault(); launch({ x: keyboardPoint.current.x, y: Math.min(0.24, keyboardPoint.current.y) }); }
    if (event.key === " ") {
      event.preventDefault(); keyboardDrawing.current = !keyboardDrawing.current;
      if (keyboardDrawing.current) { keyboardPoint.current.y = Math.max(0.65, keyboardPoint.current.y); current.current = [{ ...keyboardPoint.current }]; strokes.current.push(current.current); }
      else current.current = null;
      redraw.current();
    }
    if (event.key.startsWith("Arrow")) {
      event.preventDefault();
      keyboardPoint.current = clampBeachPoint({ x: keyboardPoint.current.x + (event.key === "ArrowRight" ? 0.015 : event.key === "ArrowLeft" ? -0.015 : 0), y: keyboardPoint.current.y + (event.key === "ArrowDown" ? 0.015 : event.key === "ArrowUp" ? -0.015 : 0) }, keyboardDrawing.current);
      if (current.current) { current.current.push({ ...keyboardPoint.current }); redraw.current(); }
    }
  }
  return <>
    <canvas ref={effectsRef} className="beach-canvas pointer-events-none" aria-hidden="true" />
    <canvas ref={sandRef} className="beach-canvas beach-input" tabIndex={0} role="application" aria-label="Playa interactiva: dibuja en la arena o lanza fuegos en el cielo. Con teclado: flechas para moverte, espacio para dibujar y Enter para lanzar." onPointerDown={down} onPointerMove={move} onPointerUp={() => { current.current = null; }} onPointerCancel={() => { current.current = null; }} onLostPointerCapture={() => { current.current = null; }} onKeyDown={key} />
  </>;
}