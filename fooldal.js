// document.addEventListener('DOMContentLoaded', function() {
//     const spanFelhasznalo = document.getElementById('felhasznalonevMegjelenites');
//     const kerdesekLista = document.getElementById('kerdesekLista');
//     const loading = document.querySelector('.loading');

//     fetch('./api/users.php')
//         .then(res => res.json())
//         .then(data => {
//             if (data.loggedIn) {
//                 spanFelhasznalo.textContent = data.name;
//             } else {
//                 spanFelhasznalo.textContent = 'Vendég';
//                 alert('Nem vagy bejelentkezve! Átirányítás a bejelentkezéshez.');
//                 window.location.href = '/bejelentkezes.html';
//             }
//         })
//         .catch(err => {
//             console.error('Hiba a felhasználó lekérésében:', err);
//             spanFelhasznalo.textContent = 'Vendég';
//         });

//     fetch('./api/questions.php')
//         .then(r => r.json())
//         .then(data => {
//             if (data.error) throw new Error(data.error);

//             kerdesekLista.innerHTML = '';

//             if (data.length === 0) {
//                 kerdesekLista.innerHTML = `
//                     <div class="empty-state">
//                         <h3>Nincsenek elérhető kérdések</h3>
//                         <p>Jelenleg nincs aktív szavazás.</p>
//                     </div>`;
//             } else {
//                 data.forEach(kerdes => {
//                     const card = document.createElement('div');
//                     card.className = 'question-card';
//                     card.innerHTML = `
//                         <div class="question-header">
//                             <p class="question-text">${kerdes.qtext}</p>
//                             <div class="question-meta">
//                                 <span class="vote-count">
//                                     <span class="vote-count-badge">${kerdes.vote_count} szavazat</span>
//                                 </span>
//                             </div>
//                         </div>
//                         <div class="question-actions">
//                             <button class="btn-vote" data-qid="${kerdes.qid}">Szavazás</button>
//                             <a href="eredmenyek.html?qid=${kerdes.qid}" class="btn-results">Eredmények</a>
//                         </div>
//                     `;
//                     kerdesekLista.appendChild(card);
//                 });

//                 document.querySelectorAll('.btn-vote').forEach(gomb => {
//                     gomb.addEventListener('click', function() {
//                         const qid = this.getAttribute('data-qid');
//                         window.location.href = `szavazas.html?qid=${qid}`;
//                     });
//                 });
//             }

//             if (loading) loading.style.display = 'none';
//         })
//         .catch(err => {
//             console.error('Hiba a kérdések betöltésekor:', err);
//             kerdesekLista.innerHTML = `
//                 <div class="empty-state">
//                     <h3>Hiba történt</h3>
//                     <p>Nem sikerült betölteni a kérdéseket.</p>
//                 </div>`;
//             if (loading) loading.style.display = 'none';
//         });
// });

/* ═══════════════════════════════════════════════════════════
   KIRÁLYSÁG — script.js  (Napsütéses)
═══════════════════════════════════════════════════════════ */

'use strict';

const T = {
  gateOpen:   3200,   // ms – gate starts opening
  introExit:  5800,   // ms – intro fades
  roomReady:  6200,   // ms – throne room fades in
};

/* ── SUN RAYS ── */
(function buildSunRays() {
  const wrap = document.getElementById('sun-rays');
  if (!wrap) return;
  for (let i = 0; i < 12; i++) {
    const r = document.createElement('div');
    r.className = 'sun-ray';
    const angle = i * 30;
    const len   = 80 + Math.random() * 60;
    r.style.cssText = `
      transform: rotate(${angle}deg) translateX(-1px);
      height: ${len}px;
      opacity: ${0.25 + Math.random() * 0.35};
    `;
    wrap.appendChild(r);
  }
})();

