import { register } from "./register";
import { login } from "./login";
import { logout } from "./logout";
import { createGame, joinGame, getGameList } from "./game";

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
        } else {
            console.error("Error fetching lobby:", lobbyHtml);
        }
    } catch (error) {
        console.error("Error fetching lobby:", error);
    }
}

// Fetch the game list when the lobby is loaded
if (window.location.pathname === "/user/lobby") {
    // Refresh the game list every 10 seconds
    setInterval(() => {
        getGameList();
    }, 10000);
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

// Add event listeners for the create game modal
document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "show-create-game-modal") {
        event.preventDefault();
        document.getElementById("create-game-modal").removeAttribute("hidden");
    } else if (event.target && event.target.id === "close-create-game-modal") {
        event.preventDefault();
        document.getElementById("create-game-modal").setAttribute("hidden", "true");
    }
});

// Add click event listeners for game items in the list
document.addEventListener("click", async (event) => {
    if (event.target && event.target.classList.contains("game-item")) {
        event.preventDefault();
        const gameId = event.target.getAttribute("data-game-id");
        await joinGame(gameId);
    }
});

// Fetch the game list when the lobby is loaded and add click event listeners for game items
if (window.location.pathname === "/user/lobby") {
    getGameList().then(() => {
        document.querySelectorAll(".game-item").forEach((gameItem) => {
            gameItem.addEventListener("click", async (event) => {
                event.preventDefault();
                const gameId = event.currentTarget.getAttribute("data-game-id");
                await joinGame(gameId);
            });
        });
    });
}


// Game forms event listeners
document.addEventListener("DOMContentLoaded",()=>{
    const  createForm = document.getElementById("create-game-form");

    if (createForm){
        createForm.addEventListener("submit",(event)=>{
            event.preventDefault();
            createGame();
        });
    }
});


/*
document.addEventListener("click", async (event) => {
    if (event.target && event.target.classList.contains("join-game")) {
        event.preventDefault();
        const gameId = event.target.getAttribute("data-game-id");
        await joinGame(gameId);
    }
});
*/

