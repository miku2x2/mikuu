'use strict';
/* ================= УТИЛИТЫ ================= */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function toast(title,text='',type=''){
  const n=document.createElement('div');n.className='toast '+type;
  const b=document.createElement('b');b.textContent=title;
  const s=document.createElement('span');s.textContent=text;
  n.append(b,s);$('#toastHost').appendChild(n);
  setTimeout(()=>{n.style.transition='opacity .4s';n.style.opacity='0';setTimeout(()=>n.remove(),420);},3400);
}
function fmtBytes(n){if(!n)return '0 Б';if(n<1024)return n+' Б';if(n<1048576)return (n/1024).toFixed(1)+' КБ';return (n/1048576).toFixed(2)+' МБ';}
function fmtTime(s){if(!isFinite(s))return '00:00';s=Math.max(0,Math.floor(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function baseName(name){return String(name||'').replace(/\.[^.]+$/,'');}
async function shrinkImage(file,size=256){
  const bmp=await createImageBitmap(file);
  const c=document.createElement('canvas');c.width=size;c.height=size;
  const s=Math.min(size/bmp.width,size/bmp.height);
  const w=bmp.width*s,h=bmp.height*s;
  const x=c.getContext('2d');x.imageSmoothingQuality='high';
  x.drawImage(bmp,(size-w)/2,(size-h)/2,w,h);bmp.close();
  return c.toDataURL('image/png');
}
function hexRgb(h){h=String(h).replace('#','');return [parseInt(h.slice(0,2),16)||0,parseInt(h.slice(2,4),16)||0,parseInt(h.slice(4,6),16)||0];}
function mix(a,b,k){return a.map((v,i)=>Math.round(v+(b[i]-v)*k));}

/* ================= ИКОНКИ ================= */
const ICONS={
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  photo:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  film:'<rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>',
  tv:'<rect x="2" y="7" width="20" height="15" rx="2"/><path d="m17 2-5 5-5-5"/>',
  gamepad:'<path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  box:'<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  play:'<path d="m6 4 14 8-14 8z"/>',
  star:'<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>'
};
function svgMarkup(name){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="#f5f7ff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[name]||ICONS.star)+'</svg>';
}
const DEFAULT_SECTION_ICON={settings:'settings',photo:'photo',music:'music',video:'film',tv:'tv',game:'gamepad',network:'globe',extras:'box'};
const TYPE_ICON={folder:'folder',link:'link',music:'music',video:'play',text:'file',photo:'photo'};
const TYPE_LABEL={folder:'Папка',link:'Ссылка',music:'Музыка',video:'Видео',text:'Текст',photo:'Фото'};
const CAT_RU={1:'Настройки',2:'Фото',3:'Музыка',4:'Видео',5:'ТВ',6:'Игра',7:'Сеть',8:'Разное'};
const FIRST_RU={2:'Memory Stick',4:'UMD',6:'Камера',8:'Game Sharing',10:'Save Data',12:'UMD Update',14:'Network Update',16:'USB',18:'Настройки видео',20:'Настройки фото',22:'Настройки системы',24:'Настройки темы',26:'Дата и время',28:'Энергосбережение',30:'Внешний дисплей',32:'Настройки звука',34:'Безопасность',38:'Настройки сети',42:'Remote Play',44:'Интернет-радио',46:'RSS',48:'Браузер',50:'Поиск',52:'Аккаунт',54:'Стандартная',56:'Bluetooth',58:'SensMe',60:'Системная память',62:'Save Data (система)',64:'Resume Game'};

/* ================= СЕРВЕРНОЕ ХРАНИЛИЩЕ ================= */
let authToken=null;
function authHeaders(){const h={};if(authToken)h['Authorization']='Bearer '+authToken;return h;}
function fileUrl(key){return '/api/files/'+encodeURIComponent(key);}
function dbOpen(){return Promise.resolve(null);}
async function idbGet(store,key){
  try{
    if(store==='kv'){const r=await fetch('/api/config');return r.ok?await r.json():undefined;}
    const r=await fetch(fileUrl(key));
    if(!r.ok)return undefined;
    return await r.blob();
  }catch(e){return undefined;}
}
async function idbSet(store,key,val){
  try{
    if(store==='kv'){
      await fetch('/api/config',{method:'PUT',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(val)});
      return;
    }
    const form=new FormData();
    form.append('file',val instanceof Blob?val:new Blob([val]));
    await fetch(fileUrl(key),{method:'POST',headers:authHeaders(),body:form});
  }catch(e){toast('Ошибка сервера','Не удалось сохранить данные.','err');}
}
async function idbDel(store,key){
  try{await fetch(fileUrl(key),{method:'DELETE',headers:authHeaders()});}catch(e){}
}

/* ================= ДВИЖОК PTF ================= */
function alignV(v,m){return v%m===0?v:v+m-(v%m);}
function readFixedString(bytes,start,len){let end=start;while(end<start+len&&bytes[end]!==0)end++;return new TextDecoder().decode(bytes.slice(start,end));}
async function decompressDeflate(bytes){
  if(!('DecompressionStream' in window))throw new Error('Браузер не поддерживает Deflate.');
  let last=null;
  for(let trim=0;trim<=3&&trim<bytes.length;trim++){
    if(trim>0&&bytes[bytes.length-trim]!==0)continue;
    try{
      const input=trim?bytes.slice(0,bytes.length-trim):bytes;
      const ds=new DecompressionStream('deflate');
      const ab=await new Response(new Blob([input]).stream().pipeThrough(ds)).arrayBuffer();
      return new Uint8Array(ab);
    }catch(e){last=e;}
  }
  throw last||new Error('Ошибка распаковки Deflate.');
}
function decompressLzr(input,maxOutput,offset=0,length=input.length-offset){
  if(!(input instanceof Uint8Array))input=new Uint8Array(input);
  const end=offset+length;
  const out=new Uint8Array(maxOutput);
  const probs=new Uint16Array(2800);probs.fill(0x80);
  let outPos=0,inPos=offset+5;
  let code=input[offset+1]*0x1000000+input[offset+2]*0x10000+input[offset+3]*0x100+input[offset+4];
  let range=0xFFFFFFFF,spec=0,corrupt=false,bufOff=0,lastByte=0,lastNumberFlag=0;
  let type=input[offset];if(type>=0x80)type-=0x100;
  if(type>7)throw new Error('Неподдерживаемый LZR.');
  if(type<0){const stored=code;if(stored>out.length||inPos+stored>end)throw new Error('Битый LZR.');return input.slice(inPos,inPos+stored);}
  const nextByte=()=>{if(inPos>=end){corrupt=true;return 0;}return input[inPos++];};
  const renorm=()=>{if(range<=0x00FFFFFF){code=(code*256+nextByte())%0x100000000;range=(range*256)%0x100000000;}};
  function decodeBit(pi){
    if(pi<0||pi>=2800){corrupt=true;return 0;}
    renorm();if(corrupt)return 0;
    const p=probs[pi],bound=Math.floor(range/256)*p;
    probs[pi]=p-Math.floor(p/8);
    if(code<bound){range=bound;probs[pi]+=31;return 1;}
    code-=bound;range-=bound;return 0;
  }
  function decodeBitSpec(pi){
    if(pi<0||pi>=2800){corrupt=true;return 0;}
    if(spec<=0x00FFFFFF){code=(code*256+nextByte())%0x100000000;range=(spec*256)%0x100000000;}
    if(corrupt)return 0;
    const p=probs[pi],bound=Math.floor(range/256)*p;
    spec=bound;probs[pi]=p-Math.floor(p/8);
    if(code<bound){range=bound;probs[pi]+=31;return 1;}
    code-=bound;range-=bound;return 0;
  }
  function decodeNumber(bits,base,step){
    let number=1;
    if(bits>=3){number=number*2+decodeBit(base+3*step);
      if(bits>=4){number=number*2+decodeBit(base+3*step);
        if(bits>=5){renorm();let rem=bits;
          while(rem>=5){if(range===0){corrupt=true;return 0;}number*=2;range=Math.floor(range/2);if(code<range)number++;else code-=range;rem--;}}}}
    lastNumberFlag=decodeBit(base);
    number=number*2+lastNumberFlag;
    if(bits>=1){number=number*2+decodeBit(base+step);if(bits>=2)number=number*2+decodeBit(base+2*step);}
    return number;
  }
  const selCtx=()=>bufOff+2488;
  function decodeLiteral(shift){
    if(bufOff>0)bufOff--;
    if(outPos===out.length)return false;
    const ctx=(Math.floor((((outPos&7)<<8)+lastByte)/(2**shift)))&7;
    const base=ctx*0xFF-1;let node=1;
    while(node<=0xFF){node=node*2+decodeBit(base+node);if(corrupt)return false;}
    out[outPos++]=node&0xFF;lastByte=node&0xFF;return true;
  }
  function decodeMatch(){
    let slot=selCtx();spec=range;let lengthClass=-1,bit;
    do{slot+=8;bit=decodeBitSpec(slot);if(corrupt)return -1;lengthClass+=bit;}while(bit!==0&&lengthClass<6);
    let offsetGroup=lengthClass+2033,offsetBias=64,matchLength;
    if(bit!==0||lengthClass>=0){
      const lc=(lengthClass<<5)+(((outPos*(2**lengthClass))&3)<<3)+bufOff+2552;
      matchLength=decodeNumber(lengthClass,lc,8);
      if(corrupt)return -1;
      if(matchLength===0xFF)return 1;
      if(lastNumberFlag!==0||lengthClass>0){offsetGroup+=56;offsetBias=352;}
    }else matchLength=1;
    let index=1,offsetClass;
    do{offsetClass=(index<<4)-offsetBias;const pi=offsetGroup+(index<<3);if(pi>=2800)return -1;bit=decodeBit(pi);if(corrupt)return -1;index=(index<<1)|bit;}while(offsetClass<0);
    let backOffset;
    if(bit!==0||offsetClass>0){
      if(bit===0)offsetClass-=8;
      const base=offsetClass+2344;
      if(base<0||base+3>=2800)return -1;
      backOffset=decodeNumber(Math.floor(offsetClass/8),base,1);
      if(corrupt)return -1;
    }else backOffset=1;
    if(backOffset>outPos)return -1;
    const copyEnd=outPos+matchLength+1;
    if(copyEnd>out.length)return -1;
    bufOff=((copyEnd+1)&1)+6;
    let from=outPos-backOffset;
    while(outPos<copyEnd)out[outPos++]=out[from++];
    lastByte=out[outPos-1];return 0;
  }
  let budget=Math.max(1024,maxOutput*2+1024);
  while(true){
    if(--budget<0)throw new Error('LZR не завершился.');
    const isMatch=decodeBit(selCtx());
    if(corrupt)throw new Error('Обрезанный LZR-поток.');
    if(isMatch===0){if(!decodeLiteral(type))throw new Error('LZR больше объявленного размера.');}
    else{const r=decodeMatch();if(r===1)return out.slice(0,outPos);if(r<0)throw new Error('Битая LZR-ссылка.');}
  }
}
function decodeGim(bytes){
  if(bytes.length<32)throw new Error('GIM слишком мал.');
  const magic=String.fromCharCode(...bytes.slice(0,4));
  const little=magic==='MIG.';
  if(!little&&magic!=='.GIM')throw new Error('Неверный GIM-заголовок.');
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const U16=o=>view.getUint16(o,little),U32=o=>view.getUint32(o,little);
  let pos=16,image=null,palette=null,guard=0;
  while(pos+16<=bytes.length&&guard++<64){
    const blockStart=pos,type=U16(pos),next=U32(pos+8),content=pos+16;
    if(type===4||type===5){
      if(U16(content)!==0x30)throw new Error('Неподдерживаемый GIM-блок.');
      const format=U16(content+4),pixelOrder=U16(content+6),width=U16(content+8),height=U16(content+10),bpp=U16(content+12);
      const pitchAlign=U16(content+14)||1,nextIndex=U32(content+24),frameEnd=U32(content+32);
      const frameOffset=U32(content+nextIndex);
      const frame=bytes.slice(content+frameOffset,content+frameEnd);
      const tileWidth=0x80/bpp,tileHeight=8;
      const rw=pixelOrder===1?alignV(width,tileWidth):width,rh=pixelOrder===1?alignV(height,tileHeight):height;
      const rows=[];let bytePos=0;
      for(let y=0;y<rh;y++){
        const row=[];let bitPos=bytePos*8;
        for(let x=0;x<rw;x++){
          let val;
          if(bpp===4){const bi=bitPos>>3,sh=bitPos&7;val=(frame[bi]>>sh)&15;}
          else if(bpp===8)val=frame[bitPos>>3];
          else if(bpp===16){const bi=bitPos>>3;val=frame[bi]|(frame[bi+1]<<8);}
          else if(bpp===32){const bi=bitPos>>3;val=(frame[bi]|frame[bi+1]<<8|frame[bi+2]<<16|frame[bi+3]<<24)>>>0;}
          else throw new Error('Неподдерживаемый GIM bpp.');
          row.push(val);bitPos+=bpp;
        }
        bytePos+=alignV(Math.ceil(rw*bpp/8),pitchAlign);
        rows.push(row);
      }
      let pixels=rows;
      if(pixelOrder===1){
        const outp=Array.from({length:height},()=>Array(width).fill(0));
        let ox=0,oy=0,tp=0;
        for(let y=0;y<rh;y++)for(let x=0;x<rw;x++){
          const dx=ox+(tp%tileWidth),dy=oy+Math.floor(tp/tileWidth);
          if(dx<width&&dy<height)outp[dy][dx]=rows[y][x];
          tp++;if(tp===tileWidth*tileHeight){tp=0;ox+=tileWidth;if(ox>=rw){ox=0;oy+=tileHeight;}}
        }
        pixels=outp;
      }else pixels=rows.slice(0,height).map(r=>r.slice(0,width));
      const obj={format,width,height,pixels};
      if(type===4)image=obj;else palette=obj;
    }
    if(!next)break;
    pos=blockStart+next;if(pos<=blockStart)break;
  }
  if(!image)throw new Error('В GIM нет блока изображения.');
  let format=image.format,pixels=image.pixels;
  if(palette){const pal=palette.pixels[0];pixels=pixels.map(row=>row.map(v=>pal[v]??0));format=palette.format;}
  const out=new Uint8ClampedArray(image.width*image.height*4);let o=0;
  for(const row of pixels)for(const v of row){
    let r,g,b,a;
    if(format===3){r=v&255;g=(v>>>8)&255;b=(v>>>16)&255;a=(v>>>24)&255;}
    else if(format===0){r=(v&31)*255/31;g=((v>>>5)&63)*255/63;b=((v>>>11)&31)*255/31;a=255;}
    else if(format===1){r=(v&31)*255/31;g=((v>>>5)&31)*255/31;b=((v>>>10)&31)*255/31;a=(v&0x8000)?255:0;}
    else if(format===2){r=(v&15)*17;g=((v>>>4)&15)*17;b=((v>>>8)&15)*17;a=((v>>>12)&15)*17;}
    else throw new Error('Неподдерживаемый GIM-формат.');
    out[o++]=r;out[o++]=g;out[o++]=b;out[o++]=a;
  }
  return new ImageData(out,image.width,image.height);
}
function imageDataToURL(img){const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').putImageData(img,0,0);return c.toDataURL('image/png');}
async function rawToImageURL(raw,fileType){
  if(fileType===5)return imageDataToURL(decodeGim(raw));
  const mime={0:'image/png',1:'image/jpeg',2:'image/tiff',3:'image/gif',4:'image/bmp'}[fileType]||'application/octet-stream';
  const bmp=await createImageBitmap(new Blob([raw],{type:mime}));
  const c=document.createElement('canvas');c.width=bmp.width;c.height=bmp.height;
  c.getContext('2d').drawImage(bmp,0,0);bmp.close();
  return c.toDataURL('image/png');
}
function downscaleURL(url,maxW,maxH){
  return new Promise(res=>{
    const img=new Image();
    img.onload=()=>{
      const s=Math.min(maxW/img.width,maxH/img.height,1);
      const c=document.createElement('canvas');
      c.width=Math.max(1,Math.round(img.width*s));c.height=Math.max(1,Math.round(img.height*s));
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      res(c.toDataURL('image/jpeg',.75));
    };
    img.onerror=()=>res(null);
    img.src=url;
  });
}
async function parsePtfTheme(buffer){
  const bytes=new Uint8Array(buffer);
  if(bytes.length<0x120||String.fromCharCode(bytes[0],bytes[1],bytes[2],bytes[3])!=='\0PTF')throw new Error('Это не PTF-файл версии 1.');
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const theme={title:readFixedString(bytes,8,128),productId:readFixedString(bytes,136,48),version:readFixedString(bytes,192,8),color:0,wallpaper:null,preview:null,cats:{},first:{},second:{}};
  const offsets=[];
  for(let p=0x100;p<0x120;p+=4){const v=view.getUint32(p,true);if(v)offsets.push(v);}
  if(!offsets.length)throw new Error('В PTF нет групп ресурсов.');
  for(const off of offsets){
    if(off+0x20>bytes.length)continue;
    const objIdx=view.getUint16(off,true),subCount=view.getUint16(off+2,true),objSize=view.getUint32(off+4,true),dataOffset=view.getUint32(off+8,true);
    if(dataOffset+objSize>bytes.length)continue;
    let pos=dataOffset;
    for(let i=0;i<subCount;i++){
      if(pos+0x20>bytes.length)break;
      const subIdx=view.getUint16(pos,true),fileType=view.getUint16(pos+4,true),comp=view.getUint16(pos+6,true),size=view.getUint32(pos+8,true),ucSize=view.getUint32(pos+12,true);
      if(pos+0x20+size>bytes.length)break;
      const packed=bytes.slice(pos+0x20,pos+0x20+size);
      try{
        let raw;
        if(comp===2&&size<ucSize)raw=await decompressDeflate(packed);
        else if(comp===1&&size<ucSize)raw=decompressLzr(packed,ucSize);
        else raw=packed.slice(0,ucSize);
        if(raw.length!==ucSize)throw new Error('Размер не совпал.');
        if(objIdx===0&&subIdx===2&&raw.length>=4){theme.color=new DataView(raw.buffer,raw.byteOffset,raw.byteLength).getUint32(0,true);}
        else if(objIdx===0&&subIdx===1){theme.preview=await rawToImageURL(raw,fileType);}
        else if(objIdx===1&&subIdx===0){theme.wallpaper=await rawToImageURL(raw,fileType);}
        else if(objIdx===2){theme.cats[subIdx]=await rawToImageURL(raw,fileType);}
        else if(objIdx===3){
          const bodyId=subIdx%2===0?subIdx:subIdx-1,focus=subIdx%2===1;
          if(!theme.first[bodyId])theme.first[bodyId]={};
          theme.first[bodyId][focus?'focus':'body']=await rawToImageURL(raw,fileType);
        }
        else if(objIdx===4){
          const bodyId=subIdx%2===0?subIdx:subIdx-1,focus=subIdx%2===1;
          if(!theme.second[bodyId])theme.second[bodyId]={};
          theme.second[bodyId][focus?'focus':'body']=await rawToImageURL(raw,fileType);
        }
      }catch(e){}
      pos+=0x20+alignV(size,4);
    }
  }
  return theme;
}

/* ================= КОНФИГУРАЦИЯ ================= */
const MONTH_COLORS={
  0:['#2e7dd1','#8fc3ff'],1:['#7d828a','#c3c9d2'],2:['#d8a91c','#f5dd8a'],3:['#8bbf2e','#d3ef9a'],
  4:['#e070a8','#ffc6de'],5:['#3ea24e','#a8dfa8'],6:['#8e5fc0','#d3b3f0'],7:['#1ea9a0','#93ece4'],
  8:['#2f6fd0','#a3c9ff'],9:['#7b3fa0','#c8a0e0'],10:['#e07716','#ffc488'],11:['#7d5a4a','#cbb09d'],12:['#d6403a','#ffa09a']
};
function defaultConfig(){
  return {
    siteName:'XMB HOME',showHints:true,randomThemes:false,activeThemeId:null,themes:[],
    iconScale:1,
    fonts:{list:[],roles:{cat:'',title:'',sub:''}},
    sections:[
      {id:uid(),key:'settings',title:'Настройки',visible:true,icon:null,psfSub:1,items:[
        {id:uid(),type:'text',title:'О сайте',sub:'Что это за место',icon:null,text:'Это личная страница, оформленная как меню PlayStation Portable.\n\nЗагружайте PTF-темы и шрифты через админ-панель, добавляйте ссылки, музыку, видео, фото и заметки в разделы — всё хранится прямо в браузере.\n\nИконку пункта можно взять из PTF-темы — тогда она будет меняться вместе с темой.\n\nНажмите A (или шестерёнку внизу), чтобы открыть админ-панель.'}
      ]},
      {id:uid(),key:'photo',title:'Фото',visible:true,icon:null,psfSub:2,items:[]},
      {id:uid(),key:'music',title:'Музыка',visible:true,icon:null,psfSub:3,items:[]},
      {id:uid(),key:'video',title:'Видео',visible:true,icon:null,psfSub:4,items:[]},
      {id:uid(),key:'tv',title:'ТВ',visible:true,icon:null,psfSub:5,items:[]},
      {id:uid(),key:'game',title:'Игра',visible:true,icon:null,psfSub:6,items:[]},
      {id:uid(),key:'network',title:'Сеть',visible:true,icon:null,psfSub:7,items:[
        {id:uid(),type:'link',title:'PTF Studio',sub:'Инструмент для PTF-тем',icon:null,url:'https://github.com/S1implyBlue/PTF-Studio'}
      ]},
      {id:uid(),key:'extras',title:'Разное',visible:true,icon:null,psfSub:8,items:[
        {id:uid(),type:'folder',title:'Материалы',sub:'Пример папки',icon:null,items:[
          {id:uid(),type:'text',title:'Заметка',sub:'',icon:null,text:'Это текст внутри папки. Папки вкладываются как подменю XMB.'}
        ]}
      ]}
    ]
  };
}
let config=defaultConfig();
let saveTimer=0;
function saveConfig(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(async()=>{
    try{
      await fetch('/api/config',{
        method:'PUT',
        headers:{'Content-Type':'application/json',...authHeaders()},
        body:JSON.stringify(config)
      });
    }catch(e){console.error('save config:',e);}
  },200);
}

/* ================= СОСТОЯНИЕ ================= */
let curTheme=null;
const themeCache=new Map();
const nav={cat:0,stack:[],idx:[0]};
let U=2,OX=0,OY=0;
const PSP={catX:110,catY:72,catSp:82,catW:64,catH:48,catLblY:98,catFont:11,itemX:110,itemY:137,itemSp:64,body:48,focus:64,lblX:149,itemFont:14,subFont:11,sub2X:130,sub2Body:32,sub2Focus:48};

function computeU(){
  const isPortrait = innerHeight > innerWidth;
  if (isPortrait) {
    U = innerWidth / 360;
    OX = 0;
    OY = (innerHeight - 272 * U) / 2;
  } else {
    U = Math.min(innerWidth/480, innerHeight/272);
    OX = (innerWidth - 480 * U) / 2;
    OY = (innerHeight - 272 * U) / 2;
  }
}
addEventListener('resize',()=>{
  computeU();renderXmb();
  if($('#photoOv')&&$('#photoOv').classList.contains('open'))layoutPhoto();
});

/* ================= ФОН / ВОЛНЫ ================= */
const waveCanvas=$('#waveCanvas'),wctx=waveCanvas.getContext('2d');
let waveColors=MONTH_COLORS[new Date().getMonth()+1];
let themeHasWallpaper=false;
function layoutWave(){waveCanvas.width=innerWidth;waveCanvas.height=innerHeight;}
function drawWaves(t){
  if(themeHasWallpaper)return;
  const w=waveCanvas.width,h=waveCanvas.height;if(!w||!h)return;
  const c1=hexRgb(waveColors[0]),c2=hexRgb(waveColors[1]);
  const g=wctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'rgb('+mix(c1,[5,8,18],.62).join(',')+')');
  g.addColorStop(.5,'rgb('+mix(c1,[5,8,18],.35).join(',')+')');
  g.addColorStop(1,'rgb('+mix(c2,[3,5,12],.78).join(',')+')');
  wctx.fillStyle=g;wctx.fillRect(0,0,w,h);
  const glow=wctx.createRadialGradient(w*.5,h*.16,0,w*.5,h*.16,h*.9);
  glow.addColorStop(0,'rgba('+c2.join(',')+',.20)');glow.addColorStop(1,'rgba(0,0,0,0)');
  wctx.fillStyle=glow;wctx.fillRect(0,0,w,h);
  for(let band=0;band<4;band++){
    wctx.beginPath();
    const baseY=h*(0.40+band*0.16);
    wctx.moveTo(0,h);
    for(let x=0;x<=w;x+=14){
      const y=baseY+Math.sin(x*0.0042+t*0.00038*(band+1)+band*2.1)*h*0.045+Math.sin(x*0.0015-t*0.00024+band*1.3)*h*0.03;
      wctx.lineTo(x,y);
    }
    wctx.lineTo(w,h);wctx.closePath();
    const col=mix(c2,[255,255,255],.25+band*.1);
    wctx.fillStyle='rgba('+col.join(',')+','+(0.05+band*0.022)+')';
    wctx.fill();
  }
}
(function waveLoop(){requestAnimationFrame(waveLoop);drawWaves(performance.now());})();

let wpCur=$('#wpA'),wpNext=$('#wpB');
function setWallpaper(url){
  if(!url){themeHasWallpaper=false;wpCur.style.opacity='0';wpNext.style.opacity='0';return;}
  const img=new Image();
  img.onload=()=>{
    const incoming=wpNext;
    incoming.src=url;incoming.style.opacity='1';
    wpCur.style.opacity='0';
    const tmp=wpCur;wpCur=wpNext;wpNext=tmp;
    themeHasWallpaper=true;
  };
  img.onerror=()=>{themeHasWallpaper=false;};
  img.src=url;
}

/* ================= ЧАСЫ ================= */
function tickClock(){
  const d=new Date();
  $('#clockText').textContent=String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'  '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}
setInterval(tickClock,5000);tickClock();

/* ================= ШРИФТЫ ================= */
const fontFaces=new Map();
async function loadFontFace(id){
  if(fontFaces.has(id))return fontFaces.get(id);
  const blob=await idbGet('files','font:'+id);
  if(!blob)return null;
  const fam='XMBF-'+id;
  try{
    const buf=blob instanceof Blob?await blob.arrayBuffer():blob;
    const f=new FontFace(fam,buf);
    await f.load();document.fonts.add(f);
    fontFaces.set(id,fam);return fam;
  }catch(e){return null;}
}
async function bootFonts(){
  const list=(config.fonts&&config.fonts.list)||[];
  for(const f of list)await loadFontFace(f.id);
  applyFonts();
}
function fontFamilyFor(role){
  const id=config.fonts&&config.fonts.roles&&config.fonts.roles[role];
  if(!id)return '';
  const fam=fontFaces.get(id);
  return fam?("'"+fam+"', 'Manrope Variable', sans-serif"):'';
}
function applyFonts(){
  const r=document.documentElement.style;
  r.setProperty('--fCat',fontFamilyFor('cat')||'var(--font)');
  r.setProperty('--fTitle',fontFamilyFor('title')||'var(--font)');
  r.setProperty('--fSub',fontFamilyFor('sub')||'var(--font)');
}

/* ================= РЕНДЕР XMB ================= */
const catCache=new Map(),itemCache=new Map();
function syncLayer(layer,entries,cache){
  const seen=new Set();
  for(const ent of entries){
    seen.add(ent.key);
    let el=cache.get(ent.key);
    if(!el){el=ent.create();el.classList.add('enter');cache.set(ent.key,el);layer.appendChild(el);requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.remove('enter')));}
    ent.apply(el);
  }
  for(const [key,el] of [...cache]){
    if(!seen.has(key)){cache.delete(key);el.classList.add('leave');setTimeout(()=>el.remove(),480);}
  }
}
function visibleSections(){return config.sections.filter(s=>s.visible);}
function currentSection(){const vs=visibleSections();return vs[clamp(nav.cat,0,Math.max(0,vs.length-1))];}
function currentItems(){
  const sec=currentSection();
  if(!sec)return [];
  let list=sec.items;
  for(const f of nav.stack)list=f.items||[];
  return list;
}
function sectionIconSrc(sec){
  if(sec.icon)return {src:sec.icon,ptf:false};
  if(curTheme&&curTheme.cats[sec.psfSub])return {src:curTheme.cats[sec.psfSub],ptf:true};
  return null;
}
function ptfIconSrc(item){
  if(!item||!item.iconPtf||!curTheme)return null;
  const parts=String(item.iconPtf).split(':');
  const kind=parts[0],sub=+parts[1];
  if(kind==='cat'&&curTheme.cats[sub])return {src:curTheme.cats[sub],ptf:true};
  if(kind==='first'&&curTheme.first[sub]&&curTheme.first[sub].body)return {src:curTheme.first[sub].body,ptf:true};
  if(kind==='second'&&curTheme.second[sub]&&curTheme.second[sub].body)return {src:curTheme.second[sub].body,ptf:true};
  return null;
}
function isMediaType(t){return t==='music'||t==='video'||t==='photo';}
function itemIconSrc(item,depth){
  if(item.icon)return {src:item.icon,ptf:false};
  const p=ptfIconSrc(item);if(p)return p;
  if(item.iconAuto&&isMediaType(item.type))return {src:item.iconAuto,ptf:false};
  if(curTheme){
    if(depth>0&&curTheme.second[0]&&curTheme.second[0].body)return {src:curTheme.second[0].body,ptf:true};
    const fb=curTheme.first[54];
    if(fb&&fb.body)return {src:fb.body,ptf:true};
  }
  return null;
}
function explicitIconSrc(item){
  if(item.icon)return {src:item.icon,ptf:false};
  const p=ptfIconSrc(item);if(p)return p;
  if(item.iconAuto&&isMediaType(item.type))return {src:item.iconAuto,ptf:false};
  return null;
}
function fillIcon(wrap,iconInfo,svgName){
  if(iconInfo){
    wrap.innerHTML='<img src="'+iconInfo.src+'" alt=""'+(iconInfo.ptf?' class="ptfImg"':'')+'>';
  }else{
    wrap.innerHTML=svgMarkup(svgName);
  }
}
function resetNav(){nav.stack=[];nav.idx=[0];}

function renderXmb(){
  const vs=visibleSections();
  nav.cat=clamp(nav.cat,0,Math.max(0,vs.length-1));
  const depth=nav.stack.length;
  const IS=clamp(config.iconScale||1,0.5,2.5);
  const catLayer=$('#catLayer'),itemLayer=$('#itemLayer');
  const textShift=nav.textOpen?-60*U:0;
  catLayer.style.transform='translateX('+(depth?-60*U+textShift:textShift)+'px)';
  itemLayer.style.transform='translateX('+(depth?-60*U+textShift:textShift)+'px)';

  syncLayer(catLayer,vs.map((sec,i)=>({
    key:'c:'+sec.id,
    create(){
      const el=document.createElement('div');el.className='cat';
      el.innerHTML='<div class="glow"></div><div class="iconWrap"></div>';
      const go=()=>{if(nav.cat!==i){nav.cat=i;resetNav();renderXmb();}};
      el.addEventListener('click',go);
      el.addEventListener('touchend',e=>{e.stopPropagation();go();});
      return el;
    },
    apply(el){
      el.style.left=(OX+PSP.catX*U+(i-nav.cat)*PSP.catSp*U)+'px';
      el.style.top=(OY+PSP.catY*U)+'px';
      el.style.width=(PSP.catW*U*IS)+'px';el.style.height=(PSP.catH*U*IS)+'px';
      const d=Math.abs(i-nav.cat);
      el.style.opacity=nav.textOpen?(d===0?'1':'.12'):(d===0?'1':d===1?'.55':d===2?'.3':'.16');
      el.classList.toggle('selected',i===nav.cat);
      el.style.zIndex=100-d;
      fillIcon(el.querySelector('.iconWrap'),sectionIconSrc(sec),DEFAULT_SECTION_ICON[sec.key]||'star');
      el.title=sec.title;
    }
  })),catCache);

  const catLbl=$('#catLabel');
  const sel=vs[nav.cat];
  catLbl.style.left=(OX+PSP.catX*U-(depth?60*U:0)+textShift)+'px';
  catLbl.style.top=(OY+PSP.catLblY*U)+'px';
  catLbl.style.fontSize=PSP.catFont*U+'px';
  catLbl.style.maxWidth=260*U+'px';
  if(catLbl.dataset.t!==String(sel?sel.title:'')){
    catLbl.dataset.t=sel?sel.title:'';
    catLbl.textContent=sel?sel.title:'';
    catLbl.classList.remove('lblIn');void catLbl.offsetWidth;catLbl.classList.add('lblIn');
  }
  catLbl.style.opacity=sel?'1':'0';

  const items=currentItems();
  nav.idx[nav.idx.length-1]=clamp(nav.idx[nav.idx.length-1],0,Math.max(0,items.length-1));
  const cur=nav.idx[nav.idx.length-1];
  const isSub=depth>0;
  const iconX=isSub?PSP.sub2X+40:PSP.itemX;
  const bodyB=isSub?PSP.sub2Body:PSP.body;
  const focusB=isSub?PSP.sub2Focus:PSP.focus;
  const themeFocus=isSub?(curTheme&&curTheme.second[1]?curTheme.second[1].focus:null):(curTheme&&curTheme.first[55]?curTheme.first[55].focus:null);

  syncLayer(itemLayer,items.map((item,i)=>({
    key:'i:'+item.id,
    create(){
      const el=document.createElement('div');el.className='xitem';
      el.innerHTML='<div class="glow"></div><img class="focusArt" alt=""><div class="subPointer"></div><div class="iconWrap"></div>';
      const go=()=>{
        if(i===nav.idx[nav.idx.length-1])activateItem(item);
        else{nav.idx[nav.idx.length-1]=i;renderXmb();}
      };
      el.addEventListener('click',go);
      el.addEventListener('touchend',e=>{e.stopPropagation();go();});
      return el;
    },
    apply(el){
      const isPrev=i===cur-1&&items.length>1;
      el.style.left=(OX+(isPrev?PSP.catX:iconX)*U)+'px';
      el.style.top=(OY+(isPrev?PSP.catY-40:PSP.itemY+(i-cur)*PSP.itemSp)*U)+'px';
      const bw=bodyB*U*IS,fw=focusB*U*IS;
      el.style.width=bw+'px';el.style.height=bw+'px';
      const d=Math.abs(i-cur);
      el.style.opacity=i===cur?'1':isPrev?'.55':d===1?'.34':d===2?'.2':'.1';
      el.style.pointerEvents=d>3?'none':'auto';
      el.classList.toggle('selected',i===cur);
      el.classList.toggle('prevMenu',isPrev);el.dataset.title=isPrev?item.title:'';
      el.style.zIndex=200-d;
      fillIcon(el.querySelector('.iconWrap'),itemIconSrc(item,depth),TYPE_ICON[item.type]||'star');
      const fa=el.querySelector('.focusArt');
      if(themeFocus){fa.src=themeFocus;fa.style.display='block';fa.style.inset=(-((fw-bw)/2/bw*100))+'%';}
      else fa.style.display='none';
      el.querySelector('.subPointer').style.display=isSub?'block':'none';
      el.title=item.title;
    }
  })),itemCache);

  const itemLbl=$('#itemLabel');
  const selItem=items[cur];
  if(selItem){
    itemLbl.style.display='block';
    itemLbl.style.left=(OX+(isSub?151+40:PSP.lblX)*U-(depth?60*U:0)+textShift)+'px';
    itemLbl.style.top=(OY+PSP.itemY*U)+'px';
    itemLbl.style.fontSize=PSP.itemFont*U+'px';
    itemLbl.style.maxWidth=(isSub?280:310)*U+'px';
    const sig=selItem.id+':'+selItem.title+':'+(selItem.sub||'');
    if(itemLbl.dataset.s!==sig){
      itemLbl.dataset.s=sig;
      itemLbl.innerHTML='';
      const t=document.createElement('div');t.className='lblTitle';t.textContent=selItem.title;
      itemLbl.appendChild(t);
      if(selItem.sub){const s=document.createElement('div');s.className='lblSub';s.style.fontSize=PSP.subFont*U+'px';s.textContent=selItem.sub;itemLbl.appendChild(s);}
      itemLbl.classList.remove('lblIn');void itemLbl.offsetWidth;itemLbl.classList.add('lblIn');
    }
  }else itemLbl.style.display='none';

  const eh=$('#emptyHint');
  if(sel&&!items.length){
    eh.classList.add('on');
    eh.style.left=(OX+PSP.lblX*U)+'px';
    eh.style.top=(OY+PSP.itemY*U)+'px';
    eh.style.fontSize=12*U+'px';
  }else eh.classList.remove('on');

  const cr=$('#crumb');
  if(depth>0){
    cr.innerHTML='';cr.classList.add('on');
    cr.appendChild(document.createTextNode(sel?sel.title:''));
    for(const f of nav.stack){const s=document.createElement('span');s.textContent=f.title;cr.appendChild(s);}
  }else cr.classList.remove('on');
}

/* ================= НАВИГАЦИЯ ================= */
function moveNav(key){
  const vs=visibleSections();
  if(!vs.length)return;
  const depth=nav.stack.length;
  const items=currentItems();
  if(key==='ArrowLeft'){
    if(depth>0){nav.stack.pop();nav.idx.pop();}
    else{nav.cat=(nav.cat-1+vs.length)%vs.length;resetNav();}
  }
  else if(key==='ArrowRight'){if(depth===0){nav.cat=(nav.cat+1)%vs.length;resetNav();}}
  else if(key==='ArrowUp'){if(items.length)nav.idx[nav.idx.length-1]=(nav.idx[nav.idx.length-1]-1+items.length)%items.length;}
  else if(key==='ArrowDown'){if(items.length)nav.idx[nav.idx.length-1]=(nav.idx[nav.idx.length-1]+1)%items.length;}
  else if(key==='Enter'||key===' '){const it=items[nav.idx[nav.idx.length-1]];if(it)activateItem(it);}
  else if(key==='Escape'){
    if(nav.textOpen){closeText();return;}
    if(depth>0){nav.stack.pop();nav.idx.pop();}
  }
  else return;
  renderXmb();
}

/* ================= АВТОИКОНКИ ================= */
function musicFallbackIcon(){
  const c=document.createElement('canvas');c.width=96;c.height=96;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,96,96,0);
  g.addColorStop(0,'#0b1226');g.addColorStop(.55,waveColors[0]);g.addColorStop(1,waveColors[1]);
  x.fillStyle=g;x.fillRect(0,0,96,96);
  x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=3;x.lineCap='round';x.beginPath();
  for(let i=0;i<=96;i+=4){const y=70+Math.sin(i*0.32)*7*Math.sin(i*0.07+1);i?x.lineTo(i,y):x.moveTo(i,y);}
  x.stroke();
  x.strokeStyle='#fff';x.lineWidth=7;x.lineCap='round';x.lineJoin='round';
  x.beginPath();x.moveTo(38,60);x.lineTo(38,24);x.lineTo(66,18);x.lineTo(66,54);x.stroke();
  x.fillStyle='#fff';x.beginPath();x.arc(31,60,10,0,7);x.fill();x.beginPath();x.arc(59,54,10,0,7);x.fill();
  return c.toDataURL('image/png');
}
function blobToDataURL(blob){
  return new Promise((res)=>{
    const r=new FileReader();
    r.onload=()=>res(r.result);
    r.onerror=()=>res(null);
    r.readAsDataURL(blob);
  });
}
function extractAudioCover(blob){
  return new Promise((res)=>{
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const buf=new Uint8Array(reader.result);
        if(buf.length<12){res(null);return;}
        const magic=String.fromCharCode(buf[0],buf[1],buf[2],buf[3]);
        if(magic==='fLaC'){
          let off=4;
          while(off+8<=buf.length){
            const isLast=(buf[off]&0x80)!==0;
            const btype=buf[off]&0x7F;
            const bsz=(buf[off+1]<<16)|(buf[off+2]<<8)|buf[off+3];
            off+=4;
            if(btype===6&&off+32<=buf.length+bsz){
              const blen=Math.min(bsz,buf.length-off);
              const bl=buf.slice(off,off+blen);
              const pt=(bl[0]<<24)|(bl[1]<<16)|(bl[2]<<8)|bl[3];
              const mimLen=(bl[4]<<24)|(bl[5]<<16)|(bl[6]<<8)|bl[7];
              let p=8+mimLen;
              if(p+4>bl.length){off+=blen;if(isLast)break;continue;}
              const descLen=(bl[p]<<24)|(bl[p+1]<<16)|(bl[p+2]<<8)|bl[p+3];p+=4;
              p+=descLen;
              if(p+20>bl.length){off+=blen;if(isLast)break;continue;}
              p+=16;
              const imgLen=(bl[p]<<24)|(bl[p+1]<<16)|(bl[p+2]<<8)|bl[p+3];p+=4;
              if(imgLen>0&&p+imgLen<=bl.length){
                const img=bl.slice(p,p+imgLen);
                const mime=String.fromCharCode(...bl.slice(8,8+mimLen)).toLowerCase();
                const ct=mime==='image/png'?'image/png':'image/jpeg';
                const b=new Blob([img],{type:ct});
                blobToDataURL(b).then(res);return;
              }
            }
            off+=bsz;
            if(isLast)break;
          }
          res(null);return;
        }
        if(magic==='OggS'){
          let pages=[];
          let off=0;
          while(off+27<=buf.length){
            if(String.fromCharCode(buf[off],buf[off+1],buf[off+2],buf[off+3])!=='OggS')break;
            const segCount=buf[off+26];
            if(off+27+segCount>buf.length)break;
            let segTable=[];let pageSz=0;
            for(let s=0;s<segCount;s++){const sl=buf[off+27+s];segTable.push(sl);pageSz+=sl;}
            const pageData=off+27+segCount;
            if(pageData+pageSz>buf.length)break;
            pages.push({data:buf.slice(pageData,pageData+pageSz),segTable});
            off=pageData+pageSz;
          }
          let vorbisData=null;
          for(const pg of pages){
            const d=pg.data;
            if(d.length>=7&&d[0]===0x03&&String.fromCharCode(d[1],d[2],d[3],d[4],d[5],d[6])==='vorbis'){
              vorbisData=d;break;
            }
          }
          if(!vorbisData){res(null);return;}
          const vd=vorbisData;
          let vp=7;
          if(vp+8>vd.length){res(null);return;}
          const userLen=(vd[vp])|(vd[vp+1]<<8)|(vd[vp+2]<<16)|(vd[vp+3]<<24);vp+=4;
          vp+=userLen;
          if(vp+4>vd.length){res(null);return;}
          const fieldCount=(vd[vp])|(vd[vp+1]<<8)|(vd[vp+2]<<16)|(vd[vp+3]<<24);vp+=4;
          for(let f=0;f<fieldCount&&vp<vd.length;f++){
            if(vp+4>vd.length)break;
            const flen=(vd[vp])|(vd[vp+1]<<8)|(vd[vp+2]<<16)|(vd[vp+3]<<24);vp+=4;
            if(vp+flen>vd.length)break;
            const field=String.fromCharCode(...vd.slice(vp,vp+flen));
            vp+=flen;
            const eqIdx=field.indexOf('=');
            if(eqIdx<0)continue;
            const key=field.substring(0,eqIdx).toUpperCase();
            if(key!=='METADATA_BLOCK_PICTURE')continue;
            const b64=field.substring(eqIdx+1);
            const bin=atob(b64);
            const bb=new Uint8Array(bin.length);
            for(let i=0;i<bin.length;i++)bb[i]=bin.charCodeAt(i);
            if(bb.length<32){continue;}
            const pt=(bb[0]<<24)|(bb[1]<<16)|(bb[2]<<8)|bb[3];
            const mimLen=(bb[4]<<24)|(bb[5]<<16)|(bb[6]<<8)|bb[7];
            let mp=8+mimLen;
            if(mp+4>bb.length)continue;
            const descLen=(bb[mp]<<24)|(bb[mp+1]<<16)|(bb[mp+2]<<8)|bb[mp+3];mp+=4;
            mp+=descLen;
            if(mp+20>bb.length)continue;
            mp+=16;
            const imgLen=(bb[mp]<<24)|(bb[mp+1]<<16)|(bb[mp+2]<<8)|bb[mp+3];mp+=4;
            if(imgLen>0&&mp+imgLen<=bb.length){
              const img=bb.slice(mp,mp+imgLen);
              const mime=String.fromCharCode(...bb.slice(8,8+mimLen)).toLowerCase();
              const ct=mime==='image/png'?'image/png':'image/jpeg';
              const b=new Blob([img],{type:ct});
              blobToDataURL(b).then(res);return;
            }
          }
          res(null);return;
        }
        if(String.fromCharCode(buf[0],buf[1],buf[2])!=='ID3'){res(null);return;}
        const ver=buf[3];
        const synSafe=(buf[6]<<21)|(buf[7]<<14)|(buf[8]<<7)|buf[9];
        const tagEnd=10+synSafe;
        let off2=10;
        while(off2+10<=Math.min(tagEnd,buf.length)){
          const fid=String.fromCharCode(buf[off2],buf[off2+1],buf[off2+2],buf[off2+3]);
          if(fid[0]==='\0'||fid[0]===' ')break;
          let fsz;
          if(ver>=4){fsz=(buf[off2+4]<<21)|(buf[off2+5]<<14)|(buf[off2+6]<<7)|buf[off2+7];}
          else{fsz=(buf[off2+4]<<24)|(buf[off2+5]<<16)|(buf[off2+6]<<8)|buf[off2+7];}
          if(fsz<=0||off2+10+fsz>buf.length)break;
          if(fid==='APIC'){
            const fr=buf.slice(off2+10,off2+10+fsz);
            let p2=1;
            while(p2<fr.length&&fr[p2]!==0)p2++;
            p2++;
            if(p2<fr.length)p2++;
            if(p2<fr.length){
              while(p2<fr.length&&fr[p2]!==0)p2++;
              p2++;
            }
            if(p2<fr.length){
              const jpg=fr[p2]===0xFF&&fr[p2+1]===0xD8&&fr[p2+2]===0xFF;
              const png=fr[p2]===0x89&&fr[p2+1]===0x50&&fr[p2+2]===0x4E&&fr[p2+3]===0x47;
              if(jpg||png){
                let end=fr.length;
                if(jpg){for(let i=p2;i<fr.length-1;i++){if(fr[i]===0xFF&&fr[i+1]===0xD9){end=i+2;break;}}}
                else{for(let i=p2;i<fr.length-11;i++){if(fr[i]===0x49&&fr[i+1]===0x45&&fr[i+2]===0x4E&&fr[i+3]===0x44){end=i+12;break;}}}
                const ct=png?'image/png':'image/jpeg';
                const b=new Blob([fr.slice(p2,end)],{type:ct});
                blobToDataURL(b).then(res);return;
              }
            }
          }
          off2+=10+fsz;
        }
        res(null);
      }catch(e){res(null);}
    };
    reader.onerror=()=>res(null);
    reader.readAsArrayBuffer(blob);
  });
}
async function musicAutoIcon(blob){
  if(blob){
    try{
      const url=await extractAudioCover(blob);
      if(url)return url;
    }catch(e){}
  }
  return musicFallbackIcon();
}
function videoAutoIcon(blob){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(blob);
    const v=document.createElement('video');
    v.muted=true;v.playsInline=true;v.preload='auto';v.src=url;
    let captured=false;
    const fail=e=>{URL.revokeObjectURL(url);rej(e instanceof Error?e:new Error('видео не читается'));};
    const capture=()=>{
      if(captured)return;captured=true;
      try{
        const s=256,c=document.createElement('canvas');c.width=s;c.height=s;
        const x=c.getContext('2d');
        const vw=v.videoWidth||16,vh=v.videoHeight||9;
        const sc=Math.max(s/vw,s/vh),dw=vw*sc,dh=vh*sc;
        x.imageSmoothingQuality='high';
        x.drawImage(v,(s-dw)/2,(s-dh)/2,dw,dh);
        URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg',.95));
      }catch(e){fail(e);}
    };
    v.onerror=fail;
    v.onloadeddata=()=>{try{v.currentTime=Math.min(1.5,(v.duration||2)/2);}catch(e){capture();}};
    v.onseeked=capture;
    setTimeout(()=>{if(!captured)capture();},2500);
  });
}
async function generateAutoIcon(type,src){
  if(type==='photo')return await shrinkImage(src,256);
  if(type==='video')return await videoAutoIcon(src);
  if(type==='music')return await musicAutoIcon(src instanceof Blob?src:null);
  return null;
}

