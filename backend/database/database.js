
/*
This data should be inside a file with .env in the same directory

DB_HOST=localhost
DB_PORT=5432
DB_USER=your_name
DB_PASSWORD=your_password
DB_NAME=texas_poker

to create the database run the code node database.js
*/

const { Client } = require("pg");
const dotenv = require("dotenv").config({ path: "../.env" });

if (dotenv.error) {
  console.error("Error loading .env file:", dotenv.error);
  process.exit(1);
}

const connectionString = {
  connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
};

console.log(connectionString);

const client = new Client(connectionString);

const createTable = async () => {
  try {
    await client.connect();
  } catch (e) {
    console.error("Error connecting to database:", e);
    process.exit(1);
  }

  const tables = [
    `
      CREATE TABLE IF NOT EXISTS public.users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        balance INTEGER NOT NULL DEFAULT 0
      );
    `,
    `
      CREATE TABLE IF NOT EXISTS public.tables (
        table_id SERIAL PRIMARY KEY,
        table_name VARCHAR(50) NOT NULL UNIQUE
      );
    `,
    `
      CREATE TABLE IF NOT EXISTS public.players (
        player_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id),
        table_id INTEGER NOT NULL REFERENCES tables(table_id),
        balance INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'active'
      );
    `,
    `
      CREATE TABLE IF NOT EXISTS public.games (
        game_id SERIAL PRIMARY KEY,
        table_id INTEGER NOT NULL REFERENCES tables(table_id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        winner_id INTEGER REFERENCES players(player_id)
      );
    `,
    `
      CREATE TABLE IF NOT EXISTS public.cards (
        card_id SERIAL PRIMARY KEY,
        suit VARCHAR(10) NOT NULL,
        rank VARCHAR(5) NOT NULL
      );
    `,
    `
      CREATE TABLE IF NOT EXISTS public.hands (
        hand_id SERIAL PRIMARY KEY,
        player_id INTEGER NOT NULL REFERENCES players(player_id),
        table_id INTEGER NOT NULL REFERENCES tables(table_id),
        game_id INTEGER NOT NULL REFERENCES games(game_id),
        is_community_hand BOOLEAN NOT NULL DEFAULT FALSE
      );
    `,
    `
      CREATE TABLE IF NOT EXISTS public.card_in_hand (
        card_id INTEGER NOT NULL REFERENCES cards(card_id),
        hand_id INTEGER NOT NULL REFERENCES hands(hand_id),
        PRIMARY KEY (card_id, hand_id)
      );
    `,
  ];

  const createNextTable = (index) => {
    if (index >= tables.length) {
      console.log("Tables created. Check your local Db server.");
      return client.end();
    }

    return client
      .query(tables[index])
      .then(() => {
        console.log(`Table ${index + 1} created.`);
        return createNextTable(index + 1);
      })
      .catch((e) => {
        console.error(`Error creating table ${index + 1}:`, e);
        return client.end();
      });
  };

  createNextTable(0);
};


createTable();
