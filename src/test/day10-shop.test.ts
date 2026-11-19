import { describe, expect, it } from "vitest";
import { changeQuantity, itemCount, clampPosition, PRODUCTS, SECTIONS } from "@/components/days/day10-shop";

describe("Día 10: tienda libre", () => {
  it("permite recolectar sin un límite de productos", () => {
    let bag = {};
    for (let i = 0; i < 1200; i++) bag = changeQuantity(bag, "ramyeon", 1);
    expect(itemCount(bag)).toBe(1200);
  });
  it("permite sacar productos sin cantidades negativas", () => {
    const bag = changeQuantity({ ramyeon: 2 }, "ramyeon", -1);
    expect(bag).toEqual({ ramyeon: 1 });
    expect(changeQuantity(bag, "ramyeon", -1)).toEqual({});
    expect(changeQuantity({}, "ramyeon", -1)).toEqual({});
  });
  it("ofrece comida, álbumes y peluches en tres pasillos", () => {
    expect(SECTIONS.map(s => s.id)).toEqual(["snacks", "albums", "plush"]);
    for (const section of SECTIONS) expect(PRODUCTS.filter(p => p.section === section.id).length).toBeGreaterThan(0);
  });
  it("mantiene los stickers sobre la bolsa al arrastrar", () => {
    expect(clampPosition(-30, 200)).toEqual({ x: 14, y: 84 });
    expect(clampPosition(55, 44)).toEqual({ x: 55, y: 44 });
  });
});