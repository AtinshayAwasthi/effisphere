import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock, AlertTriangle, Calendar, MapPin } from 'lucide-react';
import { analyticsService } from '../lib/analytics';
import { supabase } from '../lib/supabase';

interface TeamMember {
  id: string;
  full_name: string;
  department: string;
  status: string;
  todayHours: number;
  weeklyHours: number;
  isActive: boolean;
}

interface DepartmentMetrics {
  totalEmployees: number;
  activeToday: number;
  totalHours: number;
  avgProductivity: number;
  alerts: number;
}

export function ManagerDashboard() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [metrics, setMetrics] = useState<DepartmentMetrics>({
    totalEmployees: 0,
    activeToday: 0,
    totalHours: 0,
    avgProductivity: 0,
    alerts: 0
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [selectedDepartment]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load departments
      const { data: deptData } = await supabase
        .from('employees')
        .select('department')
        .not('department', 'is', null);
      
      const uniqueDepts = [...new Set(deptData?.map(e => e.department))];
      setDepartments(uniqueDepts);

      // Load team members
      let employeeQuery = supabase
        .from('employees')
        .select(`
          id,
          full_name,
          department,
          status,
          attendance_records!left(total_hours, check_in_time, status)
        `);

      if (selectedDepartment !== 'all') {
        employeeQuery = employeeQuery.eq('department', selectedDepartment);
      }

      const { data: employees } = await employeeQuery;

      // Process team data
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const teamData: TeamMember[] = employees?.map(emp => {
        const records = emp.attendance_records || [];
        const todayRecords = records.filter((r: any) => 
          r.check_in_time?.startsWith(today)
        );
        const weeklyRecords = records.filter((r: any) => 
          new Date(r.check_in_time) >= weekStart
        );

        return {
          id: emp.id,
          full_name: emp.full_name,
          department: emp.department,
          status: emp.status,
          todayHours: todayRecords.reduce((sum: number, r: any) => sum + (r.total_hours || 0), 0),
          weeklyHours: weeklyRecords.reduce((sum: number, r: any) => sum + (r.total_hours || 0), 0),
          isActive: todayRecords.some((r: any) => r.status === 'active')
        };
      }) || [];

      setTeamMembers(teamData);

      // Calculate metrics
      const activeToday = teamData.filter(t => t.isActive).length;
      const totalHours = teamData.reduce((sum, t) => sum + t.todayHours, 0);
      const avgProductivity = teamData.length > 0 
        ? (totalHours / teamData.length / 8) * 100 
        : 0;

      setMetrics({
        totalEmployees: teamData.length,
        activeToday,
        totalHours: Math.round(totalHours * 100) / 100,
        avgProductivity: Math.round(avgProductivity),
        alerts: teamData.filter(t => t.todayHours < 4 && t.todayHours > 0).length
      });

    } catch (error) {
      console.error('Error loading manager dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (member: TeamMember) => {
    if (member.isActive) return 'text-green-600 bg-green-50';
    if (member.todayHours > 0) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusText = (member: TeamMember) => {
    if (member.isActive) return 'Working';
    if (member.todayHours > 0) return 'Completed';
    return 'Not Started';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manager Dashboard</h2>
          <p className="text-gray-600 mt-1">Team performance and workforce insights</p>
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalEmployees}</p>
              <p className="text-sm text-gray-600">Team Size</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">{metrics.activeToday}</p>
              <p className="text-sm text-gray-600">Active Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalHours}h</p>
              <p className="text-sm text-gray-600">Total Hours</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.avgProductivity}%</p>
              <p className="text-sm text-gray-600">Avg Productivity</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">{metrics.alerts}</p>
              <p className="text-sm text-gray-600">Alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Status</h3>
        
        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{member.full_name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member)}`}>
                    {getStatusText(member)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Today:</span>
                    <span className="font-medium">{member.todayHours.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Week:</span>
                    <span className="font-medium">{member.weeklyHours.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{member.department}</span>
                  </div>
                </div>

                {/* Progress bar for daily target */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Daily Progress</span>
                    <span>{Math.round((member.todayHours / 8) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        member.todayHours >= 8 ? 'bg-green-500' :
                        member.todayHours >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((member.todayHours / 8) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>No team members found</p>
          </div>
        )}
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers This Week</h3>
          <div className="space-y-3">
            {teamMembers
              .sort((a, b) => b.weeklyHours - a.weeklyHours)
              .slice(0, 5)
              .map((member, index) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{member.full_name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{member.weeklyHours.toFixed(1)}h</span>
                </div>
              ))}
            {teamMembers.length === 0 && (
              <p className="text-gray-500 text-sm">No performance data available</p>
            )}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h3>
          <div className="space-y-3">
            {teamMembers
              .filter(m => m.todayHours < 4 && m.todayHours > 0)
              .map((member) => (
                <div key={member.id} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      {member.full_name} - Low Hours
                    </p>
                    <p className="text-xs text-yellow-700">
                      Only {member.todayHours.toFixed(1)} hours logged today
                    </p>
                  </div>
                </div>
              ))}
            
            {teamMembers.filter(m => !m.isActive && m.todayHours === 0).length > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {teamMembers.filter(m => !m.isActive && m.todayHours === 0).length} employees haven't checked in
                  </p>
                  <p className="text-xs text-red-700">
                    Consider following up on attendance
                  </p>
                </div>
              </div>
            )}

            {metrics.alerts === 0 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-4 h-4 bg-green-600 rounded-full mt-0.5"></div>
                <div>
                  <p className="text-sm font-medium text-green-800">All Clear</p>
                  <p className="text-xs text-green-700">No alerts for your team today</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}