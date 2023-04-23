const gameModel = require('../models/gameModel');
const gameController = {};

gameController.createGame = (req, res, next) => {
    const result = {};
    const { tableId } = req.body;
    gameModel.createGame(tableId)
      .then((gameId) => {
        result.success = true;
        result.gameId = gameId;
        result.message = 'Game Created';
        res.status(200).json({ result });
      })
      .catch((err) => {
        next(err);
      });
  };


  gameController.addPlayersToGame = (req, res, next) => {
    const { gameId, playerIds } = req.body;
    const result = {};
  
    gameModel.addPlayersToGame(gameId, playerIds)
      .then(() => {
        result.success = true;
        result.message = `Added ${playerIds.length} players to game ${gameId}`;
        res.status(200).json(result);
      })
      .catch((err) => {
        next(err);
      });
  };


  gameController.getPlayersByGameId = (req, res, next) => {
    const { gameId } = req.params;
    const result = {};
  
    gameModel.getPlayersByGameId(gameId)
      .then((players) => {
        result.players = players;
        result.message = `Found ${players.length} players in game ${gameId}`;
        res.status(200).json(result);
      })
      .catch((err) => {
        result.error = err.message;
        result.status = err.status || 500;
        next(result);
      });
  };


  gameController.dealCards = (req, res, next) => {
    const { gameId } = req.params;
    const result = {};
    gameModel.dealCards(gameId)
      .then((hands) => {
        result.success = true;
        result.hands = hands;
        res.status(200).json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  gameController.getCommunityCardsByGameId = (req, res, next) => {
    const { gameId } = req.params;
    const result = {};
    gameModel.getCommunityCardsByGameId(gameId)
      .then((cards) => {
        result.cards = cards;
        res.status(200).json(result);
      })
      .catch((err) => {
        next(err);
      });
  };


gameController.addCommunityCardToGame = (req, res, next) => {
    const { gameId, cardId } = req.body;
    const result = {};
    gameModel.addCommunityCardToGame(gameId, cardId)
      .then(() => {
        result.success = true;
        result.message = 'Community card added successfully';
        res.status(200).json(result);
      })
      .catch((err) => {
        next(err);
      });
  };
  

  gameController.getPotByGameId = (req, res, next) => {
    const { gameId } = req.params;
    const result = {};
    gameModel.getPotByGameId(gameId)
      .then((pot) => {
        result.success = true;
        result.pot = pot;
        res.status(200).json(result);
      })
      .catch((err) => {
        next(err);
      });
  };
  

gameController.placeBet = (req, res, next) => {
    const { playerId, handId, amount } = req.body;
    const result = {};
    gameModel.placeBet(playerId, handId, amount)
      .then(() => {
        result.success = true;
        result.message = `Player ${playerId} placed a bet of ${amount} on hand ${handId}`;
        res.status(200).json(result);
      })
      .catch((err) => {
        next(err);
      });
  };
  

gameController.handleGame = (req, res, next) => {
    const { gameId } = req.params;
    const result = {};
    gameModel.handleGame(gameId)
      .then((winner) => {
        result.success = true;
        result.winner = winner;
        res.status(200).json(result);
      })
      .catch((err) => {
        next(err);
      });
};
  
  
module.exports = gameController;