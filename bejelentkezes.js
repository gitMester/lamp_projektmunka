document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const adat = {
            name: document.getElementById('username').value,
            pass: document.getElementById('password').value
        };
        
        console.log('Bejelentkezési kísérlet:', adat.name);

        try {
            const response = await fetch('/api/login.php', {
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
                    window.location.href = 'fooldal.html';
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
