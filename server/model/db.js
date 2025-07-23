const pool = require("../model/pool");

async function fillDatabase(lastname, firstname, email, password) {
	const myQuery = `INSERT INTO users (lastname, firstname, email, password) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, email, firstname, lastname;`;
	const values = [lastname, firstname, email, password];
	await pool.query(myQuery, values);
}
async function checkExistingUser(email) {
	const existingUser = await pool.query(
		"SELECT id FROM users WHERE email = $1",
		[email]
	);
	if (existingUser.rows.length > 0) {
		throw new Error("User with this email already exists");
	}
	console.log("User created successfully:", existingUser.rows[0]);
	return existingUser.rows[0];
}
module.exports = { fillDatabase, checkExistingUser };
