(function(){
/* ================= ADMIN.JS — Админ-панель для XMB ================= */
const XMB=window.XMB;
const $=XMB.$;
const $$=XMB.$$;
const uid=XMB.uid;

/* ================= ОТКРЫТИЕ / ЗАКРЫТИЕ ================= */
function openAdmin(){$('#adminPanel').classList.add('open');$('#adminBackdrop').classList.add('on');renderAdminAll();}
function closeAdmin(){$('#adminPanel').classList.remove('open');$('#adminBackdrop').classList.remove('on');}
$('#fabAdmin').addEventListener('click',openAdmin);
$('#admClose').addEventListener('click',closeAdmin);
$('#adminBackdrop').addEventListener('click',closeAdmin);
$$('.admTab').forEach(t=>t.addEventListener('click',()=>{
  $$('.admTab').forEach(x=>x.classList.remove('active'));
  $$('.pane').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');$('#'+t.dataset.tab).classList.add('active');
}));

function renderAdminAll(){renderSections();renderItemsTab();renderThemes();renderSettingsTab();}

/* ================= РАЗДЕЛЫ ================= */
function renderSections(){
  const host=$('#sectionList');host.innerHTML='';
  XMB.config.sections.forEach((sec,i)=>{
    const row=document.createElement('div');row.className='rowCard'+(sec.visible?'':' off');
    const iconBtn=document.createElement('button');iconBtn.className='secIconBtn';iconBtn.title='Заменить иконку';
    const ic=XMB.sectionIconSrc(sec);
    if(ic){const img=document.createElement('img');img.src=ic.src;iconBtn.appendChild(img);}
    else iconBtn.innerHTML=XMB.svgMarkup(XMB.DEFAULT_SECTION_ICON[sec.key]||'star');
    iconBtn.addEventListener('click',async()=>{
      const inp=document.createElement('input');inp.type='file';inp.accept='image/*';
      inp.onchange=async()=>{
        const f=inp.files[0];if(!f)return;
        try{sec.icon=await XMB.shrinkImage(f,256);XMB.saveConfig();XMB.renderXmb();renderSections();toast('Иконка обновлена',sec.title,'ok');}
        catch(e){toast('Не удалось загрузить',e.message,'err');}
      };
      inp.click();
    });
    const main=document.createElement('div');main.className='rowMain';
    const title=document.createElement('input');title.type='text';title.value=sec.title;title.maxLength=32;
    title.style.cssText='background:transparent;border:none;outline:none;font-weight:700;font-size:13px;width:100%;padding:2px 0;color:var(--text)';
    title.addEventListener('input',()=>{sec.title=title.value;XMB.saveConfig();XMB.renderXmb();});
    const sub=document.createElement('div');sub.className='rowSub';
    sub.textContent=sec.items.length+' пункт(ов)'+(sec.icon?' · своя иконка':'');
    main.append(title,sub);
    const sw=document.createElement('label');sw.className='switch';
    sw.innerHTML='<input type="checkbox"'+(sec.visible?' checked':'')+'><i></i>';
    sw.querySelector('input').addEventListener('change',e=>{
      sec.visible=e.target.checked;XMB.saveConfig();
      XMB.nav.cat=XMB.clamp(XMB.nav.cat,0,Math.max(0,XMB.visibleSections().length-1));resetNav();
      XMB.renderXmb();renderSections();
    });
    const up=mkMini('M12 19V5M5 12l7-7 7 7',()=>moveRow(XMB.config.sections,i,-1,renderSections));
    const dn=mkMini('M12 5v14M19 12l-7 7-7-7',()=>moveRow(XMB.config.sections,i,1,renderSections));
    up.disabled=i===0;dn.disabled=i===XMB.config.sections.length-1;
    if(sec.icon){
      const rst=mkMini('M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',()=>{sec.icon=null;XMB.saveConfig();XMB.renderXmb();renderSections();});
      rst.title='Вернуть стандартную иконку';
      row.append(iconBtn,main,rst,up,dn,sw);
    }else row.append(iconBtn,main,up,dn,sw);
    host.appendChild(row);
  });
}
function resetNav(){XMB.nav.stack=[];XMB.nav.idx=[0];}
function mkMini(path,fn){
  const b=document.createElement('button');b.className='miniBtn';
  b.innerHTML='<svg viewBox="0 0 24 24"><path d="'+path+'"/></svg>';
  b.addEventListener('click',fn);return b;
}
function moveRow(arr,i,dir,rerender){
  const j=i+dir;if(j<0||j>=arr.length)return;
  [arr[i],arr[j]]=[arr[j],arr[i]];
  XMB.saveConfig();XMB.renderXmb();rerender();
}

/* ================= ПУНКТЫ ================= */
let adminSectionIdx=0,adminPath=[];
function adminSection(){return XMB.config.sections[XMB.clamp(adminSectionIdx,0,XMB.config.sections.length-1)];}
function adminContainer(){
  const sec=adminSection();
  let list=sec.items;
  for(const f of adminPath)list=f.items||[];
  return list;
}
function renderItemsTab(){
  const selEl=$('#itemSectionSelect');
  selEl.innerHTML='';
  XMB.config.sections.forEach((s,i)=>{
    const o=document.createElement('option');o.value=i;o.textContent=s.title;selEl.appendChild(o);
  });
  selEl.value=XMB.clamp(adminSectionIdx,0,XMB.config.sections.length-1);
  selEl.onchange=()=>{adminSectionIdx=+selEl.value;adminPath=[];renderItemsTab();};
  const cr=$('#itemCrumb');cr.innerHTML='';
  const root=document.createElement('button');root.textContent=adminSection().title;
  root.addEventListener('click',()=>{adminPath=[];renderItemsTab();});
  cr.appendChild(root);
  adminPath.forEach((f,depth)=>{
    const sep=document.createElement('span');sep.className='sep';sep.textContent='›';cr.appendChild(sep);
    const b=document.createElement('button');b.textContent=f.title;
    b.addEventListener('click',()=>{adminPath=adminPath.slice(0,depth+1);renderItemsTab();});
    cr.appendChild(b);
  });
  const host=$('#itemList');host.innerHTML='';
  const list=adminContainer();
  if(!list.length){
    const d=document.createElement('div');d.className='admNote';d.style.marginTop='4px';
    d.textContent='Здесь пока пусто. Нажмите «Добавить пункт».';host.appendChild(d);return;
  }
  list.forEach((item,i)=>{
    const row=document.createElement('div');row.className='rowCard';
    const icon=document.createElement('div');icon.className='itmIcon';
    const ic=XMB.explicitIconSrc(item);
    if(ic){const img=document.createElement('img');img.src=ic.src;icon.appendChild(img);}
    else icon.innerHTML=XMB.svgMarkup(XMB.TYPE_ICON[item.type]||'star');
    const main=document.createElement('div');main.className='rowMain';
    const t=document.createElement('div');t.className='rowTitle';
    t.appendChild(document.createTextNode(item.title||'Без названия'));
    const chip=document.createElement('span');chip.className='chip '+item.type;chip.textContent=XMB.TYPE_LABEL[item.type];
    t.appendChild(chip);
    if(item.iconPtf){
      const pc=document.createElement('span');pc.className='chip';pc.style.cssText='background:rgba(157,92,255,.1);color:#c9a4ff;border-color:rgba(157,92,255,.3)';pc.textContent='из темы';
      t.appendChild(pc);
    }
    if(item.autoIcon&&XMB.isMediaType(item.type)){
      const ac=document.createElement('span');ac.className='chip';ac.style.cssText='background:rgba(70,214,147,.1);color:#9df0c6;border-color:rgba(70,214,147,.3)';ac.textContent='авто-иконка';
      t.appendChild(ac);
    }
    const sub=document.createElement('div');sub.className='rowSub';
    sub.textContent=item.type==='folder'?(item.items?item.items.length:0)+' вложенных':item.sub||item.url||(item.fileId?'файл загружен':'');
    main.append(t,sub);
    const up=mkMini('M12 19V5M5 12l7-7 7 7',()=>moveRow(list,i,-1,renderItemsTab));
    const dn=mkMini('M12 5v14M19 12l-7 7-7-7',()=>moveRow(list,i,1,renderItemsTab));
    up.disabled=i===0;dn.disabled=i===list.length-1;
    const ed=mkMini('M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',()=>openItemModal(item));
    ed.title='Редактировать';
    const del=mkMini('M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13',()=>{
      if(confirm('Удалить «'+item.title+'»?')){list.splice(i,1);XMB.saveConfig();XMB.renderXmb();renderItemsTab();}
    });
    del.className='miniBtn danger';del.title='Удалить';
    if(item.type==='folder'){
      const open=mkMini('M3 7h7l2 2h9v10H3z',()=>{adminPath.push(item);renderItemsTab();});
      open.title='Открыть папку';
      row.append(icon,main,up,dn,open,ed,del);
    }else row.append(icon,main,up,dn,ed,del);
    host.appendChild(row);
  });
}
$('#addItemBtn').addEventListener('click',()=>openItemModal(null));
$('#bulkUploadInput').addEventListener('change',async e=>{
  const files=[...e.target.files];e.target.value='';
  if(!files.length)return;
  const list=adminContainer();
  const AUDIO_EXT=['mp3','wav','ogg','flac','aac','m4a','opus','wma'];
  const VIDEO_EXT=['mp4','webm','avi','mkv','mov','wmv','flv','m4v'];
  const PHOTO_EXT=['jpg','jpeg','png','gif','webp','bmp','svg','tiff','ico'];
  function detectType(f){
    const ext=f.name.split('.').pop().toLowerCase();
    if(AUDIO_EXT.includes(ext))return'music';
    if(VIDEO_EXT.includes(ext))return'video';
    if(PHOTO_EXT.includes(ext))return'photo';
    if(f.type.startsWith('audio/'))return'music';
    if(f.type.startsWith('video/'))return'video';
    if(f.type.startsWith('image/'))return'photo';
    return'link';
  }
  const baseName=n=>n.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim();
  let added=0;
  for(const f of files){
    const type=detectType(f);
    const item={id:uid(),type,title:baseName(f.name)||f.name,autoIcon:true};
    list.push(item);
    if(XMB.isMediaType(type)){
      try{
        const fid=uid();
        await XMB.idbSet('files',fid,f);
        item.fileId=fid;item.fileName=f.name;
        try{item.iconAuto=await XMB.generateAutoIcon(type,f);}catch(e){}
      }catch(e){}
    }
    added++;
  }
  XMB.saveConfig();XMB.renderXmb();renderItemsTab();
  toast('Файлы добавлены','Загружено файлов: '+added,'ok');
});

/* ================= МОДАЛКА ПУНКТА ================= */
let editingItem=null,editingList=null,editingIcon=null,editingFile=null,titlePristine=true;
const ICON_PLACEHOLDER='<svg viewBox="0 0 24 24" fill="none" stroke="#cfe2ff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
function populatePtfIconSelect(){
  const sel=$('#imIconPtf');sel.innerHTML='';
  const o0=document.createElement('option');o0.value='';o0.textContent='— не использовать —';sel.appendChild(o0);
  if(!XMB.curTheme){
    const o=document.createElement('option');o.disabled=true;o.textContent='PTF-тема не загружена';sel.appendChild(o);
  }else{
    const g1=document.createElement('optgroup');g1.label='Категории';
    for(let s=1;s<=8;s++){
      if(XMB.curTheme.cats[s]){const o=document.createElement('option');o.value='cat:'+s;o.textContent=XMB.CAT_RU[s]||('Категория '+s);g1.appendChild(o);}
    }
    if(g1.children.length)sel.appendChild(g1);
    const g2=document.createElement('optgroup');g2.label='Первый уровень (пункты)';
    Object.keys(XMB.curTheme.first).map(Number).sort((a,b)=>a-b).forEach(id=>{
      const o=document.createElement('option');o.value='first:'+id;o.textContent=XMB.FIRST_RU[id]||('Пункт '+id);g2.appendChild(o);
    });
    if(g2.children.length)sel.appendChild(g2);
    const g3=document.createElement('optgroup');g3.label='Второй уровень (подменю)';
    Object.keys(XMB.curTheme.second).map(Number).sort((a,b)=>a-b).forEach(id=>{
      const o=document.createElement('option');o.value='second:'+id;o.textContent=id===0?'Иконка A':id===2?'Иконка B':'Слот '+id;g3.appendChild(o);
    });
    if(g3.children.length)sel.appendChild(g3);
  }
  const want=editingItem&&editingItem.iconPtf?editingItem.iconPtf:'';
  sel.value=[...sel.options].some(o=>o.value===want)?want:'';
}
function openItemModal(item){
  editingItem=item;
  editingList=adminContainer();
  editingIcon=item?item.icon:null;
  editingFile=null;
  titlePristine=true;
  $('#imTitleH').textContent=item?'Редактировать пункт':'Новый пункт';
  $('#imType').value=item?item.type:'link';
  $('#imTitle').value=item?item.title:'';
  $('#imSub').value=item?(item.sub||''):'';
  $('#imUrl').value=item?(item.url||''):'';
  $('#imText').value=item?(item.text||''):'';
  $('#imFileName').textContent=item&&item.fileId?(item.fileName||'файл загружен'):'файл не выбран';
  $('#imAutoIcon').checked=item?(!!item.autoIcon):true;
  $('#imDelete').style.display=item?'inline-flex':'none';
  $('#imIconPrev').innerHTML=editingIcon?'<img src="'+editingIcon+'">':ICON_PLACEHOLDER;
  $('#imFile').value='';
  populatePtfIconSelect();
  modalFileType();
  $('#itemModal').classList.add('open');
  setTimeout(()=>$('#imTitle').focus(),80);
}
function modalFileType(){
  const t=$('#imType').value;
  $('#imUrlBox').style.display=t==='link'?'block':'none';
  $('#imTextBox').style.display=t==='text'?'block':'none';
  const media=XMB.isMediaType(t);
  $('#imFileBox').style.display=media?'block':'none';
  $('#imFile').accept=t==='music'?'audio/*':t==='video'?'video/*':'image/*';
  $('#imFileLabel').textContent=t==='music'?'Аудиофайл':t==='video'?'Видеофайл':'Изображение';
}
$('#imType').addEventListener('change',modalFileType);
$('#imTitle').addEventListener('input',()=>{titlePristine=false;});
$('#imFile').addEventListener('change',e=>{
  const f=e.target.files[0];if(!f)return;
  editingFile=f;
  $('#imFileName').textContent=f.name+' ('+XMB.fmtBytes(f.size)+')';
  if(titlePristine){$('#imTitle').value=XMB.baseName(f.name)||$('#imTitle').value;}
});
$('#imIconFile').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{editingIcon=await XMB.shrinkImage(f,256);$('#imIconPrev').innerHTML='<img src="'+editingIcon+'">';}
  catch(err){toast('Не удалось загрузить иконку',err.message,'err');}
  e.target.value='';
});
$('#imIconClear').addEventListener('click',()=>{editingIcon=null;$('#imIconPrev').innerHTML=ICON_PLACEHOLDER;});
$('#imCancel').addEventListener('click',()=>$('#itemModal').classList.remove('open'));
$('#imDelete').addEventListener('click',()=>{
  if(editingItem&&confirm('Удалить «'+editingItem.title+'»?')){
    const i=editingList.indexOf(editingItem);
    if(i>=0)editingList.splice(i,1);
    XMB.saveConfig();XMB.renderXmb();renderItemsTab();
    $('#itemModal').classList.remove('open');
  }
});
$('#imSave').addEventListener('click',async()=>{
  const type=$('#imType').value;
  const title=$('#imTitle').value.trim()||'Без названия';
  if(!editingItem){editingItem={id:uid(),type,title,items:type==='folder'?[]:undefined};editingList.push(editingItem);}
  if(editingItem.type==='folder'&&type!=='folder')delete editingItem.items;
  if(type==='folder'&&!Array.isArray(editingItem.items))editingItem.items=[];
  editingItem.type=type;
  editingItem.title=title;
  editingItem.sub=$('#imSub').value.trim();
  editingItem.icon=editingIcon;
  editingItem.iconPtf=$('#imIconPtf').value||null;
  if(type==='link')editingItem.url=$('#imUrl').value.trim();
  if(type==='text')editingItem.text=$('#imText').value;
  const media=XMB.isMediaType(type);
  if(media){
    editingItem.autoIcon=$('#imAutoIcon').checked;
    if(editingItem.autoIcon){
      let src=editingFile;
      if(!src&&editingItem.fileId)src=await XMB.idbGet('files',editingItem.fileId);
      if(src||type==='music'){
        try{
          editingItem.iconAuto=await XMB.generateAutoIcon(type,src);
          if(editingItem.iconAuto)toast('Авто-иконка','Создана из медиа и будет показана в меню.','ok');
        }catch(err){console.error(err);toast('Авто-иконка','Не удалось сгенерировать: '+err.message,'err');}
      }
    }else editingItem.iconAuto=null;
    if(editingFile){
      try{
        const fid=uid();
        await XMB.idbSet('files',fid,editingFile);
        editingItem.fileId=fid;editingItem.fileName=editingFile.name;
        if(editingItem.autoIcon){
          try{editingItem.iconAuto=await XMB.generateAutoIcon(type,editingFile);}catch(e){}
        }
      }catch(e){toast('Файл не сохранён',e.message,'err');}
    }
  }else{editingItem.autoIcon=false;}
  XMB.saveConfig();XMB.renderXmb();renderItemsTab();
  $('#itemModal').classList.remove('open');
  toast('Сохранено','Пункт «'+title+'» обновлён.','ok');
});

