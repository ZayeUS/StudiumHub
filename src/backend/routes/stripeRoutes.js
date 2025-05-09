import express from 'express';
import { retrieveCheckoutSession } from '../utils/stripe.js'; 
import { query } from '../db.js'; 
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

router.post('/complete-payment', authenticate, async (req, res) => {
  const { sessionId } = req.body;
  
  try {
    // Step 1: Retrieve the session details from Stripe
    const session = await retrieveCheckoutSession(sessionId);
    if (!session) {
      return res.status(400).json({ message: 'Invalid session' });
    }

    console.log('Stripe session:', JSON.stringify(session, null, 2)); // Log for debugging

    // Step 2: Extract subscription information
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    
    // Fix: Extract the proper plan name from session data
    let subscriptionPlan = 'Unknown Plan';
    
    // Method 1: Try to get from expanded subscription data
    if (session.subscription && session.subscription.plan && session.subscription.plan.product) {
      try {
        // First try to get product name directly if it's expanded
        const product = await stripe.products.retrieve(session.subscription.plan.product);
        subscriptionPlan = product.name;
      } catch (err) {
        console.log('Error fetching product details:', err);
      }
    }
    
    // Method 2: Try to get from line items
    if (subscriptionPlan === 'Unknown Plan' && session.line_items && session.line_items.data) {
      for (const item of session.line_items.data) {
        if (item.price && item.price.product) {
          try {
            // First check if product is already expanded
            if (typeof item.price.product === 'object' && item.price.product.name) {
              subscriptionPlan = item.price.product.name;
              break;
            }
            
            // Otherwise fetch the product
            const product = await stripe.products.retrieve(item.price.product);
            subscriptionPlan = product.name;
            break;
          } catch (err) {
            console.log('Error fetching product details from line items:', err);
          }
        }
      }
    }
    
    // Method 3: Try to get from metadata if it exists
    if (subscriptionPlan === 'Unknown Plan' && session.metadata && session.metadata.plan_name) {
      subscriptionPlan = session.metadata.plan_name;
    }
    
    console.log('Extracted plan name:', subscriptionPlan);
    
    const email = session.customer_details?.email;
    if (!email) {
      return res.status(400).json({ message: 'Email not found in session' });
    }

    // Step 3: Get the user_id using email
    const userQuery = 'SELECT user_id FROM users WHERE email = $1';
    const userResult = await query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userId = userResult.rows[0].user_id;

    // Step 4: Check if payment already exists
    const existingPaymentQuery = 'SELECT * FROM payments WHERE stripe_subscription_id = $1';
    const existingPayment = await query(existingPaymentQuery, [subscriptionId]);

    if (existingPayment.rows.length > 0) {
      console.log('Subscription already exists for this session');
      return res.status(200).json({ message: 'Subscription already recorded.' });
    }

    // Step 5: Save the payment
    const insertQuery = `
      INSERT INTO payments (user_id, stripe_customer_id, stripe_subscription_id, stripe_status, subscription_plan)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;

    // Get subscription status from session
    const subscriptionStatus = session.subscription.status;
    console.log('Subscription status from Stripe:', subscriptionStatus);

    const values = [
      userId,
      JSON.stringify(session.customer),
      JSON.stringify(session.subscription),
      subscriptionStatus || 'active',
      subscriptionPlan
    ];

    const result = await query(insertQuery, values);
    console.log('Subscription stored in DB:', result.rows[0]);
    
    res.status(200).json({ message: 'Payment completed and subscription created successfully.' });
  } catch (err) {
    console.error('Error processing payment:', err);
    
    // Handle unique constraint violation gracefully
    if (err.code === '23505') { // PostgreSQL unique violation code
      return res.status(200).json({ message: 'Subscription already recorded.' });
    }
    
    res.status(500).json({ message: 'Error completing payment.' });
  }
});

// Backend: Route to fetch user payment status based on email
router.get('/payment-status', authenticate, async (req, res) => {
  const { email } = req.user;

  try {
    // Fix: Join with users table to get payments by email
    const paymentStatusQuery = `
      SELECT p.stripe_status, p.subscription_plan 
      FROM payments p
      JOIN users u ON p.user_id = u.user_id
      WHERE u.email = $1
      ORDER BY p.created_at DESC
      LIMIT 1
    `;
    const result = await query(paymentStatusQuery, [email]);

    if (result.rows.length > 0) {
      return res.status(200).json({ 
        status: result.rows[0].stripe_status,
        plan: result.rows[0].subscription_plan
      });
    } else {
      return res.status(404).json({ message: 'No payment record found for user.' });
    }
  } catch (err) {
    console.error('Error fetching payment status:', err);
    return res.status(500).json({ message: 'Error fetching payment status.' });
  }
});

export default router;