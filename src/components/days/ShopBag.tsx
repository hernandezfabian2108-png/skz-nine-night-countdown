import { useRef } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clampPosition, type BagColor, type BagStyle, type Decoration } from "./day10-shop";

type Props = {
  color: BagColor; style: BagStyle; stickers: Decoration[]; editable?: boolean;
  selected?: number | null; onSelect?: (id: number) => void;
  onMove?: (id: number, x: number, y: number) => void;
  onDropSticker?: (name: string, x: number, y: number) => void;
};
export function ShopBag({ color, style, stickers, editable, selected, onSelect, onMove, onDropSticker }: Props) {
  const surface = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null);
  return (
    <div className="shop-bag-wrap">
      <div className="shop-bag-handle" data-color={color} />
      <div ref={surface} className="shop-bag" data-color={color} data-style={style}
        onDragOver={e => { if (editable) e.preventDefault(); }}
        onDrop={e => {
          if (!editable) return;
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          const pos = clampPosition((e.clientX - rect.left) / rect.width * 100, (e.clientY - rect.top) / rect.height * 100);
          onDropSticker?.(e.dataTransfer.getData("text/plain"), pos.x, pos.y);
        }}>
        <div className="shop-bag-label"><ShoppingBag size={18} /><span>STAY MART</span><small>SEOUL · STRAY KIDS</small></div>
        {stickers.map(sticker => (
          <Button variant="native" key={sticker.id} disabled={!editable}
            aria-label={`Sticker ${sticker.name}`} aria-pressed={selected === sticker.id}
            className="shop-placed-sticker" data-selected={editable && selected === sticker.id}
            style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
            onClick={() => onSelect?.(sticker.id)}
            onPointerDown={e => {
              if (!editable || !surface.current) return;
              e.preventDefault(); onSelect?.(sticker.id);
              e.currentTarget.setPointerCapture(e.pointerId);
              const rect = surface.current.getBoundingClientRect();
              drag.current = { id: sticker.id, dx: e.clientX - rect.left - rect.width * sticker.x / 100, dy: e.clientY - rect.top - rect.height * sticker.y / 100 };
            }}
            onPointerMove={e => {
              if (!drag.current || !surface.current) return;
              const rect = surface.current.getBoundingClientRect();
              const pos = clampPosition((e.clientX - rect.left - drag.current.dx) / rect.width * 100, (e.clientY - rect.top - drag.current.dy) / rect.height * 100);
              onMove?.(sticker.id, pos.x, pos.y);
            }}
            onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
            onKeyDown={e => {
              const steps: Record<string, [number, number]> = { ArrowLeft: [-3, 0], ArrowRight: [3, 0], ArrowUp: [0, -3], ArrowDown: [0, 3] };
              const step = steps[e.key];
              if (!step) return; e.preventDefault();
              const pos = clampPosition(sticker.x + step[0], sticker.y + step[1]);
              onMove?.(sticker.id, pos.x, pos.y);
            }}>
            <img src={sticker.src} alt="" draggable={false} />
          </Button>
        ))}
      </div>
    </div>
  );
}