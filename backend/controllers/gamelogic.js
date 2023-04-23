const playerController = require('../controllers/playerController');
const gameController = require('../controllers/gameController');

exports.bet = (game_id, player_id, amount) => {
  return Promise.all([
    gameController.getGameById(game_id),
    playerController.getPlayerById(player_id)
  ]).then(([game, player]) => {
    if (player.chips < amount) {
      throw new Error('Not enough chips');
    }

    player.chips -= amount;
    game.pot += amount;

    return Promise.all([
      playerController.updatePlayer(player),
      gameController.updateGame(game)
    ]);
  }).catch(error => {
    console.error('Error placing a bet:', error);
    throw error;
  });
};

exports.dealCommunityCards = (game_id, round) => {
  return gameController.getGameById(game_id).then(game => {
    switch (round) {
      case 1: // Deal the flop
        game.community_cards = [
          ...game.community_cards,
          ...game.deck.slice(0, 3)
        ];
        game.deck = game.deck.slice(3);
        break;
      case 2: // Deal the turn
        game.community_cards = [
          ...game.community_cards,
          ...game.deck.slice(0, 1)
        ];
        game.deck = game.deck.slice(1);
        break;
      case 3: // Deal the river
        game.community_cards = [
          ...game.community_cards,
          ...game.deck.slice(0, 1)
        ];
        game.deck = game.deck.slice(1);
        break;
      default:
        throw new Error('Invalid round number');
    }

    return gameController.updateGame(game);
  }).catch(error => {
    console.error('Error dealing community cards:', error);
    throw error;
  });
};


// gameLogic.js
exports.dealHoleCards = (deck) => {
  return [deck.drawCard(), deck.drawCard()];
};


exports.determineWinner = (game_id) => {
  return Promise.all([
    playerController.getPlayersByGameId(game_id),
    gameController.getCommunityCards(game_id)
  ]).then(([players, communityCards]) => {
    const hands = new Map();

    for (const player of players) {
      const cards = [...player.cards, ...communityCards];
      let bestHand = null;

      for (let i = 0; i < cards.length - 4; i++) {
        for (let j = i + 1; j < cards.length - 3; j++) {
          for (let k = j + 1; k < cards.length - 2; k++) {
            for (let l = k + 1; l < cards.length - 1; l++) {
              for (let m = l + 1; m < cards.length; m++) {
                const hand = [cards[i], cards[j], cards[k], cards[l], cards[m]];
                const handValue = evaluateHand(hand);

                if (!bestHand || handValue > bestHand.value) {
                  bestHand = {
                    cards: hand,
                    value: handValue,
                  };
                }
              }
            }
          }
        }
      }

      hands.set(player.id, bestHand);
    }

    let highestHandValue = null;

    for (const hand of hands.values()) {
      if (!highestHandValue || hand.value > highestHandValue) {
        highestHandValue = hand.value;
      }
    }

    const winners = [];

    for (const [playerId, hand] of hands.entries()) {
      if (hand.value === highestHandValue) {
        winners.push(playerId);
      }
    }

    return winners;
  }).catch(error => {
    console.error('Error determinign the winner',err);
    throw error;
  });
};

exports.bet = async (game_id, player_id, amount) => {
  try {
  // Get the game and player
  const game = await gameModel.getGameById(game_id);
  const player = await playerModel.getPlayerById(player_id);

    // Check if the player has enough chips to place the bet
  if (player.chips < amount) {
    throw new Error('Not enough chips');
  }

  // Deduct the bet amount from the player's chips and update the game pot
  player.chips -= amount;
  game.pot += amount;

  // Update the player and game in the database
  await playerModel.updatePlayer(player);
  await gameModel.updateGame(game);

}
  catch (error) {
    
    console.error('Error placing a bet:', error);
    throw error;
    }
};


exports.dealCommunityCards = async (game_id, round) => {
  try {
  // Get the game
  const game = await gameModel.getGameById(game_id);

  // Deal the community cards based on the round
  switch (round) {
    case 1: // Deal the flop
      game.community_cards = [
        ...game.community_cards,
        ...game.deck.slice(0, 3)
      ];
      game.deck = game.deck.slice(3);
      break;
    case 2: // Deal the turn
      game.community_cards = [
        ...game.community_cards,
        ...game.deck.slice(0, 1)
      ];
      game.deck = game.deck.slice(1);
      break;
    case 3: // Deal the river
      game.community_cards = [
        ...game.community_cards,
        ...game.deck.slice(0, 1)
      ];
      game.deck = game.deck.slice(1);
      break;
    default:
      throw new Error('Invalid round number');
  }

    // Update the game in the database
    await gameModel.updateGame(game);
  } catch (error) {
    console.error('Error dealing community cards:', error);
    throw error;
  }

};


exports.determineWinner = (game_id) => {
  let players, communityCards;
  return playerController.getPlayersByGameId(game_id)
    .then((playersResult) => {
      players = playersResult;
      return gameController.getCommunityCards(game_id);
    })
    .then((communityCardsResult) => {
      communityCards = communityCardsResult;
      const hands = new Map();
      for (const player of players) {
        const cards = [...player.cards, ...communityCards];
        let bestHand = null;
        for (let i = 0; i < cards.length - 4; i++) {
          for (let j = i + 1; j < cards.length - 3; j++) {
            for (let k = j + 1; k < cards.length - 2; k++) {
              for (let l = k + 1; l < cards.length - 1; l++) {
                for (let m = l + 1; m < cards.length; m++) {
                  const hand = [cards[i], cards[j], cards[k], cards[l], cards[m]];
                  const handValue = evaluateHand(hand);
                  if (!bestHand || handValue > bestHand.value) {
                    bestHand = {
                      cards: hand,
                      value: handValue,
                    };
                  }
                }
              }
            }
          }
        }
        hands.set(player.id, bestHand);
      }
      let highestHandValue = null;
      for (const hand of hands.values()) {
        if (!highestHandValue || hand.value > highestHandValue) {
          highestHandValue = hand.value;
        }
      }
      const winners = [];
      for (const [playerId, hand] of hands.entries()) {
        if (hand.value === highestHandValue) {
          winners.push(playerId);
        }
      }
      return winners;
    })
    .catch((error) => {
      console.error('Error determining winner:', error);
      throw error;
    });
};