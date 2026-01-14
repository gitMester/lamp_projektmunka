document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('regForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const adat = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };
        
          console.log(adat.username, adat.password);

        fetch('regisztracio.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adat)
        })
        .then(response => response.json())
        .then(valasz => {
            document.getElementById('uzenet').innerText = valasz.message;
        })
        .catch(error => {
            document.getElementById('uzenet').innerText = 'Hiba történt';
            console.log(error);
        });

    });
});







// document.getElementById('regForm').addEventListener('submit', function (e) {
//   e.preventDefault();

//   const adat = {
//       username: document.getElementById('username').value,
//       password: document.getElementById('password').value
//   };

//   console.log(adat.username, adat.password);

//   fetch('regisztracio.php', {
//       method: 'POST',
//       headers: {
//           'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(adat)
//   })
//   .then(response => response.json())
//   .then(valasz => {
//       document.getElementById('uzenet').innerText = valasz.message;
//   })
//   .catch(error => {
//       document.getElementById('uzenet').innerText = 'Hiba történt';
//       console.log(error);
//   });
// });
