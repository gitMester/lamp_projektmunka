'use strict';

/* ═══════════════════════════════════════════════════════════
   KIRÁLYSÁG — szavazas_new.js
   Marketplace animations + voting logic
═══════════════════════════════════════════════════════════ */

/* ── SUN RAYS ── */
(function buildSunRays() {
  const wrap = document.getElementById('sunRays');
  if (!wrap) return;
  for (let i = 0; i < 12; i++) {
    const r = document.createElement('div');
    const angle = i * 30;
    const len = 50 + Math.random() * 40;
    r.style.cssText = `
      position:absolute; left:50%; top:50%;
      width:2px; height:${len}px;
      background:linear-gradient(to bottom, rgba(255,220,60,.5), transparent);
      transform-origin:0 0;
      transform:rotate(${angle}deg) translateX(-1px);
      opacity:${0.2 + Math.random() * 0.3};
      border-radius:1px;
      animation: sunSpin 20s linear infinite;
    `;
    wrap.appendChild(r);
  }
  // inject keyframe if not present
  if (!document.getElementById('sunSpinKF')) {
    const s = document.createElement('style');
    s.id = 'sunSpinKF';
    s.textContent = '@keyframes sunSpin { to { transform: rotate(360deg); } }';
    document.head.appendChild(s);
  }
})();

