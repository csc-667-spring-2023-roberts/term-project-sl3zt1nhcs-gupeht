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
                const startGameButton = document.getElementById("start-game-button");
                const waitingMessage = document.getElementById("waiting-message");

                // Clear the user list
                userListElement.innerHTML = "";

                // Add each user to the user list
                users.forEach((username, index) => {
                    const userElement = document.createElement("li");
                    userElement.id = `user-${index}`; // assign an id to the user element
                    userElement.textContent = `${username} is online`;
                    userListElement.appendChild(userElement);
                });

                // Show or hide the start button and waiting message based on number of users
                if (users.length >= 2) {
                    startGameButton.style.display = "block";
                    waitingMessage.style.display = "none";
                } else {
                    startGameButton.style.display = "none";
                    waitingMessage.style.display = "block";
                }
            });

            socket.on("game_start", async (data) => {
                console.log("Game started with ID:", data.gameId);
                // Fetch the game content
                const response = await fetch(`/user/game/${data.gameId}`, {
                    credentials: "include",
                });
                const gameHtml = await response.text();
                // Load the game content into the game div
                document.getElementById("game").innerHTML = gameHtml;
            });

            // Event handler for sending messages
            document.getElementById("message-form").addEventListener("submit", (event) => {
                event.preventDefault();
                const message = document.getElementById("message-input").value;
                socket.emit("send_message", { message: message, userName: userName });

                document.getElementById("message-input").value = " ";
            });

            document.getElementById("start-game-button").addEventListener("click", () => {
                socket.emit("start_game");
            });

            // TODO add event listeners to the user interface

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
