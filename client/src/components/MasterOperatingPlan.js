import React from 'react';
import EmployeeContainer from './EmployeeContainer';
import CapacityDashboard from './CapacityDashboard';

function MasterOperatingPlan() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Master Operating Plan</h1>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Capacity Dashboard</h2>
        <CapacityDashboard />
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Employee Management</h2>
        <EmployeeContainer />
      </section>
    </div>
  );
}

export default MasterOperatingPlan;
