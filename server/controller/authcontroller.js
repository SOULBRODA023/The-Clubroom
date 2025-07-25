const { body } = require("express-validator");
const { fillDatabase, checkExistingUser } = require("../model/db"); // Assuming these exist
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

//verify that email doesn't exist in database and let user signup
const verifyDataNotExist = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render("auth", {
			mode: "signup", // 👈 MAKE SURE THIS IS PRESENT
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

const checkSecret = (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render("passcode", {
			user: req.user,
			errors: errors.array(),
			success: "Access granted! Welcome to the Clubhouse. 🎉",
		});
	}

	console.log("Passcode correct. Redirecting to /home");

	// Optional: set full access flag
	req.session.fullAccess = true;

	res.redirect("/home");
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

module.exports = {
	verifyDataNotExist,
	validateSignup,
	validateLogin,
	validateSecret,
	checkSecret,
};
