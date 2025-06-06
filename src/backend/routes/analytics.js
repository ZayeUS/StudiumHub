// File: src/backend/routes/analytics.js
import express from 'express';
import authenticate from '../middlewares/authenticate.js'; // Your existing authentication middleware
import checkTier from '../middlewares/checkTier.js';     // Your new tier check middleware
import { query } from '../db.js'; // Your database query function (if needed for route logic)

const router = express.Router();

// Route for a feature accessible only by 'active' or 'trialing' paid users
router.get('/pro-analytics-data', authenticate, checkTier(['active', 'trialing']), async (req, res) => {
  // If the code reaches here, the user is authenticated AND has an 'active' or 'trialing' subscription
  const { user_id, email, role_id } = req.user; 
  console.log(`User ${email} (${user_id}) with role ${role_id} accessing pro analytics.`);

  // Implement your logic to fetch and return pro analytics data
  // Example:
  try {
    // You would query your database for specific analytics related to this user's pro plan
    const analyticsResult = await query('SELECT * FROM pro_analytics_table WHERE user_id = $1 LIMIT 10', [user_id]);
    res.status(200).json({ 
      message: "Pro analytics data retrieved successfully!",
      data: analyticsResult.rows 
    });
  } catch (error) {
    console.error("Error fetching pro analytics data:", error);
    res.status(500).json({ message: "Failed to retrieve pro analytics data." });
  }
});

// Route for a feature accessible by ALL users with a recognized tier (free_active, active, trialing)
router.get('/basic-dashboard-widgets', authenticate, checkTier(['free_active', 'active', 'trialing']), async (req, res) => {
  // If the code reaches here, the user is authenticated AND has a free, active, or trialing subscription
  const { user_id, email } = req.user;
  console.log(`User ${email} (${user_id}) accessing basic dashboard widgets.`);

  // Implement your logic to fetch and return basic dashboard widget data
  res.status(200).json({ 
    message: "Basic dashboard widgets data retrieved successfully!",
    data: [{ widget1: "Basic Stats" }, { widget2: "Free Tools" }] 
  });
});


// Example: A route accessible only by 'admin' role, regardless of subscription tier
// Note: You would combine this with your existing role-based checks if you have them.
// For simplicity, this assumes a separate check is done for roles.
// Your authenticate middleware already provides role_id.
router.get('/admin-settings', authenticate, async (req, res) => {
  const { user_id, role_id } = req.user;
  if (role_id === 1) { // Assuming role_id 1 is admin
    res.status(200).json({ message: "Admin settings data.", settings: { userManagement: true, billingConfig: true } });
  } else {
    res.status(403).json({ message: "Access forbidden: Admin privilege required." });
  }
});

export default router;