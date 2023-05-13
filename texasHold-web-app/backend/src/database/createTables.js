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

                CREATE TABLE IF NOT EXISTS users (
                    user_id SERIAL PRIMARY KEY,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE
                );


                CREATE TABLE IF NOT EXISTS game_states (
                    id  SERIAL PRIMARY KEY,
                    user_id INT,
                    game_id SERIAL,
                    cards JSON,
                    bet_amount INT,
                    game_state JSON,
                    FOREIGN KEY (user_id) REFERENCES users(user_id)
                );


                CREATE TABLE IF NOT EXISTS messages (
                    message_id SERIAL PRIMARY KEY,
                    user_id INT NOT NULL,
                    message_content TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(user_id)
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
