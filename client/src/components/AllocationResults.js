import React from 'react';
import { useSelector } from 'react-redux';

const AllocationResults = () => {
  const allocation = useSelector(state => state.allocation.allocationData);

  if (!allocation || allocation.status !== 'Optimal') {
    return <div className="text-center text-gray-600">No allocation data available.</div>;
  }

  return (
    <div className="bg-green-100 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Allocation Results:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(allocation.allocation).map(([dept, heads]) => (
          <div key={dept} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-green-700 mb-2">{dept}</h3>
            <p className="text-green-600">
              <span className="font-bold">{Math.ceil(heads)}</span> heads allocated
            </p>
            <p className="text-green-600">
              Completion in <span className="font-bold">{Math.ceil(allocation.completion_times[dept])}</span> hours
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllocationResults;