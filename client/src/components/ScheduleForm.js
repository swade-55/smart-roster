import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchedule } from '../slices/scheduleSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
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

const ScheduleForm = () => {
  const dispatch = useDispatch();
  const { scheduleData, status, error } = useSelector((state) => state.schedule);
  const loading = status === 'loading';

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const validationSchema = Yup.object().shape({
    dailyDemand: Yup.array()
      .of(
        Yup.number()
          .min(0, 'Demand must be greater than or equal to 0')
          .required('Required')
      )
      .required('All days are required')
      .length(6, 'Must provide demand for all days'),
  });

  const initialValues = {
    dailyDemand: [12, 13, 11, 11, 9, 5],
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(fetchSchedule(values.dailyDemand)).unwrap();
    } catch (err) {
      console.error('Failed to generate schedule:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getChartData = () => {
    if (!scheduleData) return [];
    
    return daysOfWeek.map(day => ({
      name: day,
      variance: scheduleData.variances[day] || 0,
      required: scheduleData.daily_requirements[day] || 0,
      scheduled: scheduleData.daily_totals[day] || 0,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Schedule Generator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {daysOfWeek.map((day, index) => (
                  <div key={day}>
                    <label className="block text-sm font-medium text-gray-700">{day}:</label>
                    <Field
                      type="number"
                      name={`dailyDemand.${index}`}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <ErrorMessage
                      name={`dailyDemand.${index}`}
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Schedule'}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        {/* Results Section */}
        {scheduleData && (
          <div className="space-y-6">
            {/* Schedule Table */}
            <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
              <h2 className="text-xl font-bold mb-4">Schedule Details</h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shift
                    </th>
                    {daysOfWeek.map(day => (
                      <th key={day} className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(scheduleData.schedule).map(([shiftName, days], idx) => (
                    <tr key={shiftName} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {shiftName}
                      </td>
                      {daysOfWeek.map(day => (
                        <td key={day} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {days[day]}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-semibold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Daily Total
                    </td>
                    {daysOfWeek.map(day => (
                      <td key={day} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {scheduleData.daily_totals[day]}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Variance Chart */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">Staffing Variance</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="variance" fill="#10B981">
                      {getChartData().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={entry.variance > 0 ? '#10B981' : entry.variance < 0 ? '#EF4444' : '#6B7280'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">Summary</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">Total Staff</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {scheduleData.total_staff_needed}
                  </dd>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">Over/Under</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {scheduleData.staffing_analysis.variance_summary.total_over_staffed}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleForm;