// public/js/main.js

import { register } from './register';
import { login } from './login';
import { logout } from './logout';

export async function fetchLobby() {
  const token = localStorage.getItem('token');

  if (!token) {
    // If the token is not found, redirect to the login page
    location.href = '/user/login';
    return;
  }

  
  try {
    const response = await fetch('/user/lobby', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const lobbyHtml = await response.text();
   

    if (response.status === 200) {
      // Render the lobby HTML
      document.querySelector('body').innerHTML = lobbyHtml;
    } else {
      console.error('Error fetching lobby:', lobbyHtml);
    }
  } catch (error) {
    console.error('Error fetching lobby:', error);
  }
}

function checkLoggedIn(){
  const token = localStorage.getItem('token');
  if(token){
    fetchLobby();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  const logoutButton = document.getElementById("logout");



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

  // stop from going to log in if token exist
  checkLoggedIn();

});


 // Add a separate event listener for the logout button
 document.addEventListener('click', (event) => {
  if (event.target && event.target.id === 'logout') {
    event.preventDefault();
    logout();
  }
});