// File: src/backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './routes/users.js';
import rolesRouter from './routes/roles.js';
import profileRouter from './routes/profiles.js';
import auditRouter from './routes/auditRoutes.js';
import testEmailRoutes from './routes/testEmail.js';
import stripeRouter from './routes/stripeRoutes.js'; 
import analyticsRouter from './routes/analytics.js'; // NEW IMPORT for your hypothetical feature

dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*", 
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/users", usersRouter); 
app.use("/api/roles", rolesRouter); 
app.use("/api/profile", profileRouter);
app.use("/api/audit", auditRouter); 
app.use('/api/email', testEmailRoutes); 
app.use("/api/stripe", stripeRouter);  
app.use("/api/analytics", analyticsRouter); // NEW: Register your new feature route

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});