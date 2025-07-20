const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();
const port = process.env.PORT;


//view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "server", "views"));

//routes
app.get("/", (req, res) => {
	res.render("index");
});

//listen to app on port
app.listen(port, () => {
	console.log(`listening to your app on ${port}`);
});
