import React from 'react';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Shield,
  Calendar,
  MapPin,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  Activity
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function AdminSidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: AdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Real-Time Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employee Management', icon: Users },
    { id: 'verification-trigger', label: 'Random Verification', icon: AlertCircle },
    { id: 'map-view', label: 'Map View', icon: MapPin },
    { id: 'reports', label: 'Advanced Reports', icon: FileText },
    { id: 'location-heatmap', label: 'Location Heatmap', icon: MapPin },
    { id: 'predictive', label: 'Predictive Analytics', icon: TrendingUp },
    { id: 'manager', label: 'Manager Dashboard', icon: Users },
    { id: 'multi-location', label: 'Multi-Location', icon: MapPin },
    { id: 'security', label: 'Security Center', icon: Shield },
    { id: 'monitoring', label: 'System Monitoring', icon: Activity },
    { id: 'analytics', label: 'Advanced Analytics', icon: BarChart3 },
    { id: 'fraud-detection', label: 'Fraud Detection', icon: Shield },
    { id: 'attendance', label: 'Attendance Overview', icon: Calendar },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">Admin Panel</span>
              <p className="text-xs text-gray-500">Management Console</p>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Security Status</span>
            </div>
            <p className="text-xs text-red-600">All systems monitored</p>
            <div className="mt-2 flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-600">Active monitoring</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}