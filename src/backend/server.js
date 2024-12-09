// server.js

// ------------------------
// Imports
// ------------------------
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import admin from 'firebase-admin';


// ------------------------
// Initialize Environment Variables
// ------------------------
dotenv.config();

// ------------------------
// Initialize Firebase Admin
// ------------------------
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ------------------------
// Initialize Database Connection
// ------------------------
const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Neon
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

const query = (text, params) => pool.query(text, params);

// ------------------------
// Initialize Express App
// ------------------------
const app = express();

// ------------------------
// Middleware
// ------------------------
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*', // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// ------------------------
// Authentication Middleware
// ------------------------
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const firebase_uid = decodedToken.uid;

      // Fetch user_id from your database using firebase_uid
      const result = await query(
        'SELECT user_id FROM users WHERE firebase_uid = $1',
        [firebase_uid]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Unauthorized: User not found' });
      }

      req.user = {
        user_id: result.rows[0].user_id,
        firebase_uid,
      };

      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
};

// ------------------------
// Routes for Roles
// ------------------------
app.post('/api/roles', authenticate, async (req, res) => {
  const { role_name } = req.body;

  if (!role_name) {
    return res.status(400).json({ message: 'Role name is required.' });
  }

  const queryText = 'INSERT INTO roles (role_name) VALUES ($1) RETURNING *';
  const values = [role_name];

  try {
    const result = await query(queryText, values);
    res.status(201).json({ message: 'Role created successfully', role: result.rows[0] });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Error creating role' });
  }
});

app.get('/api/roles', async (req, res) => {
  const queryText = 'SELECT * FROM roles';

  try {
    const result = await query(queryText);
    res.status(200).json(result.rows); // Send roles as response
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Error fetching roles' });
  }
});

app.get('/api/roles/:role_id', authenticate, async (req, res) => {
  const { role_id } = req.params;
  const queryText = 'SELECT * FROM roles WHERE role_id = $1';
  const values = [role_id];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ message: 'Error fetching role' });
  }
});

app.put('/api/roles/:role_id', authenticate, async (req, res) => {
  const { role_id } = req.params;
  const { role_name } = req.body;

  if (!role_name) {
    return res.status(400).json({ message: 'Role name is required' });
  }

  const queryText = 'UPDATE roles SET role_name = $1 WHERE role_id = $2 RETURNING *';
  const values = [role_name, role_id];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json({ message: 'Role updated', role: result.rows[0] });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Error updating role' });
  }
});

app.delete('/api/roles/:role_id', authenticate, async (req, res) => {
  const { role_id } = req.params;
  const queryText = 'DELETE FROM roles WHERE role_id = $1 RETURNING *';
  const values = [role_id];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Error deleting role' });
  }
});

// ------------------------
// Routes for Users
// ------------------------
// server.js

app.post('/api/signup', async (req, res) => {
  const { firebase_uid, email, role_id } = req.body;

  if (!firebase_uid || !email || !role_id) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Save user in the database and return user data along with role_name using a JOIN
    const insertUserQuery = `
      INSERT INTO users (firebase_uid, email, role_id)
      VALUES ($1, $2, $3)
      RETURNING user_id, email, role_id
    `;
    const userResult = await query(insertUserQuery, [firebase_uid, email, role_id]);
    const user = userResult.rows[0];

    // Fetch user and role_name using a JOIN query
    const userWithRoleQuery = `
      SELECT 
        users.user_id, 
        users.email, 
        roles.role_name,
        roles.role_id
      FROM users
      INNER JOIN roles ON users.role_id = roles.role_id
      WHERE users.user_id = $1
    `;
    const fullUserResult = await query(userWithRoleQuery, [user.user_id]);

    if (fullUserResult.rows.length === 0) {
      return res.status(500).json({ message: 'Error fetching user data after creation.' });
    }

    const fullUser = fullUserResult.rows[0];

    // Respond with user data and role_name
    res.status(201).json({
      message: 'User created successfully',
      user: {
        user_id: fullUser.user_id,
        email: fullUser.email,
        role_name: fullUser.role_name,
        role_id: fullUser.role_id,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user.' });
  }
});

  
  

app.get('/api/users', authenticate, async (req, res) => {
  const queryText = 'SELECT * FROM users';

  try {
    const result = await query(queryText);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.get('/api/users/:firebase_uid', authenticate, async (req, res) => {
  const { firebase_uid } = req.params;
  const queryText = `
    SELECT users.user_id, users.email, roles.role_name, roles.role_id
    FROM users
    JOIN roles ON users.role_id = roles.role_id
    WHERE users.firebase_uid = $1
  `;
  const values = [firebase_uid];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(result.rows[0]); // Now includes role_id
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

  

app.put('/api/users/:firebase_uid', authenticate, async (req, res) => {
  const { firebase_uid } = req.params;
  const { role_id } = req.body;

  if (!role_id) {
    return res.status(400).json({ message: 'Role ID is required' });
  }

  const queryText = 'UPDATE users SET role_id = $1 WHERE firebase_uid = $2 RETURNING *';
  const values = [role_id, firebase_uid];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User role updated', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

app.delete('/api/users/:firebase_uid', authenticate, async (req, res) => {
  const { firebase_uid } = req.params;
  const queryText = 'DELETE FROM users WHERE firebase_uid = $1 RETURNING *';
  const values = [firebase_uid];

  try {
    const result = await query(queryText, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// ------------------------
// Server Setup
// ------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
