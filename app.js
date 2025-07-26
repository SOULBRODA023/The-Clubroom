const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
require("dotenv").config();
const pool = require('./server/model/pool');
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const pgSession = require("connect-pg-simple")(session);

// --- Middlewares BEFORE routes ---
app.use(flash());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "server", "views"));




app.use(
	session({
		store: new pgSession({
			pool: pool, 
			tableName: "user_sessions", 
		}),
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24, // 1 day
		},
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

				if (!user) {
					return done(null, false, { message: "Incorrect email" });
				}

			
				const match = await bcrypt.compare(password, user.password);
				if (!match) {
					return done(null, false, { message: "Incorrect password" });
				}

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
const passcodeRoute = require("./server/routes/passcode");
const homeRoute = require("./server/routes/home")


app.use("/", indexRoute);
app.use("/", signupRoute);
app.use("/", loginRoute);
app.use("/", passcodeRoute);
app.use("/", homeRoute);


// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Listening on http://localhost:${port}`);
});
