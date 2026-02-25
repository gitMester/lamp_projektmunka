/* ═══════════════════════════════════════════════════════════
   KIRÁLYSÁG — eredmenyek.js  (Kincstár — Prémium)
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── VAULT DOOR OPEN ── */
setTimeout(() => {
  const dL   = document.getElementById('doorLeft');
  const dR   = document.getElementById('doorRight');
  const glow = document.getElementById('doorGlow');
  if (dL)   dL.classList.add('open');
  if (dR)   dR.classList.add('open');
  if (glow) glow.classList.add('open');

  /* deep thud */
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[70, 14, 0.12, 0.9], [140, 28, 0.06, 0.5]].forEach(([f0, f1, g, dur]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(f0, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(f1, ctx.currentTime + dur);
      gain.gain.setValueAtTime(g, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(); osc.stop(ctx.currentTime + dur);
    });
  } catch(_) {}
}, 3000);

/* ── REMOVE INTRO ── */
setTimeout(() => {
  const intro = document.getElementById('intro-vault');
  if (intro) { intro.style.pointerEvents = 'none'; setTimeout(() => intro.remove(), 1100); }
}, 5400);

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
        setTimeout(() => { window.location.href = '/bejelentkezes.html'; }, 300);
      }
    })
    .catch(() => { span.textContent = 'Vendég'; });
})();

/* ── LOAD RESULTS ── */
document.addEventListener('DOMContentLoaded', () => {
  const loading   = document.querySelector('.t-loading');
  const container = document.getElementById('eredmenyContainer');

  const urlParams = new URLSearchParams(window.location.search);
  const qid = urlParams.get('qid');

  if (!qid) {
    if (loading) loading.innerHTML = `<p style="color:rgba(200,80,60,.8);font-family:'Cinzel',serif;font-size:12px;letter-spacing:.1em">Nincs megadva kérdés azonosító!</p>`;
    return;
  }

  fetch(`./api/result.php?qid=${qid}`)
    .then(r => r.json())
    .then(data => {
      if (data.error) throw new Error(data.error);

      /* Question title */
      const titleEl = document.getElementById('kerdesCim');
      if (titleEl) titleEl.textContent = data.qtext;

      /* Total */
      const total = data.answers.reduce((s, a) => s + a.votes, 0);
      const totalEl = document.getElementById('osszSzavazat');
      if (totalEl) totalEl.textContent = total;

      buildCoinChart(data.answers, total);
      buildLedger(data.answers, total);

      if (loading)   loading.style.display = 'none';
      if (container) container.style.display = 'block';
    })
    .catch(err => {
      console.error('[Királyság eredmények]', err);
      if (loading) loading.innerHTML = `<p style="color:rgba(200,80,60,.7);font-family:'Cinzel',serif;font-size:11px;letter-spacing:.1em">⚠ Hiba: ${escHtml(err.message)}</p>`;
    });
});

/* ══════════════════════════════════════════════════════════
   MEDIEVAL JEWEL-TONE PALETTE
   Deep saturated tones that look great on a gold coin
══════════════════════════════════════════════════════════ */
const PALETTE = [
  { main:'#9b1c1c', light:'#c83030', dark:'#5c0c0c', name:'Bíbor' },
  { main:'#1c4d8b', light:'#2a6db8', dark:'#0c2848', name:'Zafír' },
  { main:'#16623a', light:'#228a52', dark:'#0a3420', name:'Smaragd' },
  { main:'#5e1d88', light:'#7e2dba', dark:'#320c4e', name:'Ametiszt' },
  { main:'#944a08', light:'#c06414', dark:'#502404', name:'Borostyán' },
  { main:'#116868', light:'#1a9292', dark:'#083838', name:'Türkiz' },
  { main:'#852040', light:'#b02e58', dark:'#4a0e20', name:'Karmazsin' },
  { main:'#254e1a', light:'#368428', dark:'#122a0c', name:'Olíva' },
  { main:'#7a3c10', light:'#aa5a1c', dark:'#3e1c06', name:'Rézszín' },
  { main:'#1e3e7a', light:'#2e5eb0', dark:'#0c1e3e', name:'Éjkék' },
];