/* ================= ТЕМЫ ================= */
function renderThemes(){
  const host=$('#themeList');host.innerHTML='';
  const none=document.createElement('div');none.className='themeCard'+(!XMB.config.activeThemeId?' active':'');
  none.innerHTML='<div class="themePrev">Aa</div>';
  const ni=document.createElement('div');ni.className='themeInfo';
  ni.innerHTML='<b>Стандартный вид</b><span>Анимированные волны в цвете месяца</span>';
  const na=document.createElement('div');na.className='themeActs';
  const nb=document.createElement('button');nb.className='miniText'+(!XMB.config.activeThemeId?' on':'');nb.textContent=!XMB.config.activeThemeId?'Активна':'Применить';
  nb.addEventListener('click',XMB.clearTheme);
  na.appendChild(nb);none.append(ni,na);host.appendChild(none);
  XMB.config.themes.forEach(t=>{
    const card=document.createElement('div');card.className='themeCard'+(XMB.config.activeThemeId===t.id?' active':'');
    const prev=document.createElement('div');prev.className='themePrev';
    if(t.preview)prev.style.backgroundImage='url('+t.preview+')';else prev.textContent='PTF';
    const info=document.createElement('div');info.className='themeInfo';
    info.innerHTML='<b></b><span></span>';
    info.querySelector('b').textContent=t.title||t.name;
    info.querySelector('span').textContent=XMB.fmtBytes(t.size)+' · '+(t.name||'');
    const acts=document.createElement('div');acts.className='themeActs';
    const apply=document.createElement('button');apply.className='miniText'+(XMB.config.activeThemeId===t.id?' on':'');
    apply.textContent=XMB.config.activeThemeId===t.id?'Активна':'Применить';
    apply.addEventListener('click',()=>XMB.applyTheme(t.id));
    const del=document.createElement('button');del.className='miniText del';del.textContent='Удалить';
    del.addEventListener('click',async()=>{
      if(!confirm('Удалить тему «'+(t.title||t.name)+'»?'))return;
      await XMB.idbDel('files','theme:'+t.id);
      XMB.themeCache.delete(t.id);
      XMB.config.themes=XMB.config.themes.filter(x=>x.id!==t.id);
      if(XMB.config.activeThemeId===t.id){XMB.config.activeThemeId=null;XMB.clearTheme();}
      XMB.saveConfig();renderThemes();toast('Тема удалена',t.title||t.name,'ok');
    });
    acts.append(apply,del);card.append(prev,info,acts);host.appendChild(card);
  });
  $('#randomThemeToggle').checked=!!XMB.config.randomThemes;
}
$('#randomThemeToggle').addEventListener('change',e=>{XMB.config.randomThemes=e.target.checked;XMB.saveConfig();});
$('#themeFileInput').addEventListener('change',async e=>{
  const files=[...e.target.files];e.target.value='';
  if(!files.length)return;
  let loaded=0,failed=0,skipped=0;
  for(const f of files){
    if(!f.name.toLowerCase().endsWith('.ptf')){failed++;continue;}
    if(XMB.config.themes.some(t=>t.name===f.name)){skipped++;continue;}
    try{
      const buf=await f.arrayBuffer();
      const parsed=await XMB.parsePtfTheme(buf);
      const id=uid();
      await XMB.idbSet('files','theme:'+id,buf);
      XMB.themeCache.set(id,parsed);
      const preview=parsed.preview?await XMB.downscaleURL(parsed.preview,172,100):(parsed.wallpaper?await XMB.downscaleURL(parsed.wallpaper,172,100):null);
      XMB.config.themes.push({id,name:f.name,title:parsed.title,size:f.size,preview});
      loaded++;
    }catch(err){console.error(err);failed++;}
  }
  if(loaded){XMB.saveConfig();renderThemes();toast('Загружено тем: '+loaded,skipped?'Пропущено дублей: '+skipped:'Готово','ok');XMB.applyTheme(XMB.config.themes[XMB.config.themes.length-loaded].id);}
  else if(skipped)toast('Все темы уже есть','Дубли пропущены','ok');
  if(failed)toast('Не загружено: '+failed,'Проверьте формат файлов','err');
});

