
function updateUserInfo() {
  fetch('/api/user')
    .then(res => res.json())
    .then(data => {
      if(data.loggedIn){
        localStorage.setItem('currentUser', data.user.username);
        if(document.getElementById('logoutLink')){
          document.getElementById('logoutLink').style.display = 'inline';
        }
      } else {
        localStorage.removeItem('currentUser');
      }
    });
}
updateUserInfo();

if(document.getElementById('loginForm')){
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json())
      .then(data => {
        document.getElementById('loginMsg').textContent = data.message;
        if(data.success){
          setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
        }
      })
      .catch(() => { document.getElementById('loginMsg').textContent = 'Greška'; });
  });
}

if(document.getElementById('registerForm')){
  document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json())
      .then(data => {
        document.getElementById('registerMsg').textContent = data.message;
        if(data.success){
          setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        }
      })
      .catch(() => { document.getElementById('registerMsg').textContent = 'Greška'; });
  });
}

if(document.getElementById('logoutLink')){
  document.getElementById('logoutLink').addEventListener('click', function(e){
    e.preventDefault();
    fetch('/api/logout')
      .then(() => { window.location.href = 'index.html'; })
      .catch(() => {});
  });
}