/* ══════════════════════════════════════════════════════════
   COIN CHART — Chart.js with custom medallion plugin
══════════════════════════════════════════════════════════ */
function buildCoinChart(answers, total) {
  const canvas = document.getElementById('pieChart');
  if (!canvas || !answers.length) return;

  const ctx = canvas.getContext('2d');
  const colors = answers.map((_, i) => PALETTE[i % PALETTE.length]);

  /* ── Custom plugin: engrave spokes + crown center ── */
  const medallionPlugin = {
    id: 'medallion',
    afterDraw(chart) {
      const meta = chart.getDatasetMeta(0);
      if (!meta.data.length) return;
      const { x: cx, y: cy, outerRadius, innerRadius } = meta.data[0];
      const ctx2 = chart.ctx;

      /* Gold outer ring line */
      ctx2.save();
      ctx2.beginPath();
      ctx2.arc(cx, cy, outerRadius + 1.5, 0, Math.PI * 2);
      ctx2.strokeStyle = 'rgba(240,195,55,.45)';
      ctx2.lineWidth = 2.5;
      ctx2.stroke();

      /* Engraved spoke dividers */
      meta.data.forEach(arc => {
        [arc.startAngle, arc.endAngle].forEach(angle => {
          ctx2.beginPath();
          ctx2.moveTo(
            cx + Math.cos(angle) * outerRadius * 0.08,
            cy + Math.sin(angle) * outerRadius * 0.08
          );
          ctx2.lineTo(
            cx + Math.cos(angle) * (outerRadius + 0.5),
            cy + Math.sin(angle) * (outerRadius + 0.5)
          );
          ctx2.strokeStyle = 'rgba(240,195,55,.3)';
          ctx2.lineWidth = 1.2;
          ctx2.stroke();
        });
      });

      /* Percentage labels on segments */
      meta.data.forEach((arc, i) => {
        if (answers[i].votes === 0) return;
        const midAngle = (arc.startAngle + arc.endAngle) / 2;
        const r = outerRadius * 0.62;
        const lx = cx + Math.cos(midAngle) * r;
        const ly = cy + Math.sin(midAngle) * r;
        const pct = total > 0 ? Math.round((answers[i].votes / total) * 100) : 0;
        if (pct < 5) return;

        ctx2.save();
        ctx2.font = `bold ${Math.max(9, outerRadius * 0.1)}px 'Cinzel', serif`;
        ctx2.fillStyle = 'rgba(255,248,210,.95)';
        ctx2.textAlign = 'center';
        ctx2.textBaseline = 'middle';
        ctx2.shadowColor = 'rgba(0,0,0,.7)';
        ctx2.shadowBlur = 4;
        ctx2.fillText(`${pct}%`, lx, ly);
        ctx2.restore();
      });

      /* Center medallion — gold disk with crown */
      const medR = outerRadius * 0.22;
      const medGrad = ctx2.createRadialGradient(cx - medR * 0.25, cy - medR * 0.25, 0, cx, cy, medR);
      medGrad.addColorStop(0, '#ffe878');
      medGrad.addColorStop(0.4, '#d49818');
      medGrad.addColorStop(0.75, '#a07010');
      medGrad.addColorStop(1, '#6a4808');

      ctx2.beginPath();
      ctx2.arc(cx, cy, medR, 0, Math.PI * 2);
      ctx2.fillStyle = medGrad;
      ctx2.fill();

      /* Medallion border */
      ctx2.beginPath();
      ctx2.arc(cx, cy, medR, 0, Math.PI * 2);
      ctx2.strokeStyle = 'rgba(255,230,100,.55)';
      ctx2.lineWidth = 1.8;
      ctx2.stroke();
      ctx2.beginPath();
      ctx2.arc(cx, cy, medR * 0.82, 0, Math.PI * 2);
      ctx2.strokeStyle = 'rgba(255,230,100,.25)';
      ctx2.lineWidth = 1;
      ctx2.stroke();

      /* Crown emoji */
      ctx2.font = `${Math.round(medR * 0.95)}px serif`;
      ctx2.textAlign = 'center';
      ctx2.textBaseline = 'middle';
      ctx2.shadowColor = 'rgba(0,0,0,.6)';
      ctx2.shadowBlur = 3;
      ctx2.fillStyle = 'rgba(255,240,160,.95)';
      ctx2.fillText('♛', cx, cy + medR * 0.06);

      ctx2.restore();
    }
  };

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: answers.map(a => a.atext),
      datasets: [{
        data: answers.map(a => a.votes),
        backgroundColor: colors.map(c => c.main),
        hoverBackgroundColor: colors.map(c => c.light),
        borderColor: 'rgba(240,195,55,.55)',
        borderWidth: 2.5,
        hoverBorderColor: 'rgba(255,225,90,.85)',
        hoverBorderWidth: 3.5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '0%',
      animation: {
        animateRotate: true,
        animateScale: false,
        duration: 1400,
        easing: 'easeInOutQuart',
        delay: ctx => ctx.dataIndex * 100,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(18,10,2,.94)',
          borderColor: 'rgba(195,145,18,.42)',
          borderWidth: 1,
          titleFont: { family: "'Cinzel', serif", size: 11, weight: '600' },
          bodyFont:  { family: "'IM Fell English', serif", size: 13 },
          titleColor: 'rgba(240,192,58,.9)',
          bodyColor: 'rgba(215,178,118,.85)',
          padding: 13,
          callbacks: {
            label(ctx) {
              const v = ctx.parsed;
              const pct = total > 0 ? Math.round((v / total) * 100) : 0;
              return `  ${v} szavazat  (${pct}%)`;
            }
          }
        }
      }
    },
    plugins: [medallionPlugin]
  });

  /* Build legend */
  buildLegend(answers, total, colors);
}

