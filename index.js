document.addEventListener('DOMContentLoaded', () => {
  const kerdesekPreview = document.getElementById('kerdesekPreview');
  const loading = document.querySelector('.loading');

  // Kérdések betöltése
  fetch('./api/questions.php')
    .then(r => r.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      
      kerdesekPreview.innerHTML = '';
      
      if (data.length === 0) {
        kerdesekPreview.innerHTML = '<h3>Nincsenek elérhető kérdések.</h3>';
      } else {
        data.forEach(kerdes => {
          const h3 = document.createElement('h3');
          h3.textContent = `${kerdes.qtext} (Bejelentkezés szükséges)`;
          kerdesekPreview.appendChild(h3);
        });
      }
      
      loading.style.display = 'none';
    })
    .catch(err => {
      console.error('Hiba a kérdések betöltésekor:', err);
      kerdesekPreview.innerHTML = '<h3 class="error">Hiba történt a kérdések betöltésekor.</h3>';
      loading.style.display = 'none';
    });
});