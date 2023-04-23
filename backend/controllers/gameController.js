const gameModel = require('../models/gameModel');
const Deck = require('../models/deckModel');
const chatModel = require('../models/chatModel');
const gameLogic = require('./gamelogic');

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
      const holeCardsPromises = players.map((player) => {
        const holeCards = gameLogic.dealHoleCards(deck);
        return gameModel.addHoleCards(game_id, player.player_id, holeCards);
      });

      return Promise.all(holeCardsPromises);
    })
    .then(() => {
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

const chatModel = require('../models/chatModel');

exports.addMessage = (req, res) => {
  const { game_id, sender_id, message } = req.body;

  chatModel
    .addMessage(game_id, sender_id, message)
    .then(() => {
      res.status(200).json({ message: 'Message added successfully' });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
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

      // Deal hole cards to the joining player
      const deck = new Deck();
      deck.shuffle();
      const holeCards = gameLogic.dealHoleCards(deck);
      return gameModel.addHoleCards(game_id, result.player_id, holeCards);
    })
    .then(() => {
      res.status(200).json({ Result: result });
    })
    .catch((err) => {
      result.error = err.message;
      res.status(500).json({ Result: result });
    });
};


exports.leaveGame = (req, res) => {
  const { player_id } = req.params;
  const result = {};

  gameModel
    .getGamesByPlayerId(player_id)
    .then(({ game_id, seat_num }) => {
      if (seat_num === 0) {
        throw new Error('Cannot leave game as dealer');
      }

      return gameModel.leaveGame(player_id);
    })
    .then(() => {
      // Delete chat for the game if the leaving player is the last one
      return gameModel.getAllPlayersInGame(game_id);
    })
    .then((players) => {
      if (players.length === 0) {
        return chatModel.deleteChatByGameId(game_id);
      } else {
        return;
      }
    })
    .then(() => {
      req.app.locals.io.emit("playerLeftGame", { player_id, game_id });
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
  
        return gameLogic.determineWinner(game_id);
      }).then((winners)=>{
        result.winners = winners;
        // Create a new deck and shuffle it
        const deck = new Deck();
        deck.shuffle();
  
        // Get all the players in the game
        return gameModel.getAllPlayersInGame(game_id);
    
      }).then((players) => {
        // Deal hole cards to all players
        const holeCardsPromises = players.map((player) => {
          const holeCards = gameLogic.dealHoleCards(deck);
          return gameModel.addHoleCards(game_id, player.player_id, holeCards);
        });
  
        // Wait for all hole cards to be saved
        return Promise.all(holeCardsPromises);
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

exports.getPlayersInGame = (req, res) => {
  const { game_id } = req.params;
  const result = {};

  gameModel
    .getAllPlayersInGame(game_id)
    .then((players) => {
      result.players = players;
      res.status(200).json({ Result: result });
    })
    .catch((err) => {
      result.error = err.message;
      res.status(500).json({ Result: result });
    });
};


exports.getPlayerCards = (req, res) => {
  const { player_id } = req.params;
  const { game_id } = req.query;
  const result = {};

  gameModel
    .getPlayerCards(game_id, player_id)
    .then(({ hole_cards, hand }) => {
      result.hole_cards = hole_cards;
      result.hand = hand;
      res.status(200).json({ Result: result });
    })
    .catch((err) => {
      result.error = err.message;
      res.status(500).json({ Result: result });
    });
};


exports.getPlayerChips = (req, res) => {
  const { player_id } = req.params;
  const result = {};

  gameModel
    .getPlayerChips(player_id)
    .then(({ chips }) => {
      result.chips = chips;
      res.status(200).json({ Result: result });
    })
    .catch((err) => {
      result.error = err.message;
      res.status(500).json({ Result: result });
    });
};

exports.getPlayerHoleCards = (req, res) => {
  const { game_id, player_id } = req.params;
  const result = {};

  gameModel
    .getPlayerHoleCards(game_id, player_id)
    .then((cards) => {
      result.cards = cards;
      res.status(200).json({ Result: result });
    })
    .catch((err) => {
      result.error = err.message;
      res.status(500).json({ Result: result });
    });
};
