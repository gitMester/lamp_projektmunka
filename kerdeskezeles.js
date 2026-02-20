/* ═══════════════════════════════════════════════════════════
   KIRÁLYSÁG — kerdeskezeles.js  (Kovácsműhely)
═══════════════════════════════════════════════════════════ */

'use strict';

const T = {
  doorOpen:  3000,  // ms – forge door swings open
  introExit: 5600,  // ms – intro fades
  roomReady: 6000,  // ms – forge room fades in
};

/* ── STARS in dusk sky ── */
(function buildStars() {
  const sky = document.getElementById('forge-sky');
  if (!sky) return;
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = 1 + Math.random() * 2;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random() * 55}%;
      left:${Math.random() * 100}%;
      --st:${2+Math.random()*3}s;
      --sto:${-Math.random()*3}s;
      --sa:${0.2+Math.random()*0.4};
      --sb:${0.6+Math.random()*0.4};
    `;
    sky.appendChild(s);
  }
})();

/* ── CHIMNEY SPARKS (intro) ── */
(function buildChimneySparks() {
  const container = document.getElementById('chimney-sparks');
  if (!container) return;
  for (let i = 0; i < 14; i++) {
    const sp = document.createElement('div');
    sp.className = 'spark';
    sp.style.cssText = `
      left:${30 + Math.random()*40}%;
      bottom:${10 + Math.random()*30}%;
      --spd:${0.8 + Math.random()*1.2}s;
      --spdo:${-Math.random()*1.5}s;
      --spx:${(Math.random()*40-20).toFixed(0)}px;
      --spy:${-(40+Math.random()*50).toFixed(0)}px;
      width:${2+Math.random()*3}px;
      height:${2+Math.random()*3}px;
    `;
    container.appendChild(sp);
  }
})();

/* ── DOOR OPEN SEQUENCE ── */
setTimeout(() => {
  const door = document.getElementById('forge-door');
  const glow = document.getElementById('door-glow');
  if (door) door.classList.add('open');
  if (glow) glow.classList.add('open');

  /* Forge boom sound via Web Audio */
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    // Low creak
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(); osc.stop(ctx.currentTime + 0.6);

    // Distant hammer clang
    setTimeout(() => {
      const osc2  = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(320, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
      gain2.gain.setValueAtTime(0.07, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc2.start(); osc2.stop(ctx.currentTime + 0.5);
    }, 300);
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

/* ── FLOATING EMBERS in forge room ── */
(function buildEmbers() {
  const container = document.getElementById('ember-container');
  if (!container) return;
  const colors = ['#ff6a00','#ff9a3c','#ffcc88','#e84f00'];
  for (let i = 0; i < 20; i++) {
    const e = document.createElement('div');
    e.className = 'room-ember';
    const size = 2 + Math.random() * 4;
    const col  = colors[Math.floor(Math.random() * colors.length)];
    e.style.cssText = `
      width:${size}px; height:${size}px;
      left:${10+Math.random()*80}%;
      background:${col};
      box-shadow:0 0 ${size*2}px ${col};
      --ef:${4+Math.random()*6}s;
      --efo:${-Math.random()*6}s;
      --ex:${(Math.random()*40-20).toFixed(0)}px;
      --edx:${(Math.random()*60-30).toFixed(0)}px;
    `;
    container.appendChild(e);
  }
})();

/* ═══════════════════════════════════════════════════════════
   QUESTION MANAGEMENT LOGIC
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  const lista   = document.getElementById('kerdesekLista');
  const loading = document.getElementById('loading');

  /* ── TOAST ── */
  const toast = document.createElement('div');
  toast.className = 'toast';
  document.body.appendChild(toast);

  function showToast(msg, type = 'success') {
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  /* ── EDIT MODAL ── */
  const overlay    = document.getElementById('modalOverlay');
  const modalCim   = document.getElementById('modalCim');
  const modalBody  = document.getElementById('modalBody');
  const modalMent  = document.getElementById('modalMent');
  const modalMegse = document.getElementById('modalMegse');
  const modalClose = document.getElementById('modalClose');

  let modalSaveCallback = null;

  function openModal(cim, bodyHTML, onSave) {
    modalCim.textContent = cim;
    modalBody.innerHTML  = bodyHTML;
    modalSaveCallback    = onSave;
    overlay.classList.add('active');
  }

  function closeModal() {
    overlay.classList.remove('active');
    modalSaveCallback = null;
  }

  modalClose.addEventListener('click', closeModal);
  modalMegse.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  modalMent.addEventListener('click', () => { if (modalSaveCallback) modalSaveCallback(); });

  /* ── DELETE MODAL ── */
  const torlesOverlay = document.getElementById('torlesOverlay');
  const torlesSzoveg  = document.getElementById('torlesSzoveg');
  const torlesOk      = document.getElementById('torlesOk');
  const torlesMegse   = document.getElementById('torlesMegse');
  const torlesClose   = document.getElementById('torlesClose');

  let torlesCallback = null;

  function openTorles(szoveg, onConfirm) {
    torlesSzoveg.textContent = szoveg;
    torlesCallback           = onConfirm;
    torlesOverlay.classList.add('active');
  }

  function closeTorles() {
    torlesOverlay.classList.remove('active');
    torlesCallback = null;
  }

  torlesClose.addEventListener('click', closeTorles);
  torlesMegse.addEventListener('click', closeTorles);
  torlesOverlay.addEventListener('click', e => { if (e.target === torlesOverlay) closeTorles(); });
  torlesOk.addEventListener('click', () => { if (torlesCallback) torlesCallback(); });

  /* ── LOAD QUESTIONS ── */
  function betolt() {
    if (loading) loading.style.display = '';
    lista.innerHTML = '';

    fetch('./api/questions.php')
      .then(r => r.json())
      .then(data => {
        if (loading) loading.style.display = 'none';
        if (data.error) throw new Error(data.error);

        if (data.length === 0) {
          lista.innerHTML = `
            <div class="empty-state">
              <h3>⚒ Nincsenek kérdések</h3>
              <p>Hozz létre egyet az "Új kérdés" gombbal.</p>
            </div>`;
          return;
        }

        data.forEach((kerdes, i) => {
          const card = document.createElement('div');
          card.className = 'kerdes-card';
          card.dataset.qid = kerdes.qid;
          card.style.setProperty('--cd', `${6.8 + i * 0.12}s`);
          card.innerHTML = `
            <div class="kerdes-top">
              <span class="kerdes-szoveg">${escHtml(kerdes.qtext)}</span>
              <div class="kerdes-meta">
                <span class="vote-badge">⚒ ${kerdes.vote_count} szavazat</span>
              </div>
            </div>
            <div class="kerdes-actions">
              <button class="btn btn-edit-q"
                data-qid="${kerdes.qid}"
                data-qtext="${encodeURIComponent(kerdes.qtext)}">
                ✏️ Kérdés szerkesztése
              </button>
              <button class="btn btn-edit-a"
                data-qid="${kerdes.qid}"
                data-votes="${kerdes.vote_count}">
                📝 Válaszok szerkesztése
              </button>
              <a href="eredmenyek.html?qid=${kerdes.qid}" class="btn btn-results-link">
                📊 Eredmények
              </a>
              <button class="btn btn-delete"
                data-qid="${kerdes.qid}"
                data-qtext="${encodeURIComponent(kerdes.qtext)}">
                🗑️ Törlés
              </button>
            </div>
          `;
          lista.appendChild(card);
        });

        /* Event handlers */
        lista.querySelectorAll('.btn-edit-q').forEach(btn => {
          btn.addEventListener('click', () => kerdeszSzerkeszt(
            parseInt(btn.dataset.qid),
            decodeURIComponent(btn.dataset.qtext)
          ));
        });
        lista.querySelectorAll('.btn-edit-a').forEach(btn => {
          btn.addEventListener('click', () => valaszokSzerkeszt(
            parseInt(btn.dataset.qid),
            parseInt(btn.dataset.votes)
          ));
        });
        lista.querySelectorAll('.btn-delete').forEach(btn => {
          btn.addEventListener('click', () => kerdesTorles(
            parseInt(btn.dataset.qid),
            decodeURIComponent(btn.dataset.qtext)
          ));
        });
      })
      .catch(err => {
        if (loading) loading.style.display = 'none';
        lista.innerHTML = `
          <div class="empty-state">
            <h3>⚠ Hiba történt</h3>
            <p>${escHtml(err.message)}</p>
          </div>`;
      });
  }

  /* ── EDIT QUESTION ── */
  function kerdeszSzerkeszt(qid, qtext) {
    const body = `
      <div class="form-group">
        <label for="kerdeszInput">Kérdés szövege</label>
        <input type="text" id="kerdeszInput"
          value="${qtext.replace(/"/g, '&quot;')}"
          placeholder="Add meg a kérdést…" />
      </div>
    `;
    openModal('Kérdés szerkesztése', body, () => {
      const ujSzoveg = document.getElementById('kerdeszInput').value.trim();
      if (!ujSzoveg) { showToast('A kérdés nem lehet üres!', 'error'); return; }

      fetch('./api/modquestion.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qid, qtext: ujSzoveg })
      })
        .then(r => r.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          showToast('⚒ Kérdés sikeresen frissítve!');
          closeModal(); betolt();
        })
        .catch(err => showToast(err.message, 'error'));
    });
  }

  /* ── EDIT ANSWERS ── */
  function valaszokSzerkeszt(qid, voteCount) {
    fetch(`./api/question.php?qid=${qid}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);

        const warningHTML = voteCount > 0
          ? `<div class="warning-box">⚠️ Erre a kérdésre már érkezett szavazat — a válaszok nem módosíthatók.</div>`
          : '';

        const answerRowsHTML = data.answers.map(a => `
          <div class="answer-row">
            <input type="text" value="${escHtml(a.atext)}" ${voteCount > 0 ? 'disabled' : ''} />
            ${voteCount === 0 ? '<button class="btn-remove-answer" title="Törlés">✕</button>' : ''}
          </div>
        `).join('');

        const addBtnHTML = voteCount === 0
          ? `<button class="btn-add-answer" id="ujValaszBtn">+ Új válasz hozzáadása</button>`
          : '';

        openModal('Válaszok szerkesztése', `
          ${warningHTML}
          <div class="form-group">
            <label>Válaszlehetőségek</label>
            <div class="answer-inputs" id="answerInputs">${answerRowsHTML}</div>
            ${addBtnHTML}
          </div>
        `, () => {
          if (voteCount > 0) { closeModal(); return; }

          const inputs  = modalBody.querySelectorAll('.answer-row input');
          const answers = Array.from(inputs).map(i => i.value.trim()).filter(v => v !== '');

          if (answers.length < 2) {
            showToast('Legalább 2 válasz szükséges!', 'error'); return;
          }

          fetch('./api/modanswers.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qid, answers })
          })
            .then(r => r.json())
            .then(res => {
              if (res.error) throw new Error(res.error);
              showToast('⚒ Válaszok sikeresen frissítve!');
              closeModal(); betolt();
            })
            .catch(err => showToast(err.message, 'error'));
        });

        /* Remove answer buttons */
        modalBody.addEventListener('click', e => {
          if (!e.target.classList.contains('btn-remove-answer')) return;
          const container = document.getElementById('answerInputs');
          if (container.querySelectorAll('.answer-row').length > 2) {
            e.target.closest('.answer-row').remove();
          } else {
            showToast('Legalább 2 válasz szükséges!', 'error');
          }
        });

        /* Add answer button */
        const ujBtn = document.getElementById('ujValaszBtn');
        if (ujBtn) {
          ujBtn.addEventListener('click', () => {
            const container = document.getElementById('answerInputs');
            const row = document.createElement('div');
            row.className = 'answer-row';
            row.innerHTML = `
              <input type="text" placeholder="Új válasz…" />
              <button class="btn-remove-answer" title="Törlés">✕</button>
            `;
            container.appendChild(row);
            row.querySelector('input').focus();
          });
        }
      })
      .catch(err => showToast(err.message, 'error'));
  }

  /* ── DELETE QUESTION ── */
  function kerdesTorles(qid, qtext) {
    openTorles(
      `Biztosan törlöd ezt a kérdést? "${qtext}" — Ez a művelet nem vonható vissza, az összes szavazat is törlődik.`,
      () => {
        fetch('./api/delquestion.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qid })
        })
          .then(r => r.json())
          .then(data => {
            if (data.error) throw new Error(data.error);
            showToast('🔥 Kérdés törölve!');
            closeTorles(); betolt();
          })
          .catch(err => {
            showToast(err.message, 'error');
            closeTorles();
          });
      }
    );
  }

  /* ── START ── */
  betolt();
});

/* ── UTILITY ── */
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}