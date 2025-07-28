const router = require("express").Router();
const { isAuthenticated } = require("../controller/authcontroller");

const {
	renderHomePage,
	renderCreateMessageForm,
	createMessage,
	deleteMessage,
	renderPasscodeForm,
	submitPasscode,
	ensureAdmin,
} = require("../controller/homecontroller");

// Show home with user’s messages
router.get("/home", isAuthenticated, renderHomePage);

// Create message form
router.get("/home/create-message", isAuthenticated, renderCreateMessageForm);

// Submit message
router.post("/home/create-message", isAuthenticated, createMessage);

// DELETE message route (Admin only)

router.post("/messages/:id", isAuthenticated, ensureAdmin, deleteMessage);

// Passcode routes - DO NOT apply ensureAdmin here
// These routes are for users to *become* admin, so they shouldn't be protected by ensureAdmin
router.get("/adminpasscode", isAuthenticated, renderPasscodeForm);
router.post("/adminpasscode", isAuthenticated, submitPasscode);

module.exports = router;
