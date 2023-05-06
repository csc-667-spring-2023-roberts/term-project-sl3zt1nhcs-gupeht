import { register } from "./register";
import { login } from "./login";
import { logout } from "./logout";
import { createGame, getGameList } from "./game";


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
      getGameList();

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
  

export function showCreateGameModal() {
    const createGameModal = document.getElementById("create-game-modal");

    if (createGameModal) {
        createGameModal.removeAttribute("hidden");
        console.log("Show create game modal button clicked");
    } else {
        console.error("Open Create game modal not found");
    }
}

export function closeCreateGameModal() {
    const createGameModal = document.getElementById("create-game-modal");

    if (createGameModal) {
        createGameModal.setAttribute("hidden", "true");
        console.log("close create game modal button clicked");
    } else {
        console.error("Close create game modal not found");
    }
}

function handleCreateGame() {
    const createGameForm = document.getElementById("create-game-form");
   
    if (createGameForm) {
        createGameForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await createGame();
      
        });
    }

 
}

function handleJoinGame(){
  const gameListElement = document.getElementById("game-list");
  if (gameListElement) {
    gameListElement.addEventListener("click", (event) => {
        if (event.target.classList.contains("join-game")) {
            const gameId = event.target.parentElement.dataset.gameId;
            joinGame(gameId);
        }
    });
}


}


function attachEventListeners() {

    handleRegistrationForm();
    handleLoginForm();
    handleLogout();
    window.showCreateGameModal = showCreateGameModal;// expose the showCreateGameModal function globally
    window.closeCreateGameModal = closeCreateGameModal;//expose the showCreateGameModal function globally
    handleCreateGame();
    handleJoinGame();
    
}


document.addEventListener("DOMContentLoaded", () => {
    
    console.log("DOMContentLoaded event fired");
    redirectToLobbyIfAuthenticated();
    attachEventListeners();


});



