import Stripe from 'stripe';
import { query } from '../db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Retrieve the checkout session after the user completes the payment
export const retrieveCheckoutSession = async (sessionId) => {
  try {
    // Expand the subscription and customer objects to get full details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'subscription.plan', 'line_items', 'line_items.data.price.product']
    });
    return session;
  } catch (error) {
    console.error('Stripe session retrieval error:', error);
    throw new Error(`Error retrieving checkout session: ${error.message}`);
  }
};

// Store subscription details in DB
export const storeSubscription = async (userId, customerId, subscriptionId, status, plan) => {
  try {    
    // Check if subscription exists
    const checkQuery = `SELECT * FROM payments WHERE stripe_subscription_id = $1`;
    const checkResult = await query(checkQuery, [subscriptionId]);
  
    if (checkResult.rows.length > 0) {
      console.log('Subscription already exists in the database for subscription:', subscriptionId);
      return checkResult.rows[0]; // Return existing record
    }
  
    // If it doesn't exist, proceed with the insert
    const insertQuery = `
      INSERT INTO payments (user_id, stripe_customer_id, stripe_subscription_id, stripe_status, subscription_plan)
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`;
  
    const values = [userId, customerId, subscriptionId, status, plan];
    const result = await query(insertQuery, values);
    
    console.log('Subscription stored in DB:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    // Handle unique constraint violation gracefully
    if (error.code === '23505') { // PostgreSQL unique violation code
      console.log('Concurrent insertion detected, subscription already exists');
      // Query again to get the existing record
      const existingRecord = await query(
        'SELECT * FROM payments WHERE stripe_subscription_id = $1',
        [subscriptionId]
      );
      return existingRecord.rows[0];
    }
    
    console.error('Error storing subscription:', error);
    throw error;
  }
};

// Check if the subscription already exists in the DB
export const checkIfSubscriptionExists = async (subscriptionId) => {
  const checkQuery = `
    SELECT * FROM payments
    WHERE stripe_subscription_id = $1
  `;
  const result = await query(checkQuery, [subscriptionId]);
  return result.rows.length > 0;
};