/* ================= ДЕЙСТВИЯ ПУНКТОВ ================= */
function activateItem(item){
  if(item.type==='folder'){
    if(!Array.isArray(item.items))item.items=[];
    nav.stack.push(item);nav.idx.push(0);renderXmb();
  }
  else if(item.type==='link'){
    if(!item.url){toast('Нет ссылки','Укажите адрес в админ-панели.','err');return;}
    toast('Открываю ссылку',item.url,'ok');
    window.open(item.url,'_blank','noopener');
  }
  else if(item.type==='music')openMusic(item);
  else if(item.type==='video')openVideo(item);
  else if(item.type==='photo')openPhoto(item);
  else if(item.type==='text')openText(item);
}

/* ================= МУЗЫКА ================= */
const audio=new Audio();
let playlist=[],plIndex=0;
let audioCtx=null,analyser=null,freqData=null;
let mVizMode=0,mRaf=0;
function ensureAnalyser(){
  if(audioCtx)return;
  try{
    audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    const src=audioCtx.createMediaElementSource(audio);
    analyser=audioCtx.createAnalyser();analyser.fftSize=256;analyser.smoothingTimeConstant=.82;
    src.connect(analyser);analyser.connect(audioCtx.destination);
    freqData=new Uint8Array(analyser.frequencyBinCount);
  }catch(e){analyser=null;}
}
function vizLevels(){
  const lv=[.25,.2,.18,.15,.12];
  if(analyser&&!audio.paused){
    analyser.getByteFrequencyData(freqData);
    const band=(a,b)=>{let s=0;for(let i=a;i<Math.min(b,freqData.length);i++)s+=freqData[i];return clamp(s/((Math.min(b,freqData.length)-a)*255),0,1);};
    lv[0]=band(1,8);lv[1]=band(8,24);lv[2]=band(24,56);lv[3]=band(56,96);lv[4]=band(96,160);
  }else{
    const t=performance.now();
    for(let i=0;i<5;i++)lv[i]=.16+.09*Math.sin(t*0.0011+i*1.7);
  }
  return lv;
}
function paintViz(x,w,h,t,mode,lv){
  x.clearRect(0,0,w,h);
  const g=x.createLinearGradient(0,0,0,h);
  if(mode===1){
    const c1=hexRgb(waveColors[0]),c2=hexRgb(waveColors[1]);
    g.addColorStop(0,'rgb('+mix(c1,[5,8,18],.5).join(',')+')');
    g.addColorStop(1,'rgb('+mix(c2,[3,5,12],.72).join(',')+')');
  }else{g.addColorStop(0,'#070a12');g.addColorStop(1,'#000');}
  x.fillStyle=g;x.fillRect(0,0,w,h);
  const cy=h*0.55;
  if(mode===2){
    const N=Math.max(24,Math.floor(w/26)),bw=w/N;
    for(let i=0;i<N;i++){
      const val=clamp(lv[i%5]*(0.55+0.45*Math.abs(Math.sin(i*0.53+t*0.003)))*1.9,.04,1);
      const bh=val*h*0.34;
      const gr=x.createLinearGradient(0,cy-bh,0,cy+bh);
      gr.addColorStop(0,'rgba(140,200,255,.9)');gr.addColorStop(.5,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(60,120,255,.9)');
      x.fillStyle=gr;
      x.fillRect(i*bw+2,cy-bh,bw-4,bh*2);
    }
    return;
  }
  const styles=
    mode===0?['rgba(255,255,255,.92)','rgba(255,255,255,.55)','rgba(205,214,235,.42)','rgba(160,172,205,.32)','rgba(120,132,168,.25)']:
    mode===3?['#4fd2ff','#9d5cff','rgba(79,210,255,.5)','rgba(157,92,255,.45)','rgba(255,255,255,.35)']:null;
  for(let L=0;L<5;L++){
    const amp=h*0.045+(lv[L]||0)*h*0.30;
    x.beginPath();
    if(mode===1)x.moveTo(0,h);
    for(let px=0;px<=w;px+=Math.max(6,w/90)){
      const y=cy+Math.sin(px*0.006+t*0.0006*(L+1)+L*1.9)*amp*(0.6+0.4*Math.sin(t*0.00023+L))+Math.sin(px*0.0023-t*0.0004+L*0.8)*amp*0.6;
      x.lineTo(px,y);
    }
    if(mode===1){
      x.lineTo(w,h);x.closePath();
      const col=mix(hexRgb(waveColors[1]),[255,255,255],.2+L*.08);
      x.fillStyle='rgba('+col.join(',')+','+(0.05+L*0.02)+')';
      x.fill();
    }else{
      x.strokeStyle=styles[L];x.lineWidth=L===0?2:1.2;
      if(mode===3){x.shadowColor=styles[L];x.shadowBlur=10;}else x.shadowBlur=0;
      x.stroke();x.shadowBlur=0;
    }
  }
}
function startMusicViz(){
  cancelAnimationFrame(mRaf);
  const loop=t=>{
    mRaf=requestAnimationFrame(loop);
    const c=$('#mWave');
    if(c.width!==c.clientWidth||c.height!==c.clientHeight){c.width=c.clientWidth;c.height=c.clientHeight;}
    paintViz(c.getContext('2d'),c.width,c.height,t,mVizMode,vizLevels());
  };
  mRaf=requestAnimationFrame(loop);
}
function stopMusicViz(){cancelAnimationFrame(mRaf);}
function buildVizButtons(){
  const host=$('#mVizRow');host.innerHTML='';
  const names=['Линии','Волны','Спектр','Неон'];
  names.forEach((n,i)=>{
    const b=document.createElement('button');b.className='vizBtn'+(i===mVizMode?' active':'');b.title=n;
    const cv=document.createElement('canvas');cv.width=74;cv.height=42;
    paintViz(cv.getContext('2d'),74,42,1200+i*400,i,[.55,.45,.35,.3,.22]);
    b.appendChild(cv);
    b.addEventListener('click',()=>{mVizMode=i;$$('#mVizRow .vizBtn').forEach((x,k)=>x.classList.toggle('active',k===i));});
    host.appendChild(b);
  });
}
function musicPlaylistFrom(item){
  const list=currentItems().filter(i=>i.type==='music');
  return list.length?list:[item];
}
async function playTrack(i){
  if(!playlist.length)return;
  plIndex=(i+playlist.length)%playlist.length;
  const item=playlist[plIndex];
  $('#mTopTitle').textContent='♫  '+item.title;
  $('#mCount').textContent='('+(plIndex+1)+'/'+playlist.length+')';
  $('#mTitle').textContent=item.title;
  $('#mSub').textContent=item.sub||'Неизвестный исполнитель';
  const ext=String(item.fileName||'').split('.').pop().toUpperCase();
  $('#mFormat').textContent=['MP3','WAV','OGG','FLAC','AAC','M4A','OPUS'].includes(ext)?ext:'AUDIO';
  $('#miniTitle').textContent=item.title;$('#miniSub').textContent=item.sub||'Аудио';
  const art=$('#mArt');
  const ic=item.icon||ptfIconSrc(item)||(item.iconAuto?{src:item.iconAuto,ptf:false}:null);
  art.innerHTML=ic?'<img src="'+ic.src+'" alt="">':svgMarkup('music');
  $('#miniArt').innerHTML=art.innerHTML;
  const bg=$('#miniBg');
  if(ic&&ic.src){bg.style.backgroundImage='url('+ic.src+')';bg.classList.add('on');}
  else bg.classList.remove('on');
  if(!item.fileId){toast('Файл не найден','Загрузите аудио в админ-панели.','err');return;}
  audio.src=fileUrl(item.fileId);
  ensureAnalyser();
  if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();
  try{await audio.play();}catch(e){}
  setPlayUI();
}
function setPlayUI(){
  const playing=!audio.paused;
  $('#mPlayPath').setAttribute('d',playing?'M7 5h4v14H7zM13 5h4v14h-4z':'M6 4l14 8-14 8z');
}
function openMusic(item){
  playlist=musicPlaylistFrom(item);
  $('#miniPlayer').classList.remove('on');
  openOverlay('musicOv');
  startMusicViz();
  playTrack(Math.max(0,playlist.indexOf(item)));
}
function closeMusic(){stopMusicViz();closeOverlay('musicOv');$('#miniPlayer').classList.toggle('on',!!audio.src);}
audio.addEventListener('timeupdate',()=>{
  $('#mCur').textContent=fmtTime(audio.currentTime);
  $('#mDur').textContent=fmtTime(audio.duration);
  $('#mBar').style.width=(audio.duration?audio.currentTime/audio.duration*100:0)+'%';
});
audio.addEventListener('ended',()=>playTrack(plIndex+1));
audio.addEventListener('play',setPlayUI);
audio.addEventListener('pause',setPlayUI);
audio.addEventListener('play',()=>{$('#miniPlay').querySelector('svg').innerHTML='<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';});
audio.addEventListener('pause',()=>{$('#miniPlay').querySelector('svg').innerHTML='<path d="M6 4l14 8-14 8z"/>';});
$('#mPlay').addEventListener('click',()=>{ensureAnalyser();if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();if(!audio.src)playTrack(0);else audio.paused?audio.play():audio.pause();});
$('#mNext').addEventListener('click',()=>playTrack(plIndex+1));
$('#mPrev').addEventListener('click',()=>playTrack(plIndex-1));
$('#mProg').addEventListener('click',e=>{
  if(!audio.duration)return;
  const r=e.currentTarget.getBoundingClientRect();
  audio.currentTime=clamp((e.clientX-r.left)/r.width,0,1)*audio.duration;
});
$('#mClose').addEventListener('click',closeMusic);
$('#mVol').addEventListener('input',e=>{audio.volume=parseFloat(e.target.value);});
$('#miniPlay').addEventListener('click',()=>{if(audio.paused)audio.play();else audio.pause();});
$('#miniPrev').addEventListener('click',()=>playTrack(plIndex-1));
$('#miniNext').addEventListener('click',()=>playTrack(plIndex+1));
$('#miniOpen').addEventListener('click',()=>{$('#miniPlayer').classList.remove('on');openOverlay('musicOv');startMusicViz();});
$('#miniArtClose').addEventListener('click',()=>{audio.pause();audio.src='';stopMusicViz();$('#miniPlayer').classList.remove('on');$('#miniBg').classList.remove('on');});
$('#miniVol').addEventListener('input',e=>{audio.volume=parseFloat(e.target.value);});

/* ================= ФОТО (PSP-просмотр) ================= */
let photoList=[],photoIdx=0,photoRot=0,photoZoom=1,photoPanX=0,photoPanY=0,pUrl=null,pDrag=null;
function applyPhotoTransform(){
  $('#pImg').style.transform='translate('+photoPanX+'px,'+photoPanY+'px) rotate('+photoRot+'deg) scale('+photoZoom+')';
  $('#pStage').classList.toggle('zoomed',photoZoom>1);
}
function layoutPhoto(){
  const stage=$('#pStage'),img=$('#pImg');
  const sw=stage.clientWidth,sh=stage.clientHeight;
  const nw=img.naturalWidth||1,nh=img.naturalHeight||1;
  const fit=Math.min(sw/nw,sh/nh);
  img.style.width=(nw*fit)+'px';
  img.style.height=(nh*fit)+'px';
  applyPhotoTransform();
}
async function showPhoto(){
  const item=photoList[photoIdx];
  if(!item)return;
  $('#pTopTitle').textContent=item.title;
  $('#pCount').textContent='('+(photoIdx+1)+'/'+photoList.length+')';
  if(!item.fileId){toast('Файл не найден','Загрузите изображение в админ-панели.','err');return;}
  const img=$('#pImg');
  img.style.opacity='0';
  photoRot=0;photoZoom=1;photoPanX=0;photoPanY=0;
  const url=fileUrl(item.fileId);
  img.onload=()=>{img.style.opacity='1';pUrl=url;layoutPhoto();};
  img.src=url;
  applyPhotoTransform();
}
function openPhoto(item){
  photoList=currentItems().filter(i=>i.type==='photo');
  if(!photoList.length)photoList=[item];
  photoIdx=Math.max(0,photoList.indexOf(item));
  openOverlay('photoOv');
  showPhoto();
}
function photoZoomBy(k){
  photoZoom=clamp(photoZoom*k,1,6);
  if(photoZoom===1){photoPanX=0;photoPanY=0;}
  applyPhotoTransform();
}
$('#pPrev').addEventListener('click',()=>{photoIdx=(photoIdx-1+photoList.length)%photoList.length;showPhoto();});
$('#pNext').addEventListener('click',()=>{photoIdx=(photoIdx+1)%photoList.length;showPhoto();});
$('#pRot').addEventListener('click',()=>{photoRot=(photoRot+90)%360;applyPhotoTransform();});
$('#pZoomIn').addEventListener('click',()=>photoZoomBy(1.25));
$('#pZoomOut').addEventListener('click',()=>photoZoomBy(1/1.25));
$('#pClose').addEventListener('click',()=>closeOverlay('photoOv'));
(function(){
  const stage=$('#pStage');
  stage.addEventListener('dragstart',e=>e.preventDefault());
  stage.addEventListener('pointerdown',e=>{
    if(photoZoom<=1)return;
    e.preventDefault();
    pDrag={x:e.clientX,y:e.clientY,px:photoPanX,py:photoPanY,active:false};
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove',e=>{
    if(!pDrag)return;
    const dx=e.clientX-pDrag.x,dy=e.clientY-pDrag.y;
    if(!pDrag.active && Math.hypot(dx,dy)<6)return;
    if(!pDrag.active){pDrag.active=true;stage.classList.add('dragging');}
    photoPanX=pDrag.px+dx;
    photoPanY=pDrag.py+dy;
    applyPhotoTransform();
  });
  stage.addEventListener('wheel',e=>{if(photoZoom>1||e.deltaY<0){e.preventDefault();photoZoomBy(e.deltaY<0?1.12:1/1.12);}}, {passive:false});
  ['pointerup','pointercancel'].forEach(ev=>stage.addEventListener(ev,()=>{pDrag=null;stage.classList.remove('dragging');}));
  let pinchDist=0,pinchZoom0=1;
  stage.addEventListener('touchstart',e=>{
    if(e.touches.length===2){
      e.preventDefault();
      pinchDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      pinchZoom0=photoZoom;
    }
  },{passive:false});
  stage.addEventListener('touchmove',e=>{
    if(e.touches.length===2){
      e.preventDefault();
      const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      photoZoom=clamp(pinchZoom0*(d/pinchDist),1,6);
      if(photoZoom===1){photoPanX=0;photoPanY=0;}
      applyPhotoTransform();
    }
  },{passive:false});
})();

/* ================= ВИДЕО (PSP-просмотр) ================= */
const videoEl=$('#videoEl');
let videoList=[],videoIdx=0,vHideTimer=0,vUrl=null;
function vPoke(){
  $('#vBar').classList.remove('hide');$('#vTop').classList.remove('hide');
  clearTimeout(vHideTimer);
  vHideTimer=setTimeout(()=>{if(!videoEl.paused){$('#vBar').classList.add('hide');$('#vTop').classList.add('hide');}},2600);
}
async function loadVideo(){
  const item=videoList[videoIdx];
  if(!item)return;
  $('#vTopTitle').textContent=item.title;
  $('#vCount').textContent='('+(videoIdx+1)+'/'+videoList.length+')';
  if(!item.fileId){toast('Файл не найден','Загрузите видео в админ-панели.','err');return;}
  vUrl=fileUrl(item.fileId);
  videoEl.src=vUrl;
  vPoke();
  try{await videoEl.play();}catch(e){}
}
function openVideo(item){
  videoList=currentItems().filter(i=>i.type==='video');
  if(!videoList.length)videoList=[item];
  videoIdx=Math.max(0,videoList.indexOf(item));
  openOverlay('videoOv');
  loadVideo();
}
function closeVideo(){videoEl.pause();videoEl.removeAttribute('src');videoEl.load();vUrl=null;closeOverlay('videoOv');}
function vToggle(){videoEl.paused?videoEl.play():videoEl.pause();vPoke();}
videoEl.addEventListener('click',vToggle);
$('#vPlay').addEventListener('click',vToggle);
$('#vCloseTop').addEventListener('click',closeVideo);
$('#vNext').addEventListener('click',()=>{videoIdx=(videoIdx+1)%videoList.length;loadVideo();});
$('#vPrev').addEventListener('click',()=>{videoIdx=(videoIdx-1+videoList.length)%videoList.length;loadVideo();});
$('#videoOv').addEventListener('mousemove',vPoke);
$('#videoOv').addEventListener('touchstart',vPoke,{passive:true});
$('#vVol').addEventListener('input',e=>{videoEl.volume=parseFloat(e.target.value);});
$('#vVolBtn').addEventListener('click',()=>{$('#videoOv .mVolPop').classList.toggle('show');});
document.addEventListener('click',e=>{if(!e.target.closest('.mVolWrap'))$$('.mVolPop.show').forEach(p=>p.classList.remove('show'));});
videoEl.addEventListener('timeupdate',()=>{
  $('#vCur').textContent=fmtTime(videoEl.currentTime);
  $('#vDur').textContent=fmtTime(videoEl.duration);
  $('#vBarFill').style.width=(videoEl.duration?videoEl.currentTime/videoEl.duration*100:0)+'%';
  $('#vPlayPath').setAttribute('d',videoEl.paused?'M6 4l14 8-14 8z':'M7 5h4v14H7zM13 5h4v14h-4z');
});
videoEl.addEventListener('play',vPoke);
$('#vProg').addEventListener('click',e=>{
  if(!videoEl.duration)return;
  const r=e.currentTarget.getBoundingClientRect();
  videoEl.currentTime=clamp((e.clientX-r.left)/r.width,0,1)*videoEl.duration;
  vPoke();
});

/* ================= ТЕКСТ ================= */
function openText(item){
  const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  let md=esc(item.text||'').replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^# (.*)$/gm,'<h1>$1</h1>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n/g,'<br>');
  $('#tpTitle').textContent=item.title;
  $('#tpSub').textContent=item.sub||'';
  $('#tpSub').style.display=item.sub?'block':'none';
  $('#tpBody').innerHTML=md;
  nav.textOpen=true;
  renderXmb();
  requestAnimationFrame(()=>$('#textPanel').classList.add('open'));
}
function closeText(){
  nav.textOpen=false;
  $('#textPanel').classList.remove('open');
  renderXmb();
}
$('#tpClose').addEventListener('click',closeText);

function openOverlay(id){$('#'+id).classList.add('open');}
function closeOverlay(id){$('#'+id).classList.remove('open');}
function anyOverlayOpen(){return ['musicOv','videoOv','photoOv'].some(id=>$('#'+id).classList.contains('open'))||nav.textOpen;}
function closeTopOverlay(){
  if(nav.textOpen)closeText();
  else if($('#photoOv').classList.contains('open'))closeOverlay('photoOv');
  else if($('#videoOv').classList.contains('open'))closeVideo();
  else if($('#musicOv').classList.contains('open'))closeMusic();
}

/* ================= ТЕМЫ ================= */
function themeColorApply(colorIdx){
  const idx=(colorIdx===0)?(new Date().getMonth()+1):clamp(colorIdx||0,1,12);
  waveColors=MONTH_COLORS[idx]||MONTH_COLORS[8];
}
async function applyTheme(themeId,opts={}){
  try{
    let parsed=themeCache.get(themeId);
    if(!parsed){
      const blob=await idbGet('files','theme:'+themeId);
      if(!blob)throw new Error('Файл темы не найден в хранилище.');
      const buf=await (blob instanceof Blob?blob.arrayBuffer():Promise.resolve(blob instanceof ArrayBuffer?blob:new Uint8Array(blob).buffer));
      parsed=await parsePtfTheme(buf);
      themeCache.set(themeId,parsed);
    }
    curTheme=parsed;
    setWallpaper(parsed.wallpaper);
    themeColorApply(parsed.color);
    config.activeThemeId=themeId;saveConfig();
    renderXmb();renderThemes();
    if($('#itemModal')&&$('#itemModal').classList.contains('open'))populatePtfIconSelect();
    if(!opts.silent)toast('Тема применена',parsed.title||'PTF-тема','ok');
  }catch(e){
    console.error(e);
    toast('Не удалось применить тему',e.message,'err');
  }
}
function clearTheme(){
  curTheme=null;config.activeThemeId=null;saveConfig();
  setWallpaper(null);themeColorApply(0);
  renderXmb();renderThemes();
  if($('#itemModal')&&$('#itemModal').classList.contains('open'))populatePtfIconSelect();
  toast('Стандартный вид','Тема отключена.','ok');
}

/* ================= АДМИН-ЗАГЛУШКИ ================= */
/* These are overridden by admin.js when loaded */
function renderThemes(){}
function populatePtfIconSelect(){}

/* ================= КЛАВИАТУРА / ТАЧ ================= */
addEventListener('keydown',e=>{
  const tag=(document.activeElement&&document.activeElement.tagName)||'';
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'){
    if(e.key==='Escape')document.activeElement.blur();
    return;
  }
  if($('#itemModal')&&$('#itemModal').classList.contains('open')){
    if(e.key==='Escape')$('#itemModal').classList.remove('open');
    return;
  }
  if($('#musicOv').classList.contains('open')){
    if(e.key==='Escape')closeMusic();
    else if(e.key===' '){e.preventDefault();$('#mPlay').click();}
    else if(e.key==='ArrowRight')playTrack(plIndex+1);
    else if(e.key==='ArrowLeft')playTrack(plIndex-1);
    return;
  }
  if($('#photoOv').classList.contains('open')){
    if(e.key==='Escape')closeOverlay('photoOv');
    else if(e.key==='ArrowRight')$('#pNext').click();
    else if(e.key==='ArrowLeft')$('#pPrev').click();
    else if(e.key==='+'||e.key==='=')photoZoomBy(1.25);
    else if(e.key==='-'||e.key==='_')photoZoomBy(1/1.25);
    else if(e.key==='r'||e.key==='R'||e.key==='к'||e.key==='К')$('#pRot').click();
    return;
  }
  if($('#videoOv').classList.contains('open')){
    if(e.key==='Escape')closeVideo();
    else if(e.key===' '){e.preventDefault();vToggle();}
    else if(e.key==='ArrowRight'){videoEl.currentTime=Math.min(videoEl.duration||0,videoEl.currentTime+10);vPoke();}
    else if(e.key==='ArrowLeft'){videoEl.currentTime=Math.max(0,videoEl.currentTime-10);vPoke();}
    return;
  }
  if(nav.textOpen){
    if(e.key==='Escape')closeText();
    return;
  }
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' ','Escape'].includes(e.key)){
    e.preventDefault();moveNav(e.key);
  }
});
let touchX=0,touchY=0,touchT=0;
$('#stage').addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;touchT=Date.now();},{passive:true});
$('#stage').addEventListener('touchend',e=>{
  if(anyOverlayOpen())return;
  const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;
  if(Math.abs(dx)<50&&Math.abs(dy)<50){
    if(Date.now()-touchT<300){
      const t=e.target;
      if(!t.closest('.cat')&&!t.closest('.xitem'))moveNav('Enter');
    }
    return;
  }
  if(Date.now()-touchT>800)return;
  if(Math.abs(dx)>Math.abs(dy))moveNav(dx<0?'ArrowRight':'ArrowLeft');
  else moveNav(dy<0?'ArrowDown':'ArrowUp');
},{passive:true});

