export type FireworkKind = "classic" | "skz" | "lightstick";
export type BeachPoint = { x: number; y: number };
export const SAND_START = 0.45;
export const SKY_END = 0.29;
export const FIREWORKS: { id: FireworkKind; label: string }[] = [
  { id: "classic", label: "Bengala" },
  { id: "skz", label: "Stray Kids" },
  { id: "lightstick", label: "Nachimbong" },
];
export function beachZone(y: number): "sky" | "sea" | "sand" {
  return y < SKY_END ? "sky" : y >= SAND_START ? "sand" : "sea";
}
export function clampBeachPoint(point: BeachPoint, sand = false): BeachPoint {
  return { x: Math.max(0, Math.min(1, point.x)), y: Math.max(sand ? SAND_START : 0, Math.min(1, point.y)) };
}

function outline(vertices: number[][], steps = 12): BeachPoint[] {
  return vertices.flatMap((v, i) => {
    const next = vertices[(i + 1) % vertices.length];
    if (!next) return [];
    return Array.from({ length: steps }, (_, j) => ({ x: (v[0] ?? 0) + ((next[0] ?? 0) - (v[0] ?? 0)) * j / steps, y: (v[1] ?? 0) + ((next[1] ?? 0) - (v[1] ?? 0)) * j / steps }));
  });
}
function circle(cx: number, cy: number, r: number, n = 90): BeachPoint[] {
  return Array.from({ length: n }, (_, i) => ({ x: cx + Math.cos(i / n * Math.PI * 2) * r, y: cy + Math.sin(i / n * Math.PI * 2) * r }));
}
export function shapePoints(kind: Exclude<FireworkKind, "skz">): BeachPoint[] {
  if (kind === "classic") return circle(0, 0, 1, 110);
  if (kind === "lightstick") return [
    ...circle(0, -0.28, 0.55),
    ...outline([[-0.14, 0.25], [0.14, 0.25], [0.13, 1], [-0.13, 1]], 15),
    ...outline([[0, -0.73], [0.13, -0.38], [0.43, -0.28], [0.13, -0.16], [0, 0.13], [-0.13, -0.16], [-0.43, -0.28], [-0.13, -0.38]], 7),
  ];
  return [
    ...outline([[-0.7, -0.2], [-0.78, -0.97], [-0.3, -0.62], [0, -0.65], [0.3, -0.62], [0.78, -0.97], [0.7, -0.2], [0.86, 0.16], [0.66, 0.57], [0.3, 0.8], [-0.3, 0.8], [-0.66, 0.57], [-0.86, 0.16]], 10),
    ...circle(-0.28, -0.05, 0.055, 12), ...circle(0.28, -0.05, 0.055, 12),
    ...outline([[-0.13, 0.25], [0.13, 0.25], [0, 0.38]], 8),
    ...outline([[-0.25, 0.45], [0, 0.53], [0.25, 0.45]], 8),
  ];
}