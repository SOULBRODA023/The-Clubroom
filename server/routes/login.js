const express = require("express");
const router = express.Router();

router.get("/login", (req, res) => {
	res.render("auth", { mode: "login" });
});

module.exports = router;
