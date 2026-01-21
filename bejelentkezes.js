document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const adat = {
            name: document.getElementById('username').value,
            pass: document.getElementById('password').value
        };
        
        console.log('Bejelentkezési kísérlet:', adat.name);

        try {
            const response = await fetch('./api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(adat)
            });

            const valasz = await response.json();
            
            if (response.ok) {
                // Sikeres bejelentkezés
                document.getElementById('uzenet').innerText = valasz.message;
                document.getElementById('uzenet').style.color = 'green';
                
                // Átirányítás a főoldalra vagy dashboard-ra
                setTimeout(() => {
                    if (valasz.role === 'admin') {
                        window.location.href = 'admin.html'; // Admin felület
                    } else {
                        window.location.href = 'index.html'; // Normál felhasználói felület
                    }
                }, 1000);
                
            } else {
                // Hiba történt
                document.getElementById('uzenet').innerText = valasz.error || 'Bejelentkezési hiba';
                document.getElementById('uzenet').style.color = 'red';
            }
            
        } catch (error) {
            document.getElementById('uzenet').innerText = 'Hiba történt a kérés során';
            document.getElementById('uzenet').style.color = 'red';
            console.error('Fetch hiba:', error);
        }
    });
});










// document.addEventListener('DOMContentLoaded', function() {
//     const form = document.getElementById('loginForm');
//     const uzenet = document.getElementById('uzenet');

//     form.addEventListener('submit', async function(e) {
//         e.preventDefault();

//         // Adatok összegyűjtése és átnevezés a PHP által várt kulcsokra
//         const adat = {
//             name: document.getElementById('username').value,
//             pass: document.getElementById('password').value
//         };

//         console.log("Küldött adatok:", adat);

//         try {
//             const response = await fetch('bejelentkezes.php', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(adat)
//             });

//             const text = await response.text();
//             console.log("RAW PHP válasz:", text);

//             let valasz;
//             try {
//                 valasz = JSON.parse(text);
//             } catch (e) {
//                 throw new Error("Nem JSON válasz: " + text);
//             }

//             // Hibakezelés és üzenet megjelenítés
//             if (valasz.error) {
//                 uzenet.innerText = valasz.error;
//             } else if (valasz.message) {
//                 uzenet.innerText = valasz.message;
//                 // Sikeres bejelentkezés → opcionális: átirányítás
//                 // window.location.href = "dashboard.html";
//             } else {
//                 uzenet.innerText = "Ismeretlen válasz a szervertől.";
//             }

//         } catch (error) {
//             console.error(error);
//             uzenet.innerText = "Hiba történt a kapcsolat során.";
//         }
//     });
// });
