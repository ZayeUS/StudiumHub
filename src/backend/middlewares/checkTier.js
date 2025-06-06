// File: src/backend/middlewares/checkTier.js
import { query } from '../db.js'; // Import your database query function

/**
 * Middleware to check if the authenticated user's subscription tier is allowed.
 * @param {Array<string>} tiersAllowed - An array of allowed stripe_status values (e.g., ['active', 'trialing', 'free_active']).
 */
const checkTier = (tiersAllowed = []) => async (req, res, next) => {
  // Ensure tiersAllowed is an array
  if (!Array.isArray(tiersAllowed) || tiersAllowed.length === 0) {
    console.error("checkTier middleware used without specifying allowed tiers.");
    return res.status(500).json({ message: "Server configuration error: Allowed tiers not specified." });
  }

  const { user_id } = req.user; // Get user_id from the authenticate middleware (req.user)

  if (!user_id) {
    // This should ideally not happen if 'authenticate' middleware runs before 'checkTier'
    console.error("checkTier middleware: user_id not found in req.user. Ensure 'authenticate' middleware runs first.");
    return res.status(401).json({ message: "Authentication required for tier check." });
  }

  try {
    // Fetch the latest payment record for the user to get their current status
    const result = await query(
      `SELECT stripe_status FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [user_id]
    );

    // Determine the user's current subscription status
    const currentStatus = result.rows.length > 0 ? result.rows[0].stripe_status : 'unsubscribed'; // Default to 'unsubscribed' if no record found

    // Check if the user's current status is in the list of allowed tiers
    if (tiersAllowed.includes(currentStatus)) {
      next(); // User has an allowed tier, proceed to the next middleware/route handler
    } else {
      // User's tier is not allowed for this feature
      return res.status(403).json({ 
        message: `Access forbidden: Your current tier (${currentStatus}) is not allowed for this feature.`,
        required_tiers: tiersAllowed
      });
    }
  } catch (error) {
    console.error("Error in checkTier middleware:", error);
    return res.status(500).json({ message: "Internal server error during tier check." });
  }
};

export default checkTier;