const express = require("express");
const createError = require("http-errors");
const path = require("path");
const morgan = require("morgan");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set("views", path.join(__dirname, "backend", "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "backend", "static")));

const rootRoutes = require("./backend/routes/root");
app.use("/", rootRoutes);

const PORT = process.env.PORT || 3000;

router.get("/", (request, response) => {
  const name = "person";
  
  response.render("home", {
    title: "Hi World!",
    message: "Our first template.",
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

/** Existing server.js content **/

app.use((request, response, next) => {
  next(createError(404));
});