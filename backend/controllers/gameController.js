const gameModel = require('../models/gameModel');
const Deck = require('../models/deckModel');
const chatModel = require('../models/chatModel');
const {initChatSocket}= require("../sockets/chatSocket")
const chatController = require('./chatController');

exports.createGame = (req, res) => {
  const result = {};

  const { max_players, small_blind } = req.body;
  const deck = new Deck();
  deck.shuffle();

  gameModel
    .createGameAndTable(max_players, small_blind, 'NOW()')
    .then(({ table_id, game_id }) => {
      result.table_id = table_id;
      result.game_id = game_id;

      // Create chat for the game
      chatModel.createChat(game_id, null, 'Open chat for game');

       // Initialize chat socket for the game
       req.app.locals.io.emit("gameCreated", game_id);
      


      // Deal hole cards to all players
      return gameModel.getAllPlayersInGame(game_id);
    })
    .then((players) => {
      players.forEach((player) => {
        const holeCards = deck.drawCards(2);
        gameModel.addHoleCards(game_id, player.player_id, holeCards);
      });
      
      if (result.game_id) {
        res.status(200).json({ Result: result });
      } else {
        result.error = 'Game was not created';
        res.status(500).json({ Result: result });
      }
    })
    .catch((err) => {
      result.error = err.message;
      res.status(500).json({ Result: result });
    });
};

exports.getGameById = (req, res) => {
  const { game_id } = req.params;

  const result = {};

  gameModel
    .getGameById(game_id)
    .then((game) => {
      result.game = game;
      res.status(200).json({ Result: result });
    })
    .catch((err) => {
      result.error = err.message;
      res.status(500).json({ Result: result });
    });
};

exports.deleteGame = (req, res) => {
  const { game_id } = req.params;
  const result = {};

   // Delete chat for the game
   chatModel.deleteChatByGameId(game_id);

  // Emit gameEnded event
  req.app.locals.io.emit("gameEnded", game_id);
   
   const gameRoom = `game-${game_id}`;
   const chatSocket = req.app.locals.io.of('/chat').in(gameRoom);
   chatSocket.clients((error, clients) => {
     if (error) throw error;

     clients.forEach((client) => {
       client.disconnect();
     });
   });

  
    gameModel.deleteGame(game_id)
    .then(() => {
      result.game_id = game_id;
      res.status(200).json({ Result: result });
    })
    .catch((err) => {
      result.error = err.message;
      res.status(500).json({ Result: result });
    });
};

exports.getAllGames = (req, res) => {
    const result = {};
  
    gameModel
      .getAllGames()
      .then((games) => {
        result.games = games;
        // Fetch chat data for each game
        const chatPromises = games.map((game) => {
          return chatModel.getAllChats(game.game_id);
        });
        return Promise.all(chatPromises);
      })
      .then((chats) => {
        result.chats = chats;
        res.status(200).json({ Result: result });
      })
      .catch((err) => {
        result.error = err.message;
        res.status(500).json({ Result: result });
      });
  };
  


exports.getCurrentByPlayerId = (req, res) => {
  const { player_id } = req.params;
  const result = {};

  gameModel.getCurrentGameByPlayerId(player_id)
    .then((game) => {
      result.game = game;
      res.status(200).json({ Result: result });
    })
    .catch((err) => {
      result.error = err.message;
      res.status(500).json({ Result: result });
    });
};

exports.joinGame = (req, res) => {
    const { user_id, game_id } = req.body;
    const result = {};
  
    gameModel
      .joinGame(user_id, game_id)
      .then((player_id) => {
        result.player_id = player_id;
  
        // Get all the players in the game, except for the one who just joined
        return gameModel.getAllPlayersInGame(game_id, player_id);
      })
      .then((players) => {
        // Create chat for the game, with all the players in the game as participants
        const playerIds = players.map((player) => player.player_id);
        playerIds.push(result.player_id);
        chatModel.createChat(game_id, playerIds, 'Open chat for game');
        req.app.locals.io.emit("playerJoinedGame", { player_id: result.player_id, game_id });
  
        res.status(200).json({ Result: result });
      })
      .catch((err) => {
        result.error = err.message;
        res.status(500).json({ Result: result });
      });
  };

  exports.startNextRound = (req, res) => {
    const { game_id } = req.params;
    const result = {};
  
    gameModel
      .startNextRound(game_id)
      .then(() => {
        result.message = 'Next round started successfully';
  
        // Notify players of round start in chat
        chatModel.addMessage(game_id, null, `Next round started`);
  
        res.status(200).json({ Result: result });
      })
      .then(() => {
        const deck = new Deck();
        const cards = deck.shuffleDeck();
        return gameModel.addCardsToHolCards(game_id, cards);
      })
      .then(() => {
        result.message = 'Next round started successfully';
        res.status(200).json({ Result: result });
      })
      .catch((err) => {
        result.error = err.message;
        res.status(500).json({ Result: result });
      });
  };
  


    exports.getCurrentGameId = (req, res) => {
        const { game_id } = req.params;
        res.json({ game_id });
      };