/* ── CLOUDS ── */
(function buildClouds() {
  const sky = document.querySelector('.sky');
  if (!sky) return;

  const clouds = [
    { top:'12%', cd:'38s', cdo:'-10s', w:160, h:52 },
    { top:'7%',  cd:'55s', cdo:'-28s', w:220, h:70 },
    { top:'20%', cd:'45s', cdo:'-18s', w:130, h:44 },
    { top:'15%', cd:'70s', cdo:'-40s', w:190, h:60 },
  ];

  clouds.forEach(c => {
    const wrap = document.createElement('div');
    wrap.className = 'cloud';
    wrap.style.cssText = `top:${c.top}; --cd:${c.cd}; --cdo:${c.cdo};`;
    wrap.innerHTML = buildCloudSVG(c.w, c.h);
    sky.appendChild(wrap);
  });

  function buildCloudSVG(w, h) {
    const cx = w / 2, cy = h * 0.65;
    const rx = w * 0.46, ry = h * 0.32;
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="white" opacity=".92"/>
      <ellipse cx="${cx*.56}" cy="${cy - ry*.6}" rx="${rx*.46}" ry="${ry*.75}" fill="white" opacity=".95"/>
      <ellipse cx="${cx*1.2}" cy="${cy - ry*.5}" rx="${rx*.38}" ry="${ry*.7}" fill="white" opacity=".92"/>
      <ellipse cx="${cx}" cy="${cy - ry*.85}" rx="${rx*.32}" ry="${ry*.65}" fill="white" opacity=".9"/>
    </svg>`;
  }
})();

/* ── BIRDS ── */
(function buildBirds() {
  const sky = document.querySelector('.sky');
  if (!sky) return;
  const emojis = ['🐦','🐦','🦅'];
  for (let i = 0; i < 5; i++) {
    const b = document.createElement('div');
    b.className = 'bird';
    b.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    b.style.cssText = `
      top:${8+Math.random()*22}%;
      --bf:${14+Math.random()*12}s;
      --bfo:${-Math.random()*14}s;
      --by:${(Math.random()*30-15).toFixed(0)}px;
      font-size:${10+Math.random()*8}px;
    `;
    sky.appendChild(b);
  }
})();

/* ── FLOWERS / GRASS ── */
(function buildFlowers() {
  const scene = document.getElementById('scene');
  if (!scene) return;
  const blooms = ['🌸','🌼','🌺','🌻','🌷'];
  const positions = [
    {fl:'4%',fb:'14%'},{fl:'12%',fb:'16%'},{fl:'20%',fb:'13%'},
    {fl:'72%',fb:'14%'},{fl:'80%',fb:'16%'},{fl:'88%',fb:'13%'},
    {fl:'94%',fb:'15%'},
  ];
  positions.forEach((pos, i) => {
    const f = document.createElement('div');
    f.className = 'flower';
    f.textContent = blooms[i % blooms.length];
    f.style.cssText = `--fl:${pos.fl}; --fb:${pos.fb}; --fd:${(i*0.4).toFixed(1)}s; --fs:${11+Math.random()*5}px;`;
    scene.appendChild(f);
  });
})();

/* ── GATE OPEN SEQUENCE ── */
setTimeout(() => {
  const left  = document.getElementById('gate-left');
  const right = document.getElementById('gate-right');
  const glow  = document.getElementById('gate-glow');
  if (left)  left.classList.add('open');
  if (right) right.classList.add('open');
  if (glow)  glow.classList.add('open');

  /* Subtle boom via Web Audio */
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(90, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(18, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc.start(); osc.stop(ctx.currentTime + 0.7);
  } catch(_) {}
}, T.gateOpen);

/* ── CLEANUP INTRO ── */
setTimeout(() => {
  const intro = document.getElementById('intro');
  if (intro) {
    intro.style.pointerEvents = 'none';
    setTimeout(() => intro.remove(), 1000);
  }
}, T.introExit);

/* ── USER INFO ── */
(function loadUser() {
  const span = document.getElementById('felhasznalonevMegjelenites');
  if (!span) return;
  fetch('./api/users.php')
    .then(r => r.json())
    .then(d => {
      if (d.loggedIn) {
        span.textContent = d.name;
      } else {
        span.textContent = 'Vendég';
        setTimeout(() => { window.location.href = '/index.html'; }, 300);
      }
    })
    .catch(() => { span.textContent = 'Vendég'; });
})();

/* ── QUESTIONS ── */
(function loadQuestions() {
  const lista   = document.getElementById('kerdesekLista');
  const loading = document.querySelector('.loading');
  if (!lista) return;

  fetch('./api/questions.php')
    .then(r => r.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      lista.innerHTML = '';

      if (!data.length) {
        lista.innerHTML = `
          <div class="empty-state">
            <h3>Nincsenek kérdések</h3>
            <p>Jelenleg nincs aktív szavazás.</p>
          </div>`;
        return;
      }

      data.forEach((k, i) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.style.setProperty('--cd', `${7.2 + i * 0.14}s`);
        card.innerHTML = `
          <span class="card-orn tl">❧</span>
          <span class="card-orn tr">❧</span>
          <p class="q-text">${escHtml(k.qtext)}</p>
          <div class="q-meta">
            <span class="vote-badge">${k.vote_count} szavazat</span>
          </div>
          <div class="card-actions">
            <button class="btn-vote" data-qid="${k.qid}">⚔ Szavazás</button>
            <a href="eredmenyek.html?qid=${k.qid}" class="btn-results">📜 Eredmények</a>
          </div>`;
        lista.appendChild(card);
      });

      lista.querySelectorAll('.btn-vote').forEach(btn => {
        btn.addEventListener('click', function() {
          window.location.href = `szavazas.html?qid=${this.dataset.qid}`;
        });
      });
    })
    .catch(err => {
      console.error('[Királyság]', err);
      lista.innerHTML = `
        <div class="empty-state">
          <h3>⚠ Hiba történt</h3>
          <p>Nem sikerült betölteni a kérdéseket.</p>
        </div>`;
    })
    .finally(() => { if (loading) loading.style.display = 'none'; });
})();

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}