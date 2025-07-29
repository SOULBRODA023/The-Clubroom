const { body, validationResult } = require("express-validator");
const pool = require("../model/pool");
const bcrypt = require("bcryptjs");

const getLogin = (req, res) => {
	const errorMessages = req.flash("error");
	const errors = errorMessages.map((msg) => ({ msg }));
	const successMessages = req.flash("success").map((msg) => ({ msg }));
	res.render("login", { errors, successMessages });
};

const postLogin = [
	body("email")
		.trim()
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Invalid email")
		.escape(),
	body("password")
		.trim()
		.notEmpty()
		.withMessage("Password is required")
		.escape(),

	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const extractedErrors = errors.array();
			return res.render("login", {
				errors: extractedErrors,
				successMessages: [],
			});
		}
		next();
	},
];

const getRegister = (req, res) => {
	res.render("register", { errors: [], successMessages: [] });
};

const postRegister = [
	body("username")
		.notEmpty()
		.withMessage("Username is required")
		.trim()
		.escape(),
	body("email")
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Invalid email")
		.trim()
		.escape(),
	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 5 })
		.withMessage("Password too short")
		.trim()
		.escape(),

	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.render("register", {
				errors: errors.array(),
				successMessages: [],
			});
		}

		const { username, email, password } = req.body;
		try {
			const existingUser = await pool.query(
				"SELECT * FROM users WHERE email = $1",
				[email]
			);
			if (existingUser.rows.length > 0) {
				return res.render("register", {
					errors: [{ msg: "Email already in use" }],
					successMessages: [],
				});
			}

			const hashedPassword = await bcrypt.hash(password, 10);
			await pool.query(
				"INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
				[username, email, hashedPassword]
			);

			req.flash(
				"success",
				"Account created successfully! Please log in."
			);
			res.redirect("/login");
		} catch (err) {
			console.error(err);
			res.render("register", {
				errors: [{ msg: "Something went wrong" }],
				successMessages: [],
			});
		}
	},
];

const logoutUser = (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		req.flash("success", "Logged out successfully");
		res.redirect("/login");
	});
};

const isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
};

module.exports = {
	getLogin,
	postLogin,
	getRegister,
	postRegister,
	logoutUser,
	isAuthenticated,
};
