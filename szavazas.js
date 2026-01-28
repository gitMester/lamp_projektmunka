document.addEventListener('DOMContentLoaded', () => {
  const kerdesText = document.getElementById('kerdesText');
  const valaszokContainer = document.getElementById('valaszokContainer');
  const uzenet = document.getElementById('uzenet');
  const loading = document.querySelector('.loading');
  const kerdesContainer = document.getElementById('kerdesContainer');

  let aktualisKerdes = null;

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

  /* Kérdés betöltése – API mappából */
  fetch('./api/question.php')
    .then(r => r.json())
    .then(data => {
      if (data.error) throw new Error(data.error);  

      aktualisKerdes = data;
      kerdesText.textContent = data.qtext;
      valaszokContainer.innerHTML = '';

      data.answers.forEach(a => {
        const label = document.createElement('label');
        label.className = 'valasz-option';
        label.innerHTML = `
          <input type="radio" name="valasz" value="${a.aid}">
          ${a.atext}
        `;
        valaszokContainer.appendChild(label);
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
      uzenet.className = 'error';
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
      uzenet.className = 'error';
    } else {
      uzenet.textContent = result.message;
      uzenet.className = 'success';
      document.querySelectorAll('input[name="valasz"]').forEach(i => i.disabled = true);
      e.target.querySelector('button').disabled = true;
    }

    uzenet.style.display = 'block';
  });
});
