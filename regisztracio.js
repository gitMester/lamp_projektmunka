document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('regForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const adat = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };
        
          console.log(adat.username, adat.password);

        fetch('./api/regisztracio.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adat)
        })
        .then(response => response.text())
        .then(text => {
            console.log("RAW PHP válasz:", text);
            document.getElementById('uzenet').innerText = text;
        })
        .catch(error => {
            document.getElementById('uzenet').innerText = 'Hiba történt';
            console.log(error);
        });

    });
});
