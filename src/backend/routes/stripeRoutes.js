// File: src/backend/routes/stripeRoutes.js
import express from 'express';
import Stripe from 'stripe'; 
import { retrieveCheckoutSession } from '../utils/stripe.js'; 
import { query } from '../db.js'; 
import authenticate from '../middlewares/authenticate.js';
import { sendEmail } from '../utils/email.js';
import { baseTemplate } from '../templates/baseTemplate.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// This endpoint is triggered after a user successfully pays via a Stripe Checkout session.
router.post('/complete-payment', authenticate, async (req, res) => {
    const { sessionId } = req.body;
    const { user_id, email } = req.user; // Get user from authenticate middleware

    if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required.' });
    }

    try {
        const session = await retrieveCheckoutSession(sessionId);
        if (!session) {
            return res.status(400).json({ message: 'Invalid session' });
        }

        const subscription = session.subscription;
        const customerId = session.customer;
        
        // --- MODIFICATION START ---
        // Get the price ID from the first line item in the checkout session.
        const priceId = session.line_items?.data[0]?.price?.id;
        if (!priceId) {
            return res.status(400).json({ message: 'Could not determine plan from session.' });
        }
        
        // Look up the plan in your new `plans` table using the Stripe Price ID.
        const planResult = await query('SELECT plan_id, name FROM plans WHERE stripe_price_id = $1', [priceId]);
        if (planResult.rows.length === 0) {
            return res.status(404).json({ message: `Plan with price ID ${priceId} not found in database.` });
        }
        const plan = planResult.rows[0];
        // --- MODIFICATION END ---

        const insertQuery = `
          INSERT INTO payments (user_id, plan_id, stripe_customer_id, stripe_subscription_id, stripe_status)
          VALUES ($1, $2, $3, $4, $5) 
          ON CONFLICT (stripe_subscription_id) DO NOTHING
          RETURNING *`;

        const values = [
            user_id,
            plan.plan_id, // Use the plan_id from your database
            typeof customerId === 'string' ? customerId : customerId.id,
            subscription.id,
            subscription.status || 'active',
        ];

        const result = await query(insertQuery, values);

        if (result.rows.length > 0) {
            // New subscription was inserted, send notification email
            const emailBody = baseTemplate({
                title: `🎉 New Subscription: ${plan.name}`,
                body: `<p>User <strong>${email}</strong> has subscribed to the <strong>${plan.name}</strong> plan.</p>`,
            });
            await sendEmail({
                to: 'owner@cofoundless.com',
                subject: `💰 New Subscriber: ${plan.name} - ${email}`,
                html: emailBody,
            });
        }

        res.status(200).json({ message: 'Payment completed successfully.', plan: plan.name, status: subscription.status });

    } catch (err) {
        console.error('Error processing payment:', err);
        res.status(500).json({ message: 'Error completing payment.' });
    }
});


// This endpoint handles the user selecting the "Free Tier"
router.post('/select-free-tier', authenticate, async (req, res) => {
  const { user_id } = req.user; 

  try {
    // --- MODIFICATION START ---
    // First, find the plan_id for the "Free" plan from your database.
    const planResult = await query("SELECT plan_id FROM plans WHERE name = 'Free'");
    if (planResult.rows.length === 0) {
        return res.status(500).json({ message: "Free plan not configured in the database." });
    }
    const freePlanId = planResult.rows[0].plan_id;
    // --- MODIFICATION END ---

    const existingActiveSubscriptionQuery = `
      SELECT p.stripe_status, pl.name as plan_name FROM payments p
      JOIN plans pl ON p.plan_id = pl.plan_id
      WHERE p.user_id = $1 AND (p.stripe_status = 'active' OR p.stripe_status = 'trialing' OR p.stripe_status = 'free_active')
      ORDER BY p.created_at DESC
      LIMIT 1;
    `;
    const existingSubscription = await query(existingActiveSubscriptionQuery, [user_id]);

    if (existingSubscription.rows.length > 0) {
      const { stripe_status, plan_name } = existingSubscription.rows[0];
      if (stripe_status === 'free_active') {
        return res.status(200).json({ message: 'User is already on the free tier.', status: 'free_active', plan: 'Free' });
      } else {
        return res.status(400).json({ message: `User already has an active ${plan_name} plan (${stripe_status}).` });
      }
    }

    const freeSubscriptionId = `free_sub_${user_id}`;

    const insertFreeTierQuery = `
      INSERT INTO payments (user_id, plan_id, stripe_subscription_id, stripe_status)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const freeTierValues = [
      user_id,
      freePlanId, // Use the fetched plan_id
      freeSubscriptionId,
      'free_active', 
    ];

    await query(insertFreeTierQuery, freeTierValues);
    console.log('Free tier selected and recorded for user:', user_id);
    
    // Email notification logic can remain the same
    const userEmail = req.user.email;
    const emailBody = baseTemplate({
      title: `✨ New Free Tier User: ${userEmail}`,
      body: `<p>A new user has just selected the Free Tier:</p><p><strong>User Email:</strong> ${userEmail}</p>`,
    });
    await sendEmail({
        to: 'owner@cofoundless.com', 
        subject: `🆓 New Free User: ${userEmail}`,
        html: emailBody
    });

    res.status(201).json({ message: 'Free tier selected successfully.', status: 'free_active', plan: 'Free' });

  } catch (err) {
    console.error('Error selecting free tier:', err);
    if (err.code === '23505') { 
        return res.status(200).json({ message: 'Free tier already recorded for this user.', status: 'free_active', plan: 'Free' });
    }
    res.status(500).json({ message: 'Failed to select free tier.' });
  }
});

// This endpoint fetches the current subscription status for the logged-in user.
router.get('/payment-status', authenticate, async (req, res) => {
  const { user_id } = req.user; 

  try {
    const paymentStatusQuery = `
      SELECT 
        p.stripe_status, 
        pl.name as plan_name -- Fetch the plan name by joining the tables
      FROM payments p
      JOIN plans pl ON p.plan_id = pl.plan_id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT 1
    `;
    const result = await query(paymentStatusQuery, [user_id]);

    if (result.rows.length > 0) {
      return res.status(200).json({ 
        status: result.rows[0].stripe_status,
        plan: result.rows[0].plan_name // Return the plan name from the plans table
      });
    } else {
      return res.status(200).json({ status: 'unsubscribed', plan: null });
    }
  } catch (err) {
    console.error('Error fetching payment status:', err);
    return res.status(500).json({ message: 'Error fetching payment status.' });
  }
});

export default router;