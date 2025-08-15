// src/backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './routes/users.js';
import profileRouter from './routes/profiles.js';
import organizationsRouter from './routes/organizations.js';
import invitationsRouter from './routes/invitations.js';
import membersRouter from './routes/members.js';
import plansRouter from './routes/plans.js';
import stripeRouter from './routes/stripeRoutes.js';
import uploadsRouter from './routes/uploads.js';
import dashboardRouter from './routes/dashboard.js';     // <-- IMPORT
import materialsRouter from './routes/materials.js';     // <-- IMPORT
import auditRouter from './routes/auditRoutes.js';
import testEmailRoutes from './routes/testEmail.js';
import coursesRouter from './routes/courses.js'; // <-- IMPORT
import modulesRouter from './routes/modules.js'; // <-- IMPORT
import decksRouter from './routes/decks.js';       // <-- IMPORT
import quizzesRouter from './routes/quizzes.js'
import questionsRouter from './routes/questions.js'; // <-- IMPORT




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
app.use("/api/organizations", organizationsRouter);
app.use("/api/invitations", invitationsRouter);
app.use("/api/members", membersRouter);
app.use("/api/plans", plansRouter);
app.use("/api/stripe", stripeRouter);
app.use("/api/uploads", uploadsRouter);
app.use('/api/dashboard', dashboardRouter); // <-- USE
app.use('/api/materials', materialsRouter); // <-- USE
app.use("/api/audit", auditRouter);
app.use('/api/email', testEmailRoutes);
app.use('/api/courses', coursesRouter); // <-- USE
app.use('/api/modules', modulesRouter); // <-- USE
app.use('/api/decks', decksRouter);       // <-- USE
app.use('/api/quizzes', quizzesRouter); 
app.use('/api/questions', questionsRouter); // <-- USE





const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});