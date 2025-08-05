// File: src/backend/middlewares/checkTier.js
import { query } from '../db.js'; // Import your database query function

/**
 * Middleware to check if the authenticated user's organization subscription tier is allowed.
 * @param {Array<string>} tiersAllowed - An array of allowed stripe_status values (e.g., ['active', 'trialing', 'free_active']).
 */
const checkTier = (tiersAllowed = []) => async (req, res, next) => {
  // Ensure tiersAllowed is an array and not empty
  if (!Array.isArray(tiersAllowed) || tiersAllowed.length === 0) {
    console.error("checkTier middleware used without specifying allowed tiers.");
    return res.status(500).json({ message: "Server configuration error: Allowed tiers not specified." });
  }

  // The user's organization_id is attached to req.user by the 'authenticate' middleware
  const { organization_id } = req.user;

  if (!organization_id) {
    // This can happen if a user is not yet part of an organization.
    // We can treat them as 'unsubscribed' for tier checking purposes.
    const currentStatus = 'unsubscribed';
    if (tiersAllowed.includes(currentStatus)) {
        return next();
    }
    return res.status(403).json({
        message: `Access forbidden: You must belong to an organization with an active subscription.`,
        required_tiers: tiersAllowed
    });
  }

  try {
    // CORRECTED QUERY:
    // Fetch the latest payment record for the user's ORGANIZATION to get the current subscription status.
    const result = await query(
      `SELECT stripe_status FROM payments WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [organization_id]
    );

    // Determine the organization's current subscription status
    const currentStatus = result.rows.length > 0 ? result.rows[0].stripe_status : 'unsubscribed'; // Default to 'unsubscribed' if no record found

    // Check if the organization's current status is in the list of allowed tiers
    if (tiersAllowed.includes(currentStatus)) {
      next(); // User's organization has an allowed tier, proceed to the next middleware/route handler
    } else {
      // User's organization tier is not allowed for this feature
      return res.status(403).json({
        message: `Access forbidden: Your organization's current tier (${currentStatus}) is not allowed for this feature.`,
        required_tiers: tiersAllowed
      });
    }
  } catch (error) {
    console.error("Error in checkTier middleware:", error);
    return res.status(500).json({ message: "Internal server error during tier check." });
  }
};

export default checkTier;
