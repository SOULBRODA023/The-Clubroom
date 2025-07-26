const router = require("express").Router();
const { isAuthenticated } = require("../controller/authcontroller");
const {
	renderHomePage,
	renderCreateMessageForm,
	createMessage,
} = require("../controller/homecontroller");

// Show home with user’s messages
router.get("/home", isAuthenticated, renderHomePage);

// Create message form
router.get("/home/create-message", isAuthenticated, renderCreateMessageForm);

// Submit message
router.post("/home/create-message", isAuthenticated, createMessage);

module.exports = router;
