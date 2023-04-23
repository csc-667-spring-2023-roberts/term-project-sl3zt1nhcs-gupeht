const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const setupSocket = require('./socket');
const { sessionMiddleware, cookieMiddleware } = require('./middlewares/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const tableRoutes = require('./routes/tableRoutes');
const chatController = require('./controllers/chatController');

const app = express();
const server = http.createServer(app);

const io = setupSocket(server);

app.set('io',io);
chatController.setIoInstance(io); 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(sessionMiddleware);
app.use(cookieMiddleware);

// routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/game', gameRoutes);
app.use('/table', tableRoutes);

// 404 error handling
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ message: err.message });
});

// start server
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server running on port ${port}`));