function buildLegend(answers, total, colors) {
  const legendEl = document.getElementById('coinLegend');
  if (!legendEl) return;
  legendEl.innerHTML = '';

  answers.forEach((a, i) => {
    const pct = total > 0 ? Math.round((a.votes / total) * 100) : 0;
    const c   = colors[i % colors.length];
    const li  = document.createElement('div');
    li.className = 'legend-item';
    li.innerHTML = `
      <div class="legend-dot" style="background:radial-gradient(circle at 35% 30%, ${c.light}, ${c.main}, ${c.dark})"></div>
      <span class="legend-text">${escHtml(a.atext)}</span>
      <span class="legend-pct">${pct}%</span>
    `;
    legendEl.appendChild(li);
  });
}

/* ══════════════════════════════════════════
   LEDGER
══════════════════════════════════════════ */
function buildLedger(answers, total) {
  const container = document.getElementById('valaszokLista');
  if (!container) return;
  container.innerHTML = '';

  if (!answers.length) {
    container.innerHTML = `<div class="ledger-empty"><h3>Nincsenek adatok</h3><p>Még nem érkeztek szavazatok ehhez a kérdéshez.</p></div>`;
    return;
  }

  const sorted = [...answers]
    .map((a, origIdx) => ({ ...a, origIdx }))
    .sort((a, b) => b.votes - a.votes);

  const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];

  sorted.forEach((answer, rank) => {
    const color = PALETTE[answer.origIdx % PALETTE.length];
    const pct   = total > 0 ? Math.round((answer.votes / total) * 100) : 0;
    const delay = (7.7 + rank * 0.1).toFixed(2);

    const div = document.createElement('div');
    div.className = 'valasz-item';
    div.style.setProperty('--entry-color', color.main);
    div.style.setProperty('--entry-delay', `${delay}s`);

    div.innerHTML = `
      <div class="valasz-header">
        <span class="valasz-szoveg">
          <span class="v-rank">${roman[rank] || rank + 1}.</span>
          <span class="szin-jelzo" style="background:radial-gradient(circle at 35% 30%, ${color.light}, ${color.main}, ${color.dark})"></span>
          ${escHtml(answer.atext)}
        </span>
        <span class="szavazat-info">${answer.votes} szavazat</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width:${pct}%;background:linear-gradient(90deg, ${color.dark}, ${color.main} 40%, ${color.light});">
          ${pct > 7 ? `<span class="progress-percent">${pct}%</span>` : ''}
        </div>
      </div>
      ${pct <= 7 && pct > 0 ? `<div class="pct-outside">${pct}%</div>` : ''}
    `;
    container.appendChild(div);
  });
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
