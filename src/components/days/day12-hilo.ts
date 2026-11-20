/** Browser-safe geometry for the day 12 red thread map (SVG units, viewBox 0 0 400 520). */
export type Pt = { x: number; y: number };
export const CALI: Pt = { x: 118, y: 318 };
export const BOGOTA: Pt = { x: 212, y: 262 };
export const SEGMENTS = 22;
export const SNAP_RADIUS = 34;
/** Stylized outline of Colombia. */
export const COLOMBIA_PATH =
  "M196 40 L232 30 L262 52 L250 78 L270 96 L300 88 L318 110 L312 140 L330 168 L356 176 L378 214 L364 240 L384 262 L372 300 L350 312 L360 352 L338 372 L330 420 L312 470 L292 452 L284 404 L252 394 L230 372 L196 370 L170 394 L142 386 L118 400 L96 378 L70 372 L82 342 L72 318 L88 290 L80 258 L96 224 L92 186 L112 150 L130 112 L150 92 L170 60 Z";
export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
export const canSnap = (p: Pt) => dist(p, BOGOTA) <= SNAP_RADIUS;
/** Rest length of each segment: the thread stretches as needed and never breaks. */
export function segmentLength(end: Pt, connected: boolean) {
  const base = 150 / SEGMENTS;
  const needed = dist(CALI, end) / SEGMENTS;
  return connected ? needed * 1.015 : Math.max(base, needed * 1.05);
}
export const LETTER = [
  "Dicen que existe un hilo rojo invisible que une a quienes están destinados a encontrarse, sin importar el tiempo, el lugar ni las circunstancias.",
  "Entre Bogotá y Cali hay montañas, carreteras y cientos de kilómetros, pero ninguna distancia es más fuerte que este hilo.",
  "Puede estirarse, puede enredarse, puede tensarse en los días difíciles, pero jamás se rompe. Porque lo que nos une no depende del mapa, sino de algo mucho más grande.",
  "Y cada vez que mires al cielo, recuerda que en el otro extremo del hilo alguien también está pensando en ti.",
];
