document.addEventListener('DOMContentLoaded', () => {
  const kerdesContainer = document.getElementById('kerdesContainer');
  const kerdesText = document.getElementById('kerdesText');
  const valaszokContainer = document.getElementById('valaszokContainer');
  const uzenet = document.getElementById('uzenet');
  const loadingDiv = document.querySelector('.loading');

  let aktualisKerdes = null;

  // Felhasználó lekérése
  fetch('./api/users.php')
    .then(res => {
      if (!res.ok) throw new Error('Hálózati hiba');
      return res.json();
    })
    .then(data => {
      if (data.loggedIn) {
        document.getElementById('felhasznalonevMegjelenites').textContent = data.name;
      } else {
        window.location.href = './bejelentkezes.html';
      }
    })
    .catch(err => {
      console.error('Felhasználó lekérési hiba:', err);
    });

  // Kérdés betöltése - question.php-t használjuk
  fetch('./api/question.php')
    .then(res => {
      if (!res.ok) throw new Error('Hálózati hiba');
      return res.json();
    })
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
      
      loadingDiv.style.display = 'none';
      kerdesContainer.style.display = 'block';
    })
    .catch(err => {
      loadingDiv.textContent = err.message || 'Hiba a kérdés betöltésekor';
      loadingDiv.style.color = '#721c24';
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
        body: JSON.stringify({ 
          qid: aktualisKerdes.qid, 
          aid: parseInt(selected.value) 
        })
      });
      
      if (!response.ok) throw new Error('Hálózati hiba');
      
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
      uzenet.textContent = 'Hiba a szavazat rögzítésekor: ' + err.message;
      uzenet.className = 'error';
    }
  });
});