import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
    response.render("sign-up", { title: "term project sign-up"});
});

export default router;