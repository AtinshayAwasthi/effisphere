import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useEmployeeStore } from '../store/employeeStore';
import { supabase } from '../lib/supabase';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  completion_percentage: number;
}

export function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [productivityScore, setProductivityScore] = useState(0);
  const { currentUser } = useEmployeeStore();

  useEffect(() => {
    if (currentUser) {
      loadTasks();
      loadProductivityScore();
    }
  }, [currentUser]);

  const loadTasks = async () => {
    if (!currentUser) return;

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('employee_id', currentUser.id)
      .order('due_date', { ascending: true });

    if (data) setTasks(data);
  };

  const loadProductivityScore = async () => {
    if (!currentUser) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('productivity_metrics')
      .select('productivity_score')
      .eq('employee_id', currentUser.id)
      .eq('date', today)
      .maybeSingle();

    if (data) setProductivityScore(data.productivity_score);
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    await supabase
      .from('tasks')
      .update({
        status: newStatus,
        completed_at: completedAt,
        completion_percentage: newStatus === 'completed' ? 100 : newStatus === 'in_progress' ? 50 : 0
      })
      .eq('id', taskId);

    loadTasks();
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100">Total Tasks</p>
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-4xl font-bold">{tasks.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100">Completed</p>
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-4xl font-bold">{completedTasks.length}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-amber-100">In Progress</p>
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-4xl font-bold">{inProgressTasks.length}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100">Productivity</p>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-4xl font-bold">{productivityScore.toFixed(0)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
            To Do ({todoTasks.length})
          </h3>
          <div className="space-y-3">
            {todoTasks.map(task => (
              <div key={task.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-sm text-gray-900">{task.title}</p>
                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{task.priority}</span>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Start
                  </button>
                </div>
              </div>
            ))}
            {todoTasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No tasks to do</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            In Progress ({inProgressTasks.length})
          </h3>
          <div className="space-y-3">
            {inProgressTasks.map(task => (
              <div key={task.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-sm text-gray-900">{task.title}</p>
                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-blue-700">{task.completion_percentage}%</div>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'completed')}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    Complete
                  </button>
                </div>
              </div>
            ))}
            {inProgressTasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No tasks in progress</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.slice(0, 5).map(task => (
              <div key={task.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-medium text-sm text-gray-900">{task.title}</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-xs text-green-700">Done</span>
                </div>
              </div>
            ))}
            {completedTasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No completed tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
