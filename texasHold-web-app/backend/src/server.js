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
const playerModel = require("./models/game/playerModels");

// Set online users to be an object
let onlineUsers = {};

let socketIdMap = new Map();

//set io and active cors
const io = require("socket.io")(server, {
    cors: {
        origin: "*", // replace * with your frontend domain in production
        methods: ["GET", "POST"],
    },
});

//TODO move these functions to a different page for organization
// Io connection functions start here
io.on("connection", (socket) => {
    console.log(`Connection established on socket Id: ${socket.id}`);
    //listening to front end join_lobby event being emiited
    socket.on("join_lobby", (data) => {
        // data will be the userName along with user_id . the userName and user_id  is stored in the local storage
        onlineUsers[data.userId] = data.userName;
        // getting the userId and userName from the front end and adding to the socket object

        // that way we can retrieve the data if a certain function does not pass a parameter
        socket.userId = data.userId;
        socket.userName = data.userName;

        // Mapping the user Id to the socket Id so we can broadcast data to a specific user. In this example, cards wil be broadcasted for the user
        socketIdMap.set(data.userId, socket.id);

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
                        // emit to the front end  the messages history in the chat to the user logging in
                        socket.emit("receive_message", messageToEmit);
                    });
                }
            })
            .catch((err) => {
                // If an error occurs while fetching messages, log it
                console.error(err);
            });
        /*
            The game is initiated only when ther are 2 or more users
            TODO must fix starting a new game when a third player  joins the game.
        */
        if (Object.keys(onlineUsers).length >= 2) {
            // Add all online users to the game
            for (let userId in onlineUsers) {
                // it will use the userId and get the userName by userId from onlineUser
                // it will then set the player object state
                gameLogic.playerJoinGame(userId, onlineUsers[userId]);
            }

            // Now after players joined the game we will start the game
            gameLogic.startGame();

            // We need to store the game in the database
            const gameState = gameLogic.getGameState();
            // create a new game in the database
            gameModel
                .createGame("Default", gameState)
                .then((createdGame) => {
                    // the database will return the created game row but we console log the game_id
                    console.log(`Created new game with ID: ${createdGame.game_id}`);
                    /*
                    we loop through each player so we can record each individual player data on the database
                    */
                    for (let userId in gameState.players) {
                        playerModel
                            .joinGame(userId, createdGame.game_id, gameState.players[userId])
                            .then((createdPlayer) => {
                                console.log(`Added player with ID: ${userId} to game with ID: ${createdGame.game_id}`);
                            })
                            .catch((err) => {
                                console.error(err);
                            });
                    }
                    /*
                      Loop to send to the front end each individual player
                      their game state. We can accomplish this by assigining
                      socketId  to socketIdMap.geet(userId) declared in the begginning
                      of Io function
                    */
                    for (let userId in gameState.players) {
                        let socketId = socketIdMap.get(userId);

                        // Sends each individual their corresponding game state
                        const playerGameState = gameState.players[userId];

                        io.to(socketId).emit("game_start", {
                            gameId: createdGame.game_id,
                            gameState: playerGameState,
                            current_player: gameState.current_player,
                        });
                        /* Console.log for debugging to see what is being sent to the front end
                        each player should be sent only their game state
                        */
                        console.log(
                            `Sent game start data to player with ID: ${userId}. for gameId:  ${
                                createdGame.game_id
                            } Player Game State: ${JSON.stringify(playerGameState, null, 2)}, Opponent player:; ${
                                gameState.current_player
                            }`
                        );
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    });

    // Event to listen to messages sent from the client side
    socket.on("send_message", (data) => {
        // breaking the message by descontruction the parameter data
        // so we can save the messages in the data base that correspond to the  user
        const message = { userName: data.userName, message: data.message };
        // We then Emit the message to all users in the lobby since
        // the design is to be an open chat
        io.to("lobby").emit("receive_message", message);
        // Store the message in the database
        userModel
            // we store the message with the corresponding userId  and the message content
            .storeMessage(socket.userId, data.message)
            .then((storedMessage) => {
                // check for error and emit to front end "message_error"
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
        // Deleting the user from the list of online users
        delete onlineUsers[socket.userId];

        // Notify other users that this user has disconnected
        io.emit("update_user_list", onlineUsers);
        // Broadcast that the user has disconnected from the lobby
        io.to("lobby").emit("receive_message", { userName: "System", message: `${socket.userName} has left the lobby` });
        console.log(`User ${socket.userName} disconnected`);

        // If the user was part of a game, handle their disconnection
        if (gameLogic.isUserInGame(socket.userId)) {
            let gameResult = gameLogic.removeUserFromGame(socket.userId);

            if (gameResult.endGameResult) {
                gameModel
                    .getRecentGameId()
                    .then((gameId) => {
                        if (gameResult.endGameResult.gameState) {
                            gameModel.updateGame(gameResult.endGameResult.gameState, gameId).then(() => {
                                console.log("Game state updated in the database");
                            });
                        }
                    })
                    .catch((err) => {
                        console.error("Error updating the game state", err);
                    });

                if (gameResult.endGameResult.winners) {
                    let winners = gameResult.endGameResult.winners;
                    winners.forEach((winnerName) => {
                        let winnerId = Object.keys(gameResult.endGameResult.gameState.players).find(
                            (playerId) => gameResult.endGameResult.gameState.players[playerId].userName === winnerName
                        );
                        let winner = gameResult.endGameResult.gameState.players[winnerId];
                        console.log("winner::", winner);

                        // Sending individualized data to each player
                        Object.keys(gameResult.endGameResult.gameState.players).forEach((playerId) => {
                            let socketId = socketIdMap.get(playerId);
                            if (socketId) {
                                if (playerId === winnerId) {
                                    // If the player is the winner
                                    io.to(socketId).emit("game_end", {
                                        winner: winner,
                                        reason: `Game over. ${winner.userName} is the winner.`,
                                        gameResult: gameResult.roundResult,
                                    });
                                    console.log("information being passed to front end", winner, gameResult);
                                } else {
                                    // If the player is not the winner
                                    io.to(socketId).emit("game_end", {
                                        reason: `Game over. You lost. ${winner.userName} is the winner.`,
                                        gameResult: gameResult.roundResult,
                                    });
                                    console.log("information being passed to front end", "Loser", gameResult);
                                }
                            }
                        });
                    });
                }
            } else {
                // If game ends without a clear winner (all players disconnected)
                io.emit("game_end", {
                    reason: "Game over. All players have disconnected.",
                    gameResult: gameResult.endGameResult ? gameResult.endGameResult.gameState : {},
                });
            }
        }
    });
});

// Server side code

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
