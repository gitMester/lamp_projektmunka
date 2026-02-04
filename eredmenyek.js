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

    // Alap színek
    const alapSzinek = [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#E74C3C',
        '#3498DB',
        '#2ECC71',
        '#F39C12'
    ];

    // Eredmények lekérése a meglévő result.php-ből
    fetch(`./api/result.php?qid=${qid}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }

            // Kérdés címének beállítása
            kerdesCim.textContent = data.qtext;

            // Összes szavazat kiszámítása
            let osszSzavazatSzam = 0;
            data.answers.forEach(answer => {
                osszSzavazatSzam += answer.votes;
            });

            osszSzavazat.textContent = osszSzavazatSzam;

            // Kördiagram adatok előkészítése
            const labels = data.answers.map(answer => answer.atext);
            const votesData = data.answers.map(answer => answer.votes);
            const colors = data.answers.map((_, index) => alapSzinek[index % alapSzinek.length]);

            // Canvas és context
            const canvas = document.getElementById('pieChart');
            const ctx = canvas.getContext('2d');

            // Radial gradient színek létrehozása minden szelethez
            const gradientColors = colors.map(color => {
                const gradient = ctx.createRadialGradient(
                    canvas.width / 2, 
                    canvas.height / 2, 
                    0,
                    canvas.width / 2, 
                    canvas.height / 2, 
                    canvas.width / 2
                );
                
                // Világosabb szín a középen, sötétebb a széleken
                gradient.addColorStop(0, lightenColor(color, 40));
                gradient.addColorStop(0.5, color);
                gradient.addColorStop(1, darkenColor(color, 20));
                
                return gradient;
            });

            // Kördiagram létrehozása
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: votesData,
                        backgroundColor: gradientColors,
                        borderColor: '#ffffff',
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: {
                                    size: 14
                                },
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    return data.labels.map((label, i) => ({
                                        text: label,
                                        fillStyle: colors[i],
                                        hidden: false,
                                        index: i
                                    }));
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: ${value} szavazat (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });

            // Válaszok megjelenítése progress bar-okkal
            valaszokLista.innerHTML = '';

            if (data.answers.length === 0) {
                valaszokLista.innerHTML = '<p style="text-align: center; color: #666;">Még nincsenek válaszlehetőségek ehhez a kérdéshez.</p>';
            } else {
                data.answers.forEach((answer, index) => {
                    const szavazatok = answer.votes;
                    const szazalek = osszSzavazatSzam > 0 
                        ? Math.round((szavazatok / osszSzavazatSzam) * 100) 
                        : 0;
                    const szin = colors[index];

                    const valaszDiv = document.createElement('div');
                    valaszDiv.className = 'valasz-item';
                    valaszDiv.innerHTML = `
                        <div class="valasz-header">
                            <span class="valasz-szoveg">
                                <span class="szin-jelzo" style="background: radial-gradient(circle at 30% 30%, ${lightenColor(szin, 40)}, ${szin}, ${darkenColor(szin, 20)})"></span>
                                ${answer.atext}
                            </span>
                            <span class="szavazat-info">${szavazatok} szavazat</span>
                        </div>
                        <div class="progress-bar-container">
                            ${szazalek > 0 ? `
                                <div class="progress-bar" style="width: ${szazalek}%; background: linear-gradient(90deg, ${lightenColor(szin, 20)}, ${szin}, ${darkenColor(szin, 10)});">
                                    ${szazalek > 5 ? `<span class="progress-percent">${szazalek}%</span>` : ''}
                                </div>
                            ` : ''}
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

// Segédfüggvények a színek világosításához és sötétítéséhez
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + 
           (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
           .toString(16).slice(1);
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R>0?R:0)*0x10000 + 
           (G>0?G:0)*0x100 + (B>0?B:0))
           .toString(16).slice(1);
}