import wolf from "@/assets/stickers/wolf-happy.webp.asset.json";
import bunny from "@/assets/stickers/bunny-carrot.webp.asset.json";
import chick from "@/assets/stickers/chick-heart.webp.asset.json";
import quokka from "@/assets/stickers/quokka-wink.webp.asset.json";
import album1 from "@/assets/skz-album-1.jpg.asset.json";
import album2 from "@/assets/skz-album-2.jpg.asset.json";
import album3 from "@/assets/skz-album-3.jpg.asset.json";

export type Section = "snacks" | "albums" | "plush";
export type BagColor = "mint" | "pink" | "cloud" | "ink";
export type BagStyle = "tote" | "striped";
export type Decoration = { id: number; src: string; name: string; x: number; y: number };
export type Product = { id: string; name: string; section: Section; detail: string; image?: string; pack?: string; label?: string };
export type Collection = Record<string, number>;
export const SECTIONS: { id: Section; name: string; korean: string }[] = [
  { id: "snacks", name: "Snacks coreanos", korean: "간식" },
  { id: "albums", name: "Álbumes", korean: "음반" },
  { id: "plush", name: "Peluches SKZOO", korean: "인형" },
];
export const BAG_COLORS: { id: BagColor; name: string }[] = [
  { id: "mint", name: "Menta" }, { id: "pink", name: "Rosa" },
  { id: "cloud", name: "Nube" }, { id: "ink", name: "Grafito" },
];
export const SHOP_STICKERS = [
  { name: "Wolf Chan", src: wolf.url }, { name: "Leebit", src: bunny.url },
  { name: "BbokAri", src: chick.url }, { name: "Han Quokka", src: quokka.url },
];
export const PRODUCTS: Product[] = [
  { id: "ramyeon", name: "Ramyeon STAY", section: "snacks", detail: "Fideos coreanos picantes · edición STAY", pack: "ramyeon", label: "라면" },
  { id: "pepero", name: "Pepero de chocolate", section: "snacks", detail: "Palitos crujientes cubiertos de chocolate", pack: "pepero", label: "빼빼로" },
  { id: "banana", name: "Leche de banana", section: "snacks", detail: "La bebida clásica de las tiendas coreanas", pack: "banana", label: "바나나" },
  { id: "chips", name: "Honey Butter Chips", section: "snacks", detail: "Papas con miel y mantequilla · selección SKZ", pack: "chips", label: "허니버터" },
  { id: "tteok", name: "Tteokbokki", section: "snacks", detail: "Pasteles de arroz con salsa gochujang", pack: "tteok", label: "떡볶이" },
  { id: "soda", name: "Soda de uva", section: "snacks", detail: "Refresco de uva para acompañar tus snacks", pack: "soda", label: "포도" },
  { id: "album1", name: "This & That", section: "albums", detail: "Stray Kids · edición de colección", image: album1.url },
  { id: "album2", name: "God's Menu", section: "albums", detail: "Stray Kids · álbum y photobook", image: album2.url },
  { id: "album3", name: "LALALALA", section: "albums", detail: "Stray Kids · edición de colección", image: album3.url },
  ...SHOP_STICKERS.map((s, i) => ({ id: `plush${i}`, name: s.name, section: "plush" as const, detail: "Peluche SKZOO · colección de invierno", image: s.src })),
];
export function changeQuantity(items: Collection, id: string, delta: number): Collection {
  if (!PRODUCTS.some(p => p.id === id) || !Number.isInteger(delta)) return items;
  const next = { ...items };
  const quantity = Math.max(0, (next[id] ?? 0) + delta);
  if (quantity === 0) delete next[id];
  else next[id] = quantity;
  return next;
}
export function itemCount(items: Collection): number {
  return Object.values(items).reduce((sum, quantity) => sum + quantity, 0);
}
export function clampPosition(x: number, y: number) {
  return { x: Math.max(14, Math.min(86, x)), y: Math.max(20, Math.min(84, y)) };
}