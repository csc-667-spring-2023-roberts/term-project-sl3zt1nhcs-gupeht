import { register } from "./register";
import { login } from "./login";
import { logout } from "./logout";
import { createGame, joinGame, getGameList } from "./game";

const messageDiv = document.getElementById("message");

export async function fetchLobby() {
    const token = localStorage.getItem("token");

    if (!token) {
        // If the token is not found, redirect to the login page
        location.href = "/user/login";
        return;
    }

    try {
        const response = await fetch("/lobby", {
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
        } else {
            console.error("Error fetching lobby:", lobbyHtml);
        }
    } catch (error) {
        console.error("Error fetching lobby:", error);
    }
}

if (window.location.pathname === "/user/lobby") {
    // Refresh the game list every 10 seconds
    setInterval(() => {
        getGameList();
    }, 10000);
}

function checkLoggedIn() {
    const token = localStorage.getItem("token");
    const currentPath = window.location.pathname;
    const loginPath = "user/login"; 
    const registerPath = "user/register"; 
    const lobbyPath = "user/lobby"; 

    if (token) {
        if (currentPath === loginPath || currentPath === registerPath) {
            window.location.href = lobbyPath;
        } else if (currentPath === lobbyPath) {
            fetchLobby();
        }
    }
}

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

    checkLoggedIn();

    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (event) => {
            event.preventDefault();
            logout();
        });
    }

    const showCreateGameModalBtn = document.getElementById("show-create-game-modal");
    const closeCreateGameModalBtn = document.getElementById("close-create-game-modal");
    const createGameModal = document.getElementById("create-game-modal");

    if (showCreateGameModalBtn) {
        showCreateGameModalBtn.addEventListener("click", (event) => {
            event.preventDefault();
            createGameModal.removeAttribute("hidden");
        });
    }

    if (closeCreateGameModalBtn) {
        closeCreateGameModalBtn.addEventListener("click", (event) => {
            event.preventDefault();
            createGameModal.setAttribute("hidden", "true");
        });
    }

    const createGameForm = document.getElementById("create-game-form");
    if (createGameForm) {
        createGameForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await createGame();
        });
    }

    const gameListElement = document.getElementById("game-list");
    if (gameListElement) {
        gameListElement.addEventListener("click", (event) => {
            if (event.target.classList.contains("join-game")) {
                const gameId = event.target.parentElement.dataset.gameId;
                joinGame(gameId);
            }
        });
    }

    if (window.location.pathname === "/user/lobby") {
        getGameList();
    }
});
