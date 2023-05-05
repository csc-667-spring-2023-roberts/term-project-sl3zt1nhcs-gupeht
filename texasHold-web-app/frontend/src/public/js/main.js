import { register } from "./register";
import { login } from "./login";
import { logout } from "./logout";
import { createGame, joinGame, getGameList } from "./game";


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
        await fetchLobby();
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
     
  
      if (response.status === 200) {
        // Render the lobby HTML
        document.querySelector('body').innerHTML = lobbyHtml;
        // Update the URL to user/lobby
         window.history.pushState({}, '', '/user/lobby');
      } else {
        console.error('Error fetching lobby:', lobbyHtml);
      }
    } catch (error) {
      console.error('Error fetching lobby:', error);
    }
  }



  function handleRegisterAndLoginForm() {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
   
  
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
    const gameListElement = document.getElementById("game-list");

    if (createGameForm) {
        createGameForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await createGame();
        });
    }

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

    handleLogout();
    handleCreateGame();
    handleRegisterAndLoginForm();
     // Add this line to expose the showCreateGameModal function globally
     window.showCreateGameModal = showCreateGameModal;
     window.closeCreateGameModal = closeCreateGameModal;
}


document.addEventListener("DOMContentLoaded", () => {
    
    console.log("DOMContentLoaded event fired");
    redirectToLobbyIfAuthenticated();
    attachEventListeners();
   
   
   
});



