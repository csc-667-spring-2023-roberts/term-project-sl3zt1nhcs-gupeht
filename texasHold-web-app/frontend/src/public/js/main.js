// public/js/main.js

import { register } from "./register";
import { login } from "./login";
import { logout } from "./logout";
import connectSocket from "./socket";

export async function fetchLobby() {
    const token = localStorage.getItem("token");

    if (!token) {
        // If the token is not found, redirect to the login page
        location.href = "/user/login";
        return;
    }

    try {
        const response = await fetch("/user/lobby", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const lobbyHtml = await response.text();

        if (response.status === 200) {
            // Render the lobby HTML
            document.querySelector("body").innerHTML = lobbyHtml;
            // Fetch the game list when the lobby is loaded
            getGameList();
            // Connect the socket and join the game
            const socket = connectSocket();

            //TODO: const gameId = // Set the gameId from the game you want the user to join

            socket.emit("join_game", gameId);
        } else {
            console.error("Error fetching lobby:", lobbyHtml);
        }
    } catch (error) {
        console.error("Error fetching lobby:", error);
    }
}

// Fetch the game list when the lobby is loaded
if (window.location.pathname === "/user/lobby") {
  getGameList();
}

// prevents from going to login page
function checkLoggedIn() {
    const token = localStorage.getItem("token");
    if (token) {
        fetchLobby();
    }
}

// Event listener  for register and login forms
document.addEventListener("DOMContentLoaded", () => {
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

    // stop from going to log in if token exist
    checkLoggedIn();
});



// Add a separate event listener for the logout button
document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "logout") {
        event.preventDefault();
        logout();
    }
});

// Add a separate event listener for the create  game
document.addEventListener("click", async (event) => {
    if (event.target && event.target.id === "create-game") {
        event.preventDefault();
        await createGame();
    } else if (event.target && event.target.classList.contains("join-game")) {
        event.preventDefault();
        const gameId = event.target.getAttribute("data-game-id");
        await joinGame(gameId);
    }
});


//TODO ... change the implementation
async function createGame() {

    const tablename = document.querySelector('#create-game-form input[tableName="tableName"]').value;
    const maxPlayers = document.querySelector('#create-game-form input[maxPlayers="maxPlayers"]').value;
    const minBuyin = document.querySelector('#create-game-form input[minBuyIn="minBuyIn"]').value;
    const maxBuyIn = document.querySelector('#create-game-form input[maxBuyIn="maxBuyIn"]').value;

    const token = localStorage.getItem("token");

    try{
      const response = await  fetch("/game/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    })

    const responseData = await response.json();


    if ( response.status === 200){
      messageDiv.textContent = "Joined Game"
    }





    }

   
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                showMessage(data.error);
            } else {
                window.location.href = `/game/${data.gameId}`;
            }
        });
}

async function joinGame(gameId) {
    // Join game logic here
    window.location.href = `/game/join/${gameId}`;
}



//SHOW LIST OF GAMES
async function getGameList() {
    //TODO CHANGE IMPLEMENTATION
    const response = await fetch("/game/list");
    const games = await response.json();

    const gameListElement = document.getElementById("game-list");

    if (games.length === 0) {
        gameListElement.innerHTML = "<p>No games available. Create one!</p>";
    } else {
        const gameItems = games.map((game) => {
            return `<div>
                <h3>${game.tableName}</h3>
                <p>Players: ${game.players.length}/${game.maxPlayers}</p>
                <p>Buy-In: ${game.minBuyIn} - ${game.maxBuyIn}</p>
                <button class="join-game" data-game-id="${game._id}">Join</button>
              </div>`;
        });
        gameListElement.innerHTML = gameItems.join("");
    }
}
