import collage from '@/assets/day14/collage.png.asset.json';
import compass from '@/assets/day14/compass.png.asset.json';
import p1 from '@/assets/day14/photo-1.png.asset.json';
import p2 from '@/assets/day14/photo-2.png.asset.json';
import p3 from '@/assets/day14/photo-3.png.asset.json';
import p4 from '@/assets/day14/photo-4.png.asset.json';
import p5 from '@/assets/day14/photo-5.png.asset.json';
import p6 from '@/assets/day14/photo-6.png.asset.json';
import p7 from '@/assets/day14/photo-7.png.asset.json';
import p8 from '@/assets/day14/photo-8.png.asset.json';
import p9 from '@/assets/day14/photo-9.png.asset.json';
export const CARDS = [p1,p2,p3,p4,p5,p6,p7,p8,p9,collage,compass].map((a,i)=>({id:`photo-${i}`,src:a.url,name:i<8?`Retrato ${i+1}`:i===8?'Reverso 5-STAR':i===9?'Colección azul':'Brújula de estrellas'}));
export const PAGES = ['Crema','Rosa','Celeste','Lavanda','Menta'];
export const SLEEVES = ['transparente','rosa','menta','estrellas','lazo'] as const;
export type Sleeve = typeof SLEEVES[number];
export const STICKERS = ['estrella','corazon','lazo','cinta','nota','mariposa','skz'] as const;
export type Sticker = typeof STICKERS[number];
export type Item = {id:string;kind:'card'|'sticker';asset:string;x:number;y:number;size:number;sleeve:Sleeve;parent?:string};
export type Pages = Item[][];
export const emptyPages = ():Pages=>PAGES.map(()=>[]);
export const POCKETS = [17,38,62,83].flatMap(x=>[30,72].map(y=>({x,y})));
export function bound(x:number,y:number){return {x:Math.max(10,Math.min(90,x)),y:Math.max(16,Math.min(86,y))};}
export function moveItem(items:Item[],id:string,x:number,y:number):Item[]{
 const current=items.find(i=>i.id===id);if(!current)return items;
 const pos=bound(x,y),dx=pos.x-current.x,dy=pos.y-current.y;
 return items.map(i=>i.id===id?{...i,...pos}:i.parent===id?{...i,x:i.x+dx,y:i.y+dy}:i);
}
export function removeItem(items:Item[],id:string){return items.filter(i=>i.id!==id&&i.parent!==id);}
export function placeItem(items:Item[],item:Item):Item[]{
 let pos=bound(item.x,item.y);
 if(item.kind==='card'){
  const pocket=POCKETS.find(p=>Math.hypot(p.x-pos.x,p.y-pos.y)<13);
  if(pocket)pos=pocket;
  const replaced=items.find(i=>i.kind==='card'&&i.x===pos.x&&i.y===pos.y);
  return [...(replaced?removeItem(items,replaced.id):items),{...item,...pos}];
 }
 const parent=[...items].reverse().find(i=>i.kind==='card'&&Math.abs(i.x-pos.x)<10&&Math.abs(i.y-pos.y)<17);
 return [...items,{...item,...pos,...(parent?{parent:parent.id}:{})}];
}
export function validPages(value:unknown):value is Pages {
 return Array.isArray(value)&&value.length===5&&value.every(p=>Array.isArray(p)&&p.every(i=>i&&typeof i.id==='string'&&(i.kind==='card'?CARDS.some(c=>c.id===i.asset):i.kind==='sticker'&&STICKERS.includes(i.asset))&&Number.isFinite(i.x)&&Number.isFinite(i.y)&&Number.isFinite(i.size)&&SLEEVES.includes(i.sleeve)));
}
