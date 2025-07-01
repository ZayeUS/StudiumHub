// File: src/backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './routes/users.js';
import profileRouter from './routes/profiles.js';
import auditRouter from './routes/auditRoutes.js';
import testEmailRoutes from './routes/testEmail.js';
import stripeRouter from './routes/stripeRoutes.js';
import plansRouter from './routes/plans.js';
import organizationsRouter from './routes/organizations.js';
import invitationsRouter from './routes/invitations.js';

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
app.use("/api/profile", profileRouter);
app.use("/api/audit", auditRouter);
app.use('/api/email', testEmailRoutes);
app.use("/api/stripe", stripeRouter);
app.use("/api/plans", plansRouter);
app.use("/api/organizations", organizationsRouter);
app.use("/api/invitations", invitationsRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});