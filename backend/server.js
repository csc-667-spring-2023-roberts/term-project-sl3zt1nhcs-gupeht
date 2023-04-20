const express = require("express");
const createError = require("http-errors");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const env = process.env.NODE_ENV || 'development';
const config = require(`../backend/config/${env}`);
const { errorHandler} = require("./middleware/errorHandler");
const {sessionMiddleware} = require ('./middleware/sessionUser');
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set("views", path.join(__dirname, "backend", "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "backend", "static")));

const rootRoutes = require("./routes/root");
const authRoutes = require ("./routes/userRouter");
const gameRoutes = require('./routes/gameRouter');
const userRoutes = require('./routes/userRouter');

app.use(sessionMiddleware);// declared globally so is accessible to all routes

app.use("/", rootRoutes);
app.use("/api/auth",authRoutes);
app.use('/api/game',gameRoutes);
app.use('/api/user',userRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || config.PORT;


app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}.....`);
});


// Handle 404 erors
app.use((request, response, next) => {
  next(createError(404));
});

