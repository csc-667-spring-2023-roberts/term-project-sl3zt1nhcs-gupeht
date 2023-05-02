// public/js/lobby.js

const socket = io();

document.getElementById('create-game-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    fetch('/api/game/create', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: { 'Content-Type': 'application/json' },
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                showMessage(data.error);
            } else {
                window.location.href = `/game/${data.gameId}`;
            }
        });
});

socket.on('game_list', (games) => {
    const gameList = document.getElementById('game-list');
    gameList.innerHTML = '';

    games.forEach((game) => {
        const gameItem = document.createElement('div');
        gameItem.innerHTML = `
            <h3>${game.tableName}</h3>
            <p>Players: ${game.currentPlayers}/${game.maxPlayers}</p>
            <button class="join-game" data-id="${game.gameId}">Join Game</button>
        `;
        gameList.appendChild(gameItem);
    });

    document.querySelectorAll('.join-game').forEach((button) => {
        button.addEventListener('click', (e) => {
            const gameId = e.target.dataset.id;
            window.location.href = `/game/join/${gameId}`;
        });
        });
        });
        
        socket.emit('get_game_list');
        
        function showMessage(msg) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = msg;
        setTimeout(() => {
        messageElement.textContent = '';
        }, 3000);
        }
