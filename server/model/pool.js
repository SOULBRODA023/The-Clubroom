const pool = new Pool({
	connectionString: process.env.DATABASE_URL, // Render provides this environment variable
	ssl: {
		rejectUnauthorized: false, // Required for Render's managed PostgreSQL
	},
});
