const pool = require("../model/pool");
require("dotenv").config(); // Ensure dotenv is loaded here if ADMIN_PASSCODE is used directly
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE; // Make sure this is correctly loaded

// GET /home – display messages
const renderHomePage = async (req, res) => {
	console.log("renderHomePage triggered. req.user:", req.user);
	console.log(
		"Flash messages on home page load - Success:",
		req.flash("success"),
		"Error:",
		req.flash("error")
	);

	try {
		// If user is not a member, redirect to passcode (original logic)
		if (!req.user || !req.user.is_member) {
			console.log(
				"renderHomePage: User not member. Redirecting to /adminpasscode."
			);
			req.flash(
				"error",
				"You need to be a member to access this page. Enter the passcode to become one."
			);
			return res.redirect("/adminpasscode");
		}

		// --- MODIFIED LOGIC HERE ---
		// Now, all members (including admins) will see all messages.
		const queryText = `
            SELECT m.*, u.firstname, u.lastname
            FROM messages m
            JOIN users u ON m.user_id = u.id
            ORDER BY m.created_at DESC
        `;
		const queryParams = []; // No specific user_id filter needed anymore for displaying all messages

		const result = await pool.query(queryText, queryParams);

		res.render("home", {
			user: req.user,
			messages: result.rows,
			success: req.flash("success"),
			error: req.flash("error"),
		});
	} catch (err) {
		console.error("Error loading home page:", err);
		req.flash("error", "Failed to load messages.");
		res.status(500).redirect("/home");
	}
};

// POST /home/create-message – insert a new message
const createMessage = async (req, res) => {
	console.log("createMessage triggered. req.user:", req.user);
	try {
		const { title, message } = req.body;
		if (!req.user) {
			req.flash("error", "You must be logged in to create a message.");
			return res.redirect("/login");
		}
		await pool.query(
			`INSERT INTO messages (title, text, user_id)
             VALUES ($1, $2, $3)`,
			[title, message, req.user.id]
		);
		req.flash("success", "Message created successfully!");
		res.redirect("/home");
	} catch (err) {
		console.error("Error creating message:", err);
		req.flash("error", "Error creating message.");
		res.status(500).redirect("/home/create-message");
	}
};

// GET /home/create-message – show create form
const renderCreateMessageForm = (req, res) => {
	console.log("renderCreateMessageForm triggered. req.user:", req.user);
	if (!req.user) {
		req.flash("error", "You must be logged in to create a message.");
		return res.redirect("/login");
	}
	res.render("create-message", {
		user: req.user,
		mode: "create",
		errors: req.flash("errors") || [],
		error: req.flash("error"),
		success: req.flash("success"),
	});
};

// DELETE /messages/:id - Delete a message (Admin only)
const deleteMessage = async (req, res) => {
	console.log("deleteMessage triggered. req.user:", req.user);
	console.log("Attempting to delete message ID:", req.params.id);
	const messageId = req.params.id;
	try {
		// The ensureAdmin middleware (from home.js router) already checked if req.user.is_admin is true
		const result = await pool.query(
			"DELETE FROM messages WHERE id = $1 RETURNING id",
			[messageId]
		);
		if (result.rowCount === 0) {
			req.flash("error", "Message not found or already deleted.");
		} else {
			req.flash("success", "Message deleted successfully!");
		}
		res.redirect("/home");
	} catch (err) {
		console.error("Error deleting message:", err);
		req.flash("error", "Failed to delete message due to a server error.");
		res.status(500).redirect("/home");
	}
};

// ensureAdmin middleware (now part of homecontroller.js)
const ensureAdmin = (req, res, next) => {
	console.log("ensureAdmin middleware triggered. req.user:", req.user);
	if (req.user && req.user.is_admin) {
		console.log("ensureAdmin: User is admin. Proceeding.");
		return next();
	}

	console.log(
		'ensureAdmin: User is NOT admin. Redirecting to /adminpasscode with "Access Denied" flash.'
	);
	req.flash(
		"error",
		"Access Denied: You need administrator privileges to perform this action. Please enter the admin passcode."
	);
	res.redirect("/adminpasscode");
};

// GET /adminpasscode - Render the passcode entry form
const renderPasscodeForm = (req, res) => {
	console.log("renderPasscodeForm triggered. req.user:", req.user);
	console.log(
		"Flash messages on passcode page load - Success:",
		req.flash("success"),
		"Error:",
		req.flash("error")
	);

	if (!req.user) {
		console.log("renderPasscodeForm: No user. Redirecting to login.");
		req.flash("error", "You must be logged in to access this page.");
		return res.redirect("/login");
	}
	// If user is already an admin, no need to enter passcode
	if (req.user.is_admin) {
		console.log(
			"renderPasscodeForm: User is already admin. Redirecting to /home."
		);
		req.flash("success", "You are already an administrator!");
		return res.redirect("/home");
	}
	console.log("renderPasscodeForm: Rendering passcode page.");
	res.render("passcode", {
		user: req.user,
		error: req.flash("error"),
		success: req.flash("success"),
		errors: req.flash("errors") || [],
	});
};

// POST /adminpasscode - Handle passcode submission
const submitPasscode = async (req, res) => {
	console.log("submitPasscode triggered. req.user:", req.user);
	console.log("Submitted passcode:", req.body.passcode);

	const { passcode } = req.body;
	if (!req.user) {
		console.log("submitPasscode: No user. Redirecting to login.");
		req.flash("error", "You must be logged in to perform this action.");
		return res.redirect("/login");
	}
	if (passcode === ADMIN_PASSCODE) {
		console.log("submitPasscode: Correct passcode.");
		try {
			// 1. Update user's is_admin status in the database
			await pool.query("UPDATE users SET is_admin = TRUE WHERE id = $1", [
				req.user.id,
			]);
			console.log("submitPasscode: User is_admin updated in DB.");

			// 2. IMPORTANT: Re-fetch the user from the database to get the updated is_admin status
			const updatedUserResult = await pool.query(
				"SELECT id, firstname, lastname, email, is_member, is_admin FROM users WHERE id = $1",
				[req.user.id]
			);

			if (updatedUserResult.rows.length > 0) {
				req.user = updatedUserResult.rows[0]; // Update req.user with fresh data
				req.session.user = req.user; // Also update req.session.user if your isAuthenticated uses it
				console.log(
					"submitPasscode: req.user and req.session.user updated with new admin status:",
					req.user.is_admin
				);
			}

			req.flash(
				"success",
				"Congratulations! You are now an administrator."
			);
			res.redirect("/home");
		} catch (err) {
			console.error("Error updating admin status:", err);
			req.flash(
				"error",
				"Failed to update admin status due to a database error."
			);
			res.redirect("/adminpasscode");
		}
	} else {
		console.log("submitPasscode: Incorrect passcode.");
		req.flash("error", "Incorrect passcode. Please try again.");
		res.redirect("/adminpasscode");
	}
};

module.exports = {
	renderHomePage,
	renderCreateMessageForm,
	createMessage,
	deleteMessage,
	renderPasscodeForm,
	submitPasscode,
	ensureAdmin, 
};
