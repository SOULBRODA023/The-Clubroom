const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
	verifyDataNotExist,
	validateSignup,
} = require("../controller/authcontroller");

router.get("/signup", (req, res) => {
	const flashSuccess = req.flash("success");

	res.render("auth", {
		mode: "signup",
		errors: [],
		oldInput: {},
		success: flashSuccess.length > 0 ? flashSuccess[0] : null,
	});
});


router.post("/signup", validateSignup, verifyDataNotExist);

module.exports = router;
