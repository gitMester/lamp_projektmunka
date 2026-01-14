document.getElementById('regForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const adat = {
      username: document.getElementById('username').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value
  };

  try {
      const response = await fetch('regisztracio.php', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(adat)
      });

      let valasz;
      try {
          valasz = await response.json(); // JSON parse
      } catch(e) {
          document.getElementById('uzenet').innerText = 'Szerver nem JSON-t küldött!';
          console.error('JSON parse hiba:', e);
          return;
      }

      document.getElementById('uzenet').style.color = valasz.status === 'success' ? 'green' : 'red';
      document.getElementById('uzenet').innerText = valasz.message || 'Ismeretlen hiba';

  } catch(error) {
      document.getElementById('uzenet').style.color = 'red';
      document.getElementById('uzenet').innerText = 'Hálózati hiba történt';
      console.error(error);
  }
});
