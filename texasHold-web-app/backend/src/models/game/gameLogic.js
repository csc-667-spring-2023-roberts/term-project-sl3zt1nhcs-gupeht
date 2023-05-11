const suits = ['S', 'H', 'D', 'C'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

 function createDeck() {
    let deck = [];
    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push(`${rank}${suit}`);
        });
    });
    return deck;
}

 function shuffle(deck) {
    for(let i = deck.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * i);
        const temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    return deck;
}

  let gameState = {
    pot: 0,
    current_bet: 0,
    dealer: null,
    current_player: null,
    players: {} // We will store the player's data using their user_id as the key
};

 function playerJoinGame(user_id, userName) {
    gameState.players[user_id] = {
        userName: userName,
        cards: [],
        bet_amount: 0,
        money: 1000, // Let's give each player 1000 units of money to start
        isActive: true // New property indicating if the player is active in the current round
    };

    // If this is the first player to join, they become the dealer
    if (!gameState.dealer) {
        gameState.dealer = user_id;
    }
}

 function playerFold(user_id) {
    // If the player folds, mark them as inactive
    gameState.players[user_id].isActive = false;

    // If there's only one active player left, they win the game
    const activePlayers = Object.values(gameState.players).filter(player => player.isActive);
    if (activePlayers.length === 1) {
        endRound();
    }
}


 function startGame() {
    // Create and shuffle the deck
    let deck = createDeck();
    shuffle(deck);

    // Deal two cards to each player
    for (let user_id in gameState.players) {
        gameState.players[user_id].cards = [deck.pop(), deck.pop()];
        gameState.players[user_id].isActive = true;
    }
    // The player after the dealer goes first
    gameState.current_player = getNextPlayer(gameState.dealer);
}

 function playerBet(user_id, amount) {

    let player = gameState.players[user_id];

    // Make sure the player has enough money to make the bet
    if (player.money < amount) {
        return `${player.userName} does not have enough money to bet ${amount}`;
    }

    // Make sure it's the player's turn
    if (gameState.current_player !== user_id) {
        return `It's not ${player.userName}'s turn to bet`;
    }

     // Make sure the player is active
     if (!player.isActive) {
        return `${player.userName} can't bet because they have folded`;
    }

    player.money -= amount;
    player.bet_amount += amount;
    gameState.pot += amount;

    // If the player has bet all their money, they are all in
    if (player.money === 0) {
        return `${player.userName} is all in!`;
    }

    // Move on to the next player
    gameState.current_player = getNextPlayer(user_id);
}

 function getNextPlayer(currentPlayerId) {
    // Get all player ids
    const playerIds = Object.keys(gameState.players);

    // Get the index of the current player
    const currentPlayerIndex = playerIds.indexOf(currentPlayerId);

    // Get the next player index
    let nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;

    // Skip over players who are not active
    while (!gameState.players[playerIds[nextPlayerIndex]].isActive) {
        nextPlayerIndex = (nextPlayerIndex + 1) % playerIds.length;
    }

    // Return the id of the next player
    return playerIds[nextPlayerIndex];
}

 function calculateHandValue(hand) {
    // Convert card ranks to numbers for easier comparison
    let values = hand.map(card => {
        let value = card.slice(0, -1); // Remove the last character (suit)

        if (value === 'J') return 11;
        if (value === 'Q') return 12;
        if (value === 'K') return 13;
        if (value === 'A') return 14;

        return parseInt(value);
    });

    // Check for pair or three of a kind
    let counts = {};
    for (let value of values) {
        if (!counts[value]) counts[value] = 0;
        counts[value]++;
    }

    let pairs = Object.values(counts).filter(count => count === 2).length;
    let threes = Object.values(counts).filter(count => count === 3).length;

    // Pair: Add 1000 to make it worth more than high card
    // Three of a kind: Add 2000 to make it worth more than pair
    let pairValue = pairs > 0 ? 1000 + Math.max(...values) : 0;
    let threeValue = threes > 0 ? 2000 + Math.max(...values) : 0;

    // High card: Just the value of the highest card
    let highCardValue = Math.max(...values);

    return Math.max(pairValue, threeValue, highCardValue);
}


 function determineWinner() {
    let handValues = {};
    let highestHandValue = -1;

    // Calculate hand values and find the highest value
    for (let user_id in gameState.players) {
        let hand = gameState.players[user_id].cards;
        let handValue = calculateHandValue(hand);
        handValues[user_id] = handValue;

        if (handValue > highestHandValue) {
            highestHandValue = handValue;
        }
    }

    // Check how many players have the highest hand value
    let winners = [];
    for (let user_id in handValues) {
        if (handValues[user_id] === highestHandValue) {
            winners.push(user_id);
        }
    }

    if (winners.length > 1) {
        // If more than one player has the highest hand value, it's a tie
        return winners;
    } else {
        // Otherwise, the single player with the highest hand value is the winner
        return winners[0];
    }
}


 function endRound() {
    // Reveal each player's hand
    for (let user_id in gameState.players) {
        console.log(`${gameState.players[user_id].userName}'s hand: ${gameState.players[user_id].cards}`);
    }

    // Determine the winner
    let winners = determineWinner();

    if (Array.isArray(winners)) {
        console.log('It\'s a tie!');
        // Split the pot between the winners
        winners.forEach(winner => {
            gameState.players[winner].money += gameState.pot / winners.length;
        });
    } else {
        console.log(`${gameState.players[winners].userName} wins the pot of ${gameState.pot}!`);
        gameState.players[winners].money += gameState.pot;
    }

    // Reset the game state
    gameState.pot = 0;
    gameState.current_bet = 0;
    gameState.dealer = getNextPlayer(gameState.dealer);
    gameState.current_player = gameState.dealer;

    for (let user_id in gameState.players) {
        gameState.players[user_id].cards = [];
        gameState.players[user_id].bet_amount = 0;
    }
}




module.exports = {
    createDeck,
    shuffle,
    playerJoinGame,
    playerFold,
    startGame,
    playerBet,
    gameState,
    determineWinner,
    endRound,

  };