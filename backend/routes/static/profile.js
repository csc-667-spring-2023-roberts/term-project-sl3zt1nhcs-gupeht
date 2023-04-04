import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
    response.render("profile", { title: "term project profile"});
});

export default router;