const express = require("express");
const {
	validateSecret,
	checkSecret,
	isRiddle
} = require("../controller/passcodecontroller");
const { isAuthenticated , redirectIfMember} = require("../controller/authcontroller");
const router = express.Router();

router.get(
	"/passcode",
	isAuthenticated,
	redirectIfMember, 
	(req, res) => {
		res.render("passcode", {
			user: req.user,
			errors: [],
			success: null,
		});
	}
);

router.post("/passcode", isAuthenticated, validateSecret, checkSecret);

router.get("/passcode/riddle", redirectIfMember, (req, res) => {
	res.render("riddle", {
		mode: "form",
		message: null,
	})
});

router.post("/passcode/riddle", isRiddle)

module.exports = router;
