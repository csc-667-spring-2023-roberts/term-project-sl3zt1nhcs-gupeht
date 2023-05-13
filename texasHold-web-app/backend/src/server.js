const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "config", ".env") });

const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cookieParser = require("cookie-parser");
const { sessionMiddleware } = require("./middleware/sessionMiddleWare");
const cors = require("cors");
const userRoutes = require("./router/userRoutes");
const root = require("./router/root");
const { customErrorHandler } = require("./middleware/customErrorHandler");
const app = express();
const server = http.createServer(app);
const userModel = require("./models/users/userModel");
const gameLogic = require("./models/game/gameLogic");
const gameModel = require("./models/game/gameModel");

// keep list of online users
let onlineUsers = {};
//let gameState = gameLogic.gameState;

const io = require("socket.io")(server, {
    cors: {
        origin: "*", // replace * with your frontend domain in production
        methods: ["GET", "POST"],
    },
});

// Io connection here
io.on("connection", (socket) => {
    console.log(`Connection established on socket Id: ${socket.id}`);

    socket.on("join_lobby", (data) => {
        onlineUsers[data.userId] = data.userName;

        socket.userId = data.userId;
        socket.userName = data.userName;

        // Emitting the updated user list to all connected sockets
        io.emit("update_user_list", onlineUsers);

        // Joining the user to the 'lobby' room
        socket.join("lobby");

        // Logging the join event
        console.log(`User ${data.userName} joined the lobby`);

        //Broadcast that the user has connected on lobby
        io.to("lobby").emit("receive_message", { userName: "System", message: ` ${data.userName} joined lobby` });

        // Fetching all messages from the database
        userModel
            .getMessages()
            .then((messages) => {
                // If there are messages, emit each message to the newly joined user
                if (messages && messages.length > 0) {
                    messages.forEach((message) => {
                        // Break into username and message_content since is being requested by client
                        const messageToEmit = {
                            userName: message.username,
                            message: message.message_content,
                        };

                        socket.emit("receive_message", messageToEmit);
                    });
                }
            })
            .catch((err) => {
                // If an error occurs while fetching messages, log it
                console.error(err);
            });

        // If there are enough users to start a game
        if (Object.keys(onlineUsers).length >= 2) {
            // Add all online users to the game
            for (let userId in onlineUsers) {
                gameLogic.playerJoinGame(userId, onlineUsers[userId]);
            }

            console.log(gameLogic.getGameState());
            // Start the game
           // gameLogic.startGame();
        }
    });

    socket.on("send_message", (data) => {
        const message = { userName: data.userName, message: data.message };
        // Emit the message to all users in the lobby
        io.to("lobby").emit("receive_message", message);
        // Store the message in the database
        userModel
            .storeMessage(socket.userId, data.message)
            .then((storedMessage) => {
                if (!storedMessage) {
                    socket.emit("message_error", { error: "Message could not be stored." });
                }
                // Log the stored message
                console.log(`Stored message: ${storedMessage.message_content}`);
                console.log(`user sending message is ${data.userName}`);
            })
            .catch((err) => {
                // If an error occurs while storing the message, log it
                console.error(err);
                socket.emit("message_error", { error: "An error occurred while storing the message." });
            });
    });

    socket.on("disconnect", () => {
        // Remove user from onlineUsers object
        delete onlineUsers[socket.userId];

        // Notify other users that this user has disconnected
        io.emit("update_user_list", onlineUsers);
        //Broadcast that the user has connected on lobby
        io.to("lobby").emit("receive_message", { userName: "System", message: `${socket.userName} has left the lobby` });

        console.log(`User ${socket.userName} disconnected`);
    });
});

// view engine setup
app.set("views", path.join(__dirname, "../../frontend/src/public/views"));

app.set("view engine", "ejs");

// Serve static files for front end

app.use(express.static(path.join(__dirname, "../../frontend/src/public/")));

// middleware
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(sessionMiddleware);

app.use("/", root);
app.use("/user", userRoutes);

// Move customErrorHandler here, after the routes
app.use(customErrorHandler);

//Creates database
const { CreateTableError, createTables } = require("./database/createTables");

const result = {};

createTables()
    .then((resultStatus) => {
        result.message = resultStatus.message;
        // start server here
        const port = process.env.PORT || 3000;

        // 404 error handling
        app.use((req, res, next) => {
            res.status(404).json({ message: "Not Found" });
        });

        // error handling
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(err.statusCode || 500).json({ message: err.message });
        });

        return new Promise((resolve, reject) => {
            server.listen(port, () => {
                result.serverMessage = `Server running on port ${port}`;
                console.log(result.serverMessage);
                resolve(result);
            });
        });
    })
    .catch((error) => {
        if (error instanceof CreateTableError) {
            result.message = ("Error in creating table", error.message);
        } else {
            result.internal = ("Error in createTables", error);
        }
        return Promise.reject(result);
    })
    .then((result) => {
        console.log("Server started successfully", result);
    })
    .catch((result) => {
        console.log("Error starting server", result);
    });
