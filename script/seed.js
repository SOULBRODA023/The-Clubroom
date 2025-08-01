const pool = require("../server/model/pool"); 

async function seed() {
	console.log("starting seeding...");
	try {
		await pool.query(`
			CREATE TABLE IF NOT EXISTS users (
				id SERIAL PRIMARY KEY,
				firstname VARCHAR(255) NOT NULL,
				lastname VARCHAR(255) NOT NULL,
				email VARCHAR(255) UNIQUE NOT NULL,
				password TEXT NOT NULL,
				is_member BOOLEAN DEFAULT FALSE,
				is_admin BOOLEAN DEFAULT FALSE
			);
		`);

		await pool.query(`
			CREATE TABLE IF NOT EXISTS messages (
				id SERIAL PRIMARY KEY,
				title VARCHAR(255) NOT NULL,
				text TEXT NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				user_id INTEGER,
				CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id)
			);
		`);

		await pool.query(`
			CREATE TABLE IF NOT EXISTS user_sessions (
				sid VARCHAR NOT NULL PRIMARY KEY,
				sess JSON NOT NULL,
				expire TIMESTAMP NOT NULL
			);
		`);

		await pool.query(`
			CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "user_sessions" ("expire");
		`);

		console.log("Tables created successfully");
	} catch (err) {
		console.error("seed error:", err);
	}
}

module.exports = seed;
