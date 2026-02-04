document.addEventListener('DOMContentLoaded', function() {
    const spanFelhasznalo = document.getElementById('felhasznalonevMegjelenites');
    const loading = document.querySelector('.loading');
    const eredmenyContainer = document.getElementById('eredmenyContainer');
    const kerdesCim = document.getElementById('kerdesCim');
    const valaszokLista = document.getElementById('valaszokLista');
    const osszSzavazat = document.getElementById('osszSzavazat');

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

    // URL paraméter beolvasása
    const urlParams = new URLSearchParams(window.location.search);
    const qid = urlParams.get('qid');

    if (!qid) {
        loading.innerHTML = '<div class="error">Nincs megadva kérdés azonosító!</div>';
        return;
    }

    // Eredmények betöltése
    betoltEredmenyek(qid);
});

function betoltEredmenyek(qid) {
    const loading = document.querySelector('.loading');
    const eredmenyContainer = document.getElementById('eredmenyContainer');
    const kerdesCim = document.getElementById('kerdesCim');
    const valaszokLista = document.getElementById('valaszokLista');
    const osszSzavazat = document.getElementById('osszSzavazat');

    // Kérdés és válaszok lekérése
    fetch(`./api/question.php?qid=${qid}`)
        .then(res => res.json())
        .then(questionData => {
            if (questionData.error) {
                throw new Error(questionData.error);
            }

            kerdesCim.textContent = questionData.qtext;

            // Szavazatok lekérése
            return fetch(`./api/results.php?qid=${qid}`)
                .then(res => res.json())
                .then(votesData => {
                    return { questionData, votesData };
                });
        })
        .then(({ questionData, votesData }) => {
            // Szavazatok összeszámolása válaszonként
            const szavazatokSzama = {};
            let osszSzavazatSzam = 0;

            votesData.forEach(vote => {
                const aid = vote.aid;
                szavazatokSzama[aid] = (szavazatokSzama[aid] || 0) + 1;
                osszSzavazatSzam++;
            });

            osszSzavazat.textContent = osszSzavazatSzam;

            // Válaszok megjelenítése progress bar-okkal
            valaszokLista.innerHTML = '';

            if (questionData.answers.length === 0) {
                valaszokLista.innerHTML = '<p style="text-align: center; color: #666;">Még nincsenek válaszlehetőségek ehhez a kérdéshez.</p>';
            } else {
                questionData.answers.forEach(answer => {
                    const szavazatok = szavazatokSzama[answer.aid] || 0;
                    const szazalek = osszSzavazatSzam > 0 
                        ? Math.round((szavazatok / osszSzavazatSzam) * 100) 
                        : 0;

                    const valaszDiv = document.createElement('div');
                    valaszDiv.className = 'valasz-item';
                    valaszDiv.innerHTML = `
                        <div class="valasz-header">
                            <span class="valasz-szoveg">${answer.atext}</span>
                            <span class="szavazat-info">${szavazatok} szavazat</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${szazalek}%">
                                ${szazalek > 5 ? `<span class="progress-percent">${szazalek}%</span>` : ''}
                            </div>
                        </div>
                        ${szazalek <= 5 && szazalek > 0 ? `<div style="text-align: right; margin-top: 5px; font-size: 12px; color: #888;">${szazalek}%</div>` : ''}
                    `;
                    valaszokLista.appendChild(valaszDiv);
                });
            }

            loading.style.display = 'none';
            eredmenyContainer.style.display = 'block';
        })
        .catch(err => {
            console.error('Hiba az eredmények betöltésekor:', err);
            loading.innerHTML = `<div class="error">Hiba történt az eredmények betöltésekor: ${err.message}</div>`;
        });
}