document.addEventListener('DOMContentLoaded', function() {
    const spanFelhasznalo = document.getElementById('felhasznalonevMegjelenites');
    const kerdesekLista = document.getElementById('kerdesekLista');
    const loading = document.querySelector('.loading');

    fetch('/api/users.php')
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

    fetch('./api/questions.php')
        .then(r => r.json())
        .then(data => {
            if (data.error) throw new Error(data.error);

            kerdesekLista.innerHTML = '';

            if (data.length === 0) {
                kerdesekLista.innerHTML = `
                    <div class="empty-state">
                        <h3>Nincsenek elérhető kérdések</h3>
                        <p>Jelenleg nincs aktív szavazás.</p>
                    </div>`;
            } else {
                data.forEach(kerdes => {
                    const card = document.createElement('div');
                    card.className = 'question-card';
                    card.innerHTML = `
                        <div class="question-header">
                            <p class="question-text">${kerdes.qtext}</p>
                            <div class="question-meta">
                                <span class="vote-count">
                                    <span class="vote-count-badge">${kerdes.vote_count} szavazat</span>
                                </span>
                            </div>
                        </div>
                        <div class="question-actions">
                            <button class="btn-vote" data-qid="${kerdes.qid}">Szavazás</button>
                            <a href="eredmenyek.html?qid=${kerdes.qid}" class="btn-results">Eredmények</a>
                        </div>
                    `;
                    kerdesekLista.appendChild(card);
                });

                document.querySelectorAll('.btn-vote').forEach(gomb => {
                    gomb.addEventListener('click', function() {
                        const qid = this.getAttribute('data-qid');
                        window.location.href = `szavazas.html?qid=${qid}`;
                    });
                });
            }

            if (loading) loading.style.display = 'none';
        })
        .catch(err => {
            console.error('Hiba a kérdések betöltésekor:', err);
            kerdesekLista.innerHTML = `
                <div class="empty-state">
                    <h3>Hiba történt</h3>
                    <p>Nem sikerült betölteni a kérdéseket.</p>
                </div>`;
            if (loading) loading.style.display = 'none';
        });
});