const express = require("express");
const router = express.Router();
const passport = require("passport");
const { validateSignup } = require("../controller/authcontroller");

// GET /login

router.get("/login", (req, res) => {
	res.render("auth", {
		mode: "login",
		errors: [],
		oldInput: {},
	});
});


router.post(
	"/login",validateSignup,
	// Optional: A middleware to log login attempts before Passport processes them
	(req, res, next) => {
		console.log("Login attempted for username:", req.body.email);
		next();
	},
	// Passport.js authentication middleware
	passport.authenticate("local", {
		successRedirect: "/home", // Redirect to the index page on successful login
		failureRedirect: "/login", // Redirect back to the login page on failed login
		failureFlash: false, // Set to true if you want to use connect-flash for error messages
	})
);

module.exports = router;
