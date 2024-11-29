import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CapacityDashboard = () => {
  const employees = useSelector(state => state.employees.employees);

  const combinedTallyData = useMemo(() => {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const jobClasses = [...new Set(employees.map(e => e.job_class?.name || 'Unassigned'))];

    const tally = daysOfWeek.map(day => {
      const dayData = { day };
      let totalCount = 0;

      jobClasses.forEach(jobClass => {
        const jobClassEmployees = employees.filter(e => (e.job_class?.name || 'Unassigned') === jobClass);
        const count = jobClassEmployees.filter(employee => employee.schedule?.[day]).length;
        dayData[jobClass] = count;
        totalCount += count;
      });

      dayData.totalCount = totalCount;
      return dayData;
    });

    let runningTotal = 0;
    return tally.map(dayData => {
      runningTotal += dayData.totalCount;
      return { ...dayData, runningTotal };
    });
  }, [employees]);

  const jobClasses = useMemo(() => {
    return [...new Set(employees.map(e => e.job_class?.name || 'Unassigned'))];
  }, [employees]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Combined Capacity Dashboard</h2>
      <div className="overflow-x-auto">
        <table className="table w-full mb-4">
          <thead>
            <tr>
              <th>Day</th>
              {jobClasses.map(jobClass => (
                <th key={jobClass}>{jobClass}</th>
              ))}
              <th>Total Count</th>
              <th>Running Total</th>
            </tr>
          </thead>
          <tbody>
            {combinedTallyData.map(dayData => (
              <tr key={dayData.day}>
                <td className="capitalize">{dayData.day}</td>
                {jobClasses.map(jobClass => (
                  <td key={jobClass}>{dayData[jobClass]}</td>
                ))}
                <td>{dayData.totalCount}</td>
                <td>{dayData.runningTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={combinedTallyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            {jobClasses.map((jobClass, index) => (
              <Line 
                key={jobClass}
                type="monotone" 
                dataKey={jobClass} 
                stroke={`hsl(${index * 360 / jobClasses.length}, 70%, 50%)`} 
                name={jobClass} 
              />
            ))}
            <Line type="monotone" dataKey="totalCount" stroke="#8884d8" name="Total Count" strokeWidth={2} />
            <Line type="monotone" dataKey="runningTotal" stroke="#82ca9d" name="Running Total" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CapacityDashboard;
