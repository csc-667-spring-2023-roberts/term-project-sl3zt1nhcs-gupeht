import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
    response.render("home", { title: "term project home"});
});

export default router;