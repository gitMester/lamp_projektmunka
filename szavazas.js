document.addEventListener('DOMContentLoaded', () => {
  const kerdesContainer = document.getElementById('kerdesContainer');
  const kerdesText = document.getElementById('kerdesText');
  const valaszokContainer = document.getElementById('valaszokContainer');
  const uzenet = document.getElementById('uzenet');

  let aktualisKerdes = null;

  // Felhasználó lekérése
  fetch('./api/users.php')
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        document.getElementById('felhasznalonevMegjelenites').textContent = data.name;
      } else {
        window.location.href = './bejelentkezes.html';
      }
    });

  // Kérdés betöltése
  fetch('./api/get_question.php')
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      aktualisKerdes = data;
      kerdesText.textContent = data.qtext;
      valaszokContainer.innerHTML = '';
      data.answers.forEach(answer => {
        const label = document.createElement('label');
        label.className = 'valasz-option';
        label.innerHTML = `<input type="radio" name="valasz" value="${answer.aid}"> ${answer.atext}`;
        valaszokContainer.appendChild(label);
      });
      document.querySelector('.loading').style.display = 'none';
      kerdesContainer.style.display = 'block';
    })
    .catch(err => {
      document.querySelector('.loading').textContent = err.message || 'Hiba a kérdés betöltésekor';
    });

  // Szavazás submit
  document.getElementById('szavazasForm').addEventListener('submit', async e => {
    e.preventDefault();
    const selected = document.querySelector('input[name="valasz"]:checked');
    if (!selected) {
      uzenet.textContent = 'Kérlek válassz egy lehetőséget!';
      uzenet.className = 'error';
      return;
    }

    try {
      const response = await fetch('./api/vote.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ qid: aktualisKerdes.qid, aid: parseInt(selected.value) })
      });
      const result = await response.json();
      if (result.error) {
        uzenet.textContent = result.error;
        uzenet.className = 'error';
      } else {
        uzenet.textContent = result.message || 'Szavazat rögzítve!';
        uzenet.className = 'success';
        document.querySelectorAll('input[name="valasz"]').forEach(inp => inp.disabled = true);
        e.target.querySelector('button').disabled = true;
      }
    } catch (err) {
      uzenet.textContent = 'Hiba a szavazat rögzítésekor';
      uzenet.className = 'error';
    }
  });
});
