export type Disc = { id: number; title: string; track: string; back: string; hue: string };

export const DISCS: Disc[] = [
  { id: 1, title: "Disco I", track: "5sSv2lotkWeHZ9YSTQrdbf", back: "Mi amor, te dedico esto", hue: "var(--cafe-disc-1)" },
  { id: 2, title: "Disco II", track: "5dUjBnP5zrWpWA5RGrr73g", back: "ya lo sabes:", hue: "var(--cafe-disc-2)" },
  { id: 3, title: "Disco III", track: "04A4WyCRyHQ8Nb3u3IsfzH", back: "arte", hue: "var(--cafe-disc-3)" },
  { id: 4, title: "Disco IV", track: "1KuNhOubescxn3xD6WNI7Q", back: "al arte", hue: "var(--cafe-disc-4)" },
];

export const FULL_PHRASE = "Mi amor, te dedico esto, ya lo sabes: arte al arte";

/** Fragments revealed so far, always in disc order. */
export function revealedPhrase(flipped: Set<number>): string[] {
  return DISCS.filter((d) => flipped.has(d.id)).map((d) => d.back);
}

export function phraseComplete(flipped: Set<number>): boolean {
  return DISCS.every((d) => flipped.has(d.id));
}

export function embedUrl(track: string): string {
  return `https://open.spotify.com/embed/track/${track}?utm_source=generator&theme=0`;
}

export type Art = "lobo" | "logo" | "lightstick" | "corazon";
export const ARTS: { id: Art; label: string }[] = [
  { id: "lobo", label: "Lobito" },
  { id: "logo", label: "Logo SKZ" },
  { id: "lightstick", label: "Lightstick" },
  { id: "corazon", label: "Corazón" },
];

export const MAX_SUGAR = 4;
export const clampSugar = (n: number) => Math.max(0, Math.min(MAX_SUGAR, n));
