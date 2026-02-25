/* ═══════════════════════════════════════════════════════════
   KIRÁLYSÁG — eredmenyek.js  (Kincstár változat)
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── VAULT DOOR SEQUENCE ── */
setTimeout(() => {
  const dL   = document.getElementById('doorLeft');
  const dR   = document.getElementById('doorRight');
  const glow = document.getElementById('doorGlow');
  if (dL)   dL.classList.add('open');
  if (dR)   dR.classList.add('open');
  if (glow) glow.classList.add('open');

  /* Low boom via Web Audio */
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(70, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(15, ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(0.10, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc.start(); osc.stop(ctx.currentTime + 0.9);
  } catch(_) {}
}, 3000);

/* ── CLEANUP INTRO ── */
setTimeout(() => {
  const intro = document.getElementById('intro-vault');
  if (intro) {
    intro.style.pointerEvents = 'none';
    setTimeout(() => intro.remove(), 1000);
  }
}, 5600);

/* ── SCATTERED GOLD COINS ── */
(function buildCoins() {
  const wrap = document.getElementById('coinScatter');
  if (!wrap) return;
  const positions = [
    {l:'3%',  b:'8%'},  {l:'7%',  b:'4%'},  {l:'5%',  b:'2%'},
    {l:'91%', b:'6%'},  {l:'95%', b:'3%'},   {l:'88%', b:'9%'},
    {l:'2%',  b:'18%'}, {l:'97%', b:'15%'},  {l:'94%', b:'22%'},
    {l:'8%',  b:'22%'},
  ];
  positions.forEach((pos, i) => {
    const c = document.createElement('div');
    c.className = 'coin';
    const size = 12 + Math.random() * 14;
    c.style.cssText = `
      left:${pos.l}; bottom:${pos.b};
      --cs:${size}px;
      --co:${0.3 + Math.random() * 0.4};
      --cf:${3 + Math.random() * 4}s;
      --cd:${(i * 0.35).toFixed(1)}s;
    `;
    wrap.appendChild(c);
  });
})();

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
document.addEventListener('DOMContentLoaded', function() {
  const loading   = document.querySelector('.t-loading');
  const container = document.getElementById('eredmenyContainer');
  const kerdesCim = document.getElementById('kerdesCim');
  const valaszokLista = document.getElementById('valaszokLista');
  const osszSzavazat  = document.getElementById('osszSzavazat');

  const urlParams = new URLSearchParams(window.location.search);
  const qid = urlParams.get('qid');

  if (!qid) {
    if (loading) loading.innerHTML = '<p style="color:#c06030;font-family:var(--font-heading)">Nincs megadva kérdés azonosító!</p>';
    return;
  }

  betoltEredmenyek(qid, { loading, container, kerdesCim, valaszokLista, osszSzavazat });
});

/* Medieval color palette — rich jewel tones */
const MEDIEVAL_COLORS = [
  { main:'#c02828', light:'#e05050', dark:'#7a1010', name:'Bíbor' },
  { main:'#1a6ba0', light:'#3090cc', dark:'#0a3a60', name:'Kék' },
  { main:'#c8a010', light:'#f0c830', dark:'#7a6008', name:'Arany' },
  { main:'#1a7840', light:'#30a860', dark:'#0a4020', name:'Smaragd' },
  { main:'#7028a0', light:'#9840c8', dark:'#401060', name:'Viola' },
  { main:'#c06820', light:'#e08840', dark:'#7a3c0c', name:'Narancs' },
  { main:'#1c7878', light:'#30a0a0', dark:'#0c4848', name:'Türkiz' },
  { main:'#a03060', light:'#c85080', dark:'#601830', name:'Karmazsin' },
  { main:'#3060a0', light:'#5080c8', dark:'#183060', name:'Ég' },
  { main:'#608020', light:'#80a830', dark:'#304010', name:'Olíva' },
];

function betoltEredmenyek(qid, els) {
  const { loading, container, kerdesCim, valaszokLista, osszSzavazat } = els;

  fetch(`./api/result.php?qid=${qid}`)
    .then(r => r.json())
    .then(data => {
      if (data.error) throw new Error(data.error);

      kerdesCim.textContent = data.qtext;

      const total = data.answers.reduce((s, a) => s + a.votes, 0);
      osszSzavazat.textContent = total;

      /* ── MEDIEVAL PIE CHART (Chart.js, custom stained glass style) ── */
      buildMedievalChart(data.answers, total);

      /* ── LEDGER ENTRIES ── */
      buildLedger(data.answers, total, valaszokLista);

      if (loading)   loading.style.display = 'none';
      if (container) container.style.display = 'block';
    })
    .catch(err => {
      console.error('[Királyság eredmények]', err);
      if (loading) loading.innerHTML = `
        <p style="color:rgba(200,80,60,.8);font-family:var(--font-heading);font-size:13px;letter-spacing:.1em">
          ⚠ Hiba az eredmények betöltésénél: ${escHtml(err.message)}
        </p>`;
    });
}

function buildMedievalChart(answers, total) {
  const canvas = document.getElementById('pieChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (!answers.length) return;

  const labels = answers.map(a => a.atext);
  const votes  = answers.map(a => a.votes);
  const colors = answers.map((_, i) => MEDIEVAL_COLORS[i % MEDIEVAL_COLORS.length]);
  const bgColors  = colors.map(c => c.main);
  const hoverColors = colors.map(c => c.light);

  /* Custom plugin: stained-glass inner ring + center medallion */
  const medievalPlugin = {
    id: 'medievalDeco',
    afterDraw(chart) {
      const { ctx, chartArea: { width, height }, _metasets } = chart;
      if (!_metasets.length) return;
      const cx = chart.getDatasetMeta(0).data[0]?.x;
      const cy = chart.getDatasetMeta(0).data[0]?.y;
      if (cx == null) return;

      /* Inner ring border */
      ctx.save();
      ctx.strokeStyle = 'rgba(240,190,50,.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      /* outer decorative ring */
      const outerR = chart.getDatasetMeta(0).data[0]?.outerRadius || 130;
      ctx.arc(cx, cy, outerR + 3, 0, Math.PI * 2);
      ctx.stroke();

      /* Center medallion */
      const innerR = chart.getDatasetMeta(0).data[0]?.innerRadius || 0;
      const medR   = Math.max(innerR, outerR * 0.18);

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, medR);
      grad.addColorStop(0, '#ffd060');
      grad.addColorStop(0.5, '#c89020');
      grad.addColorStop(1, '#7a5000');
      ctx.beginPath();
      ctx.arc(cx, cy, medR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(240,190,50,.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      /* Crown symbol in center */
      ctx.fillStyle = 'rgba(255,240,180,.9)';
      ctx.font = `bold ${Math.round(medR * 0.9)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚜', cx, cy);
      ctx.restore();

      /* Spoke dividers with gold overlay */
      ctx.save();
      ctx.strokeStyle = 'rgba(240,190,50,.35)';
      ctx.lineWidth = 1.5;
      const meta = chart.getDatasetMeta(0).data;
      meta.forEach(arc => {
        const angle = arc.startAngle;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx + Math.cos(angle) * (arc.outerRadius + 2),
          cy + Math.sin(angle) * (arc.outerRadius + 2)
        );
        ctx.stroke();
      });
      ctx.restore();
    }
  };

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: votes,
        backgroundColor: bgColors,
        hoverBackgroundColor: hoverColors,
        borderColor: 'rgba(240,190,50,.5)',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: 'rgba(240,210,80,.9)',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: {
        animateRotate: true,
        animateScale: false,
        duration: 1200,
        easing: 'easeInOutQuart',
        delay(ctx) { return ctx.dataIndex * 80; }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 14,
            color: 'rgba(230,190,110,.85)',
            font: { family: "'Cinzel', serif", size: 10, weight: '600' },
            usePointStyle: true,
            pointStyle: 'rectRounded',
            generateLabels(chart) {
              return chart.data.labels.map((label, i) => ({
                text: label.length > 28 ? label.slice(0, 26) + '…' : label,
                fillStyle: bgColors[i],
                strokeStyle: 'rgba(240,190,50,.4)',
                lineWidth: 1,
                hidden: false,
                index: i,
              }));
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(20,12,4,.92)',
          borderColor: 'rgba(200,150,20,.4)',
          borderWidth: 1,
          titleFont: { family: "'Cinzel', serif", size: 11 },
          bodyFont:  { family: "'IM Fell English', serif", size: 13 },
          titleColor: 'rgba(240,190,60,.9)',
          bodyColor: 'rgba(220,180,120,.85)',
          padding: 12,
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
    plugins: [medievalPlugin]
  });
}

function buildLedger(answers, total, container) {
  if (!container) return;
  container.innerHTML = '';

  if (!answers.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;font-family:var(--font-body);font-style:italic;color:rgba(200,160,80,.4);">
        Még nincsenek szavazatok.
      </div>`;
    return;
  }

  /* Sort by votes descending for ledger display */
  const sorted = [...answers].map((a, origIdx) => ({ ...a, origIdx }))
    .sort((a, b) => b.votes - a.votes);

  sorted.forEach((answer, rank) => {
    const color  = MEDIEVAL_COLORS[answer.origIdx % MEDIEVAL_COLORS.length];
    const pct    = total > 0 ? Math.round((answer.votes / total) * 100) : 0;
    const delay  = (7.6 + rank * 0.12).toFixed(2);

    const div = document.createElement('div');
    div.className = 'valasz-item';
    div.style.setProperty('--entry-color', color.main);
    div.style.setProperty('--entry-delay', `${delay}s`);

    /* Roman numeral rank for flair */
    const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
    const rankLabel = roman[rank] || `${rank + 1}`;

    div.innerHTML = `
      <div class="valasz-header">
        <span class="valasz-szoveg">
          <span class="szin-jelzo" style="background:radial-gradient(circle at 35% 30%, ${color.light}, ${color.main}, ${color.dark})"></span>
          <span style="font-family:var(--font-heading);font-size:9px;letter-spacing:.1em;color:var(--ink-faint);margin-right:4px;">${rankLabel}.</span>
          ${escHtml(answer.atext)}
        </span>
        <span class="szavazat-info">${answer.votes} szavazat</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width:${pct}%;background:linear-gradient(90deg,${color.dark},${color.main},${color.light});">
          ${pct > 6 ? `<span class="progress-percent">${pct}%</span>` : ''}
        </div>
      </div>
      ${pct <= 6 && pct > 0 ? `<div style="text-align:right;margin-top:4px;font-size:10px;font-family:var(--font-heading);color:var(--ink-faint);letter-spacing:.08em;">${pct}%</div>` : ''}
    `;
    container.appendChild(div);
  });
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}