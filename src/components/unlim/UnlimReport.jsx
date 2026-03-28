/**
 * UnlimReport — FUMETTO ELAB della lezione
 * Stile visivo dei volumi ELAB: mascotte robot, pannelli comic, foto breadboard.
 * Il docente aggiunge screenshot e foto direttamente nel fumetto, poi stampa → PDF.
 * Usa solo DOM methods sicuri (no innerHTML/document.write).
 * © Andrea Marro — 28/03/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import { getSavedSessions, getLastSession } from '../../hooks/useSessionTracker';
import { getLessonPath } from '../../data/lesson-paths';

// ─── Helpers ────────────────────────────────────────────────────────

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDuration(start, end) {
  if (!start || !end) return '\u2014';
  const min = Math.round((new Date(end) - new Date(start)) / 60000);
  if (min < 1) return '< 1 min';
  return `${min} min`;
}

function esc(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function humanize(id) {
  const m = {
    led_base: 'LED', resistenza_ohm: 'Legge di Ohm', circuito_serie: 'Serie',
    circuito_parallelo: 'Parallelo', condensatore_energia: 'Condensatore',
    carica_scarica_RC: 'RC', controllo_indiretto: 'Controllo indiretto',
    catena_reazione: 'Catena', potenziometro: 'Potenziometro',
    fotoresistore: 'LDR', pwm_duty: 'PWM', servo_angolo: 'Servo',
    digitalRead: 'digitalRead', analogRead: 'analogRead',
    digitalWrite: 'digitalWrite', analogWrite: 'analogWrite/PWM',
    tau_RC: '\u03C4 RC', R_varia_scarica: 'R scarica',
    multimetro_tensione: 'Multimetro V', scarica_esponenziale: 'Scarica exp',
  };
  return m[id] || id.replace(/_/g, ' ');
}

function volumeColor(expId) {
  if (!expId) return '#1E4D8C';
  if (expId.startsWith('v1')) return '#4A7A25';
  if (expId.startsWith('v2')) return '#E8941C';
  if (expId.startsWith('v3')) return '#E54B3D';
  return '#1E4D8C';
}

function volumeNum(expId) {
  if (!expId) return '';
  if (expId.startsWith('v1')) return '1';
  if (expId.startsWith('v2')) return '2';
  if (expId.startsWith('v3')) return '3';
  return '';
}

function buildScenes(session, lessonPath) {
  const scenes = [];
  const msgs = session?.messages || [];
  const errs = session?.errors || [];

  if (lessonPath?.title) {
    scenes.push({
      type: 'intro',
      title: lessonPath.title,
      text: lessonPath.objective || 'Scopriamo insieme qualcosa di nuovo!',
    });
  }

  let pairIdx = 0;
  const titles = [
    'Si comincia!', 'Andiamo avanti...', 'Approfondiamo!', 'Che curiosit\u00E0!',
    'Ancora...', 'Un passo in pi\u00F9', 'Quasi alla fine!', 'Ecco!'
  ];
  for (let i = 0; i < msgs.length; i++) {
    if (msgs[i].role === 'user') {
      const resp = msgs[i + 1]?.role === 'assistant' ? msgs[i + 1] : null;
      const t0 = msgs[i].timestamp ? new Date(msgs[i].timestamp).getTime() : 0;
      const t1 = resp?.timestamp ? new Date(resp.timestamp).getTime() : t0 + 60000;
      const sceneErrs = (!t0) ? [] : errs.filter(e => {
        if (!e.timestamp) return false;
        const t = new Date(e.timestamp).getTime();
        return t >= t0 - 5000 && t <= t1 + 5000;
      });

      let title = titles[pairIdx % titles.length];
      const q = msgs[i].text.toLowerCase();
      if (sceneErrs.length) title = 'Oops!';
      else if (q.includes('cos\'') || q.includes('cosa ')) title = 'Domandona!';
      else if (q.includes('perch')) title = 'Perch\u00E9?';
      else if (q.includes('funzion')) title = 'Come funziona?';
      else if (q.includes('aiut') || q.includes('help')) title = 'Aiuto!';

      scenes.push({
        type: 'dialog', title,
        question: msgs[i], answer: resp, errors: sceneErrs,
      });
      if (resp) i++;
      pairIdx++;
    }
  }

  scenes.push({
    type: 'finale',
    concepts: lessonPath?.session_save?.concepts_covered || [],
    nextId: lessonPath?.session_save?.next_suggested || null,
  });

  return scenes;
}

function captureSimulatorScreenshot() {
  const svg = document.querySelector('.simulator-canvas svg, [data-simulator-canvas] svg');
  if (!svg) return null;
  try {
    const clone = svg.cloneNode(true);
    const { width, height } = svg.getBoundingClientRect();
    clone.setAttribute('width', width);
    clone.setAttribute('height', height);
    const data = new XMLSerializer().serializeToString(clone);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);
  } catch {
    return null;
  }
}

// ─── Photo slot helper (used in template) ───────────────────────────

function photoSlotHTML(idx) {
  return `
    <div class="photo-slot no-print" data-scene="${idx}">
      <button class="add-photo-btn" onclick="addPhoto(${idx})">\u{1F4F7} Aggiungi foto</button>
      <span class="photo-hint">Breadboard, circuito, classe...</span>
    </div>
    <div class="photo-container" id="photos-${idx}"></div>`;
}

// ─── HTML Builder ───────────────────────────────────────────────────

function buildReportHTML(session, lessonPath, screenshotDataUrl) {
  const title = lessonPath?.title || session?.experimentId || 'Sessione ELAB';
  const date = formatDate(session?.startTime);
  const dur = formatDuration(session?.startTime, session?.endTime);
  const nMsg = session?.messages?.length || 0;
  const nErr = session?.errors?.length || 0;
  const concepts = lessonPath?.session_save?.concepts_covered || [];
  const volCol = volumeColor(session?.experimentId);
  const volN = volumeNum(session?.experimentId);
  const nextPath = lessonPath?.session_save?.next_suggested
    ? getLessonPath(lessonPath.session_save.next_suggested) : null;

  const scenes = buildScenes(session, lessonPath);

  const scenesHTML = scenes.map((sc, idx) => {
    const num = idx + 1;

    if (sc.type === 'intro') {
      return `
      <div class="panel panel-intro" style="border-color:${volCol}">
        <div class="panel-tag" style="background:${volCol}">Scena ${num}</div>
        <div class="panel-body intro-body">
          <img src="/assets/mascot/robot_excited.png" class="mascot" alt="Robot ELAB" onerror="this.style.display='none'">
          <div>
            <h2 class="intro-title">${esc(sc.title)}</h2>
            <p class="intro-text">${esc(sc.text)}</p>
            ${volN ? `<span class="vol-badge" style="background:${volCol}">Volume ${volN}</span>` : ''}
          </div>
        </div>
        ${photoSlotHTML(idx)}
      </div>`;
    }

    if (sc.type === 'dialog') {
      const hasErr = sc.errors.length > 0;
      const bc = hasErr ? '#D32F2F' : volCol;
      const qT = formatTime(sc.question.timestamp);
      const aT = sc.answer ? formatTime(sc.answer.timestamp) : '';

      return `
      <div class="panel" style="border-color:${bc}">
        <div class="panel-tag" style="background:${bc}">${hasErr ? '\u26A1 ' : ''}Scena ${num} \u2014 ${esc(sc.title)}</div>
        <div class="comic-row">
          <div class="char"><div class="char-face face-student">\u{1F9D1}\u200D\u{1F3EB}</div><div class="char-label">Classe</div></div>
          <div class="balloon balloon-q"><span class="balloon-time">${qT}</span>${esc(sc.question.text)}<div class="balloon-tail tail-left"></div></div>
        </div>
        ${sc.errors.map(e => `<div class="error-strip"><span class="error-boom">\u{1F4A5}</span><span><strong>Oops!</strong> ${esc(e.detail || e.type)}</span></div>`).join('')}
        ${sc.answer ? `
        <div class="comic-row row-flip">
          <div class="balloon balloon-a"><span class="balloon-time">${aT}</span>${esc(sc.answer.text)}<div class="balloon-tail tail-right"></div></div>
          <div class="char"><img src="/assets/mascot/robot_full.png" class="char-face face-robot" alt="UNLIM" onerror="this.outerHTML='\u{1F916}'"><div class="char-label" style="color:${volCol}">UNLIM</div></div>
        </div>` : ''}
        ${photoSlotHTML(idx)}
      </div>`;
    }

    if (sc.type === 'finale') {
      const pills = sc.concepts.length > 0
        ? sc.concepts.map(c => `<span class="pill" style="background:${volCol}20;color:${volCol};border-color:${volCol}50">${esc(humanize(c))}</span>`).join('')
        : '<span class="pill pill-empty">Sessione libera</span>';

      return `
      <div class="panel panel-finale" style="border-color:${volCol}">
        <div class="panel-tag" style="background:${volCol}">Scena ${num} \u2014 Traguardo!</div>
        <div class="panel-body finale-body">
          <img src="/assets/mascot/robot_excited.png" class="mascot" alt="Robot ELAB" onerror="this.style.display='none'">
          <div>
            <h2 class="finale-title">\u{1F3C6} Missione completata!</h2>
            <p class="finale-label">Concetti conquistati:</p>
            <div class="pills">${pills}</div>
            ${nErr > 0 ? `<p class="finale-err">\u{1F4AA} ${nErr} ${nErr === 1 ? 'errore superato' : 'errori superati'} \u2014 sbagliando si impara!</p>` : '<p class="finale-err">\u2728 Zero errori \u2014 sessione perfetta!</p>'}
            ${nextPath ? `<div class="next-box" style="border-color:${volCol}40">\u{1F4DA} <strong>Prossima avventura:</strong> ${esc(nextPath.title)}</div>` : ''}
          </div>
        </div>
        ${photoSlotHTML(idx)}
      </div>`;
    }
    return '';
  }).join('');

  const screenshotHTML = screenshotDataUrl
    ? `<div class="panel panel-screenshot" style="border-color:${volCol}">
        <div class="panel-tag" style="background:${volCol}">\u{1F4F8} Il nostro circuito</div>
        <div class="screenshot-wrap"><img src="${screenshotDataUrl}" alt="Screenshot circuito" class="screenshot-img"></div>
       </div>` : '';

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fumetto ELAB \u2014 ${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Open Sans',system-ui,sans-serif;color:#1A1A2E;background:#E8E8F0;line-height:1.55}
@media print{
  body{background:#fff}
  .no-print{display:none!important}
  .wrap{box-shadow:none;margin:0;max-width:none;border-radius:0}
  .cover-page{break-after:page}
  .panel{break-inside:avoid}
  .panel-finale{break-before:page}
  @page{margin:1cm 1.4cm;size:A4}
}
.wrap{max-width:840px;margin:0 auto;background:#fff;border-radius:18px;box-shadow:0 6px 30px rgba(0,0,0,0.1);overflow:hidden}
.toolbar{position:sticky;top:0;z-index:100;background:#fff;padding:12px 20px;display:flex;justify-content:center;gap:10px;border-bottom:1px solid #E0E0E0;box-shadow:0 2px 8px rgba(0,0,0,0.05);flex-wrap:wrap}
.tb{padding:10px 24px;font-size:14px;font-weight:700;font-family:'Oswald',sans-serif;letter-spacing:.5px;border:none;border-radius:8px;cursor:pointer;transition:.15s}
.tb-pr{background:#1E4D8C;color:#fff}.tb-pr:hover{background:#163B6C}
.tb-sc{background:#F0F2F5;color:#1E4D8C}.tb-sc:hover{background:#E0E4EA}
.tb-photo{background:${volCol};color:#fff}.tb-photo:hover{filter:brightness(0.9)}
.cover-page{background:linear-gradient(135deg,${volCol} 0%,#1E4D8C 100%);color:#fff;padding:56px 36px;text-align:center;position:relative;overflow:hidden}
.cover-page::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E");opacity:.6}
.cover-inner{position:relative;z-index:1}
.cover-mascot{width:100px;height:100px;border-radius:24px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;margin:0 auto 12px}
.cover-mascot img{width:80px;height:80px;object-fit:contain}
.cover-h1{font-family:'Oswald',sans-serif;font-size:32px;font-weight:700;letter-spacing:-.5px;margin-bottom:4px}
.cover-sub{font-family:'Oswald',sans-serif;font-size:20px;font-weight:500;opacity:.9}
.cover-meta{font-size:14px;opacity:.7;margin-top:8px}
.cover-badge{display:inline-block;background:rgba(255,255,255,.18);padding:5px 16px;border-radius:20px;font-size:12px;letter-spacing:.5px;margin-top:8px;font-weight:700}
.stats{display:flex;border-bottom:2px solid #F0F0F0}
.st{flex:1;text-align:center;padding:16px 8px;border-right:1px solid #F0F0F0}
.st:last-child{border:none}
.st-v{font-family:'Oswald',sans-serif;font-size:24px;font-weight:700;color:${volCol}}
.st-l{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-top:2px}
.comic-grid{padding:20px 24px;display:flex;flex-direction:column;gap:18px}
.panel{border:3px solid #1E4D8C;border-radius:18px;padding:20px 22px;position:relative;background:#FAFBFE}
.panel-tag{position:absolute;top:-13px;left:18px;background:#1E4D8C;color:#fff;font-family:'Oswald',sans-serif;font-size:12px;font-weight:700;padding:3px 14px;border-radius:10px;letter-spacing:.4px;text-transform:uppercase;white-space:nowrap}
.panel-intro,.panel-finale{background:linear-gradient(135deg,#FAFFFE,#F0F8F0)}
.intro-body,.finale-body{display:flex;align-items:center;gap:20px;margin-top:8px}
.mascot{width:80px;height:80px;object-fit:contain;flex-shrink:0;border-radius:16px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.12))}
.intro-title,.finale-title{font-family:'Oswald',sans-serif;font-size:22px;color:#1E4D8C}
.intro-text{font-size:15px;color:#444;margin-top:4px}
.vol-badge{display:inline-block;color:#fff;padding:3px 12px;border-radius:12px;font-size:11px;font-weight:700;margin-top:8px}
.finale-label{font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.4px;margin-top:8px}
.pills{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.pill{padding:5px 12px;border-radius:16px;font-size:12px;font-weight:700;border:1.5px solid}
.pill-empty{background:#F5F5F5;color:#999;border-color:#E0E0E0}
.finale-err{font-size:14px;margin-top:10px;color:#444}
.next-box{margin-top:12px;padding:12px 16px;border-radius:12px;background:#F0FFF4;border:1.5px solid;font-size:14px;color:#2D5A1A}
.comic-row{display:flex;align-items:flex-start;gap:10px;margin:12px 0}
.row-flip{flex-direction:row-reverse}
.char{text-align:center;flex-shrink:0;width:52px}
.char-face{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto}
.face-student{background:#E3ECFA;border:2px solid #B8CCE8}
.face-robot{background:#E3F5E3;border:2px solid #B8D8B8;object-fit:contain;padding:2px}
.char-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;color:#888;margin-top:3px}
.balloon{flex:1;padding:14px 18px;border-radius:18px;font-size:14px;line-height:1.5;position:relative;word-wrap:break-word}
.balloon-q{background:#E3ECFA;border:2px solid #B8CCE8}
.balloon-a{background:#E3F5E3;border:2px solid #B8D8B8}
.balloon-tail{position:absolute;bottom:12px;width:0;height:0}
.tail-left{left:-10px;border-top:8px solid transparent;border-bottom:8px solid transparent;border-right:10px solid #B8CCE8}
.tail-right{right:-10px;border-top:8px solid transparent;border-bottom:8px solid transparent;border-left:10px solid #B8D8B8}
.balloon-time{position:absolute;top:5px;right:10px;font-size:9px;color:#aaa;font-weight:600}
.error-strip{display:flex;align-items:center;gap:8px;margin:6px 0 8px 62px;padding:8px 14px;background:#FFF3E0;border:1.5px solid #FFCC80;border-radius:10px;font-size:13px;color:#BF360C}
.error-boom{font-size:18px}
.panel-screenshot{text-align:center}
.screenshot-wrap{margin-top:8px}
.screenshot-img{max-width:100%;border-radius:12px;border:2px solid #E0E0E0}
.photo-slot{margin-top:10px;text-align:center}
.add-photo-btn{padding:6px 16px;border:2px dashed #B0BEC5;border-radius:8px;background:transparent;color:#607D8B;font-size:12px;font-family:'Open Sans',sans-serif;cursor:pointer;transition:.15s}
.add-photo-btn:hover{border-color:#1E4D8C;color:#1E4D8C;background:#F0F4F8}
.photo-hint{display:block;font-size:10px;color:#aaa;margin-top:2px}
.photo-container{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;justify-content:center}
.photo-container img{max-width:240px;max-height:180px;border-radius:12px;border:2px solid #E0E0E0;object-fit:cover}
.photo-wrapper{position:relative;display:inline-block}
.photo-remove{position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;border:2px solid #fff;background:#D32F2F;color:#fff;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,.2)}
.footer{text-align:center;padding:16px 24px;border-top:1px solid #E8E8E8;font-size:12px;color:#999}
.footer a{color:#1E4D8C;text-decoration:none;font-weight:700}
</style>
</head>
<body>
<div class="toolbar no-print">
  <button class="tb tb-pr" onclick="window.print()">\u{1F5A8}\uFE0F STAMPA / SALVA PDF</button>
  <button class="tb tb-photo" onclick="addPhotoGlobal()">\u{1F4F7} AGGIUNGI FOTO</button>
  <button class="tb tb-sc" onclick="addScreenshot()">\u{1F4F8} SCREENSHOT CIRCUITO</button>
  <button class="tb tb-sc" onclick="window.close()">CHIUDI</button>
</div>
<div class="wrap">
  <div class="cover-page">
    <div class="cover-inner">
      <div class="cover-mascot"><img src="/assets/mascot/robot_full.png" alt="ELAB Robot" onerror="this.parentElement.textContent='\u{1F4A1}'"></div>
      <h1 class="cover-h1">${esc(title)}</h1>
      <div class="cover-sub">Il Fumetto della Lezione</div>
      <div class="cover-meta">${date} \u00B7 ${dur} \u00B7 ${nMsg} messaggi</div>
      <div class="cover-badge">ELAB Tutor${volN ? ' \u2014 Volume ' + volN : ''}</div>
    </div>
  </div>
  <div class="stats">
    <div class="st"><div class="st-v">${dur}</div><div class="st-l">Durata</div></div>
    <div class="st"><div class="st-v">${nMsg}</div><div class="st-l">Domande</div></div>
    <div class="st"><div class="st-v">${nErr}</div><div class="st-l">${nErr === 1 ? 'Errore' : 'Errori'}</div></div>
    <div class="st"><div class="st-v">${concepts.length}</div><div class="st-l">Concetti</div></div>
  </div>
  ${screenshotHTML}
  <div class="comic-grid">
    ${scenesHTML}
  </div>
  <div class="footer">
    <a href="https://elabtutor.school">elabtutor.school</a> &mdash; ELAB Tutor &mdash; ${date}
  </div>
</div>
<script>
function addPhoto(sceneIdx){
  var inp=document.createElement('input');
  inp.type='file';inp.accept='image/*';inp.capture='environment';inp.multiple=true;
  inp.onchange=function(e){
    Array.from(e.target.files).forEach(function(f){
      var r=new FileReader();
      r.onload=function(ev){
        var c=document.getElementById('photos-'+sceneIdx);if(!c)return;
        var w=document.createElement('div');w.className='photo-wrapper';
        var img=document.createElement('img');img.src=ev.target.result;img.alt='Foto';
        w.appendChild(img);
        var btn=document.createElement('button');btn.className='photo-remove no-print';
        btn.textContent='\\u00D7';
        btn.onclick=function(){w.remove()};w.appendChild(btn);
        c.appendChild(w);
      };r.readAsDataURL(f);
    });
  };inp.click();
}
function addPhotoGlobal(){
  var slots=document.querySelectorAll('.photo-slot');
  if(slots.length>0){
    var last=slots[slots.length-1];
    addPhoto(Number(last.dataset.scene)||0);
  }
}
function addScreenshot(){
  var inp=document.createElement('input');
  inp.type='file';inp.accept='image/*';
  inp.onchange=function(e){
    var f=e.target.files[0];if(!f)return;
    var r=new FileReader();
    r.onload=function(ev){
      var grid=document.querySelector('.comic-grid');
      if(!grid)return;
      var div=document.createElement('div');
      div.className='panel panel-screenshot';
      div.style.borderColor='${volCol}';
      var tag=document.createElement('div');
      tag.className='panel-tag';tag.style.background='${volCol}';
      tag.textContent='\u{1F4F8} Il nostro circuito';
      div.appendChild(tag);
      var wrap=document.createElement('div');wrap.className='screenshot-wrap';
      var pw=document.createElement('div');pw.className='photo-wrapper';
      var img=document.createElement('img');img.src=ev.target.result;img.alt='Circuito';img.className='screenshot-img';
      pw.appendChild(img);
      var rm=document.createElement('button');rm.className='photo-remove no-print';rm.textContent='\\u00D7';
      rm.onclick=function(){div.remove()};pw.appendChild(rm);
      wrap.appendChild(pw);div.appendChild(wrap);
      grid.insertBefore(div,grid.firstChild);
    };r.readAsDataURL(f);
  };inp.click();
}
<\/script>
</body>
</html>`;
}

// ─── Public API ─────────────────────────────────────────────────────

export function openReportWindow(experimentId) {
  let session;
  if (experimentId) {
    const sessions = getSavedSessions();
    session = [...sessions].reverse().find(s => s.experimentId === experimentId);
  }
  if (!session) session = getLastSession();

  if (!session || (!session.messages?.length && !session.errors?.length)) {
    return false;
  }

  const lessonPath = getLessonPath(session.experimentId);
  const screenshot = captureSimulatorScreenshot();
  const html = buildReportHTML(session, lessonPath, screenshot);

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const popup = window.open(url, '_blank');

  if (!popup) {
    // Popup bloccato (comune su LIM scolastiche) → fallback: download file HTML
    const a = document.createElement('a');
    a.href = url;
    a.download = `fumetto-elab-${session.experimentId || 'sessione'}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return 'downloaded';
  }

  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return true;
}

export function isReportCommand(text) {
  if (!text) return false;
  const l = text.toLowerCase().trim();
  return [
    /^(crea|genera|fai|apri|mostra|stampa)\s+(il\s+)?(report|fumetto)$/,
    /^(report|fumetto)$/,
    /^(report|fumetto)\s+(della\s+)?(sessione|lezione)$/,
  ].some(p => p.test(l));
}

