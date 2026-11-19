import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useHydrated } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Disc3, Minus, Package, Plus, RotateCcw, ShoppingBag, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import storeAsset from "@/assets/stay-mart.jpg.asset.json";
import { ShopBag } from "./ShopBag";
import { BAG_COLORS, PRODUCTS, SECTIONS, SHOP_STICKERS, changeQuantity, itemCount, type BagColor, type BagStyle, type Collection, type Decoration, type Product, type Section } from "./day10-shop";

function ProductArt({ product }: { product: Product }) {
  if (product.image) return <img src={product.image} alt={product.name} className={`shop-product-image ${product.section === "albums" ? "shop-album" : ""}`} draggable={false} />;
  return <div className="shop-snack-pack" data-pack={product.pack}><span>STAY PICKS</span><strong>{product.label}</strong><span className="shop-pack-symbol"><Package size={30} strokeWidth={1.5} /></span><small>{product.name}</small></div>;
}

export function Day10() {
  const hydrated = useHydrated();
  const [open, setOpen] = useState(true);
  return <>
    <Button variant="native" className="candy-button grid h-28 w-28 place-items-center" aria-label="Abrir la tienda coreana" onClick={() => setOpen(true)}><ShoppingBag size={44} /></Button>
    {hydrated && open && createPortal(<Shop onClose={() => setOpen(false)} />, document.body)}
  </>;
}

