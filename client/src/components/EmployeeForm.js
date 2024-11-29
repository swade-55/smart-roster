import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addEmployee } from '../slices/employeeSlice';

function EmployeeForm({ onClose }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    hire_date: '',
    hourly_rate: '',
    job_class_id: ''
  });
  const [jobClasses, setJobClasses] = useState([]);

  useEffect(() => {
    // Fetch job classes when the component mounts
    fetchJobClasses();
  }, []);

  const fetchJobClasses = async () => {
    try {
      const response = await fetch('/labinv/api/job_classes');
      if (!response.ok) {
        throw new Error('Failed to fetch job classes');
      }
      const data = await response.json();
      setJobClasses(data);
    } catch (error) {
      console.error('Error fetching job classes:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addEmployee(formData)).then(() => {
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        placeholder="First Name"
        required
      />
      <input
        type="text"
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        placeholder="Last Name"
        required
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <input
        type="date"
        name="hire_date"
        value={formData.hire_date}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="hourly_rate"
        value={formData.hourly_rate}
        onChange={handleChange}
        placeholder="Hourly Rate"
        required
      />
      <select
        name="job_class_id"
        value={formData.job_class_id}
        onChange={handleChange}
        required
      >
        <option value="">Select Job Class</option>
        {jobClasses.map((jobClass) => (
          <option key={jobClass.id} value={jobClass.id}>
            {jobClass.name}
          </option>
        ))}
      </select>
      <button type="submit">Add Employee</button>
    </form>
  );
}

export default EmployeeForm;