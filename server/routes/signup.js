const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
	verifyDataNotExist,
	validateSignup,
} = require("../controller/authcontroller");

router.get("/signup", (req, res) => {
	res.render("auth", {
		mode: "signup",
		errors: [],
		oldInput: {},
	});
});

router.post("/signup", validateSignup, verifyDataNotExist);

module.exports = router;