/* ================= ЗАПУСК ================= */
(async function boot(){
  computeU();layoutWave();buildVizButtons();
  try{
    const saved=await idbGet('kv','config');
    if(saved&&saved.sections)config=saved;
  }catch(e){}
  if(!config.fonts)config.fonts={list:[],roles:{cat:'',title:'',sub:''}};
  if(!config.fonts.roles)config.fonts.roles={cat:'',title:'',sub:''};
  if(config.iconScale==null)config.iconScale=1;
  if(!visibleSections().length)config.sections[0].visible=true;
  applySiteName();applyHints();
  await bootFonts();
  if(config.randomThemes&&config.themes.length){
    const t=config.themes[Math.floor(Math.random()*config.themes.length)];
    await applyTheme(t.id,{silent:true});
    setTimeout(()=>toast('Случайная тема',(t.title||t.name),'ok'),1600);
  }else if(config.activeThemeId){
    await applyTheme(config.activeThemeId,{silent:true});
  }else themeColorApply(0);
  renderXmb();
  $('#stage').classList.add('on');
  setTimeout(()=>$('#boot').classList.add('off'),1050);
})();

/* ================= ПОЛНОЭКРАН ================= */
let fsPromptShown=false;
function toggleFullscreen(){
  if(!document.fullscreenElement&&!document.webkitFullscreenElement){
    const el=document.documentElement;
    (el.requestFullscreen||el.webkitRequestFullscreen||el.mozRequestFullScreen||el.msRequestFullscreen).call(el);
  }else{
    (document.exitFullscreen||document.webkitExitFullscreen||document.mozCancelFullScreen||document.msExitFullscreen).call(document);
  }
}
$('#fsBtn').addEventListener('click',e=>{e.stopPropagation();toggleFullscreen();});
$('#fsBtn').addEventListener('touchend',e=>{e.stopPropagation();});
$('#fsYes').addEventListener('click',()=>{$('#fsPrompt').classList.remove('show');toggleFullscreen();});
$('#fsNo').addEventListener('click',()=>{$('#fsPrompt').classList.remove('show');});
if(!localStorage.getItem('fsPrompted')){
  addEventListener('orientationchange',()=>{
    if(!fsPromptShown&&screen.orientation&&screen.orientation.type.includes('landscape')){
      fsPromptShown=true;
      localStorage.setItem('fsPrompted','1');
      setTimeout(()=>$('#fsPrompt').classList.add('show'),500);
    }
  });
}

