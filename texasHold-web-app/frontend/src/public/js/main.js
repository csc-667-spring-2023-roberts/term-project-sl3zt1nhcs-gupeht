// public/js/main.js

import { register } from "./register";
import { login } from "./login";
import { logout } from "./logout";
import connectSocket from "./socket";
import {createGame,joinGame,getGameList} from "./game";

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
