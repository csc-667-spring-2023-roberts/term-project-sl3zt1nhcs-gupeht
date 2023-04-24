const socketIO = require("socket.io");
const gameModel = require("./models/game/gameModel");
const chatController = require("./controllers/chatController");


const setupSocket = (server) => {
    const io = socketIO(server);

    io.on("connection", (socket) => {
        console.log("Player connected:", socket.id);

        socket.on("join_game", async (gameId) => {
            const playerInGame = await gameModel.isPlayerInGame(socket.playerId, gameId);

            if (!playerInGame) {
                return socket.emit("error_message", "You are not part of this game");
            }
            socket.join(`game_${gameId}`);

            console.log(`Player ${socket.playerId} joined the chat for game ${gameId}`);

            const messages = await chatController.getMessages(gameId);
            socket.emit("chat_messages", messages);
        });

        socket.on("send_message", async ({ playerId, gameId, message }) => {
            await chatController.addMessage(playerId, gameId, message);
            const messages = await chatController.getMessages(gameId);

            io.to(`game_${gameId}`).emit("chat_messages", messages);
        });

        socket.on("leave_game", async (gameId) => {
            socket.leave(`game_${gameId}`);
            console.log(`Player ${socket.playerId} left chat for game ${gameId}`);
        });

        socket.on("disconnect", () => {
            console.log("Player disconnected:", socket.id);
        });
    });

    return io;
};

module.exports = setupSocket;