function Shop({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"decorate" | "shop" | "finish">("decorate");
  const [color, setColor] = useState<BagColor>("mint");
  const [style, setStyle] = useState<BagStyle>("tote");
  const [stickers, setStickers] = useState<Decoration[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [section, setSection] = useState<Section>("snacks");
  const [items, setItems] = useState<Collection>({});
  const [detail, setDetail] = useState<Product | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [flight, setFlight] = useState<{ product: Product; x: number; y: number; dx: number; dy: number; key: number } | null>(null);
  const [notice, setNotice] = useState("");
  const bagTarget = useRef<HTMLDivElement>(null);
  const id = useRef(0);
  const total = itemCount(items);
  const collected = PRODUCTS.filter(p => (items[p.id] ?? 0) > 0);
  const moveSticker = (stickerId: number, x: number, y: number) => setStickers(previous => previous.map(s => s.id === stickerId ? { ...s, x, y } : s));
  const add = (product: Product, origin?: HTMLElement) => {
    setItems(previous => changeQuantity(previous, product.id, 1));
    setNotice(`${product.name} guardado en tu bolsa`);
    const start = origin?.getBoundingClientRect(); const end = bagTarget.current?.getBoundingClientRect();
    if (start && end) setFlight({ product, x: start.left + start.width / 2, y: start.top + start.height / 2, dx: end.left + end.width / 2 - start.left - start.width / 2, dy: end.top + Math.min(end.height / 2, 110) - start.top - start.height / 2, key: ++id.current });
  };
  const reset = () => { setColor("mint"); setStyle("tote"); setStickers([]); setSelected(null); setItems({}); setPhase("decorate"); setInventoryOpen(false); setNotice(""); };
  const bag = <ShopBag color={color} style={style} stickers={stickers} editable={phase === "decorate"} selected={selected} onSelect={setSelected} onMove={moveSticker} onDropSticker={(name, x, y) => {
    const sticker = SHOP_STICKERS.find(s => s.name === name);
    if (!sticker) return;
    const nextId = ++id.current;
    setStickers(previous => [...previous, { ...sticker, id: nextId, x, y }]);
    setSelected(nextId);
  }} />;

  return <div className="stay-shop fixed inset-0 z-[70] overflow-y-auto bg-background text-foreground" role="dialog" aria-modal="true" aria-label="Día 10: STAY MART">
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3"><span className="shop-logo grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground"><ShoppingBag size={22} /></span><div><p className="text-lg font-bold leading-none">STAY MART<span className="ml-2 text-xs font-normal text-muted-foreground">서울</span></p><p className="mt-1 text-xs text-muted-foreground">Día 10 · Tu rincón de Stray Kids</p></div></div>
        <div className="flex items-center gap-2"><Link to="/puertas" className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><ArrowLeft size={16} />Las puertas</Link><Button variant="ghost" size="icon" aria-label="Cerrar" onClick={onClose}><X /></Button></div>
      </div>
    </header>
    <div className="shop-store-photo relative overflow-hidden" data-phase={phase}><img src={storeAsset.url} alt="Interior de STAY MART con estantes de snacks, discos y peluches" className="h-full w-full object-cover" /><div className="shop-photo-caption absolute bottom-4 left-4 rounded-md bg-background/95 px-4 py-2 sm:left-8"><span className="text-xs font-bold text-primary">SEOUL SELECT SHOP</span><p className="text-sm">Pequeñas cosas. Grandes favoritos.</p></div></div>
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-8">
      {phase === "decorate" ? <>
        <div className="mb-7 flex items-start justify-between gap-4"><div><p className="mb-2 text-xs font-bold uppercase text-primary">Tu bolsa, tu estilo</p><h1 className="text-3xl font-bold sm:text-4xl">Antes de entrar</h1><p className="mt-2 text-sm text-muted-foreground">Un pequeño lienzo para tus favoritos.</p></div><Sparkles className="mt-3 text-primary" size={30} /></div>
        <div className="grid items-start gap-8 md:grid-cols-2 lg:gap-16">
          <section className="shop-decoration-stage flex min-h-96 items-center justify-center rounded-lg bg-secondary p-8" aria-label="Bolsa personalizable">{bag}</section>
          <section className="space-y-7 pb-5">
            <fieldset><legend className="mb-3 text-sm font-bold">Color de la bolsa</legend><div className="flex flex-wrap gap-3">{BAG_COLORS.map(c => <Button variant="native" key={c.id} title={c.name} aria-label={`Color ${c.name}`} aria-pressed={color === c.id} onClick={() => setColor(c.id)} className="shop-swatch grid h-11 w-11 place-items-center rounded-full border-2" data-color={c.id} data-active={color === c.id}>{color === c.id && <Check size={20} />}</Button>)}</div></fieldset>
            <fieldset><legend className="mb-3 text-sm font-bold">Acabado</legend><div className="flex gap-2">{([{ id: "tote", name: "Liso" }, { id: "striped", name: "Rayas" }] as const).map(s => <Button key={s.id} variant={style === s.id ? "default" : "outline"} onClick={() => setStyle(s.id)} aria-pressed={style === s.id}>{s.name}</Button>)}</div></fieldset>
            <fieldset><legend className="mb-3 text-sm font-bold">Stickers SKZOO</legend><div className="grid grid-cols-4 gap-2">{SHOP_STICKERS.map(s => <Button variant="native" key={s.name} aria-label={`Añadir sticker ${s.name}`} draggable onDragStart={e => { e.dataTransfer.setData("text/plain", s.name); }} className="shop-sticker-choice flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-2 transition-colors hover:bg-secondary" onClick={() => { const nextId = ++id.current; setStickers(previous => [...previous, { ...s, id: nextId, x: 30 + previous.length % 3 * 20, y: 50 + Math.floor(previous.length / 3) % 2 * 20 }]); setSelected(nextId); }}><img src={s.src} alt="" className="h-16 w-full object-contain" draggable={false} /><span className="text-center text-xs">{s.name}</span></Button>)}</div></fieldset>
            <div className="flex flex-wrap items-center gap-2"><Button variant="outline" size="sm" disabled={selected === null} onClick={() => { setStickers(previous => previous.filter(s => s.id !== selected)); setSelected(null); }}><Trash2 />Quitar sticker</Button><Button variant="ghost" size="sm" disabled={stickers.length === 0} onClick={() => { setStickers([]); setSelected(null); }}><RotateCcw />Limpiar</Button></div>
            <Button size="lg" className="w-full" onClick={() => { setPhase("shop"); setNotice(""); }}>Entrar a la tienda<ArrowRight /></Button>
          </section>
        </div>
      </> : phase === "shop" ? <>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="mb-1 text-xs font-bold uppercase text-primary">Bienvenida a los pasillos</p><h1 className="text-3xl font-bold">Elige tus favoritos</h1></div><Button onClick={() => { setPhase("finish"); setInventoryOpen(false); }}><Check />Finalizar recorrido</Button></div>
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0">
            <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-border" aria-label="Pasillos">{SECTIONS.map(s => <Button variant="native" key={s.id} onClick={() => { setSection(s.id); setDetail(null); }} aria-current={section === s.id ? "page" : undefined} className="shop-aisle-tab flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm" data-active={section === s.id}>{s.id === "snacks" ? <Package size={17} /> : s.id === "albums" ? <Disc3 size={17} /> : <Sparkles size={17} />}{s.name}</Button>)}</nav>
            <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{SECTIONS.find(s => s.id === section)?.name}</h2><span className="text-sm text-muted-foreground">{SECTIONS.find(s => s.id === section)?.korean}</span></div>
            <div className="shop-shelf-grid grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3">
              {PRODUCTS.filter(p => p.section === section).map(p => <article key={p.id} className="shop-product group relative min-w-0">
                <Button variant="native" className="shop-product-art relative flex w-full items-end justify-center rounded-t-lg bg-secondary px-3 pt-5 pb-4" onClick={() => setDetail(p)} aria-label={`Ver ${p.name}`} title={`${p.name}: ${p.detail}`}><ProductArt product={p} /><span className="shop-shelf-edge absolute inset-x-0 bottom-0 h-2" /></Button>
                <div className="pt-3"><p className="text-sm font-bold">{p.name}</p><p className="mt-1 min-h-8 text-xs text-muted-foreground">{p.detail}</p><Button variant="outline" size="sm" className="mt-3 w-full" aria-label={`Guardar ${p.name}`} onClick={e => add(p, e.currentTarget)}><Plus />A la bolsa{(items[p.id] ?? 0) > 0 && <span className="ml-auto text-primary">{items[p.id]}</span>}</Button></div>
              </article>)}
            </div>
            {detail && <section className="mt-6 flex items-start justify-between gap-3 border-y border-border py-4" aria-label="Detalle del producto"><div><p className="font-bold">{detail.name}</p><p className="mt-1 text-sm text-muted-foreground">{detail.detail}</p></div><Button variant="ghost" size="icon" onClick={() => setDetail(null)} aria-label="Cerrar detalle"><X /></Button></section>}
          </section>
          <aside ref={bagTarget} className="shop-inventory sticky bottom-0 z-20 self-start rounded-lg border border-border bg-card p-4 lg:top-24" data-expanded={inventoryOpen}>
            <Button variant="native" onClick={() => setInventoryOpen(!inventoryOpen)} className="flex w-full items-center justify-between gap-2 text-left lg:pointer-events-none" aria-expanded={inventoryOpen}><span className="flex items-center gap-2 font-bold"><ShoppingBag size={18} />Tu bolsa<span className="text-sm font-normal text-muted-foreground">({total})</span></span><ChevronDown size={18} className="lg:hidden" /></Button>
            <div className="shop-inventory-bag mt-3 flex justify-center">{bag}</div>
            <div className="shop-inventory-list mt-4 max-h-64 overflow-y-auto">{collected.length ? collected.map(p => <div key={p.id} className="flex items-center justify-between gap-2 border-t border-border py-3"><span className="min-w-0 text-xs font-bold">{p.name}</span><div className="flex shrink-0 items-center gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Sacar ${p.name}`} onClick={() => setItems(previous => changeQuantity(previous, p.id, -1))}><Minus /></Button><span className="min-w-5 text-center text-xs">{items[p.id]}</span><Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Añadir otro ${p.name}`} onClick={e => add(p, e.currentTarget)}><Plus /></Button></div></div>) : <p className="py-3 text-center text-sm text-muted-foreground">Tu bolsa espera sus primeros favoritos.</p>}</div>
          </aside>
        </div>
      </> : <>
        <div className="mb-8 text-center"><span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary"><Check size={22} /></span><h1 className="text-3xl font-bold sm:text-4xl">Una bolsa muy tuya</h1><p className="mt-2 text-sm text-muted-foreground">{total === 0 ? "Tu bolsa decorada está lista para otra visita." : `${total} favoritos de STAY MART, elegidos por ti.`}</p></div>
        <div className="grid items-start gap-10 md:grid-cols-[280px_minmax(0,1fr)]"><div className="flex justify-center py-6">{bag}</div><section aria-label="Artículos recolectados" className="space-y-6">{SECTIONS.map(s => {
          const products = collected.filter(p => p.section === s.id);
          return products.length > 0 ? <section key={s.id}><h2 className="mb-3 border-b border-border pb-2 text-sm font-bold">{s.name}</h2><div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{products.map(p => <article key={p.id} className="min-w-0 rounded-lg border border-border bg-card p-3"><div className="shop-summary-art flex h-28 items-center justify-center"><ProductArt product={p} /></div><p className="mt-3 text-sm font-bold">{p.name}</p><div className="mt-2 flex items-center justify-between gap-2"><span className="text-xs text-muted-foreground">Cantidad: {items[p.id]}</span><Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Sacar ${p.name}`} onClick={() => setItems(previous => changeQuantity(previous, p.id, -1))}><Minus /></Button></div></article>)}</div></section> : null;
        })}</section></div>
        <div className="mt-9 flex flex-wrap justify-center gap-3 border-t border-border pt-6"><Button onClick={() => setPhase("shop")}><ArrowLeft />Seguir recorriendo</Button><Button variant="outline" onClick={reset}><RotateCcw />Decorar desde cero</Button></div>
      </>}
    </main>
    <p className="sr-only" aria-live="polite">{notice}</p>
    {flight && <div key={flight.key} className="shop-flying-item pointer-events-none fixed z-50" style={{ left: flight.x, top: flight.y, "--flight-x": `${flight.dx}px`, "--flight-y": `${flight.dy}px` } as React.CSSProperties} onAnimationEnd={() => setFlight(null)}><ProductArt product={flight.product} /></div>}
    <footer className="mx-auto max-w-7xl border-t border-border px-4 py-5 text-xs text-muted-foreground sm:px-8">STAY MART · Stray Kids collection · 서울</footer>
  </div>;
}