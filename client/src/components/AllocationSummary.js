import React from 'react';
import DepartmentForm from './DepartmentForm';
import AllocationResults from './AllocationResults';

function AllocationSummary() {
  return (
    <div className="p-4 bg-base-100">
      <h1 className="text-3xl font-bold mb-4 text-primary">Head Allocation Optimizer</h1>
      <div className="card bg-base-100 shadow-xl mb-4">
        <div className="card-body">
      <DepartmentForm />
      </div>
      </div>
      <AllocationResults />
    </div>
  );
}

export default AllocationSummary;
