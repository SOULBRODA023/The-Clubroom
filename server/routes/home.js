const express = require("express");
const router = express.Router();

router.get("/home", (req, res) => {
	console.log("Redirected to /");
	res.render("home", { user: req.user });
});

module.exports = router;
