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

const PackageInfo = ({ selectedPackage }) => {
  if (!selectedPackage) return null;

  const info = {
    '7-day': {
      title: '7-Day Package',
      features: [
        'Covers all 7 days of operation',
        'Supports both 4 and 5-day employee schedules',
        'Flexible staffing distribution',
        'Must have staffing needs for all days'
      ]
    },
    '6-day': {
      title: '6-Day Package',
      features: [
        'Covers 6 days of operation',
        '4-day employee schedules only',
        'One guaranteed off day',
        'More consistent scheduling patterns'
      ]
    }
  };

  const packageDetails = info[selectedPackage];

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <h3 className="font-bold mb-2">{packageDetails.title}</h3>
      <ul className="text-sm list-disc pl-5">
        {packageDetails.features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
  );
};

const ScheduleForm = () => {
  const dispatch = useDispatch();
  const { scheduleData, status, error } = useSelector((state) => state.schedule);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [scheduleType, setScheduleType] = useState('4');
  const [staffingNeeds, setStaffingNeeds] = useState({
    Sunday: 12,
    Monday: 13,
    Tuesday: 11,
    Wednesday: 11,
    Thursday: 9,
    Friday: 5,
    Saturday: 8
  });
  const [validationError, setValidationError] = useState(null);

  const handleInputChange = (day, value) => {
    setStaffingNeeds(prev => ({
      ...prev,
      [day]: parseInt(value) || 0
    }));
  };

  const validateSchedule = () => {
    const workingDays = Object.values(staffingNeeds).filter(v => v > 0).length;
    
    if (!selectedPackage) {
      return "Please select a schedule package";
    }

    if (selectedPackage === '7-day') {
      if (workingDays < 7) {
        return "7-day package requires staffing for all 7 days";
      }
    } else if (selectedPackage === '6-day') {
      if (workingDays > 6) {
        return "6-day package cannot have more than 6 working days";
      }
      if (scheduleType !== '4') {
        return "6-day package only supports 4-day employee schedules";
      }
    }
    return null;
  };

  const handlePackageSelect = (packageType) => {
    setSelectedPackage(packageType);
    if (packageType === '6-day') {
      setScheduleType('4');
    }
    setValidationError(null);
  };

  const getChartData = () => {
    if (!scheduleData) return [];

    return DAYS_OF_WEEK.map(day => ({
      name: day,
      required: scheduleData.daily_requirements[day] || 0,
      scheduled: scheduleData.daily_totals[day] || 0,
      variance: scheduleData.variances[day] || 0
    }));
  };

  const handleGenerateSchedule = async () => {
    const validationResult = validateSchedule();
    if (validationResult) {
      setValidationError(validationResult);
      return;
    }

    const payload = {
      required_heads: DAYS_OF_WEEK.map(day => staffingNeeds[day]),
      schedule_type: scheduleType,
      package_type: selectedPackage
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    try {
      await dispatch(fetchSchedule(payload)).unwrap();
      setValidationError(null);
    } catch (err) {
      console.error('Failed to generate schedule:', err);
      setValidationError(err.message);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Select Schedule Package</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => handlePackageSelect('7-day')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedPackage === '7-day'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <h3 className="font-bold">7-Day Package</h3>
              <p className="text-sm text-gray-600">Flexible scheduling with 4/5 day options</p>
            </button>
            <button
              onClick={() => handlePackageSelect('6-day')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedPackage === '6-day'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <h3 className="font-bold">6-Day Package</h3>
              <p className="text-sm text-gray-600">4-day schedules with one guaranteed off day</p>
            </button>
          </div>
          
          {selectedPackage && <PackageInfo selectedPackage={selectedPackage} />}
          
          <div className="flex items-center justify-between mt-6">
            <h2 className="text-xl font-bold">Staff Requirements</h2>
            <select
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
              className="w-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={selectedPackage === '6-day'}
            >
              <option value="4">4-Day</option>
              {selectedPackage === '7-day' && <option value="5">5-Day</option>}
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
          
          {validationError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              {validationError}
            </div>
          )}

          <button
            onClick={handleGenerateSchedule}
            className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={status === 'loading' || !selectedPackage}
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Schedule...
              </span>
            ) : (
              'Generate Schedule'
            )}
          </button>
        </div>
      </div>

      {error && !validationError && (
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