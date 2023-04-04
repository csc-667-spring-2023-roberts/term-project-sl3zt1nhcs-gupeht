const express = require('express');
const router = express.Router();



router.get("/", (req, res) => {
    const name = "person";
    
    res.render("home", {
      title: "Hi World!",
      message: "Our first template.",
    });
  });

  module.exports = router