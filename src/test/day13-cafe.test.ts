import { describe, expect, it } from "vitest";
import { DISCS, FULL_PHRASE, embedUrl, phraseComplete, revealedPhrase, clampSugar, ARTS } from "@/components/days/day13-cafe";

describe("Day 13 cafe", () => {
  it("offers cream decorations without the wolf", () => {
    expect(ARTS.map((a) => a.id)).toEqual(["logo", "lightstick", "corazon"]);
    expect(ARTS.map((a) => a.label)).not.toContain("Lobito");
  });
  it("has exactly 4 discs with the requested Spotify tracks", () => {
    expect(DISCS.map((d) => d.track)).toEqual(["5sSv2lotkWeHZ9YSTQrdbf", "5dUjBnP5zrWpWA5RGrr73g", "04A4WyCRyHQ8Nb3u3IsfzH", "1KuNhOubescxn3xD6WNI7Q"]);
    expect(embedUrl(DISCS[0]!.track)).toContain("open.spotify.com/embed/track/5sSv2lotkWeHZ9YSTQrdbf");
  });
  it("reveals fragments in disc order regardless of flip order", () => {
    expect(revealedPhrase(new Set([3, 1]))).toEqual(["Mi amor, te dedico esto", "arte"]);
  });
  it("completes the phrase only with all four backs", () => {
    expect(phraseComplete(new Set([1, 2, 3]))).toBe(false);
    const all = new Set([4, 2, 1, 3]);
    expect(phraseComplete(all)).toBe(true);
    const [a, b, c, d] = revealedPhrase(all);
    expect(`${a}, ${b} ${c} ${d}`).toBe(FULL_PHRASE);
  });
  it("keeps sugar between 0 and 4", () => {
    expect(clampSugar(-1)).toBe(0);
    expect(clampSugar(9)).toBe(4);
  });
});
