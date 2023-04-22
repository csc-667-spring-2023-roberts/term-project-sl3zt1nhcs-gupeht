const lobbyModel = require('../models/LobbyModel');
const lobbyPlayersModel = require('../models/lobbyPlayersModel');
const gameModel = require('../models/gameModel');

exports.createLobby = (req, res) => {
  const result = {};

  const { lobby_owner, num_players, num_rounds, starting_chips } = req.body;

  lobbyModel
    .createLobby(lobby_owner, num_players, num_rounds, starting_chips)
    .then((lobby_id) => {
      result.lobby_id = lobby_id;
      res.status(200).json({ Result: result });
    })
    .catch((err) => {
      result.error = err.message;
      res.status(500).json({ Result: result });
    });
};

exports.addPlayerToLobby = (req, res) => {
  const result = {};

  const { lobby_id, user_id } = req.body;

  lobbyPlayersModel
    .addPlayerToLobby(lobby_id, user_id)
    .then(() => {
      result.message = 'Player added to lobby successfully';
      res.status(200).json({ Result: result });
    })
    .catch((err) => {
      result.error = err.message;
      res.status(500).json({ Result: result });
    });
};

exports.removePlayerFromLobby = (req, res) => {
  const result = {};

  const { lobby_id, user_id } = req.body;

  lobbyPlayersModel
    .removePlayerFromLobby(lobby_id, user_id)
    .then(() => {
      result.message = 'Player removed from lobby successfully';
      res.status(200).json({ Result: result });
    })
    .catch((err) => {
      result.error = err.message;
      res.status(500).json({ Result: result });
    });
};

exports.startGameInLobby = (req, res) => {
  const result = {};

  const { lobby_id } = req.body;

  lobbyModel
    .getLobbyById(lobby_id)
    .then((lobby) => {
      if (!lobby) {
        throw new Error('Lobby not found');
      }

      return gameModel.createGameAndTable(
        lobby.num_players,
        lobby.starting_chips,
        'NOW()'
      );
    })
    .then(({ table_id, game_id }) => {
      result.table_id = table_id;
      result.game_id = game_id;

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

exports.getAllLobbies = (req, res) => {
  const result = {};

  lobbyModel
    .getAllLobbies()
    .then((lobbies) => {
      result.lobbies = lobbies;
      res.status(200).json({ Result: result });
    })
    .catch((err) => {
      result.error = err.message;
      res.status(500).json({ Result: result });
    });
};

exports.getLobbyById = (req, res) => {
    const result = {};
  
    const { lobby_id } = req.params;
  
    lobbyModel
      .getLobbyById(lobby_id)
      .then((lobby) => {
        result.lobby = lobby;
        res.status(200).json({ Result: result 
        });
    })
    .catch((err) => {
    result.error = err.message;
    res.status(500).json({ Result: result });
    });
    };
    
    exports.getAllLobbies = (req, res) => {
    const result = {};
    
    lobbyModel
    .getAllLobbies()
    .then((lobbies) => {
    result.lobbies = lobbies;
    res.status(200).json({ Result: result });
    })
    .catch((err) => {
    result.error = err.message;
    res.status(500).json({ Result: result });
    });
    };
    
    exports.updateLobby = (req, res) => {
    const result = {};
    
    const { lobby_id } = req.params;
    const { num_players, num_rounds, starting_chips } = req.body;
    
    lobbyModel
    .updateLobby(lobby_id, num_players, num_rounds, starting_chips)
    .then(() => {
    result.message = 'Lobby updated successfully';
    res.status(200).json({ Result: result });
    })
    .catch((err) => {
    result.error = err.message;
    res.status(500).json({ Result: result });
    });
    };
    
    exports.deleteLobby = (req, res) => {
    const result = {};
    
    const { lobby_id } = req.params;
    
    lobbyModel
    .deleteLobby(lobby_id)
    .then(() => {
    result.message = 'Lobby deleted successfully';
    res.status(200).json({ Result: result });
    })
    .catch((err) => {
    result.error = err.message;
    res.status(500).json({ Result: result });
    });
    };
    
    exports.removePlayerFromLobby = (req, res) => {
    const result = {};
    
    const { lobby_id, user_id } = req.body;
    
    lobbyPlayersModel
    .removePlayerFromLobby(lobby_id, user_id)
    .then(() => {
    result.message = 'Player removed from lobby successfully';
    res.status(200).json({ Result: result });
    })
    .catch((err) => {
    result.error = err.message;
    res.status(500).json({ Result: result });
    });
    };
  