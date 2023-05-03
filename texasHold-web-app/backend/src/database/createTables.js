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
            CREATE TABLE  IF NOT EXISTS tables (
                table_id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                max_players INTEGER NOT NULL,
                min_buy_in NUMERIC(10, 2) NOT NULL,
                max_buy_in NUMERIC(10, 2) NOT NULL
            );
            
            
            
            CREATE TABLE IF NOT EXISTS games_data (
                game_data_id SERIAL PRIMARY KEY,
                game_id INTEGER NOT NULL REFERENCES games(game_id),
                game_data JSON NOT NULL
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
                user_id INTEGER NOT NULL REFERENCES users(user_id),
                game_id INTEGER NOT NULL REFERENCES games(game_id),
                buy_in NUMERIC(10, 2) NOT NULL,
                cash_out NUMERIC(10, 2) NOT NULL,
                UNIQUE (user_id, game_id)
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
