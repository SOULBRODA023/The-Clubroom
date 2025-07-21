const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();

const signupRoute = require("./server/routes/signup");
const loginRoute = require("./server/routes/login");
const indexRoute = require("./server/routes/index");

const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "server", "views"));

// Use route files
app.use("/", indexRoute); // your homepage
app.use("/", signupRoute); // handles GET /signup
app.use("/", loginRoute); // handles GET /login

// Start server
app.listen(port, () => {
	console.log(`Listening to your app on http://localhost:${port}`);
});
