document.addEventListener('DOMContentLoaded', function() {
    const spanFelhasznalo = document.getElementById('felhasznalonevMegjelenites');
    const kerdesekLista = document.getElementById('kerdesekLista');
    const loading = document.querySelector('.loading');

    // Felhasználó ellenőrzése
    fetch('./api/users.php')
        .then(res => res.json())
        .then(data => {
            if (data.loggedIn) {
                spanFelhasznalo.textContent = data.name;
            } else {
                spanFelhasznalo.textContent = 'Vendég';
                alert('Nem vagy bejelentkezve! Átirányítás a bejelentkezéshez.');
                window.location.href = './bejelentkezes.html';
            }
        })
        .catch(err => {
            console.error('Hiba a felhasználó lekérésében:', err);
            spanFelhasznalo.textContent = 'Vendég';
        });

    // Kérdések betöltése
    fetch('./api/questions.php')
        .then(r => r.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            
            kerdesekLista.innerHTML = '';
            
            if (data.length === 0) {
                kerdesekLista.innerHTML = '<li>Nincsenek elérhető kérdések.</li>';
            } else {
                data.forEach(kerdes => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        ${kerdes.qtext}
                        <a href="szavazas.html?qid=${kerdes.qid}">[Szavazás]</a>
                        <a href="eredmenyek.html?qid=${kerdes.qid}">[Eredmények]</a>
                    `;
                    kerdesekLista.appendChild(li);
                });
            }
            
            if (loading) loading.style.display = 'none';
        })
        .catch(err => {
            console.error('Hiba a kérdések betöltésekor:', err);
            kerdesekLista.innerHTML = '<li class="error">Hiba történt a kérdések betöltésekor.</li>';
            if (loading) loading.style.display = 'none';
        });
});