import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg; 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Neon
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

export const query = (text, params) => pool.query(text, params);
