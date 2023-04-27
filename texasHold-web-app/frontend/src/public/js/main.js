
const register = require('./register');
const login = require('./login');
const logout = require('./logout');


function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const logoutLink = document.querySelector('#logout');
  if (token && logoutLink) {
    logoutLink.classList.remove('hidden');
  } else if (!token && logoutLink) {
    logoutLink.classList.add('hidden');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  const logoutButton = document.getElementById("logout");

  checkLoginStatus();

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      register(event);
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      login(event);
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();
      logout();
    });
  }


  
});
