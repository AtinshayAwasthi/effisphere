import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Employee {
  id: string;
  full_name: string;
  status: string;
  updated_at: string;
}

export function useEmployeeStatus() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    // Load initial data
    loadEmployees();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('employee_status')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'employees' },
        (payload) => {
          setEmployees(prev => prev.map(emp => 
            emp.id === payload.new.id 
              ? { ...emp, status: payload.new.status, updated_at: payload.new.updated_at }
              : emp
          ));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadEmployees = async () => {
    const { data } = await supabase
      .from('employees')
      .select('id, full_name, status, updated_at');
    
    if (data) setEmployees(data);
  };

  const updateStatus = async (employeeId: string, status: string) => {
    const { error } = await supabase
      .from('employees')
      .update({ status })
      .eq('id', employeeId);
    
    return !error;
  };

  return { employees, updateStatus };
}