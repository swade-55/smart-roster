import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchedule } from '../store/scheduleSlice';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2 } from "lucide-react";

const ScheduleSummary = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, hasSubscription } = useSelector((state) => state.auth);
  const { scheduleData, status, error } = useSelector((state) => state.schedule);

  const [staffingNeeds, setStaffingNeeds] = useState({
    Sunday: 12,
    Monday: 13,
    Tuesday: 11,
    Wednesday: 11,
    Thursday: 9,
    Friday: 5
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!hasSubscription) {
      navigate('/subscription');
    }
  }, [hasSubscription, navigate]);

  const handleInputChange = (day, value) => {
    setStaffingNeeds(prev => ({
      ...prev,
      [day]: parseInt(value) || 0
    }));
  };

  const handleGenerateSchedule = async () => {
    try {
      await dispatch(fetchSchedule(Object.values(staffingNeeds))).unwrap();
    } catch (err) {
      console.error('Failed to generate schedule:', err);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (!hasSubscription) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Staff Requirements Input
            <span className="text-sm font-normal">
              Welcome, {user?.username || 'User'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(staffingNeeds).map(([day, value]) => (
              <div key={day} className="space-y-2">
                <label className="text-sm font-medium">{day}</label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => handleInputChange(day, e.target.value)}
                  min="0"
                  className="w-full"
                />
              </div>
            ))}
          </div>
          <Button 
            onClick={handleGenerateSchedule} 
            className="mt-4 w-full"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Schedule'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {scheduleData && status === 'succeeded' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Schedule Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={Object.keys(staffingNeeds).map(day => ({
                      day,
                      scheduled: scheduleData[`Schedule_${day}`]?.count || 0,
                      required: staffingNeeds[day]
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="scheduled" 
                      stroke="#8884d8" 
                      name="Scheduled Staff" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="required" 
                      stroke="#82ca9d" 
                      name="Required Staff" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schedule Pattern</TableHead>
                    <TableHead>Staff Count</TableHead>
                    <TableHead>Working Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(scheduleData).map(([pattern, data]) => (
                    <TableRow key={pattern}>
                      <TableCell className="font-medium">{pattern}</TableCell>
                      <TableCell>{data.count}</TableCell>
                      <TableCell>
                        {Object.entries(data.schedule)
                          .filter(([_, isWorking]) => isWorking === 1)
                          .map(([day]) => day)
                          .join(', ')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(scheduleData.additionalResources || {}).map(([day, value]) => (
                  <div key={day} className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-medium">{day}</div>
                    <div className={`text-xl ${value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {value > 0 ? '+' : ''}{value}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ScheduleSummary;