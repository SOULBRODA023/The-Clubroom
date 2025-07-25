const express = require("express");
const { validateSecret, checkSecret } = require("../controller/authcontroller");
const router = express.Router();
require("dotenv").config();

router.get("/passcode", (req, res) => {
	res.render("passcode", {
		user: req.user,
		errors: [],
		success:null,
	});
});

router.post("/passcode", validateSecret, checkSecret);
module.exports = router;
