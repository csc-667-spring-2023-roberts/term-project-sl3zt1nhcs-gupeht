import { register } from "./register";
import { login } from "./login";
import { logout } from "./logout";
import { io } from 'socket.io-client';
let socket;

async function redirectToLobbyIfAuthenticated(){
  const token = localStorage.getItem('token');
  if (token){
    try{
      const response = await fetch('/user/is-authenticated',{
        headers:{
          'Authorization': `Bearer ${token}`,
        },
      });

      if ( response.status === 200){
         fetchLobby();
      }
    }catch(error){
      console.error('Error checking authentication status:',error);
    }
  }
}

export async function fetchLobby() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');
  try {
    const response = await fetch('/user/lobby', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const lobbyHtml = await response.text();
    document.querySelector('body').innerHTML = lobbyHtml;
    window.history.pushState({}, '', '/user/lobby');

    if (response.status !== 200) {
      console.error('Error fetching lobby:', lobbyHtml);
    } else {
      socket = io("http://localhost:3000");
      socket.emit('join_lobby', { userId: userId });
      socket.on('receive_message', (data) => {
        console.log('Received a message:', data);
      });
      document.getElementById('message-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const message = document.getElementById('message-input').value;
        socket.emit('send_message', { message: message, userId: userId });
      });
    }
  } catch (error) {
    console.error('Error fetching lobby:', error);
  }
}


function handleRegistrationForm(){
  const registerForm = document.getElementById("register-form");

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      register(event);
    });
  }
}

  function handleLoginForm() {
   
    const loginForm = document.getElementById("login-form");
   
    if (loginForm) {
      loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        login(event);
      });
    }
  }
  
  function handleLogout(){

    document.addEventListener('click', (event) => {
        if (event.target && event.target.id === 'logout') {
          event.preventDefault();
          logout();
        }
      });

  }
  
function attachEventListeners() {

    handleRegistrationForm();
    handleLoginForm();
    handleLogout();
}



document.addEventListener("DOMContentLoaded", () => {
    
    console.log("DOMContentLoaded event fired");
    redirectToLobbyIfAuthenticated();
    attachEventListeners();
});


