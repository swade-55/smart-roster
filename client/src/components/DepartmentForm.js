import React from 'react';
import { useDispatch } from 'react-redux';
import { fetchAllocation } from '../slices/allocationSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const DepartmentForm = () => {
  const dispatch = useDispatch();

  const validationSchema = Yup.object().shape({
    departments: Yup.object().shape({
      Perishable: Yup.object().shape({
        total_cases: Yup.number().min(0, 'Must be greater than or equal to 0').required('Required'),
        cases_per_hour: Yup.number().min(0, 'Must be greater than or equal to 0').required('Required'),
      }),
      Grocery: Yup.object().shape({
        total_cases: Yup.number().min(0, 'Must be greater than or equal to 0').required('Required'),
        cases_per_hour: Yup.number().min(0, 'Must be greater than or equal to 0').required('Required'),
      }),
      Frozen: Yup.object().shape({
        total_cases: Yup.number().min(0, 'Must be greater than or equal to 0').required('Required'),
        cases_per_hour: Yup.number().min(0, 'Must be greater than or equal to 0').required('Required'),
      }),
    }),
    total_heads: Yup.number().min(0, 'Must be greater than or equal to 0').required('Required'),
  });

  const initialValues = {
    departments: {
      Perishable: { total_cases: '', cases_per_hour: '' },
      Grocery: { total_cases: '', cases_per_hour: '' },
      Frozen: { total_cases: '', cases_per_hour: '' },
    },
    total_heads: 0,
  };

  const handleSubmit = (values) => {
    dispatch(fetchAllocation(values));
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched }) => (
        <Form className="streamlit-form">
          {Object.keys(initialValues.departments).map(deptName => (
            <div key={deptName} className="mb-4">
              <h2 className="text-xl font-semibold mb-2">{deptName}</h2>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Total Cases for {deptName}:</span>
                </label>
                <Field
                  type="number"
                  name={`departments.${deptName}.total_cases`}
                  className={`input input-bordered input-primary w-full max-w-xs ${
                    errors.departments?.[deptName]?.total_cases && touched.departments?.[deptName]?.total_cases ? 'input-error' : ''
                  }`}
                />
                <ErrorMessage name={`departments.${deptName}.total_cases`} component="div" className="text-error" />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Cases Per Hour for {deptName}:</span>
                </label>
                <Field
                  type="number"
                  name={`departments.${deptName}.cases_per_hour`}
                  className={`input input-bordered input-primary w-full max-w-xs ${
                    errors.departments?.[deptName]?.cases_per_hour && touched.departments?.[deptName]?.cases_per_hour ? 'input-error' : ''
                  }`}
                />
                <ErrorMessage name={`departments.${deptName}.cases_per_hour`} component="div" className="text-error" />
              </div>
            </div>
          ))}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Total Heads:</span>
            </label>
            <Field
              type="number"
              name="total_heads"
              className={`input input-bordered input-primary w-full max-w-xs ${
                errors.total_heads && touched.total_heads ? 'input-error' : ''
              }`}
            />
            <ErrorMessage name="total_heads" component="div" className="text-error" />
          </div>
          <button type="submit" className="btn btn-primary mt-4">Calculate Allocation</button>
        </Form>
      )}
    </Formik>
  );
};

export default DepartmentForm;