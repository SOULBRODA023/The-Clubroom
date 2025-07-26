const express = require("express");
const router = express.Router();
const passport = require("passport");
const { validateLogin } = require("../controller/authcontroller");
const { validationResult } = require("express-validator");

// GET /login
router.get("/login", (req, res) => {
	const errorMessages = req.flash("error");
	const errors = errorMessages.map((msg) => ({ msg }));
	const flashSuccess = req.flash("success");

	res.render("auth", {
		mode: "login",
		errors,
		oldInput: {},
		success: flashSuccess.length > 0 ? flashSuccess[0] : null,
	});
});

// POST /login/password
router.post(
	"/login",
	validateLogin,
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.render("auth", {
				mode: "login",
				errors: errors.array(),
				oldInput: req.body,
				success: "login successful",
			});
		}
		next();
	},
	passport.authenticate("local", {
		successRedirect: "/passcode",
		failureRedirect: "/login",
		failureFlash: true,
	})
);

module.exports = router;
