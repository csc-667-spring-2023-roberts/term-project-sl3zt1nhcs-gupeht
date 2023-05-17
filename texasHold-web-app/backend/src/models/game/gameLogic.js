const playerModel = require("./playerModels");

const suits = ["♠", "♥", "♦", "♣"];

const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

function createDeck() {
    let deck = [];
    suits.forEach((suit) => {
        ranks.forEach((rank) => {
            deck.push(`${rank}${suit}`);
        });
    });
    return deck;
}

function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    console.log("cards shuffle....");
    return deck;
}

let gameState = {
    isActive: true,
    pot: 0,
    current_bet: 0,
    dealer: null,
    current_player: null,
    players: {}, // We will store the player's data using their user_id as the key
};

// Getter function
function getGameState() {
    return gameState;
}

function isUserInGame(user_id) {
    let result = !!gameState.players[user_id] ? `user leaving is  in game` : `user leaving is not  in game`;

    console.log(result);

    return !!gameState.players[user_id];
}

function removeUserFromGame(user_id) {
    let gameResult = {};
    // Check if the player exists in the game
    if (!gameState.players[user_id]) {
        return `Player ${user_id} does not exist in the game`;
    }

    // If the player is the dealer, assign a new dealer
    if (gameState.dealer === user_id) {
        console.log("user leaving the game was a dealer");
        gameState.dealer = getNextPlayer(user_id);
    }

    // If the player is the current player, move to the next player
    if (gameState.current_player === user_id) {
        console.log("user leaving the game was a current player");
        gameState.current_player = getNextPlayer(user_id);
    }

    console.log("Updating player state of the player leaving the game");
    let playState = gameState.players[user_id];
    playState.isParticipating = false;
    gameState.players[user_id] = playState; // Update the gameState with the new player state
    playerModel.updatePlayerState(user_id, gameState.players[user_id]);

    let activePlayers = Object.values(gameState.players).filter((player) => player.isParticipating).length;
    console.log("Active players remaining in the game:", activePlayers);

    if (activePlayers > 1) {
        console.log("more than one player left");
        // we will count the cards
        gameResult.roundResult = endRound();
    } else if (activePlayers === 1) {
        console.log("only one player left");
        // only the player who did not leave the game should be counted as winner regardless of the cards
        gameResult.endGameResult = endGame();
        Object.values(gameState.players).forEach((player) => {
            player.isActive = false;
            player.isParticipating = false;
            gameState.players[player.userId] = player; // Update the gameState with the new player state
        });
    }

    return gameResult;
}

function playerJoinGame(user_id, userName) {
    gameState.players[user_id] = {
        userName: userName,
        cards: [],
        bet_amount: 0,
        money: 1000, // Let's give each player 1000 units of money to start
        isActive: true, // New property indicating if the player is active in the current round
        isParticipating: true,
        roundsWon: 0,
        roundsLost: 0,
        gamesWon: 0,
        gamesLost: 0,
    };

    let activePlayers = Object.values(gameState.players).filter((player) => player.isParticipating).length;

    if (activePlayers === 1) {
        // If this is the first player to join, they become the dealer
        if (!gameState.dealer) {
            gameState.dealer = user_id;
        } else if (!gameState.current_player) {
            // If this is the second player to join, they become the current player
            gameState.current_player = user_id;
        }
    }
}

function playerFold(user_id) {
    // If the player folds, mark them as inactive
    gameState.players[user_id].isActive = false;

    // If there's only one active player left, they win the game
    const activePlayers = Object.values(gameState.players).filter((player) => player.isActive);
    if (activePlayers.length === 1) {
        endRound();
    }
}

function startGame() {
    let participatingPlayers = Object.values(gameState.players).filter((player) => player.isParticipating);
    if (participatingPlayers.length < 2) {
        return;
    }

    // Create and shuffle the deck
    let deck = createDeck();
    shuffle(deck);

    for (let user_id in gameState.players) {
        gameState.players[user_id].cards = [deck.pop(), deck.pop(), deck.pop(), deck.pop(), deck.pop()];
        gameState.players[user_id].isActive = true;
        gameState.players[user_id].isParticipating = true;
    }

    // The player after the dealer goes first if there's no current player
    if (!gameState.current_player) {
        gameState.current_player = getNextPlayer(gameState.dealer);
    }
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

    // Check if there is only one active player left
    const nextPlayer = getNextPlayer(gameState.current_player);
    if (nextPlayer === null) {
        // If there is no next active player, end the round or the game
        const activePlayers = Object.values(gameState.players).filter((player) => player.isActive);
        if (activePlayers.length === 1) {
            endRound();
        }
    }
}

