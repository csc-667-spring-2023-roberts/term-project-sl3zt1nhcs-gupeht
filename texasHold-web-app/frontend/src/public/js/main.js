import { register } from "./register";
import { login } from "./login";
import { logout } from "./logout";


// Import socket.io-client
import io from "socket.io-client";


// Connect to the server
const socket = io();


socket.on('chat message', function(msg){
  // Append the message to the chat box
  const chatBox = document.getElementById('chat-box');
  if (chatBox) {
    chatBox.innerHTML += '<p>' + msg + '</p>';
  }
});


function chatEvent(){

  const chatForm = document.getElementById('chat-form');
  if (chatForm) {
    chatForm.addEventListener('submit', function(e){
      e.preventDefault();
      const input = e.target.querySelector('input');
      socket.emit('chat message', input.value);
      input.value = '';
    });
  }
}





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

         chatEvent();
      }

      document.addEventListener("DOMContentLoaded", () => {
 
        socket.emit('join', { username: 'TestUser' }); // Replace 'TestUser' with your logged in user's name
       
      });
      

          

    }catch(error){
      console.error('Error checking authentication status:',error);
    }
  }
}


export async function fetchLobby() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/user/lobby', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const lobbyHtml = await response.text();
   
    // Always update the lobby HTML
    document.querySelector('body').innerHTML = lobbyHtml;
    // Update the URL to user/lobby
    window.history.pushState({}, '', '/user/lobby');

     

    if (response.status !== 200) {
      console.error('Error fetching lobby:', lobbyHtml);
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





