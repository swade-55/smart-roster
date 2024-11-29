import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../slices/authSlice';
import { fetchUsers } from '../slices/authSlice';
import { fetchEmployees } from '../slices/employeeSlice';

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialValues = {
    username: '',
    password: '',
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
  });

  const onSubmit = (values, { setSubmitting, setErrors }) => {
    dispatch(loginUser(values))
      .unwrap()
      .then((user) => {
        navigate('/');
        dispatch(fetchUsers());
        dispatch(fetchEmployees())
      })
      .catch((error) => {
        console.error('Error:', error);
        setErrors({ submit: error.message || 'Login failed. Please check your username and password.' });
      })
      .finally(() => setSubmitting(false));
  };
  const employees = useSelector(state=>state.employees)
  console.log('employees after useEffect', employees)

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9f9f9' }}>
      <div style={{ width: '100%', maxWidth: '28rem', backgroundColor: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', borderRadius: '0.5rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <img src={`${process.env.PUBLIC_URL}/lablogo.png`} alt="Lab Logo" style={{ marginBottom: '1rem' }} onError={() => console.error("Failed to load image at /lablogo.png")} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>ScheduleSmart Roster Management</h1>
        </div>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
          {({ isSubmitting, errors }) => (
            <Form>
              {errors.submit && <p style={{ color: '#f56565', marginBottom: '1rem' }}>{errors.submit}</p>}

              <div style={{ marginBottom: '1rem' }}>
                <Field name="username" type="text" placeholder="Username" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                <ErrorMessage name="username" component="p" style={{ color: '#f56565', marginTop: '0.25rem' }} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <Field name="password" type="password" placeholder="Password" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                <ErrorMessage name="password" component="p" style={{ color: '#f56565', marginTop: '0.25rem' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#3182ce', color: '#fff', borderRadius: '0.375rem', cursor: 'pointer', border: 'none' }}>
                  Login
                </button>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginForm;
