const { Client } = require("pg");
const config = require("../config/development");

class CreateTableError extends Error {
    constructor(message) {
        super(message);
        this.name = "CreateTableError";
    }
}

const createTables = () => {
    const client = new Client(config.database);

    return client
        .connect()
        .then(() => {
            return client.query(
                `

                CREATE TABLE IF NOT EXISTS games (
                    game_id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    start_time TIMESTAMP NOT NULL
                );

                CREATE TABLE IF NOT EXISTS games_data (
                    id SERIAL PRIMARY KEY,
                    game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
                    game_data JSON NOT NULL
                );
                
                
                CREATE TABLE IF NOT EXISTS tables (
                    table_id SERIAL PRIMARY KEY,
                    game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
                    max_players INTEGER NOT NULL,
                    min_buy_in NUMERIC(10, 2) NOT NULL,
                    max_buy_in NUMERIC(10, 2) NOT NULL,
                    num_players INTEGER NOT NULL DEFAULT 0
                );
                
                CREATE TABLE IF NOT EXISTS users (
                    user_id SERIAL PRIMARY KEY,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    auth_token VARCHAR(255)
                );
                
                CREATE TABLE IF NOT EXISTS players (
                    player_id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                    game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
                    UNIQUE (user_id, game_id)
                );

                CREATE TABLE IF NOT EXISTS players_game_save (
                    id SERIAL PRIMARY KEY,
                    player_id INTEGER NOT NULL REFERENCES players(player_id) ON DELETE CASCADE,
                    game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
                    metadata JSON NOT NULL,
                    UNIQUE (player_id, game_id)
                );
            
            `
            );
        })
        .then(() => {
            return { success: true, message: "Tables created successfully" };
        })
        .catch((error) => {
            throw new CreateTableError(`Error creating tables: ${error.message}`);
        })
        .finally(() => {
            return client.end();
        });
};

module.exports = { createTables, CreateTableError };
