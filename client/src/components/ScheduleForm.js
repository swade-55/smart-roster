import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchedule } from '../slices/scheduleSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const ScheduleForm = () => {
  const dispatch = useDispatch();
  const { scheduleData, status, error } = useSelector((state) => state.schedule);
  
  const [scheduleType, setScheduleType] = useState('5');
  const [staffingNeeds, setStaffingNeeds] = useState({
    Sunday: 12,
    Monday: 13,
    Tuesday: 11,
    Wednesday: 11,
    Thursday: 9,
    Friday: 5,
    Saturday: 8
  });

  const handleInputChange = (day, value) => {
    setStaffingNeeds(prev => ({
      ...prev,
      [day]: parseInt(value) || 0
    }));
  };

  const validateSchedule = (needs) => {
    const daysNeeded = Object.values(needs).filter(v => v > 0).length;
    if (scheduleType === '4' && daysNeeded > 4) {
      return "4-day schedule cannot cover more than 4 working days";
    }
    if (scheduleType === '5' && daysNeeded > 5) {
      return "5-day schedule cannot cover more than 5 working days";
    }
    return null;
  };

  const getChartData = () => {
    if (!scheduleData) return [];
    
    return DAYS_OF_WEEK.map(day => ({
      name: day,
      variance: scheduleData.variances?.[day] || 0,
      required: scheduleData.daily_requirements?.[day] || 0,
      scheduled: scheduleData.daily_totals?.[day] || 0,
    }));
  };

  const handleGenerateSchedule = async () => {
    const payload = {
      required_heads: DAYS_OF_WEEK.slice(0, 6).map(day => staffingNeeds[day]),
      schedule_type: scheduleType
    };
    
    console.log('Sending payload:', JSON.stringify(payload, null, 2)); // Pretty print the payload
  
    try {
      await dispatch(fetchSchedule(payload)).unwrap();
    } catch (err) {
      console.error('Failed to generate schedule:', err);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Staff Requirements Input</h2>
            <select
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
              className="w-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="4">4-Day</option>
              <option value="5">5-Day</option>
            </select>
          </div>
        </div>
        <div className="p-6 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="space-y-2">
                <label className="text-sm font-medium">{day}</label>
                <input
                  type="number"
                  value={staffingNeeds[day]}
                  onChange={(e) => handleInputChange(day, e.target.value)}
                  min="0"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <button 
            onClick={handleGenerateSchedule} 
            className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating {scheduleType}-Day Schedule...
              </span>
            ) : (
              `Generate ${scheduleType}-Day Schedule`
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {scheduleData && (
        <>
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold">Schedule Patterns</h2>
            </div>
            <div className="p-6 pt-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pattern</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Days</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Count</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(scheduleData.schedule || {}).map(([patternId, pattern]) => (
                      <tr key={patternId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patternId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Object.entries(pattern)
                            .filter(([_, count]) => count > 0)
                            .map(([day]) => day)
                            .join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.max(...Object.values(pattern))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold">Daily Staffing Analysis</h2>
            </div>
            <div className="p-6 pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="required" fill="#9333ea" name="Required" />
                    <Bar dataKey="scheduled" fill="#2563eb" name="Scheduled" />
                    <Bar dataKey="variance" name="Variance">
                      {getChartData().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={entry.variance >= 0 ? '#22c55e' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold">Schedule Summary</h2>
            </div>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Total Staff</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {scheduleData.total_staff_needed}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Total Variance</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {scheduleData.staffing_analysis?.variance_summary?.total_over_staffed +
                     scheduleData.staffing_analysis?.variance_summary?.total_under_staffed}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">Coverage</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {scheduleData.staffing_analysis?.variance_summary?.days_exactly_staffed} / {DAYS_OF_WEEK.length} days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ScheduleForm;