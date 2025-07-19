const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();
const port = process.env.PORT;

//view engine
app.set("view engine", "views");
app.set("views", path.join(__dirname, "views"));

//routes
app.get("/", (req, res) => {
	res.send("We are on our homepage");
});

//listen to app on port
app.listen(port, () => {
	console.log(`listening to your app on ${port}`);
});
