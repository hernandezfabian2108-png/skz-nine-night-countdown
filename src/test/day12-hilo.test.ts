import { describe, expect, it } from "vitest";
import { BOGOTA, CALI, SEGMENTS, canSnap, segmentLength } from "@/components/days/day12-hilo";

describe("day 12 red thread", () => {
  it("snaps the pin only near Bogota", () => {
    expect(canSnap({ x: BOGOTA.x + 10, y: BOGOTA.y })).toBe(true);
    expect(canSnap(CALI)).toBe(false);
  });
  it("stretches instead of breaking when dragged far", () => {
    const far = { x: 900, y: 900 };
    const d = Math.hypot(far.x - CALI.x, far.y - CALI.y);
    expect(segmentLength(far, false) * SEGMENTS).toBeGreaterThanOrEqual(d);
  });
});
