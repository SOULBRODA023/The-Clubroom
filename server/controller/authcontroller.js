const { body } = require("express-validator");
const { fillDatabase, checkExistingUser } = require("../model/db");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

//verify that email doesn't exist in database and let user signup
const verifyDataNotExist = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render("auth", {
			mode: "signup",
			errors: errors.array(),
			oldInput: req.body,
			success: null,
		});
	}

	const { lastname, firstname, email, password } = req.body;
	try {
		const hashedPassword = await bcrypt.hash(password, 12);
		await fillDatabase(lastname, firstname, email, hashedPassword);
		req.flash("success", "Signup successful. Please kindly login.");
		res.redirect("/login");
	} catch (error) {
		console.error("Database error:", error);
		res.status(500).send("Something went wrong");
	}
};

//validation
const validateSignup = [
	body("lastname")
		.notEmpty()
		.withMessage("Last name is required")
		.trim()
		.isLength({ min: 2 })
		.withMessage("Last name must be at least 2 characters"),
	body("firstname")
		.notEmpty()
		.withMessage("First name is required")
		.trim()
		.isLength({ min: 2 })
		.withMessage("First name must be at least 2 characters"),
	body("email")
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Please enter a valid email")
		.normalizeEmail()
		.custom(async (value) => {
			const user = await checkExistingUser(value);
			if (user) {
				throw new Error("Email is already in use");
			}
			return true;
		}),
	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/\d/)
		.withMessage("Password must contain at least one number")
		.matches(/[!@#$%^&*]/)
		.withMessage("Password must contain at least one special character"),
	body("confirm")
		.notEmpty()
		.withMessage("Confirm password is required")
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("Passwords do not match");
			}
			return true;
		}),
];

const validateLogin = [
	body("email")
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Enter a valid email"),

	body("password").notEmpty().withMessage("Password is required"),
];

function isAuthenticated(req, res, next) {
	if (req.isAuthenticated && req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login"); 
}

function redirectIfMember(req, res, next) {
	console.log("Checking membership for user:", req.user);
	if (req.user && req.user.is_member === true) {
		console.log("User is a member. Redirecting...");
		return res.redirect("/home");
	}
	console.log("User not a member. Proceeding to passcode...");
	next();
}


module.exports = {
	verifyDataNotExist,
	validateSignup,
	validateLogin,
	isAuthenticated,
	redirectIfMember,
};
