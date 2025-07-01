import { query } from '../db.js';

/**
 * Middleware to check if the authenticated user has one of the allowed roles
 * within their organization.
 * @param {Array<string>} allowedRoles - An array of allowed role strings (e.g., ['admin']).
 */
const checkRole = (allowedRoles = []) => async (req, res, next) => {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    console.error("checkRole middleware called without specifying allowed roles.");
    return res.status(500).json({ message: "Server configuration error." });
  }

  const { user_id } = req.user;

  if (!user_id) {
    // This should not happen if the 'authenticate' middleware runs first.
    return res.status(401).json({ message: "Authentication details not found." });
  }

  try {
    const memberResult = await query(
      `SELECT om.role, u.organization_id FROM organization_members om
       JOIN users u ON om.user_id = u.user_id
       WHERE om.user_id = $1`,
      [user_id]
    );

    if (memberResult.rows.length === 0) {
      return res.status(403).json({ message: "You are not a member of any organization." });
    }

    const userRole = memberResult.rows[0].role;
    req.user.organization_id = memberResult.rows[0].organization_id; // Attach org_id to request

    if (allowedRoles.includes(userRole)) {
      next(); // User has the required role, proceed.
    } else {
      res.status(403).json({ message: `Forbidden: Your role (${userRole}) is not authorized for this action.` });
    }
  } catch (error) {
    console.error("Error in checkRole middleware:", error);
    res.status(500).json({ message: "Internal server error during role check." });
  }
};

export default checkRole;