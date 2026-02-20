/* ═══════════════════════════════════════════════════════════
   KIRÁLYSÁG — ujkerdes.js  (Királyi Konyha)
═══════════════════════════════════════════════════════════ */

'use strict';

const T = {
  doorOpen:  3000,
  introExit: 5600,
  roomReady: 6000,
};

/* ── CHIMNEY SMOKE PUFFS ── */
(function buildSmoke() {
  [
    { id: 'smoke-left',  count: 10 },
    { id: 'smoke-right', count: 8 },
  ].forEach(({ id, count }) => {
    const container = document.getElementById(id);
    if (!container) return;
    for (let i = 0; i < count; i++) {
      const puff = document.createElement('div');
      puff.className = 'smoke-puff';
      const size = 18 + Math.random() * 22;
      puff.style.cssText = `
        width:${size}px; height:${size}px;
        left:${20+Math.random()*60}%;
        bottom:${Math.random()*30}%;
        --sd:${3+Math.random()*2.5}s;
        --sdo:${-Math.random()*3}s;
        --sx:${(Math.random()*30-15).toFixed(0)}px;
      `;
      container.appendChild(puff);
    }
  });
})();

/* ── DOOR OPEN ── */
setTimeout(() => {
  const door = document.getElementById('kitchen-door');
  const glow = document.getElementById('door-glow');
  if (door) door.classList.add('open');
  if (glow) glow.classList.add('open');

  /* Wooden creak + distant kitchen clatter */
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    /* Low creak */
    const osc1  = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1); gain1.connect(ctx.destination);
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(80, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.55);
    gain1.gain.setValueAtTime(0.07, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.start(); osc1.stop(ctx.currentTime + 0.6);

    /* Distant pot clang */
    setTimeout(() => {
      const osc2  = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(480, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.35);
      gain2.gain.setValueAtTime(0.06, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc2.start(); osc2.stop(ctx.currentTime + 0.4);
    }, 280);
  } catch(_) {}
}, T.doorOpen);

/* ── CLEANUP INTRO ── */
setTimeout(() => {
  const intro = document.getElementById('intro');
  if (intro) {
    intro.style.pointerEvents = 'none';
    setTimeout(() => intro.remove(), 900);
  }
}, T.introExit);

/* ── FLOATING FOOD PARTICLES in kitchen room ── */
(function buildFoodParticles() {
  const container = document.getElementById('food-particles');
  if (!container) return;
  const foods = ['🍖','🍗','🥩','🧅','🧄','🌿','🍞','🥕','🥬','🍎'];
  for (let i = 0; i < 12; i++) {
    const f = document.createElement('div');
    f.className = 'food-float';
    f.textContent = foods[Math.floor(Math.random() * foods.length)];
    f.style.cssText = `
      left:${5+Math.random()*90}%;
      bottom:0;
      --ff:${12+Math.random()*6}px;
      --ffd:${10+Math.random()*8}s;
      --ffdo:${-Math.random()*10}s;
      --ffx:${(Math.random()*60-30).toFixed(0)}px;
      --ffy:${-(60+Math.random()*80).toFixed(0)}px;
      --ffr:${(Math.random()*40-20).toFixed(0)}deg;
    `;
    container.appendChild(f);
  }
})();

/* ═══════════════════════════════════════════════════════════
   FORM LOGIC
═══════════════════════════════════════════════════════════ */

let valaszCounter = 2;

document.addEventListener('DOMContentLoaded', () => {
  const uzenet = document.getElementById('uzenet');

  /* ── User fetch ── */
  fetch('./api/users.php')
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        document.getElementById('felhasznalonevMegjelenites').textContent = data.name;
      } else {
        window.location.href = './bejelentkezes.html';
      }
    })
    .catch(err => console.error('Felhasználó lekérési hiba:', err));

  /* ── Form submit ── */
  document.getElementById('ujKerdesForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    document.getElementById('kerdesHiba').textContent   = '';
    document.getElementById('valaszokHiba').textContent = '';
    uzenet.style.display = 'none';
    uzenet.className = 'message';

    const kerdesText = document.getElementById('kerdesText').value.trim();
    if (!kerdesText) {
      document.getElementById('kerdesHiba').textContent = 'A kérdés nem lehet üres!';
      return;
    }

    const valaszInputok = document.querySelectorAll('#valaszokLista input[type="text"]');
    const valaszok = [];
    valaszInputok.forEach(input => {
      const text = input.value.trim();
      if (text) valaszok.push(text);
    });

    if (valaszok.length < 2) {
      document.getElementById('valaszokHiba').textContent = 'Legalább 2 válaszlehetőséget adj meg!';
      return;
    }

    try {
      const response = await fetch('./api/add_question.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qtext: kerdesText, answers: valaszok })
      });

      const text   = await response.text();
      const result = JSON.parse(text);

      if (result.error) {
        uzenet.textContent = result.error;
        uzenet.className   = 'message error';
      } else {
        uzenet.textContent = result.message || '⚜ Kérdés sikeresen létrehozva!';
        uzenet.className   = 'message success';

        document.getElementById('ujKerdesForm').reset();

        /* Reset answers to 2 */
        document.getElementById('valaszokLista').innerHTML = `
          <div class="answer-item">
            <span class="answer-number">1.</span>
            <input type="text" placeholder="Első válasz" data-valasz="0" required>
            <button type="button" onclick="torolValasz(this)" class="btn-delete" style="visibility:hidden;">×</button>
          </div>
          <div class="answer-item">
            <span class="answer-number">2.</span>
            <input type="text" placeholder="Második válasz" data-valasz="1" required>
            <button type="button" onclick="torolValasz(this)" class="btn-delete" style="visibility:hidden;">×</button>
          </div>
        `;
        valaszCounter = 2;

        setTimeout(() => { window.location.href = 'fooldal.html'; }, 2000);
      }
    } catch (err) {
      console.error('Hiba:', err);
      uzenet.textContent = 'Hiba történt a kérdés létrehozása során: ' + err.message;
      uzenet.className   = 'message error';
    }
  });
});

/* ── Add answer ── */
function ujValasz() {
  const lista = document.getElementById('valaszokLista');
  const item  = document.createElement('div');
  item.className = 'answer-item';
  item.innerHTML = `
    <span class="answer-number">${valaszCounter + 1}.</span>
    <input type="text" placeholder="${valaszCounter + 1}. válasz" data-valasz="${valaszCounter}">
    <button type="button" onclick="torolValasz(this)" class="btn-delete">×</button>
  `;
  lista.appendChild(item);
  valaszCounter++;
  frissitTorolGombok();
}

/* ── Remove answer ── */
function torolValasz(button) {
  button.parentElement.remove();
  const inputok = document.querySelectorAll('#valaszokLista input[type="text"]');
  inputok.forEach((input, i) => {
    input.placeholder    = `${i + 1}. válasz`;
    input.dataset.valasz = i;
    input.closest('.answer-item').querySelector('.answer-number').textContent = `${i + 1}.`;
  });
  valaszCounter = inputok.length;
  frissitTorolGombok();
}

/* ── Show/hide delete buttons ── */
function frissitTorolGombok() {
  const itemek = document.querySelectorAll('.answer-item');
  itemek.forEach(item => {
    const btn = item.querySelector('.btn-delete');
    btn.style.visibility = itemek.length <= 2 ? 'hidden' : 'visible';
  });
}
