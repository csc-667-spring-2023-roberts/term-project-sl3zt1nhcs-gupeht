import express from "express";

const router = express.Router();

router.get("/:id", (request, response) => {
    const {id} = request.params;
    response.render("game", { title: "term project game", id });
});

export default router;