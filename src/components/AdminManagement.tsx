import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, Trash2, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminSignup } from './AdminSignup';

interface Admin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
  account_status: string;
  created_at: string;
  last_login_at?: string;
}

export function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .in('role', ['Admin', 'Manager'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin account?')) return;

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Failed to delete admin account');
    }
  };

  if (showCreateModal) {
    return <AdminSignup onBack={() => { setShowCreateModal(false); loadAdmins(); }} currentAdminId="current-admin" />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Management</h2>
          <p className="text-gray-600 mt-1">Manage administrator accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create Admin</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Administrator Accounts ({admins.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {admins.map((admin) => (
            <div key={admin.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{admin.full_name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{admin.email}</span>
                      <span>•</span>
                      <span>{admin.role}</span>
                      <span>•</span>
                      <span>{admin.department}</span>
                    </div>
                    {admin.last_login_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last login: {new Date(admin.last_login_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    admin.account_status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {admin.account_status}
                  </span>
                  
                  <button
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Admin"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {admins.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No administrators found</h3>
              <p className="text-gray-600 mb-4">Create the first admin account to get started.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create First Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}