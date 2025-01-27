import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Import routes
import usersRouter from "./routes/users.js";
import rolesRouter from "./routes/roles.js"; // Import the roles router

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*", // Restrict based on environment
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/users", usersRouter);  // Users routes
app.use("/api/roles", rolesRouter);  // Roles routes

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
