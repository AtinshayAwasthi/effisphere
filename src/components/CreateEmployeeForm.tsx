import React, { useState } from 'react';
import { User, Mail, Phone, Building, Calendar, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useEmployeeStore } from '../store/employeeStore';

interface EmployeeData {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hireDate: string;
}

interface CreateEmployeeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateEmployeeForm({ onSuccess, onCancel }: CreateEmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeData>({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    hireDate: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useEmployeeStore();

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 100);
  };

  const simpleHash = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'effisphere_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const tempPassword = generatePassword();
      const passwordHash = await simpleHash(tempPassword);

      // Create user
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email: formData.email,
          password_hash: passwordHash,
          role: 'employee',
          is_verified: true
        })
        .select()
        .single();

      if (userError) {
        throw new Error(userError.message);
      }

      // Create employee record
      const { error: employeeError } = await supabase
        .from('employees')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          employee_id: `EMP${Date.now()}`,
          department: formData.department,
          position: formData.position,
          phone: formData.phone,
          hire_date: formData.hireDate,
          created_by: currentUser?.id
        });

      if (employeeError) {
        throw new Error(employeeError.message);
      }

      // Show credentials to admin
      const message = `✅ Employee Created Successfully!\n\n👤 Name: ${formData.fullName}\n📧 Email: ${formData.email}\n🔑 Password: ${tempPassword}\n🏢 Department: ${formData.department}\n💼 Position: ${formData.position}\n\n📋 Please provide these login credentials to the employee.`;
      alert(message);
      
      console.log('🎉 New Employee Created:', {
        name: formData.fullName,
        email: formData.email,
        password: tempPassword,
        department: formData.department,
        position: formData.position
      });

      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Failed to create employee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Create New Employee</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>
      <div className="p-6">

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building className="w-4 h-4 inline mr-1" />
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Hire Date
            </label>
            <input
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Creating...' : 'Create Employee'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}