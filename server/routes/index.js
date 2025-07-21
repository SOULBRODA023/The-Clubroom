const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	res.redirect("/login"); // Or render a home page
});

module.exports = router;
