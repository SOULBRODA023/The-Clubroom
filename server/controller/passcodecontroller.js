const { body, validationResult } = require("express-validator");
const pool = require("../model/pool");
const { isAuthenticated } = require("./authcontroller");
require("dotenv").config();

const isUserMember = (req, res) => {
	const isMember = req.user?.ismember;

	if (!isMember) {
		return res.status(403).render("passcode", {
			user: req.user,
			errors: [],
			success: null,
		});
	} else {
		return res.render("home", { user: req.user }); // make sure "home" view exists
	}
};


const validateSecret = [
	body("secret")
		.notEmpty()
		.withMessage("Secret passcode has to be filled to proceed")
		.custom((value) => {
			if (value !== process.env.SECRET_PASSCODE) {
				throw new Error("Wrong passcode");
			}
			return true;
		}),
];

const checkSecret = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render("passcode", {
			user: req.user,
			errors: errors.array(),
			success: null,
		});
	}

	const userId = req.user.id;

	try {
		await pool.query("UPDATE users SET is_member = true WHERE id = $1", [
			userId,
		]);

		req.user.is_member = true;

		res.redirect("/home");
		console.log("Passcode correct. Redirecting to /home");
	} catch (err) {
		console.error("Error updating membership:", err);
		res.status(500).send("Something went wrong");
	}
};


const isRiddle = (req, res) => {
	
	const myAnswer = req.body.riddle;
	if (!myAnswer) {
		return res.render("riddle", {
			mode: "form",
			message: "Please provide an answer.",
		});
	}

	const reformatAnswer = myAnswer.toLowerCase().trim();

	if (reformatAnswer === process.env.RIDDLE_ANSWER.toLowerCase()) {
		console.log("Correct answer:", reformatAnswer);
		res.render("riddle", {
			mode: "success",
			message: "Correct! The code is: TDETOTHEWORLD",
		});
	} else {
		console.log("Wrong answer");
		// Render error mode
		res.render("riddle", {
			mode: "form",
			message: "That's not correct. Try again!",
		});
	}



};


module.exports = {
	validateSecret,
	checkSecret,
	isUserMember, 
	isRiddle
};