/* ================= ШРИФТЫ ================= */
function renderFonts(){
  const list=(XMB.config.fonts&&XMB.config.fonts.list)||[];
  const host=$('#fontList');host.innerHTML='';
  if(!list.length){
    const d=document.createElement('div');d.className='admNote';d.textContent='База шрифтов пуста. Загрузите ttf / otf / woff / woff2.';
    host.appendChild(d);
  }
  list.forEach(f=>{
    const row=document.createElement('div');row.className='rowCard';
    const ic=document.createElement('div');ic.className='itmIcon';
    ic.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#cfe2ff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 20L11 4h2l6 16M7 15h10"/></svg>';
    const main=document.createElement('div');main.className='rowMain';
    const t=document.createElement('div');t.className='rowTitle';t.textContent=f.name;
    const sub=document.createElement('div');sub.className='rowSub';sub.textContent='сохранён локально';
    main.append(t,sub);
    const del=mkMini('M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13',async()=>{
      if(!confirm('Удалить шрифт «'+f.name+'»?'))return;
      await XMB.idbDel('files','font:'+f.id);
      const fam=XMB.fontFaces.get(f.id);
      if(fam){const face=[...document.fonts].find(x=>x.family===fam);if(face)document.fonts.delete(face);XMB.fontFaces.delete(f.id);}
      XMB.config.fonts.list=XMB.config.fonts.list.filter(x=>x.id!==f.id);
      for(const r of ['cat','title','sub'])if(XMB.config.fonts.roles[r]===f.id)XMB.config.fonts.roles[r]='';
      XMB.saveConfig();XMB.applyFonts();renderFonts();XMB.renderXmb();
      toast('Шрифт удалён',f.name,'ok');
    });
    del.className='miniBtn danger';
    row.append(ic,main,del);host.appendChild(row);
  });
  [['#fontCat','cat'],['#fontTitle','title'],['#fontSub','sub']].forEach(([selId,role])=>{
    const sel=$(selId);sel.innerHTML='';
    const o0=document.createElement('option');o0.value='';o0.textContent='Стандартный (Manrope)';sel.appendChild(o0);
    list.forEach(f=>{const o=document.createElement('option');o.value=f.id;o.textContent=f.name;sel.appendChild(o);});
    sel.value=XMB.config.fonts.roles[role]||'';
    sel.onchange=()=>{XMB.config.fonts.roles[role]=sel.value;XMB.saveConfig();XMB.applyFonts();XMB.renderXmb();};
  });
}
$('#fontFileInput').addEventListener('change',async e=>{
  const files=[...e.target.files];e.target.value='';
  if(!files.length)return;
  for(const f of files){
    try{
      const id=uid();
      await XMB.idbSet('files','font:'+id,await f.arrayBuffer());
      XMB.config.fonts.list.push({id,name:f.name.replace(/\.[^.]+$/,'')});
      await XMB.loadFontFace(id);
      toast('Шрифт добавлен',f.name,'ok');
    }catch(err){toast('Не удалось загрузить шрифт',f.name,'err');}
  }
  XMB.saveConfig();XMB.applyFonts();renderFonts();XMB.renderXmb();
});

