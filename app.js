		const express = require("express");
		const app = express();
		const path = require("path");
		const session = require("express-session");
		const passport = require("passport");
		const localStrategy = require("passport-local").Strategy;

		const pool = require("./server/model/pool");
		const flash = require("connect-flash");
		const bcrypt = require("bcryptjs");
		const pgSession = require("connect-pg-simple")(session);

		const seed = require("./script/seed");

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
				secret: process.env.SESSION_SECRET, // IMPORTANT: Set this as an environment variable on Render!
				resave: false,
				saveUninitialized: false,
				cookie: {
					maxAge: 1000 * 60 * 60 * 24, // 1 day
					secure: process.env.NODE_ENV === "production", // Use secure cookies in production
					httpOnly: true,
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
						const result = await pool.query(
							"SELECT * FROM users WHERE email = $1",
							[email]
						);
						if (result.rows.length === 0) {
							console.log("User not found");
							return done(null, false, { message: "Incorrect email" });
						}

						const user = result.rows[0];
						const match = await bcrypt.compare(password, user.password);
						if (!match) {
							console.log("Incorrect password");
							return done(null, false, { message: "Incorrect password" });
						}

						console.log("User authenticated successfully");
						return done(null, user);
					} catch (err) {
						console.error(err);
						return done(err);
					}
				}
			)
		);

		passport.serializeUser((user, done) => done(null, user.id));
		passport.deserializeUser(async (id, done) => {
			try {
				const result = await pool.query("SELECT * FROM users WHERE id = $1", [
					id,
				]);
				done(null, result.rows[0]);
			} catch (err) {
				done(err);
			}
		});

		// --- Routes LAST ---
		const signupRoute = require("./server/routes/signup");
		const loginRoute = require("./server/routes/login");
		const indexRoute = require("./server/routes/index");
		const passcodeRoute = require("./server/routes/passcode");
		const homeRoute = require("./server/routes/home");

		app.use("/", indexRoute);
		app.use("/", signupRoute);
		app.use("/", loginRoute);
		app.use("/", passcodeRoute);
		app.use("/", homeRoute);

		// Start server function
		const port = process.env.PORT || 3000;

		async function startServer() {
			await seed();

			try {
				const client = await pool.connect();
				const result = await client.query("SELECT NOW()");
				client.release();
				console.log("Database connected successfully at:", result.rows[0].now);
			} catch (err) {
				console.error("Failed to connect to database on startup:", err.stack);
			}
			app.listen(port, () => {
				console.log(`Listening on http://localhost:${port}`);
			});				
		}
		startServer();
						