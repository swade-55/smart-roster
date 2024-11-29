import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { updateSubscription } from '../slices/authSlice';

// Move this outside of the component
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const SubscriptionPage = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [stripe, setStripe] = useState(null);
  console.log('Auth state:', auth);
  const { isAuthenticated, hasSubscription } = auth;

  useEffect(() => {
    // Load Stripe on component mount
    stripePromise.then(stripeInstance => {
      setStripe(stripeInstance);
    });
  }, []);

  const handleSubscribe = async () => {
    console.log("Subscribe button clicked");
    try {
      const response = await fetch('/labinv/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      console.log('Checkout session response:', response);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const session = await response.json();
      console.log('Received session data:', session);
      
      if (!session.id) {
        throw new Error('No session ID returned from the server');
      }
      
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });
      
      if (error) {
        console.error('Stripe checkout error:', error);
        alert(error.message);
      }
    } catch (error) {
      console.error('Error in handleSubscribe:', error);
      alert(`Subscription error: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Subscribe to Access Premium Features</h1>
      {isAuthenticated ? (
        hasSubscription ? (
          <p>You already have an active subscription.</p>
        ) : (
          <button onClick={handleSubscribe}>Subscribe Now</button>
        )
      ) : (
        <p>Please log in to subscribe.</p>
      )}
    </div>
  );
};

export default SubscriptionPage;