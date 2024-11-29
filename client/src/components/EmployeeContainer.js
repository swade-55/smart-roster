import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees, deleteEmployee, updateEmployeeSchedule } from '../slices/employeeSlice';
import EmployeeForm from './EmployeeForm';

function EmployeeContainer() {
  const dispatch = useDispatch();
  const { employees, status, error } = useSelector((state) => state.employees);
  const [searchQuery, setSearchQuery] = useState('');
  const [editEmployeeId, setEditEmployeeId] = useState(null);
  const [editedSchedule, setEditedSchedule] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchEmployees());
    }
  }, [status, dispatch]);

  const handleDelete = (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      dispatch(deleteEmployee(employeeId));
    }
  };

  const handleFormClose=()=>{
    setIsModalOpen(false);
  }

  const handleEdit = (employee) => {
    setEditEmployeeId(employee.id);
    setEditedSchedule({ ...employee.schedule });
  };

  const handleSave = () => {
    dispatch(updateEmployeeSchedule({ employeeId: editEmployeeId, scheduleData: editedSchedule }));
    setEditEmployeeId(null);
  };

  const handleChange = (e, day) => {
    setEditedSchedule(prev => ({
      ...prev,
      [day]: e.target.checked
    }));
  };

  const filteredEmployees = Array.isArray(employees) 
    ? employees.filter((employee) =>
        `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const groupedEmployees = filteredEmployees.reduce((acc, employee) => {
    const jobClassName = employee.job_class?.name || 'Unassigned';
    if (!acc[jobClassName]) {
      acc[jobClassName] = [];
    }
    acc[jobClassName].push(employee);
    return acc;
  }, {});

  const EmployeeTable = ({ employees, jobClassName }) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">{jobClassName}</h2>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Sunday</th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
            <th>Saturday</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{`${employee.first_name} ${employee.last_name}`}</td>
              {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => (
                <td key={day}>
                  {editEmployeeId === employee.id ? (
                    <input
                      type="checkbox"
                      checked={editedSchedule[day]}
                      onChange={(e) => handleChange(e, day)}
                    />
                  ) : (
                    employee.schedule?.[day] ? 'X' : '-'
                  )}
                </td>
              ))}
              <td>
                {editEmployeeId === employee.id ? (
                  <>
                    <button className="btn btn-primary mr-2" onClick={handleSave}>Save</button>
                    <button className="btn btn-secondary" onClick={() => setEditEmployeeId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-secondary mr-2" onClick={() => handleEdit(employee)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(employee.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          className="input input-bordered w-full max-w-xs"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">Add New Employee</button>
      </div>
      {Object.entries(groupedEmployees).map(([jobClassName, employees]) => (
        <EmployeeTable key={jobClassName} employees={employees} jobClassName={jobClassName} />
      ))}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <EmployeeForm onClose={handleFormClose} />
            <button onClick={handleFormClose} className="btn btn-secondary mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeContainer;