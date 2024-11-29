import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateSubscription } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('SuccessPage mounted, dispatching updateSubscription');
    dispatch(updateSubscription(true)).then((result) => {
      console.log('updateSubscription result:', result);
    });
    // Redirect to home page after a short delay
    const timer = setTimeout(() => {
      console.log('Redirecting to home page');
      navigate('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [dispatch, navigate]);

  return (
    <div>
      <h1>Subscription Successful!</h1>
      <p>You now have access to premium features. Redirecting...</p>
    </div>
  );
};

export default SuccessPage;