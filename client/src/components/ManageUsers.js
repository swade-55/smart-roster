import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, addUser, deleteUser } from '../slices/authSlice';

const ManageUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.auth.users);
  const admin = useSelector((state) => state.auth.user);  // Assuming the logged-in user is the admin
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user', can_manage_tools: false, can_manage_testlines: false });


  const handleAddUser = () => {
    dispatch(addUser(newUser));
    setNewUser({ username: '', email: '', password: '', role: 'user', can_manage_tools: false, can_manage_testlines: false });
  };

  const handleDeleteUser = (userId) => {
    dispatch(deleteUser(userId));
  };

  const containerStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '20px',
  };

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ccc',
  };

  const checkboxContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '10px 0',
  };

  const buttonStyle = {
    display: 'block',
    width: '100%',
    padding: '10px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const userListStyle = {
    listStyleType: 'none',
    padding: '0',
  };

  const userListItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #ccc',
  };

  const deleteButtonStyle = {
    backgroundColor: '#DC3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Manage Users</h2>
      <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} style={inputStyle} />
      <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} style={inputStyle} />
      <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} style={inputStyle} />
      <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} style={inputStyle}>
        <option value="user">User</option>
        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
      </select>
      <div style={checkboxContainerStyle}>
        <label>
          <input type="checkbox" checked={newUser.can_manage_tools} onChange={(e) => setNewUser({ ...newUser, can_manage_tools: e.target.checked })} />
          Can Manage Tools
        </label>
        <label>
          <input type="checkbox" checked={newUser.can_manage_testlines} onChange={(e) => setNewUser({ ...newUser, can_manage_testlines: e.target.checked })} />
          Can Manage Test Lines
        </label>
      </div>
      <button onClick={handleAddUser} style={buttonStyle}>Add User</button>
      <ul style={userListStyle}>
        {users.map(user => (
          <li key={user.id} style={userListItemStyle}>
            {user.username} - {user.email}
            <button onClick={() => handleDeleteUser(user.id)} style={deleteButtonStyle}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageUsers;