/* ── CLOUDS ── */
(function buildClouds() {
  const sky = document.getElementById('marketSky');
  if (!sky) return;
  const configs = [
    { top:'10%', dur:'42s', del:'-8s',  w:130, h:44 },
    { top:'6%',  dur:'60s', del:'-28s', w:190, h:60 },
    { top:'18%', dur:'50s', del:'-18s', w:110, h:36 },
    { top:'14%', dur:'75s', del:'-42s', w:160, h:52 },
  ];
  configs.forEach(c => {
    const d = document.createElement('div');
    d.style.cssText = `
      position:absolute; pointer-events:none; top:${c.top};
      animation:cloudFloat ${c.dur} linear ${c.del} infinite;
      filter:drop-shadow(0 3px 6px rgba(100,160,200,.12));
    `;
    d.innerHTML = buildCloudSVG(c.w, c.h);
    sky.appendChild(d);
  });
  function buildCloudSVG(w, h) {
    const cx = w/2, cy = h*.65, rx = w*.46, ry = h*.32;
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="white" opacity=".9"/>
      <ellipse cx="${cx*.56}" cy="${cy - ry*.6}" rx="${rx*.46}" ry="${ry*.75}" fill="white" opacity=".92"/>
      <ellipse cx="${cx*1.2}" cy="${cy - ry*.5}" rx="${rx*.38}" ry="${ry*.7}" fill="white" opacity=".9"/>
      <ellipse cx="${cx}" cy="${cy - ry*.85}" rx="${rx*.32}" ry="${ry*.62}" fill="white" opacity=".88"/>
    </svg>`;
  }
  if (!document.getElementById('cloudFloatKF')) {
    const s = document.createElement('style');
    s.id = 'cloudFloatKF';
    s.textContent = '@keyframes cloudFloat { from{transform:translateX(calc(-100% - 200px))} to{transform:translateX(calc(100vw + 200px))} }';
    document.head.appendChild(s);
  }
})();

/* ── BIRDS ── */
(function buildBirds() {
  const c = document.getElementById('birds');
  if (!c) return;
  const emojis = ['🐦','🐦','🦅','🦜'];
  for (let i = 0; i < 6; i++) {
    const b = document.createElement('div');
    b.className = 'bird';
    b.textContent = emojis[i % emojis.length];
    b.style.cssText = `
      --bt2:${6 + Math.random()*20}%;
      --bd:${13 + Math.random()*12}s;
      --bdo:${-(Math.random()*13).toFixed(1)}s;
      --bs:${9 + Math.random()*7}px;
      --by:${(Math.random()*24-12).toFixed(0)}px;
    `;
    c.appendChild(b);
  }
})();

/* ── CROWD NPCs ── */
(function buildCrowd() {
  const c = document.getElementById('crowd');
  if (!c) return;
  const colors = ['#1a2a6b','#6a2010','#1a4a1a','#4a2a6b','#6a4a10'];
  const headColors = ['#f5d5a5','#c8995a','#e8c890','#b8885a','#d8aa7a'];
  for (let i = 0; i < 12; i++) {
    const x = 5 + (i * 8.2) + (Math.random() * 3 - 1.5);
    const scale = 0.5 + Math.random() * 0.35;
    const col = colors[i % colors.length];
    const hcol = headColors[i % headColors.length];
    const delay = (Math.random() * 3).toFixed(1);
    const dur = (2.5 + Math.random() * 2).toFixed(1);
    const npc = document.createElement('div');
    npc.style.cssText = `
      position:absolute; bottom:0; left:${x}%;
      width:14px; height:52px;
      transform-origin:bottom center;
      animation:npcBob ${dur}s ease-in-out ${delay}s infinite;
    `;
    npc.innerHTML = `
      <div style="width:12px;height:12px;border-radius:50%;background:${hcol};border:1px solid #906040;margin:0 auto;"></div>
      <div style="width:12px;height:22px;background:${col};clip-path:polygon(10% 0%,90% 0%,95% 100%,5% 100%);margin:0 auto;"></div>
      <div style="display:flex;gap:2px;margin:0 auto;width:12px;">
        <div style="width:5px;height:16px;background:#2a1a08;border-radius:2px 2px 4px 4px;"></div>
        <div style="width:5px;height:16px;background:#2a1a08;border-radius:2px 2px 4px 4px;"></div>
      </div>
    `;
    c.appendChild(npc);
  }
  const s = document.createElement('style');
  s.textContent = '@keyframes npcBob{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-3px) rotate(-1deg)}75%{transform:translateY(-1.5px) rotate(1deg)}}';
  document.head.appendChild(s);
})();

/* ── PARTICLE CANVAS (floating market dust/sparks) ── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = H + 10;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(0.3 + Math.random() * 0.8);
      this.r  = 1 + Math.random() * 2;
      this.alpha = 0.4 + Math.random() * 0.4;
      this.life  = 0;
      this.maxLife = 200 + Math.random() * 300;
      this.color = Math.random() > .6
        ? `rgba(255,${180 + Math.floor(Math.random()*60)},30,`
        : `rgba(255,${220 + Math.floor(Math.random()*35)},${100 + Math.floor(Math.random()*80)},`;
    }
    update() {
      this.x += this.vx + Math.sin(this.life * 0.05) * 0.2;
      this.y += this.vy;
      this.life++;
      if (this.y < -10 || this.life > this.maxLife) this.reset();
    }
    draw() {
      const a = this.alpha * (1 - this.life / this.maxLife);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + a + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < 60; i++) {
    const p = new Particle();
    p.y = Math.random() * H;  // scatter initially
    p.life = Math.random() * p.maxLife;
    particles.push(p);
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ── CHAINS TOP ── */
(function buildChains() {
  const c = document.getElementById('chainsTop');
  if (!c) return;
  let html = '';
  for (let i = 0; i < 20; i++) {
    const left = (i / 20 * 100).toFixed(1);
    const h = 20 + Math.sin(i / 20 * Math.PI) * 30;
    const delay = -(i * 0.2).toFixed(1);
    html += `<div style="
      position:absolute; left:${left}%;
      top:0; width:6px; height:${h}px;
      background:repeating-linear-gradient(to bottom,
        #5a4020 0px,#5a4020 4px,#8a6830 4px,#8a6830 7px,#5a4020 7px,#5a4020 10px);
      border-radius:2px;
      animation:chainSwing 2.5s ease-in-out ${delay}s infinite alternate;
      transform-origin:top center;
    "></div>`;
  }
  c.innerHTML = html;
  const s = document.createElement('style');
  s.textContent = '@keyframes chainSwing{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}';
  document.head.appendChild(s);
})();

/* ── MERCHANT SPEECH BUBBLES ── */
(function merchantTalk() {
  const speeches = [
    'Hallgasd meg a kikiáltót, polgár!',
    'Szavazz bölcsen, királyom!',
    'A döntés a tied, nemes úr!',
    'Mindenki szavazata számít!',
    'A Királyság figyel rád!',
    'Ne habozz, lépj közelebb!',
  ];
  let idx = 0;
  const bubble = document.getElementById('merchantSpeech');
  if (!bubble) return;
  setInterval(() => {
    idx = (idx + 1) % speeches.length;
    bubble.style.opacity = '0';
    bubble.style.transform = 'translateX(-10%) translateY(-10px)';
    bubble.style.transition = 'all .3s ease';
    setTimeout(() => {
      bubble.textContent = speeches[idx];
      bubble.style.opacity = '1';
      bubble.style.transform = 'translateX(-10%) translateY(0)';
    }, 350);
  }, 3500);
})();

/* ── MAGIC SPARKLES on click ── */
document.addEventListener('click', function(e) {
  if (!e.target.closest('.valasz-option') && !e.target.closest('.btn-vote')) return;
  for (let i = 0; i < 8; i++) {
    const sp = document.createElement('div');
    sp.style.cssText = `
      position:fixed; left:${e.clientX}px; top:${e.clientY}px;
      pointer-events:none; z-index:9999;
      font-size:${10 + Math.random()*10}px;
      color:${Math.random()>.5?'#f5c842':'#ff8844'};
      text-shadow:0 0 8px currentColor;
      animation:sparkleOut .7s ease-out forwards;
      transform-origin:center;
    `;
    sp.textContent = ['✦','★','◆','✧','⚜'][Math.floor(Math.random()*5)];
    document.body.appendChild(sp);

    const angle = (i / 8) * Math.PI * 2;
    const dist  = 30 + Math.random() * 40;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    sp.style.setProperty('--dx', dx + 'px');
    sp.style.setProperty('--dy', dy + 'px');
    setTimeout(() => sp.remove(), 750);
  }
});
(function addSparkleKF() {
  const s = document.createElement('style');
  s.textContent = '@keyframes sparkleOut{0%{opacity:1;transform:translate(0,0) scale(1) rotate(0deg)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(0) rotate(180deg)}}';
  document.head.appendChild(s);
})();

/* ═══════════════════════════════════════════════════════════
   VOTING LOGIC
═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const kerdesText       = document.getElementById('kerdesText');
  const valaszokContainer = document.getElementById('valaszokContainer');
  const uzenet            = document.getElementById('uzenet');
  const loadingEl         = document.getElementById('loadingEl');
  const kerdesContainer   = document.getElementById('kerdesContainer');
  const userSpan          = document.getElementById('felhasznalonevMegjelenites');

  let aktualisKerdes = null;

  const urlParams = new URLSearchParams(window.location.search);
  const qidParam  = urlParams.get('qid');

  /* User */
  fetch('./api/users.php')
    .then(r => r.json())
    .then(d => {
      if (!d.loggedIn) {
        window.location.href = 'index.html';
      } else {
        if (userSpan) userSpan.textContent = d.name;
      }
    })
    .catch(() => {});

  /* Question */
  const questionUrl = qidParam ? `./api/question.php?qid=${qidParam}` : './api/question.php';
  fetch(questionUrl)
    .then(r => r.json())
    .then(data => {
      if (data.error) throw new Error(data.error);

      aktualisKerdes = data;
      kerdesText.textContent = data.qtext;
      valaszokContainer.innerHTML = '';

      data.answers.forEach((a, i) => {
        const label = document.createElement('label');
        label.className = 'valasz-option';
        label.style.setProperty('--i', i);
        label.innerHTML = `
          <input type="radio" name="valasz" value="${a.aid}">
          ${escHtml(a.atext)}
        `;
        // stagger animation
        label.style.opacity = '0';
        label.style.animation = `fadeUp .4s ease ${.1 + i * .1}s both`;
        valaszokContainer.appendChild(label);
      });

      if (loadingEl) loadingEl.style.display = 'none';
      kerdesContainer.style.display = 'block';
    })
    .catch(err => {
      if (loadingEl) loadingEl.innerHTML = `<span style="color:rgba(255,150,100,.7)">${escHtml(err.message)}</span>`;
    });

  /* Submit */
  document.getElementById('szavazasForm').addEventListener('submit', async e => {
    e.preventDefault();
    const selected = document.querySelector('input[name="valasz"]:checked');
    if (!selected) {
      showMessage('Válassz egy lehetőséget, nemes úr!', 'error');
      return;
    }

    const voteBtn = document.getElementById('voteBtn');
    if (voteBtn) { voteBtn.disabled = true; }

    try {
      const res = await fetch('./api/vote.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qid: aktualisKerdes.qid, aid: Number(selected.value) })
      });
      const result = await res.json();

      if (result.error) {
        showMessage(result.error, 'error');
        if (voteBtn) voteBtn.disabled = false;
      } else {
        showMessage(result.message || 'Szavazatodat rögzítettük! A Királyság hálás!', 'success');
        document.querySelectorAll('input[name="valasz"]').forEach(i => i.disabled = true);
        // confetti burst
        triggerConfetti();
      }
    } catch {
      showMessage('Hiba történt a szavazás során.', 'error');
      if (voteBtn) voteBtn.disabled = false;
    }
  });

  function showMessage(text, type) {
    uzenet.textContent = text;
    uzenet.className = 'message ' + type;
    uzenet.style.display = 'block';
    // reset animation
    uzenet.style.animation = 'none';
    void uzenet.offsetWidth;
    uzenet.style.animation = '';
  }

  function triggerConfetti() {
    const colors = ['#f5c842','#ff6644','#44aaff','#88ff88','#ff88cc','#ffaa44'];
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        const c = document.createElement('div');
        const col = colors[Math.floor(Math.random() * colors.length)];
        const x = 20 + Math.random() * 60;
        c.style.cssText = `
          position:fixed; top:60%; left:${x}%;
          width:${4 + Math.random()*6}px; height:${4 + Math.random()*6}px;
          background:${col};
          pointer-events:none; z-index:9999;
          border-radius:${Math.random() > .5 ? '50%' : '2px'};
          animation:confettiFall ${1.2 + Math.random()*.8}s ease-in forwards;
          --cx:${(Math.random()*120-60).toFixed(0)}px;
          --cr:${Math.floor(Math.random()*720)}deg;
        `;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 2200);
      }, i * 40);
    }
    if (!document.getElementById('confettiKF')) {
      const s = document.createElement('style');
      s.id = 'confettiKF';
      s.textContent = '@keyframes confettiFall{0%{transform:translateY(0) translateX(0) rotate(0)}100%{transform:translateY(60vh) translateX(var(--cx)) rotate(var(--cr));opacity:0}}';
      document.head.appendChild(s);
    }
  }
});

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
