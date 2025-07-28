const { Pool } = require("pg");



const pool = new Pool({
	connectionString: process.env.DATABASE_URL, // Render provides this environment variable
	ssl: {
		rejectUnauthorized: false, 
	},
});
