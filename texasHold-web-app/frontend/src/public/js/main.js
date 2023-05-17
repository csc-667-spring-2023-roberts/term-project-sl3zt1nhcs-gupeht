import { register } from "./register";
import { login } from "./login";
import { logout } from "./logout";
import { io } from "socket.io-client";
let socket;

async function isUserLoggedin() {
    const user_id = localStorage.getItem("user_id");

    if (!user_id) {
        console.log("User is not logged in");
        return;
    }

    redirectToLobbyIfAuthenticated();
}

function renderGame(data) {
    // Access the game div
    const gameElement = document.getElementById("game");

    // Clear the game div
    gameElement.innerHTML = "";

    // Create the scoreboard
    const scoreBoardElement = document.createElement("div");
    scoreBoardElement.classList.add("score-board");
    scoreBoardElement.innerHTML = `
           <p>Game ID: ${data.gameId}</p>
           <p>Current player: ${data.current_player}</p>
           <p>Your Round wons: ${data.gameState.roundsWon}</p>
           <p>Your Round loss: ${data.gameState.roundsLost}</p>
       `;

    // Add the scoreboard to the game div
    gameElement.appendChild(scoreBoardElement);

    // Create the user card
    const userCardElement = document.createElement("div");
    userCardElement.classList.add("user-card");

    // Loop through the cards array and add each card to userCardElement
    for (let card of data.gameState.cards) {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.textContent = card;
        userCardElement.appendChild(cardElement);
    }

    // Add the user card to the game div
    gameElement.appendChild(userCardElement);

    // Create the game buttons
    const buttonsElement = document.createElement("div");
    buttonsElement.classList.add("buttons");
    buttonsElement.innerHTML = `
           <button id="hit-button">Hit</button>
           <button id="stand-button">Stand</button>
       `;

    // Add the game buttons to the game div
    gameElement.appendChild(buttonsElement);
}

async function redirectToLobbyIfAuthenticated() {
    try {
        const response = await fetch("/user/is-authenticated", {
            credentials: "include", // Include the session cookie in the request
        });

        const data = await response.json();

        //SPA model
        if (data.authenticated) {
            fetchLobby();
        }
    } catch (error) {
        console.error("Error checking authentication status:", error);
    }
}

export async function fetchLobby() {
    const userId = localStorage.getItem("user_id");

    const userName = localStorage.getItem("userName");

    try {
        const response = await fetch("/user/lobby", {
            credentials: "include", // Include the credentials (cookies) in the request
        });

        const lobbyHtml = await response.text();

        if (response.status === 200) {
            document.querySelector("body").innerHTML = lobbyHtml;
            window.history.pushState({}, "", "/user/lobby");

            if (!socket) {
                socket = io("http://localhost:3000");
            }

            socket.emit("join_lobby", { userId: userId, userName: userName });

            // socket to receive messages
            socket.on("receive_message", (data) => {
                // Access the message Div
                const messagesElement = document.getElementById("messages");
                //Message element
                const messageElement = document.createElement("p");

                // If the message is from the current user, it is not an incoming message
                if (data.userName !== userName) {
                    messageElement.classList.add("message", "incoming");
                } else {
                    messageElement.classList.add("message", "outgoing");
                }

                messageElement.textContent = `${data.userName}: ${data.message}`;

                //Appending the new message to the message div
                // sroll down messages
                messagesElement.appendChild(messageElement);
                messagesElement.scrollTop = messagesElement.scrollHeight;
                console.log("Received a message:", data);
            });
            // Socket to update the list of users
            socket.on("update_user_list", (users) => {
                const userListElement = document.getElementById("user-list");
                const waitingMessage = document.getElementById("waiting-message");

                // Clear the user list
                userListElement.innerHTML = "";

                // Add each user to the user list
                for (let userId in users) {
                    // use a for...in loop to iterate through an object
                    const userElement = document.createElement("li");
                    userElement.id = `user-${userId}`; // use userId as the id
                    userElement.textContent = `${users[userId]} is online`; // use users[userId] to access the userName
                    userListElement.appendChild(userElement);
                }

                // Show or hide the start button and waiting message based on number of users
                const numUsers = Object.keys(users).length; // use Object.keys() to get the number of users
                if (numUsers >= 2) {
                    waitingMessage.style.display = "none";
                } else {
                    waitingMessage.style.display = "block";
                }
            });

            socket.on("game_start", async (data) => {
                renderGame(data);
            });

            socket.on("game_resume", async (data) => {
                renderGame(data);
            });
            
            socket.on("game_end", (data) => {
                console.log(" front end game_end Game ended. Reason:", data.reason);

                // Access the game div
                const gameElement = document.getElementById("game");

                // Clear the game div
                gameElement.innerHTML = "";

                // Create a new div for the game result
                const gameResultElement = document.createElement("div");
                gameResultElement.classList.add("game-result");

                // Add the game result to the new div
                if (data.winner) {
                    gameResultElement.innerHTML = `
                        <p>Winner: ${data.winner.userName}</p>
                        <p>Reason: ${data.reason}</p>
                        <p>WinnersCard: ${JSON.stringify(data.winnersCard)}</p>
                        <p>LosersCard: ${JSON.stringify(data.losersCard)}</p>
                    `;
                } else {
                    gameResultElement.innerHTML = `
                        <p>Reason: ${data.reason}</p>
                        <p>WinnersCard: ${JSON.stringify(data.winnersCard)}</p>
                        <p>LosersCard: ${JSON.stringify(data.losersCard)}</p>
                    `;
                }

                // Add the game result div to the game div
                gameElement.appendChild(gameResultElement);

                // Show waiting message
                const waitingMessage = document.getElementById("waiting-message");
                waitingMessage.style.display = "block";

                // Hide waiting message after 5 seconds
                setTimeout(() => {
                    waitingMessage.style.display = "none";
                }, 2000);
            });

            // Event handler for sending messages
            document.getElementById("message-form").addEventListener("submit", (event) => {
                event.preventDefault();
                const message = document.getElementById("message-input").value;
                socket.emit("send_message", { message: message, userName: userName });

                document.getElementById("message-input").value = " ";
            });

            // event listener for error related to messages
            socket.on("message_error", (data) => {
                console.error("Message error:", data.error);
            });
        } else {
            console.error("Error fetching lobby:", lobbyHtml);
        }
    } catch (error) {
        console.error("Error fetching lobby:", error);
    }
}

function handleRegistrationForm() {
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

function handleLogout() {
    document.addEventListener("click", (event) => {
        if (event.target && event.target.id === "logout") {
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
    isUserLoggedin();
    attachEventListeners();
});
