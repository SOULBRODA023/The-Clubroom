const express = require("express");
const router = express.Router();
const

router.get("/signup", (req, res) => {
	res.render("auth", { mode: "signup" });
});
router.post("/signup", (req, res) => {
    const { lastname, firstname, email, password, confirm } = req.body;
})

module.exports = router;