/* ================= ЭКСПОРТ ДЛЯ ADMIN.JS ================= */
function applySiteName(){const n=(config.siteName||'XMB HOME').trim()||'XMB HOME';$('#siteLabel').textContent=n;$('#bootName').textContent=n;document.title=n+' · PSP-страница';}
function applyHints(){$('#hintBar').style.display=config.showHints?'':'none';}
window.XMB={
  $, $$, uid, clamp, get config(){return config;}, set config(v){config=v;}, saveConfig,
  get authToken(){return authToken;}, set authToken(v){authToken=v;},
  fileUrl,
  get curTheme(){return curTheme;},
  themeCache, nav, PSP, ICONS, svgMarkup,
  DEFAULT_SECTION_ICON, TYPE_ICON, TYPE_LABEL, CAT_RU, FIRST_RU,
  renderXmb, openOverlay, closeOverlay, activateItem, showPhoto, loadVideo,
  visibleSections, sectionIconSrc, explicitIconSrc, isMediaType,
  applyTheme, clearTheme, applySiteName, applyHints, fontFaces,
  loadFontFace, applyFonts, dbOpen, idbGet, idbSet, idbDel,
  toast, fmtBytes, baseName, shrinkImage, generateAutoIcon, downscaleURL, parsePtfTheme,
  get renderThemes(){return renderThemes;},
  get populatePtfIconSelect(){return populatePtfIconSelect;},
  renderAdminAll: ()=>{}
};
