const pool = require("../model/pool");
async function fillDatabase(lastname, firstname, email, password) {
	const myQuery = `INSERT INTO users (lastname, firstname, email, password) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, email, firstname, lastname;`;
	const values = [lastname, firstname, email, password];
	const result = await pool.query(myQuery, values);
	const newUser = result.rows[0];
	console.log("User created successfully:", newUser); 
	return newUser;
}

async function checkExistingUser(email) {
	const existingUser = await pool.query(
		"SELECT id FROM users WHERE email = $1",
		[email]
	);
	if (existingUser.rows.length > 0) {
		throw new Error("User with this email already exists");
	}

	return null;
}


module.exports = { fillDatabase, checkExistingUser };
