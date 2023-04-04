// imports
import express           from "express";
import createError       from "http-errors";
import path              from "path";
import morgan            from "morgan";
import livereload        from "livereload";
import cookieParser      from "cookie-parser";
import connectLiveReload from "connect-livereload";

import {
  gameRoute, 
  homeRoute, 
  lobbyRoute, 
  profileRoute,
  signUpRoute
} 
from './routes/index.js';

// global(s)
const app  = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development")  {
  const liveReloadServer = livereload.createServer();

  liveReloadServer.watch(path.join(".", "backend", "static"));
  liveReloadServer.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
  });

  app.use(connectLiveReload());
}

app.set("views", path.join(".", "backend", "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(".", "backend", "static")));

app.use("/game",    gameRoute);
app.use("/",        homeRoute);
app.use("/lobby",   lobbyRoute);
app.use("/profile", profileRoute);
app.use("/sign-up", signUpRoute);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.use((request, response, next) => {
  next(createError(404));
});