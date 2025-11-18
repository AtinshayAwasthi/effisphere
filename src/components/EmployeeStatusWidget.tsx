import React from 'react';
import { Circle } from 'lucide-react';
import { useEmployeeStatus } from '../hooks/useEmployeeStatus';

export function EmployeeStatusWidget() {
  const { employees, updateStatus } = useEmployeeStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-yellow-500';
      case 'suspended': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const handleStatusChange = async (employeeId: string, newStatus: string) => {
    await updateStatus(employeeId, newStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Employee Status</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {employees.map((employee) => (
          <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Circle className={`w-3 h-3 fill-current ${getStatusColor(employee.status)}`} />
              <span className="font-medium text-gray-900">{employee.full_name}</span>
            </div>
            <select
              value={employee.status}
              onChange={(e) => handleStatusChange(employee.id, e.target.value)}
              className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}