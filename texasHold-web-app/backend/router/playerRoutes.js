const playerController = require("./controllers/playerController");

router.post("/player/join", playerController.joinGame);
router.post("/player/leave", playerController.leaveGame);

module.exports = router;