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

// document.addEventListener('DOMContentLoaded', function() {
//     document.getElementById('regForm').addEventListener('submit', async function(e) {
//         e.preventDefault();
        
//         const adat = {
//             username: document.getElementById('username').value,
//             password: document.getElementById('password').value
//         };
        
//         console.log('Küldés előtt:', adat.username, adat.password);

//         try {
//             const response = await fetch('regisztracio.php', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(adat)
//             });

//             const valasz = await response.json();
            
//             if (response.ok) {
//                 document.getElementById('uzenet').innerText = valasz.message;
//                 document.getElementById('uzenet').style.color = 'green';
//                 // Form ürítése sikeres regisztráció után
//                 document.getElementById('regForm').reset();
//             } else {
//                 document.getElementById('uzenet').innerText = valasz.error || 'Hiba történt';
//                 document.getElementById('uzenet').style.color = 'red';
//             }
            
//         } catch (error) {
//             document.getElementById('uzenet').innerText = 'Hiba történt a kérés során';
//             document.getElementById('uzenet').style.color = 'red';
//             console.error('Fetch hiba:', error);
//         }
//     });
// });





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
