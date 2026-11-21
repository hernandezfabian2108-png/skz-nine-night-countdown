import {describe,it,expect} from 'vitest';
import {emptyPages,placeItem,moveItem,removeItem,validPages,type Item} from '@/components/days/day14-binder';
const card:Item={id:'a',kind:'card',asset:'photo-0',x:18,y:29,size:1,sleeve:'transparente'};
describe('Día 14: colección libre',()=>{
 it('mantiene cinco páginas independientes y reinicia solamente la actual',()=>{const pages=emptyPages();pages[0]=[card];pages[1]=[{...card,id:'b'}];pages[0]=[];expect(pages.length).toBe(5);expect(pages[1]).toEqual([{...card,id:'b'}]);});
 it('coloca cartas en bolsillos y permite moverlas libremente',()=>{const placed=placeItem([],card);expect(placed[0]).toMatchObject({x:17,y:30});expect(moveItem(placed,'a',55,48)[0]).toMatchObject({x:55,y:48});});
 it('mueve los stickers pegados junto con la carta',()=>{const items=placeItem([card],{...card,id:'s',kind:'sticker',asset:'estrella',x:20,y:30});expect(items[1]?.parent).toBe('a');expect(moveItem(items,'a',38,49)[1]).toMatchObject({x:40,y:50});});
 it('retira la carta y sus stickers sin modificar las otras',()=>{expect(removeItem([card,{...card,id:'s',parent:'a'},{...card,id:'b'}],'a')).toEqual([{...card,id:'b'}]);});
 it('reemplaza una carta de bolsillo sin dejar stickers huérfanos',()=>{const items=placeItem([],card);const decorated=placeItem(items,{...card,id:'s',kind:'sticker',asset:'estrella'});expect(placeItem(decorated,{...card,id:'b'}).map(i=>i.id)).toEqual(['b']);});
 it('acepta la colección guardada y rechaza contenido inválido',()=>{expect(validPages([[card],[],[],[],[]])).toBe(true);expect(validPages([[{...card,asset:'missing'}],[],[],[],[]])).toBe(false);});
});
