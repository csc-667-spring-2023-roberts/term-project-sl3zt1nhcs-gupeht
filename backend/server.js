const express = require("express");
const createError = require("http-errors");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const env = process.env.NODE_ENV || 'development';
const config = require(`./config/${env}`)
const { errorHandler} = require("./middleware/errorHandler");
const {sessionMiddleware} = require ('./middleware/sessionUser');
const {requireAuth} = require ('./middleware/authMiddleware');
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set("views", path.join(__dirname, "backend", "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "backend", "static")));

const rootRoutes = require("./routes/root");
const authRoutes = require ("./routes/auth");

app.use(sessionMiddleware);
app.use("/", rootRoutes);
app.use("/auth",authRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || config.PORT;


app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

/** Existing server.js content **/

app.use((request, response, next) => {
  next(createError(404));
});

app.usr