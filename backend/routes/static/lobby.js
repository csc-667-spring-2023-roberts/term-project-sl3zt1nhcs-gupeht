import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
    response.render("lobby", { title: "term project lobby"});
});

export default router;