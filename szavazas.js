document.addEventListener('DOMContentLoaded', () => {
  const kerdesText = document.getElementById('kerdesText');
  const valaszokContainer = document.getElementById('valaszokContainer');
  const uzenet = document.getElementById('uzenet');
  const loading = document.querySelector('.loading');
  const kerdesContainer = document.getElementById('kerdesContainer');

  let aktualisKerdes = null;

  const urlParams = new URLSearchParams(window.location.search);
  const qidParam = urlParams.get('qid');

  /* Felhasználó */
  fetch('./api/users.php')
    .then(r => r.json())
    .then(d => {
      if (!d.loggedIn) {
        window.location.href = 'bejelentkezes.html';
      } else {
        document.getElementById('felhasznalonevMegjelenites').textContent = d.name;
      }
    });

  /* Kérdés betöltése */
  const questionUrl = qidParam ? `./api/question.php?qid=${qidParam}` : './api/question.php';

  fetch(questionUrl)
    .then(r => r.json())
    .then(data => {
      if (data.error) throw new Error(data.error);

      aktualisKerdes = data;
      kerdesText.textContent = data.qtext;
      valaszokContainer.innerHTML = '';

      data.answers.forEach(a => {
        // ✅ JAVÍTÁS: answer-item + answer-label osztályok, hogy a CSS működjön
        const item = document.createElement('div');
        item.className = 'answer-item';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'valasz';
        radio.value = a.aid;

        const label = document.createElement('label');
        label.className = 'answer-label';
        label.textContent = a.atext;

        item.appendChild(radio);
        item.appendChild(label);
        valaszokContainer.appendChild(item);
      });

      loading.style.display = 'none';
      kerdesContainer.style.display = 'block';
    })
    .catch(err => {
      loading.textContent = err.message;
    });

  /* Szavazás */
  document.getElementById('szavazasForm').addEventListener('submit', async e => {
    e.preventDefault();

    const selected = document.querySelector('input[name="valasz"]:checked');
    if (!selected) {
      uzenet.textContent = 'Válassz egy lehetőséget!';
      uzenet.className = 'message error';
      uzenet.style.display = 'block';
      return;
    }

    const res = await fetch('./api/vote.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qid: aktualisKerdes.qid,
        aid: Number(selected.value)
      })
    });

    const result = await res.json();

    if (result.error) {
      uzenet.textContent = result.error;
      uzenet.className = 'message error';
    } else {
      uzenet.textContent = result.message;
      uzenet.className = 'message success';
      document.querySelectorAll('input[name="valasz"]').forEach(i => i.disabled = true);
      e.target.querySelector('button').disabled = true;
    }

    uzenet.style.display = 'block';
  });
});