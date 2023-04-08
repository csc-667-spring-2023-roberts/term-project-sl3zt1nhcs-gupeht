
/*
This data should be inside a file with .env in the same directory

DB_HOST=localhost
DB_PORT=5432
DB_USER=your_name
DB_PASSWORD=your_password
DB_NAME=texas_poker

to create the database run the code node database.js
*/

// import Client class
const { Client } = require("pg"); 
// the config path must be set to the root of the project directory
const dotenv = require("dotenv").config({ path: "../.env" });

// error check handler for dotenv
if (dotenv.error) {
  console.error("Error loading .env file:", dotenv.error);
  process.exit(1);
}

// constains all the environment variables to connect to database
const connectionString = {
  connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
};
// implement to help to debug an issues
console.log(connectionString);
//Create a  new instance of Client
const client = new Client(connectionString);

//  connects client object to your local db server and creates tables

const createTable = async () => {
  //  A try and catch block to connect the client to the datbase
  try {
    await client.connect();
  } catch (e) {
    console.error("Error connecting to database:", e);
    process.exit(1);
  }

  // Array of tables
  const tables = [

    // Index 1
    `
      CREATE TABLE IF NOT EXISTS public.users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        balance INTEGER NOT NULL DEFAULT 0
      );
    `,
    // Index 2
    `
      CREATE TABLE IF NOT EXISTS public.tables (
        table_id SERIAL PRIMARY KEY,
        table_name VARCHAR(50) NOT NULL UNIQUE
      );
    `,
    // Index 3
    `
      CREATE TABLE IF NOT EXISTS public.players (
        player_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id),
        table_id INTEGER NOT NULL REFERENCES tables(table_id),
        balance INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'active'
      );
    `,
    // Index 4
    `
      CREATE TABLE IF NOT EXISTS public.games (
        game_id SERIAL PRIMARY KEY,
        table_id INTEGER NOT NULL REFERENCES tables(table_id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        winner_id INTEGER REFERENCES players(player_id)
      );
    `,
    //Index 5
    `
      CREATE TABLE IF NOT EXISTS public.cards (
        card_id SERIAL PRIMARY KEY,
        suit VARCHAR(10) NOT NULL,
        rank VARCHAR(5) NOT NULL
      );
    `,
    // Index 6
    `
      CREATE TABLE IF NOT EXISTS public.hands (
        hand_id SERIAL PRIMARY KEY,
        player_id INTEGER NOT NULL REFERENCES players(player_id),
        table_id INTEGER NOT NULL REFERENCES tables(table_id),
        game_id INTEGER NOT NULL REFERENCES games(game_id),
        is_community_hand BOOLEAN NOT NULL DEFAULT FALSE
      );
    `,
    // Index 7
    `
      CREATE TABLE IF NOT EXISTS public.card_in_hand (
        card_id INTEGER NOT NULL REFERENCES cards(card_id),
        hand_id INTEGER NOT NULL REFERENCES hands(hand_id),
        PRIMARY KEY (card_id, hand_id)
      );
    `,
  ];

  // function that creates tables recursively according to position. Order matter due to the relations
  const createNextTable = (index) => {

    // Base Case: If all tables have been creaed will exit
    if (index >= tables.length) {
      console.log("Tables created. Check your local Db server.");
      return client.end();
    }

    // Recursion here : promises are used to handle eror
    //  index refer to the position of table in tables
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

  // function is called inside starting at array 0
  createNextTable(0);
};


createTable();
