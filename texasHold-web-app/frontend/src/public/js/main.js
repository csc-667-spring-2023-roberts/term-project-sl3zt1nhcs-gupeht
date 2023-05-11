import { register } from "./register";
import { login } from "./login";
import { logout } from "./logout";
import { io } from "socket.io-client";
let socket;

// this function will redirect to lobby when user is authenticated and render dynamically all functionality
async function redirectToLobbyIfAuthenticated() {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const response = await fetch("/user/is-authenticated", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                fetchLobby();
            }
        } catch (error) {
            console.error("Error checking authentication status:", error);
        }
    }
}

export async function fetchLobby() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    const userName = localStorage.getItem("userName");

    try {
        const response = await fetch("/user/lobby", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const lobbyHtml = await response.text();

        document.querySelector("body").innerHTML = lobbyHtml;

        window.history.pushState({}, "", "/user/lobby");

        if (response.status !== 200) {
            console.error("Error fetching lobby:", lobbyHtml);
        } else {

            // Start of the socket transmission
            socket = io("http://localhost:3000");

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
                // Clear the user list
                const userListElement = document.getElementById("user-list");
                userListElement.innerHTML = "";

                // Add each user to the user list
                users.forEach((user) => {
                    const userElement = document.createElement("li");
                    userElement.textContent = `${user} is online`;
                    userListElement.appendChild(userElement);
                });
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
    redirectToLobbyIfAuthenticated();
    attachEventListeners();
});
