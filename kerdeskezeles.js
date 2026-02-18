document.addEventListener('DOMContentLoaded', function () {

  const lista = document.getElementById('kerdesekLista');
  const loading = document.getElementById('loading');

  // --- TOAST ---
  const toast = document.createElement('div');
  toast.className = 'toast';
  document.body.appendChild(toast);

  function showToast(msg, type = 'success') {
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // --- MODAL (szerkesztés) ---
  const overlay    = document.getElementById('modalOverlay');
  const modalCim   = document.getElementById('modalCim');
  const modalBody  = document.getElementById('modalBody');
  const modalMent  = document.getElementById('modalMent');
  const modalMegse = document.getElementById('modalMegse');
  const modalClose = document.getElementById('modalClose');

  let modalSaveCallback = null;

  function openModal(cim, bodyHTML, onSave) {
    modalCim.textContent = cim;
    modalBody.innerHTML = bodyHTML;
    modalSaveCallback = onSave;
    overlay.classList.add('active');
  }

  function closeModal() {
    overlay.classList.remove('active');
    modalSaveCallback = null;
  }

  modalClose.addEventListener('click', closeModal);
  modalMegse.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  modalMent.addEventListener('click', () => {
    if (modalSaveCallback) modalSaveCallback();
  });

  // --- TÖRLÉS MODAL ---
  const torlesOverlay = document.getElementById('torlesOverlay');
  const torlesSzoveg  = document.getElementById('torlesSzoveg');
  const torlesOk      = document.getElementById('torlesOk');
  const torlesMegse   = document.getElementById('torlesMegse');
  const torlesClose   = document.getElementById('torlesClose');

  let torlesCallback = null;

  function openTorles(szoveg, onConfirm) {
    torlesSzoveg.textContent = szoveg;
    torlesCallback = onConfirm;
    torlesOverlay.classList.add('active');
  }

  function closeTorles() {
    torlesOverlay.classList.remove('active');
    torlesCallback = null;
  }

  torlesClose.addEventListener('click', closeTorles);
  torlesMegse.addEventListener('click', closeTorles);
  torlesOverlay.addEventListener('click', e => { if (e.target === torlesOverlay) closeTorles(); });

  torlesOk.addEventListener('click', () => {
    if (torlesCallback) torlesCallback();
  });

  // --- KÉRDÉSEK BETÖLTÉSE ---
  function betolt() {
    loading.style.display = '';
    lista.innerHTML = '';

    fetch('./api/questions.php')
      .then(r => r.json())
      .then(data => {
        loading.style.display = 'none';

        if (data.error) throw new Error(data.error);

        if (data.length === 0) {
          lista.innerHTML = `<div class="empty-state"><h3>Nincsenek kérdések</h3><p>Hozz létre egyet az "Új kérdés" gombbal.</p></div>`;
          return;
        }

        data.forEach(kerdes => {
          const card = document.createElement('div');
          card.className = 'kerdes-card';
          card.dataset.qid = kerdes.qid;
          card.innerHTML = `
            <div class="kerdes-top">
              <span class="kerdes-szoveg">${kerdes.qtext}</span>
              <div class="kerdes-meta">
                <span class="vote-badge">🗳️ ${kerdes.vote_count} szavazat</span>
              </div>
            </div>
            <div class="kerdes-actions">
              <button class="btn btn-edit-q" data-qid="${kerdes.qid}" data-qtext="${encodeURIComponent(kerdes.qtext)}">✏️ Kérdés szerkesztése</button>
              <button class="btn btn-edit-a" data-qid="${kerdes.qid}" data-votes="${kerdes.vote_count}">📝 Válaszok szerkesztése</button>
              <a href="eredmenyek.html?qid=${kerdes.qid}" class="btn btn-results-link">📊 Eredmények</a>
              <button class="btn btn-delete" data-qid="${kerdes.qid}" data-qtext="${encodeURIComponent(kerdes.qtext)}">🗑️ Törlés</button>
            </div>
          `;
          lista.appendChild(card);
        });

        // Eseménykezelők
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
        loading.style.display = 'none';
        lista.innerHTML = `<div class="empty-state"><h3>Hiba történt</h3><p>${err.message}</p></div>`;
      });
  }

  // --- KÉRDÉS SZERKESZTÉSE ---
  function kerdeszSzerkeszt(qid, qtext) {
    const body = `
      <div class="form-group">
        <label for="kerdeszInput">Kérdés szövege</label>
        <input type="text" id="kerdeszInput" value="${qtext.replace(/"/g, '&quot;')}" placeholder="Add meg a kérdést..." />
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
          showToast('Kérdés sikeresen frissítve!');
          closeModal();
          betolt();
        })
        .catch(err => showToast(err.message, 'error'));
    });
  }

  // --- VÁLASZOK SZERKESZTÉSE ---
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
            <input type="text" value="${a.atext.replace(/"/g, '&quot;')}" ${voteCount > 0 ? 'disabled' : ''} />
            ${voteCount === 0 ? '<button class="btn-remove-answer" title="Törlés">✕</button>' : ''}
          </div>
        `).join('');

        const addBtnHTML = voteCount === 0
          ? `<button class="btn-add-answer" id="ujValaszBtn">+ Új válasz hozzáadása</button>`
          : '';

        const body = `
          ${warningHTML}
          <div class="form-group">
            <label>Válaszlehetőségek</label>
            <div class="answer-inputs" id="answerInputs">
              ${answerRowsHTML}
            </div>
            ${addBtnHTML}
          </div>
        `;

        openModal('Válaszok szerkesztése', body, () => {
          if (voteCount > 0) { closeModal(); return; }

          const inputs = modalBody.querySelectorAll('.answer-row input');
          const answers = Array.from(inputs).map(i => i.value.trim()).filter(v => v !== '');

          if (answers.length < 2) {
            showToast('Legalább 2 válasz szükséges!', 'error');
            return;
          }

          fetch('./api/modanswers.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qid, answers })
          })
            .then(r => r.json())
            .then(res => {
              if (res.error) throw new Error(res.error);
              showToast('Válaszok sikeresen frissítve!');
              closeModal();
              betolt();
            })
            .catch(err => showToast(err.message, 'error'));
        });

        // Válasz törlés gombok
        modalBody.addEventListener('click', e => {
          if (e.target.classList.contains('btn-remove-answer')) {
            const row = e.target.closest('.answer-row');
            const container = document.getElementById('answerInputs');
            if (container.querySelectorAll('.answer-row').length > 2) {
              row.remove();
            } else {
              showToast('Legalább 2 válasz szükséges!', 'error');
            }
          }
        });

        // Új válasz hozzáadása
        const ujBtn = document.getElementById('ujValaszBtn');
        if (ujBtn) {
          ujBtn.addEventListener('click', () => {
            const container = document.getElementById('answerInputs');
            const row = document.createElement('div');
            row.className = 'answer-row';
            row.innerHTML = `<input type="text" placeholder="Új válasz..." /><button class="btn-remove-answer" title="Törlés">✕</button>`;
            container.appendChild(row);
            row.querySelector('input').focus();
          });
        }
      })
      .catch(err => showToast(err.message, 'error'));
  }

  // --- KÉRDÉS TÖRLÉSE ---
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
            showToast('Kérdés törölve!');
            closeTorles();
            betolt();
          })
          .catch(err => {
            showToast(err.message, 'error');
            closeTorles();
          });
      }
    );
  }

  // --- INDÍTÁS ---
  betolt();
});