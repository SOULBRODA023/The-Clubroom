const express = require("express");
const {
	validateSecret,
	checkSecret,
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

module.exports = router;
