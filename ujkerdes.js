let valaszCounter = 2;

document.addEventListener('DOMContentLoaded', () => {
  const uzenet = document.getElementById('uzenet');

  // Felhasználó lekérése
  fetch('./api/users.php')
    .then(res => res.json())
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

  // Form submit kezelése
  document.getElementById('ujKerdesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Hibák törlése
    document.getElementById('kerdesHiba').textContent = '';
    document.getElementById('valaszokHiba').textContent = '';
    uzenet.style.display = 'none';

    // Kérdés szövege
    const kerdesText = document.getElementById('kerdesText').value.trim();
    
    if (!kerdesText) {
      document.getElementById('kerdesHiba').textContent = 'A kérdés nem lehet üres!';
      return;
    }

    // Válaszok összegyűjtése
    const valaszInputok = document.querySelectorAll('#valaszokLista input[type="text"]');
    const valaszok = [];
    
    valaszInputok.forEach(input => {
      const text = input.value.trim();
      if (text) {
        valaszok.push(text);
      }
    });

    // Validáció
    if (valaszok.length < 2) {
      document.getElementById('valaszokHiba').textContent = 'Legalább 2 válaszlehetőséget adj meg!';
      return;
    }

    // Adatok küldése
    try {
      const response = await fetch('./api/add_question.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qtext: kerdesText,
          answers: valaszok
        })
      });

      const text = await response.text();
      console.log('Szerver válasz:', text);
      
      const result = JSON.parse(text);

      if (result.error) {
        uzenet.textContent = result.error;
        uzenet.className = 'error';
      } else {
        uzenet.textContent = result.message || 'Kérdés sikeresen létrehozva!';
        uzenet.className = 'success';
        
        // Form ürítése siker esetén
        document.getElementById('ujKerdesForm').reset();
        
        // Válaszok visszaállítása 2-re
        const valaszokLista = document.getElementById('valaszokLista');
        valaszokLista.innerHTML = `
          <div class="valasz-item">
            <input type="text" placeholder="1. válasz" data-valasz="0" required>
            <button type="button" onclick="torolValasz(this)" style="visibility: hidden;">Törlés</button>
          </div>
          <div class="valasz-item">
            <input type="text" placeholder="2. válasz" data-valasz="1" required>
            <button type="button" onclick="torolValasz(this)" style="visibility: hidden;">Törlés</button>
          </div>
        `;
        valaszCounter = 2;

        // Átirányítás 2 másodperc után
        setTimeout(() => {
          window.location.href = 'fooldal.html';
        }, 2000);
      }
    } catch (err) {
      console.error('Hiba:', err);
      uzenet.textContent = 'Hiba történt a kérdés létrehozása során: ' + err.message;
      uzenet.className = 'error';
    }
  });
});

// Új válasz hozzáadása
function ujValasz() {
  const valaszokLista = document.getElementById('valaszokLista');
  const ujValaszItem = document.createElement('div');
  ujValaszItem.className = 'valasz-item';
  ujValaszItem.innerHTML = `
    <input type="text" placeholder="${valaszCounter + 1}. válasz" data-valasz="${valaszCounter}">
    <button type="button" onclick="torolValasz(this)">Törlés</button>
  `;
  valaszokLista.appendChild(ujValaszItem);
  valaszCounter++;
  
  frissitTorolGombok();
}

// Válasz törlése
function torolValasz(button) {
  const valaszItem = button.parentElement;
  valaszItem.remove();
  
  // Számozás frissítése
  const valaszInputok = document.querySelectorAll('#valaszokLista input[type="text"]');
  valaszInputok.forEach((input, index) => {
    input.placeholder = `${index + 1}. válasz`;
    input.dataset.valasz = index;
  });
  
  valaszCounter = valaszInputok.length;
  frissitTorolGombok();
}

// Törlés gombok láthatóságának frissítése
function frissitTorolGombok() {
  const valaszItemek = document.querySelectorAll('.valasz-item');
  valaszItemek.forEach((item, index) => {
    const torolGomb = item.querySelector('button');
    if (valaszItemek.length <= 0) {
      torolGomb.style.visibility = 'hidden';
    } else {
      torolGomb.style.visibility = 'visible';
    }
  });
}
