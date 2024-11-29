import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

const NewUserForm = () => {
  const navigate = useNavigate();
  const initialValues = {
    username: '',
    email: '',
    password: '',
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const onSubmit = (values, { setSubmitting, resetForm, setErrors }) => {
    // Construct the API endpoint
    const apiUrl = '/users'; 

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        resetForm();
        navigate('/login');
    })
    .catch(error => {
        console.error('Error:', error);
        setErrors({ submit: 'Failed to create user' });
    })
    .finally(() => {
        setSubmitting(false);
    });
};


return (
  <div className="card bg-base-100 shadow-xl p-5">
    <div className="card-body">
      <button onClick={() => navigate('/')} className="btn btn-secondary mb-4">Back to Home</button>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <div className="form-control">
              <Field name="username" placeholder="Username" className="input input-bordered" />
              <ErrorMessage name="username" component="div" className="text-error" />
            </div>

            <div className="form-control">
              <Field name="email" type="email" placeholder="Email" className="input input-bordered" />
              <ErrorMessage name="email" component="div" className="text-error" />
            </div>

            <div className="form-control">
              <Field name="password" type="password" placeholder="Password" className="input input-bordered" />
              <ErrorMessage name="password" component="div" className="text-error" />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary mt-4">
              Create User
            </button>
          </Form>
        )}
      </Formik>
    </div>
  </div>
);
};

export default NewUserForm;