/* ================= НАСТРОЙКИ ================= */
function renderSettingsTab(){
  $('#siteNameInput').value=XMB.config.siteName;
  $('#hintsToggle').checked=!!XMB.config.showHints;
  $('#iconScaleRange').value=XMB.config.iconScale||1;
  $('#iconScaleVal').textContent=(XMB.config.iconScale||1).toFixed(2);
}
$('#siteNameInput').addEventListener('input',e=>{XMB.config.siteName=e.target.value;XMB.applySiteName();XMB.saveConfig();});
$('#hintsToggle').addEventListener('change',e=>{XMB.config.showHints=e.target.checked;XMB.saveConfig();XMB.applyHints();});
$('#iconScaleRange').addEventListener('input',e=>{
  XMB.config.iconScale=+e.target.value;
  $('#iconScaleVal').textContent=XMB.config.iconScale.toFixed(2);
  XMB.saveConfig();XMB.renderXmb();
});
$('#resetAllBtn').addEventListener('click',async()=>{
  if(!confirm('Сбросить ВСЁ: разделы, пункты, файлы, шрифты и темы? Действие необратимо.'))return;
  try{
    const headers={};
    if(XMB.authToken)headers['Authorization']='Bearer '+XMB.authToken;
    await fetch('/api/reset',{method:'DELETE',headers});
  }catch(e){}
  location.reload();
});

/* ================= ПЕРЕКЛЮЧЕНИЕ АДМИН-КЛАВИАТУРЫ ================= */
addEventListener('keydown',e=>{
  const tag=(document.activeElement&&document.activeElement.tagName)||'';
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')return;
  if($('#adminPanel').classList.contains('open')){
    if(e.key==='Escape')closeAdmin();
    return;
  }
  if(e.code==='KeyA'||e.key==='F2'){e.preventDefault();openAdmin();return;}
});
})();
