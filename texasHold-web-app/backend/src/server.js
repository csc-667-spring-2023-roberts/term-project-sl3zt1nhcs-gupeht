const path = require("path");
require('dotenv').config({path:path.join(__dirname,'config','.env')});

const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const { sessionMiddleware, cookieMiddleware } = require("./middleware/sessionMiddleWare");
const userRoutes = require("./router/userRoutes");
const root = require("./router/root");
const { customErrorHandler } = require("./middleware/customErrorHandler");
const app = express();
const server = http.createServer(app);






const io = require('socket.io')(server, {
  cors: {
    origin: "*", // replace * with your frontend domain in production
    methods: ["GET", "POST"]
  }
});


io.on("connection", (socket) => {
  console.log("New client connected");
  
  socket.on('join_lobby', (data) => {
    socket.join('lobby'); // assuming 'lobby' is the room for your lobby
    console.log(`User ${data.userId} joined the lobby`);
  });

  socket.on("send_message", (data) => {
    io.to('lobby').emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});





// view engine setup
app.set("views", path.join(__dirname, "../../frontend/src/public/views"));

app.set("view engine", "ejs");

// Serve static files for front end

app.use(express.static(path.join(__dirname, "../../frontend/src/public/")));

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(sessionMiddleware);
app.use(cookieMiddleware);




app.use("/", root);
app.use("/user", userRoutes);


// Move customErrorHandler here, after the routes
app.use(customErrorHandler);


//Creates database
const { CreateTableError, createTables } = require("./database/createTables");

const result = {};

createTables()
    .then((resultStatus) => {
        result.message = resultStatus.message;
        // start server here
        const port = process.env.PORT || 3000;
        
        // 404 error handling
        app.use((req, res, next) => {
            res.status(404).json({ message: "Not Found" });
        });

        // error handling
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(err.statusCode || 500).json({ message: err.message });
        });

        return new Promise((resolve, reject) => {
            server.listen(port, () => {
                result.serverMessage = `Server running on port ${port}`;
                console.log(result.serverMessage);
                resolve(result);
            });
        });
    })
    .catch((error) => {
        if (error instanceof CreateTableError) {
            result.message = ("Error in creating table", error.message);
        } else {
            result.internal = ("Error in createTables", error);
        }
        return Promise.reject(result);
    })
    .then((result) => {
        console.log("Server started successfully", result);
    })
    .catch((result) => {
        console.log("Error starting server", result);
    });