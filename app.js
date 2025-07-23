const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
require("dotenv").config();
const pool = require('./server/model/pool')

// --- Middlewares BEFORE routes ---

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "server", "views"));

// Session middleware FIRST
app.use(
	session({
		secret: "cats",
		resave: false,
		saveUninitialized: false,
	})
);

// Passport middlewares NEXT
app.use(passport.initialize());
app.use(passport.session());

// --- THEN configure passport strategy ---
passport.use(
	new localStrategy(
		{ usernameField: "email" },
		async (email, password, done) => {
			try {
				const { rows } = await pool.query(
					"SELECT * FROM users WHERE email = $1",
					[email]
				);
				const user = rows[0];
				if (!user)
					return done(null, false, { message: "Incorrect email" });
				if (user.password !== password)
					return done(null, false, { message: "Incorrect password" });
				return done(null, user);
			} catch (err) {
				return done(err);
			}
		}
	)
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
	try {
		const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
			id,
		]);
		done(null, rows[0]);
	} catch (err) {
		done(err);
	}
});

// --- Routes LAST ---
const signupRoute = require("./server/routes/Signup");
const loginRoute = require("./server/routes/login");
const indexRoute = require("./server/routes/index");

app.use("/", indexRoute);
app.use("/", signupRoute);
app.use("/", loginRoute);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`);
});
