import chickGiftAsset from "@/assets/stickers/chick-gift.webp.asset.json";
const chickGift = chickGiftAsset.url;
import chickHeartAsset from "@/assets/stickers/chick-heart.webp.asset.json";
const chickHeart = chickHeartAsset.url;
import pinkHatAsset from "@/assets/stickers/pink-hat.webp.asset.json";
const pinkHat = pinkHatAsset.url;
import pinkGiftAsset from "@/assets/stickers/pink-gift.webp.asset.json";
const pinkGift = pinkGiftAsset.url;
import foxGiftAsset from "@/assets/stickers/fox-gift.webp.asset.json";
const foxGift = foxGiftAsset.url;
import quokkaWinkAsset from "@/assets/stickers/quokka-wink.webp.asset.json";
const quokkaWink = quokkaWinkAsset.url;
import quokkaMugAsset from "@/assets/stickers/quokka-mug.webp.asset.json";
const quokkaMug = quokkaMugAsset.url;
import puppyWinkAsset from "@/assets/stickers/puppy-wink.webp.asset.json";
const puppyWink = puppyWinkAsset.url;
import bunnyCarrotAsset from "@/assets/stickers/bunny-carrot.webp.asset.json";
const bunnyCarrot = bunnyCarrotAsset.url;
import bunnyTreeAsset from "@/assets/stickers/bunny-tree.webp.asset.json";
const bunnyTree = bunnyTreeAsset.url;
import wolfHappyAsset from "@/assets/stickers/wolf-happy.webp.asset.json";
const wolfHappy = wolfHappyAsset.url;
import wolfGiftAsset from "@/assets/stickers/wolf-gift.webp.asset.json";
const wolfGift = wolfGiftAsset.url;

export const STICKERS: string[] = [
  wolfHappy,
  chickHeart,
  pinkHat,
  puppyWink,
  foxGift,
  quokkaWink,
  bunnyCarrot,
  wolfGift,
  chickGift,
  pinkGift,
  quokkaMug,
  bunnyTree,
];

export type Day = {
  day: number;
  sticker: string;
};

/** The 24 doors. Each day's own content gets added to its page later. */
export const DAYS: Day[] = Array.from({ length: 24 }, (_, i) => ({
  day: i + 1,
  sticker: STICKERS[i % STICKERS.length] ?? STICKERS[0] ?? "",
}));

export function getDay(value: string): Day | undefined {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 24) return undefined;
  return DAYS[n - 1];
}
