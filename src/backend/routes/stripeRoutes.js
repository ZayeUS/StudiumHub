// src/backend/routes/stripeRoutes.js
import express from 'express';
import Stripe from 'stripe';
import { retrieveCheckoutSession } from '../utils/stripe.js';
import { query } from '../db.js';
import authenticate from '../middlewares/authenticate.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// 1) Complete a Stripe checkout and record payment under the organization
router.post('/complete-payment', authenticate, async (req, res) => {
  const { sessionId } = req.body;
  const { organization_id } = req.user;

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required.' });
  }

  try {
    const session = await retrieveCheckoutSession(sessionId);
    if (!session) {
      return res.status(400).json({ message: 'Invalid session' });
    }

    const priceId = session.line_items?.data[0]?.price?.id;
    if (!priceId) {
      return res.status(400).json({ message: 'Could not determine plan from session.' });
    }

    // Find plan by Stripe price ID
    const planRes = await query(
      'SELECT plan_id, name FROM plans WHERE stripe_price_id = $1',
      [priceId]
    );
    if (planRes.rows.length === 0) {
      return res.status(404).json({ message: `Plan with price ID ${priceId} not found.` });
    }
    const plan = planRes.rows[0];

    const subscription = session.subscription;
    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer.id;

    // Insert a payment record under the organization
    await query(
      `
      INSERT INTO payments
        (organization_id, plan_id, stripe_customer_id, stripe_subscription_id, stripe_status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (stripe_subscription_id) DO NOTHING;
      `,
      [
        organization_id,
        plan.plan_id,
        customerId,
        subscription.id,
        subscription.status || 'active',
      ]
    );

    res.status(200).json({
      message: 'Payment completed successfully.',
      plan: plan.name,
      status: subscription.status,
    });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ message: 'Error completing payment.' });
  }
});

// 2) Select free tier for organization
router.post('/select-free-tier', authenticate, async (req, res) => {
  const { organization_id } = req.user;

  try {
    const planRes = await query("SELECT plan_id FROM plans WHERE name = 'Free'");
    if (planRes.rows.length === 0) {
      return res.status(500).json({ message: "Free plan not configured." });
    }
    const freePlanId = planRes.rows[0].plan_id;

    // Check for existing active subscription on this org
    const existingRes = await query(
      `
      SELECT p.stripe_status
        FROM payments p
       WHERE p.organization_id = $1
         AND p.stripe_status IN ('active','trialing','free_active')
       ORDER BY p.created_at DESC
       LIMIT 1
      `,
      [organization_id]
    );
    if (existingRes.rows.length > 0) {
      const { stripe_status } = existingRes.rows[0];
      return res.status(400).json({
        message: `Your organization already has an active plan (${stripe_status}).`
      });
    }

    // Insert free tier record
    await query(
      `
      INSERT INTO payments
        (organization_id, plan_id, stripe_subscription_id, stripe_status)
      VALUES ($1, $2, $3, $4)
      `,
      [organization_id, freePlanId, `free_sub_${organization_id}`, 'free_active']
    );

    res.status(201).json({
      message: 'Free tier selected successfully.',
      status: 'free_active',
      plan: 'Free'
    });
  } catch (err) {
    console.error('Error selecting free tier:', err);
    if (err.code === '23505') {
      return res.status(200).json({ message: 'Free tier already recorded.' });
    }
    res.status(500).json({ message: 'Failed to select free tier.' });
  }
});

// 3) Get current payment status for organization
router.get('/payment-status', authenticate, async (req, res) => {
  const { organization_id } = req.user;

  try {
    const statusRes = await query(
      `
      SELECT p.stripe_status, pl.name AS plan_name
        FROM payments p
        JOIN plans pl ON p.plan_id = pl.plan_id
       WHERE p.organization_id = $1
       ORDER BY p.created_at DESC
       LIMIT 1
      `,
      [organization_id]
    );

    if (statusRes.rows.length > 0) {
      return res.status(200).json({
        status: statusRes.rows[0].stripe_status,
        plan: statusRes.rows[0].plan_name,
      });
    } else {
      return res.status(200).json({ status: 'unsubscribed', plan: null });
    }
  } catch (err) {
    console.error('Error fetching payment status:', err);
    res.status(500).json({ message: 'Error fetching payment status.' });
  }
});

export default router;
