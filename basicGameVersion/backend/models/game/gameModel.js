const db = require('../database/db');
const { CustomError } = require('../middleware/customErrorHandler');
const pokerLogic = require('../pokerLogic');


const gameModel = {};

const createDeck = () => {
    const deck = [];
    suits.forEach((suit) => {
      ranks.forEach((rank) => {
        deck.push({ suit, rank });
      });
    });
    return deck;
  };

gameModel.createGame = (tableId) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO games (table_id, start_time) VALUES ($1, NOW()) RETURNING game_id`;
      const values = [tableId];
  
      db.query(query, values)
        .then(async (result) => {
          if (result.rowCount > 0) {
            const gameId = result.rows[0].game_id;
            const deck = createDeck();
            await gameModel.shuffleDeck(gameId, deck);
            resolve(gameId);
          } else {
            reject(new CustomError('Failed to create game', 500));
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  

gameModel.addPlayersToGame = (gameId, playerIds) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO players (user_id, game_id) VALUES ${playerIds
      .map((id) => `(${id}, ${gameId})`)
      .join(', ')}`;

    db.query(query)
      .then((result) => {
        if (result.rowCount > 0) {
          resolve(true);
        } else {
          reject(new CustomError('No rows affected', 404));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

gameModel.getPlayersByGameId = (gameId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT p.player_id, p.user_id, u.username, p.status, p.current_bet, p.chips FROM players p INNER JOIN users u ON p.user_id = u.user_id WHERE p.game_id = $1`;
    const values = [gameId];

    db.query(query, values)
      .then((result) => {
        resolve(result.rows);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

gameModel.dealCards = (gameId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT player_id FROM players WHERE game_id = $1 ORDER BY player_id ASC`;
    const values = [gameId];

    db.query(query, values)
      .then((result) => {
        const playerIds = result.rows.map((row) => row.player_id);
        const deck = pokerLogic.shuffleDeck();
        const hands = {};

        playerIds.forEach((id) => {
          hands[id] = [];
        });

        for (let i = 0; i < 2; i++) {
          playerIds.forEach((id) => {
            hands[id].push(deck.pop());
          });
        }

        const handRows = [];

        playerIds.forEach((id) => {
          hands[id].forEach((card) => {
            handRows.push(`(${id}, '${card.suit}', '${card.rank}')`);
          });
        });

        const insertHandsQuery = `INSERT INTO hands (player_id, suit, rank) VALUES ${handRows.join(', ')}`;

        db.query(insertHandsQuery)
          .then(() => {
            resolve(hands);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
};


gameModel.getCommunityCardsByGameId = (gameId) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT suit, rank FROM cards INNER JOIN communitycards ON cards.card_id = community_cards.card_id WHERE game_id = $1 ORDER BY position ASC`;
      const values = [gameId];
      db.query(query, values)
  .then((result) => {
    resolve(result.rows);
  })
  .catch((err) => {
    reject(err);
  });
});
};

gameModel.addCommunityCardToGame = (gameId, cardId) => {
return new Promise((resolve, reject) => {
const query = `INSERT INTO community_cards (game_id, card_id, position) VALUES ($1, $2, (SELECT COALESCE(MAX(position), -1) + 1 FROM community_cards WHERE game_id = $1))`;
const values = [gameId, cardId];db.query(query, values)
.then(() => {
  resolve(true);
})
.catch((err) => {
  reject(err);
     });
 });
};

gameModel.getPotByGameId = (gameId) => {
return new Promise((resolve, reject) => {
const query = `SELECT COALESCE(SUM(amount), 0) AS pot FROM bets INNER JOIN hands ON bets.hand_id = hands.hand_id INNER JOIN players ON hands.player_id = players.player_id WHERE bets.game_id = $1 AND players.status = 'active'`;
const values = [gameId];
db.query(query, values)
  .then((result) => {
    resolve(result.rows[0].pot);
  })
  .catch((err) => {
    reject(err);
  });
});
};


gameModel.placeBet = (playerId, handId, amount) => {
    return new Promise((resolve, reject) => {
    const query = `INSERT INTO bets (player_id, hand_id, amount) VALUES ($1, $2, $3)`;
    const values = [playerId, handId, amount];
    db.query(query, values)
  .then((result) => {
    if (result.rowCount > 0) {
      resolve(true);
    } else {
      reject(new CustomError('No rows affected', 404));
    }
  })
  .catch((err) => {
    reject(err);
  });
});
};

gameModel.handleBettingRound = async (gameId, players, pot, currentPlayer) => {
    let highestBet = 0;
    let activePlayers = players.filter((player) => player.status === 'active');
    
    // Determine the highest bet so far
    activePlayers.forEach((player) => {
    if (player.currentBet > highestBet) {
    highestBet = player.currentBet;
    }
    });
    
    // Loop through the players and receive their actions
    for (let i = 0; i < activePlayers.length; i++) {
    const player = activePlayers[i];

    if (player === currentPlayer) {
        // The current player can bet, call, raise, or fold
        const maxBet = player.chips + player.currentBet;
        const minBet = highestBet === 0 ? 1 : highestBet;
        const options = {
          bet: Math.min(maxBet, minBet + pokerLogic.MAX_RAISE_AMOUNT),
          call: highestBet - player.currentBet,
          raise: Math.min(maxBet, highestBet + pokerLogic.MAX_RAISE_AMOUNT) - player.currentBet,
          fold: true,
        };
      
        // Send the options to the frontend and receive the player's choice
        const action = await promptAction(player.username, options);
      
        // Handle the player's action
        if (action === 'bet' && options.bet >= minBet) {
          player.chips -= options.bet - player.currentBet;

          player.currentBet = options.bet;
          pot += options.bet - player.currentBet;
          await gameModel.placeBet(player.playerId, player.handId, player.currentBet);
          highestBet = player.currentBet;
        } else if (action === 'call' && options.call > 0) {
          player.chips -= options.call;
          player.currentBet += options.call;
          pot += options.call;
          await gameModel.placeBet(player.playerId, player.handId, player.currentBet);
        } else if (action === 'raise' && options.raise >= pokerLogic.MIN_RAISE_AMOUNT) {
          player.chips -= options.raise;
          player.currentBet += options.raise;
          pot += options.raise;
          await gameModel.placeBet(player.playerId, player.handId, player.currentBet);
          highestBet = player.currentBet;
        } else if (action === 'fold') {
          player.status = 'folded';
        }
      } else {
        // Other players can only call, raise, or fold
        const options = {
          call: highestBet - player.currentBet,
          raise: Math.min(player.chips + player.currentBet, highestBet + pokerLogic.MAX_RAISE_AMOUNT) - player.currentBet,
          fold: true,
        };
      
        // Choose an option at random
        const keys = Object.keys(options);
        const randomAction = keys[Math.floor(Math.random() * keys.length)];
      
        // Handle the player's action
        if (randomAction === 'call' && options.call > 0) {
          player.chips -= options.call;
          player.currentBet += options.call;
          pot += options.call;
          await gameModel.placeBet(player.playerId, player.handId, player.currentBet);
        } else if (randomAction === 'raise' && options.raise >= pokerLogic.MIN_RAISE_AMOUNT) {
          player.chips -= options.raise;
          player.currentBet += options.raise;
          pot += options.raise;
          await gameModel.placeBet(player.playerId, player.handId, player.currentBet);
          highestBet = player.currentBet;
        } else if (randomAction === 'fold') {
          player.status = 'folded';
        }
      }
      
      // Check if all players have bet the same amount or folded
      const betsEqual = activePlayers.every(
        (p) => p.currentBet === highestBet || p.status === 'folded'
      );
      
      if (betsEqual) {
        // All bets are equal, move to the next round
        return pot;
      }

    }
    // If we reach this point, it means all players have bet or folded
    return pot;
    };
    
    gameModel.handleGame = async (gameId) => {
    // Retrieve the players for the game
    const players = await gameModel.getPlayersByGameId(gameId);
    
    // Deal the cards to the players
    const hands = await gameModel.dealCards(gameId);
    
    // Update the players with their hand IDs
    players.forEach((player) => {
    player.handId = hands[player.playerId];
    });
    
    // Determine the small blind and big blind
    const smallBlindPlayer = players[0];
    const bigBlindPlayer = players[1];
    smallBlindPlayer.currentBet = gameModel.SMALL_BLIND;
    bigBlindPlayer.currentBet = gameModel.SMALL_BLIND * 2;
    smallBlindPlayer.chips -= gameModel.SMALL_BLIND;
    bigBlindPlayer.chips -= gameModel.SMALL_BLIND * 2;
    
    // Shuffle the deck and deal the community cards
    const deck = pokerLogic.shuffleDeck();
    const communityCards = [];
    
    for (let i =0; i < 3; i++) {
        communityCards.push(deck.pop());
        }
        
        await gameModel.addCommunityCardToGame(gameId, communityCards[0].cardId);
        await gameModel.addCommunityCardToGame(gameId, communityCards[1].cardId);
        await gameModel.addCommunityCardToGame(gameId, communityCards[2].cardId);
        
        // Handle the pre-flop betting round
        let pot = await gameModel.getPotByGameId(gameId);
        pot = await gameModel.handleBettingRound(gameId, players, pot, bigBlindPlayer);
        
        // Deal the flop
        communityCards.push(deck.pop());
        communityCards.push(deck.pop());
        
        await gameModel.addCommunityCardToGame(gameId, communityCards[3].cardId);
        await gameModel.addCommunityCardToGame(gameId, communityCards[4].cardId);
        
        // Handle the post-flop betting round
        pot = await gameModel.getPotByGameId(gameId);
        pot = await gameModel.handleBettingRound(gameId, players, pot, smallBlindPlayer);
        
        // Deal the turn
        communityCards.push(deck.pop());
        
        await gameModel.addCommunityCardToGame(gameId, communityCards[5].cardId);
        
        // Handle the turn betting round
        pot = await gameModel.getPotByGameId(gameId);
        pot = await gameModel.handleBettingRound(gameId, players, pot, smallBlindPlayer);
        
        // Deal the river
        communityCards.push(deck.pop());
        
        await gameModel.addCommunityCardToGame(gameId, communityCards[6].cardId);
        
        // Handle the river betting round
        pot = await gameModel.getPotByGameId(gameId);
        pot = await gameModel.handleBettingRound(gameId, players, pot, smallBlindPlayer);
        
        // Determine the winner and update the database
        const winner = pokerLogic.getWinner(players, communityCards);
        await gameModel.updateWinner(gameId, winner);
        
        return winner;
        };
        
        module.exports = gameModel;
         


