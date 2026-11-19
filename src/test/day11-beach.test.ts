import { describe, expect, it } from "vitest";
import { beachZone, clampBeachPoint, FIREWORKS, shapePoints } from "@/components/days/day11-beach";

describe("playa del día 11", () => {
  it("reserva la mayor parte de la escena para arena y separa el cielo del mar", () => {
    expect(beachZone(0.1)).toBe("sky");
    expect(beachZone(0.35)).toBe("sea");
    expect(beachZone(0.45)).toBe("sand");
    expect(beachZone(0.99)).toBe("sand");
  });
  it("mantiene los dibujos dentro de la arena húmeda", () => {
    expect(clampBeachPoint({ x: -0.2, y: 0.1 }, true)).toEqual({ x: 0, y: 0.45 });
    expect(clampBeachPoint({ x: 1.2, y: 1.4 }, true)).toEqual({ x: 1, y: 1 });
  });
  it("incluye bengalas y las formas temáticas de Stray Kids", () => {
    expect(FIREWORKS.map(f => f.id)).toEqual(["classic", "skz", "lightstick"]);
    expect(FIREWORKS.some(f => f.label === "Wolf Chan")).toBe(false);
    expect(shapePoints("lightstick").some(p => p.y === 1)).toBe(true);
    expect(shapePoints("classic")).toHaveLength(110);
  });
});