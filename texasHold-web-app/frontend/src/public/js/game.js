//game/js for the front end
export async function createGame() {
   
    const name = document.querySelector('#create-game-form input[name="gameName"]').value;
    const maxPlayers = document.querySelector('#create-game-form input[name="maxPlayers"]').value;
    const minBuyin = document.querySelector('#create-game-form input[name="minBuyIn"]').value;
    const maxBuyIn = document.querySelector('#create-game-form input[name="maxBuyIn"]').value;

    const token = localStorage.getItem("token");

    try {
        const response = await fetch("/game/create", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, maxPlayers, minBuyin, maxBuyIn }),
        });

        const responseData = await response.json();

        if (response.status === 200) {
            messageDiv.textContent = `Game : ${name} created successfully`;

        } else if (response.status === 409) {
            messageDiv.textContent = responseData.message;
        } else {
            messageDiv.textContent = "An error occurred during creating game";
        }
    } catch (error) {
        messageDiv.textContent = message.error;
    }
}

/*
export async function joinGame(gameId) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`/game/join/${gameId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });

        const responseData = await response.json();

        if (response.status === 200) {
            messageDiv.textContent = `${responseData.username} joined the game`;
        } else {
            messageDiv.textContent = responseData.message || "An error occurred while joining the game";
        }
    } catch (error) {
        messageDiv.textContent = error.message;
    }
}
*/


export async function getGameList() {
    const gameListElement = document.getElementById("game-list");
  
    const token = localStorage.getItem("token");
    const response = await fetch("/game/list", {

      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    const resultResponse = await response.json();

    const gamesArray = resultResponse.result.games;
  
    if ( gamesArray.length === 0) {

      gameListElement.innerHTML = "<p>No games available. Create one!</p>";
    } else {

        const gamesObj = {};
    
        for (const game of gamesArray) {
            const gameId = game.game_id;
            const availableSpaces = game.max_players - game.num_players
            const startTime =  new Date(game.start_time).tolocaleString();
            const gameHtml = `
            <div class="game-item" data-game-id="${gameId}">
                <h3>${game.name}</h3>
                <p>Start Time: ${startTime}</p>
                <p>Players: (Available spaces: ${availableSpaces})</p>
                <p>Buy-In: ${game.min_buy_in} - ${game.max_buy_in}</p>
                <button class="join-game">Join</button>
            </div>
            `;
        
        gamesObj[gameId] = {
          html: gameHtml,
          numPlayers: game.num_players,
          maxPlayers: game.max_players
        };
      }
  
      gameListElement.innerHTML = Object.values(gamesObj)
        .map((game) => game.html)
        .join("");
    }

  }
  