function getNextPlayer(currentPlayerId) {
    // Get all player ids
    const playerIds = Object.keys(gameState.players);

    // Get the index of the current player
    const currentPlayerIndex = playerIds.indexOf(currentPlayerId);

    // Get the next player index
    let nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;

    let loopCount = 0; // count how many times we've looped

    while (!gameState.players[playerIds[nextPlayerIndex]].isActive) {
        nextPlayerIndex = (nextPlayerIndex + 1) % playerIds.length;
        loopCount++;

        // If we've looped over all players and none are active, return null or some default value
        if (loopCount >= playerIds.length) {
            return null;
        }
    }

    // Return the id of the next player
    return playerIds[nextPlayerIndex];
}

function showCards(user_id) {
    let player = gameState.players[user_id];
    if (player) {
        return player.cards;
    } else {
        return `${user_id} is not in the game`;
    }
}

function calculateHandValue(hand) {
    // Convert card ranks to numbers for easier comparison
    let values = hand.map((card) => {
        let value = card.slice(0, -1); // Remove the last character (suit)

        if (value === "J") return 11;
        if (value === "Q") return 12;
        if (value === "K") return 13;
        if (value === "A") return 14;

        return parseInt(value);
    });

    // Check for pair or three of a kind
    let counts = {};
    for (let value of values) {
        if (!counts[value]) counts[value] = 0;
        counts[value]++;
    }

    let pairs = Object.values(counts).filter((count) => count === 2).length;
    let threes = Object.values(counts).filter((count) => count === 3).length;

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

// Function to draw a card from the deck
function drawCard(user_id) {
    // Make sure it's the player's turn
    if (gameState.current_player !== user_id) {
        return `It's not ${gameState.players[user_id].userName}'s turn to draw a card`;
    }

    // Draw a card from the deck
    let card = deck.pop();

    // Add the card to the player's hand
    gameState.players[user_id].cards.push(card);
}

// Function to pass the turn to the next player
function passTurn(user_id) {
    // Make sure it's the player's turn
    if (gameState.current_player !== user_id) {
        return `It's not ${gameState.players[user_id].userName}'s turn to pass`;
    }

    // Pass the turn to the next player
    gameState.current_player = getNextPlayer(user_id);
}

// Functions to bet more or less
function betMore(user_id, additionalAmount) {
    playerBet(user_id, gameState.players[user_id].bet_amount + additionalAmount);
}

function betLess(user_id, lessAmount) {
    playerBet(user_id, gameState.players[user_id].bet_amount - lessAmount);
}

// Function to bet all
function betAll(user_id) {
    playerBet(user_id, gameState.players[user_id].money);
}

function endRound() {
    let roundResult = {
        cards: {},
        winner: null,
        money: null,
    };

    console.log("revealing each players hand");

    // Reveal each player's hand
    for (let user_id in gameState.players) {
        let cards = showCards(user_id);
        if (Array.isArray(cards)) {
            roundResult.cards[user_id] = cards;
            console.log(`${gameState.players[user_id].userName}'s hand: ${cards}`);
        } else {
            console.log(cards); // Log the error message
        }
    }

    // Determine the winner
    let winners = determineWinner();

    if (Array.isArray(winners)) {
        console.log("It's a tie!");
        roundResult.winner = "tie";
        // Split the pot between the winners
        winners.forEach((winner) => {
            gameState.players[winner].money += gameState.pot / winners.length;
            roundResult.money = gameState.players[winner].money;
        });
    } else {
        console.log(`${gameState.players[winners].userName} wins the pot of ${gameState.pot}!`);
        roundResult.winner = winners;
        gameState.players[winners].money += gameState.pot;
        roundResult.money = gameState.players[winners].money;
        gameState.players[winners].roundsWon++;

        for (let user_id in gameState.players) {
            if (user_id !== winners) {
                gameState.players[user_id].roundsLost++;
            }
        }
    }

    // Store the winners cards in the round result
    if (Array.isArray(winners)) {
        roundResult.winnersCard = []; // Initialize as an array
        winners.forEach((winner) => {
            roundResult.winnersCard.push(gameState.players[winner].cards); // Push each winner's cards
        });
    } else {
        // Only one winner, so we don't need an array
        roundResult.winnersCards = gameState.players[winners].cards;
    }

    // Reset the game state
    gameState.pot = 0;
    gameState.current_bet = 0;
    gameState.dealer = getNextPlayer(gameState.dealer);
    gameState.current_player = gameState.dealer;

    for (let user_id in gameState.players) {
        gameState.players[user_id].cards = [];
        gameState.players[user_id].bet_amount = 0;
        gameState.players[user_id].isActive = true;
        playerModel.updatePlayerState(user_id, gameState.players[user_id]);
    }

    console.log("round result:", roundResult);

    return roundResult;
}
function endGame() {
    let result = {};

    let activePlayers = [];
    let inactivePlayers = [];

    // Identify all active players
    for (let user_id in gameState.players) {
        if (gameState.players[user_id].isParticipating) {
            activePlayers.push(user_id);
        } else {
            inactivePlayers.push(user_id);
        }
    }

    // If only one player is active, they're the winner
    if (activePlayers.length === 1) {
        let winnerId = activePlayers[0];
        gameState.players[winnerId].gamesWon++;
        result.winners = [gameState.players[winnerId].userName];

        // Increment gamesLost for all inactive players
        inactivePlayers.forEach((playerId) => {
            gameState.players[playerId].gamesLost++;
        });
    } else {
        // If more than one player is active, determine the player(s) with the maximum rounds won
        let maxRoundsWon = 0;
        let winners = [];

        for (let user_id in gameState.players) {
            if (gameState.players[user_id].roundsWon > maxRoundsWon) {
                maxRoundsWon = gameState.players[user_id].roundsWon;
                winners = [user_id]; // New winner found, reset the winners array
            } else if (gameState.players[user_id].roundsWon === maxRoundsWon) {
                winners.push(user_id); // Tie, add the player to the winners array
            }
        }

        // Increment the gamesWon for the winners and gamesLost for the others
        for (let user_id in gameState.players) {
            if (winners.includes(user_id)) {
                gameState.players[user_id].gamesWon++;
            } else {
                gameState.players[user_id].gamesLost++;
            }
        }

        let winnerNames = winners.map((id) => gameState.players[id].userName);
        result.winners = winnerNames;
    }

    // Set all players to inactive and not participating
    for (let user_id in gameState.players) {
        gameState.players[user_id].isActive = false;
        gameState.players[user_id].isParticipating = false;
        playerModel.updatePlayerState(user_id, gameState.players[user_id]);
    }

    // Set the game state to inactive
    gameState.isActive = false;
    result.gameState = gameState;

    // Update each player's state in the database
    for (let user_id in gameState.players) {
        let playerState = gameState.players[user_id];

        playerModel.updatePlayerState(user_id, playerState);
    }

    return result;
}

// for individual player
function playerRejoinGame(user_id, playerGameState) {
    if (!gameState.players[user_id]) {
        console.log(`Player with id ${user_id} does not exist in the game.`);
        return;
    }

    // Update the player's game state with the provided game state
    gameState.players[user_id] = playerGameState;

    // Set player to active and participating
    gameState.players[user_id].isActive = true;
    gameState.players[user_id].isParticipating = true;
    console.log(`Player with id ${user_id} has rejoined the game.`);


    playerModel.updatePlayerState(user_id, playerState);
}

module.exports = {
    createDeck,
    shuffle,
    playerJoinGame,
    playerFold,
    startGame,
    playerBet,
    getGameState,
    determineWinner,
    endRound,
    showCards,
    isUserInGame,
    removeUserFromGame,
    playerRejoinGame,
};
