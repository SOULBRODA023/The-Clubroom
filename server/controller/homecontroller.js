const pool = require("../model/pool");

// GET /home – display messages of logged-in user
const renderHomePage = async (req, res) => {
	try {
		if (!req.user.is_member) {
			return res.redirect("/passcode");
		}

		const result = await pool.query(
			`SELECT id, title, text, created_at 
			 FROM messages 
			 WHERE user_id = $1 
			 ORDER BY created_at DESC`,
			[req.user.id]
		);

		res.render("home", {
			user: req.user,
            messages: result.rows,
            
		});
	} catch (err) {
		console.error("Error loading home page:", err);
		res.status(500).send("Server error");
	}
};

// POST /home/create-message – insert a new message
const createMessage = async (req, res) => {
	try {
		const { title, message } = req.body;

		if (!req.user) {
			return res.redirect("/login");
		}

		await pool.query(
			`INSERT INTO messages (title, text, user_id)
			 VALUES ($1, $2, $3)`,
			[title, message, req.user.id]
		);

		res.redirect("/home?success=Message created successfully");
	} catch (err) {
		console.error("Error creating message:", err);
		res.status(500).send("Error creating message");
	}
};

// GET /home/create-message – show create form
const renderCreateMessageForm = (req, res) => {
	if (!req.user) {
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

module.exports = {
	renderHomePage,
	renderCreateMessageForm,
	createMessage,
};
