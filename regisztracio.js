document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('regForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const adat = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };
        fetch('regisztracio.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adat)
        })
        .then(response => response.text())
        .then(text => {
            // document.getElementById('uzenet').innerText = text;
        })
        .catch(error => {
            document.getElementById('uzenet').innerText = 'Hiba történt';
            console.log(error);
        });

    });
});
