import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AdminSidebar } from './components/AdminSidebar';
import { Dashboard } from './components/Dashboard';
import { TimeTracking } from './components/TimeTracking';
import { AttendanceCalendar } from './components/AttendanceCalendar';
import { Analytics } from './components/Analytics';
import { AdminAnalytics } from './components/AdminAnalytics';
import { EmployeeList } from './components/EmployeeList';
import { BiometricVerification } from './components/BiometricVerification';
import { EmployeeManagement } from './components/EmployeeManagement';
import { LoginScreen } from './components/LoginScreen';
import { EmployeeLoginForm } from './components/EmployeeLoginForm';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { SystemSettings } from './components/SystemSettings';
import { GeolocationTracker } from './components/GeolocationTracker';
import { GeolocationAttendance } from './components/GeolocationAttendance';
import { LocationHeatmap } from './components/LocationHeatmap';
import { ProductivityDashboard } from './components/ProductivityDashboard';
import { FraudDetection } from './components/FraudDetection';
import { RandomVerification } from './components/RandomVerification';
import { TaskManagement } from './components/TaskManagement';
import { AdminReports } from './components/AdminReports';
import { AdminVerificationTrigger } from './components/AdminVerificationTrigger';
import { EnhancedAdminDashboard } from './components/EnhancedAdminDashboard';
import { MapView } from './components/MapView';
import { AttendanceReport } from './components/AttendanceReport';
import { AdvancedReports } from './components/AdvancedReports';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { ManagerDashboard } from './components/ManagerDashboard';
import { MultiLocationManager } from './components/MultiLocationManager';
import { SecurityCenter } from './components/SecurityCenter';
import { SystemMonitoring } from './components/SystemMonitoring';
import { NotificationCenter } from './components/NotificationCenter';
import { useEmployeeStore } from './store/employeeStore';
import { authService } from './lib/auth';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showEmployeeLogin, setShowEmployeeLogin] = useState(false);
  const { currentUser, userRole, setCurrentUser, setUserRole } = useEmployeeStore();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const isValid = await authService.validateSession();
      if (isValid) {
        const user = authService.getCurrentUser();
        if (user) {
          setCurrentUser({
            id: user.employee?.id || user.id,
            name: user.employee?.full_name || 'Admin User',
            email: user.email,
            role: user.role,
            department: user.employee?.department || 'Administration',
            avatar: ''
          });
          setUserRole(user.role);
          setIsLoggedIn(true);
        }
      }
    };
    
    checkSession();
  }, []);

  const renderEmployeeContent = () => {
    return (
      <>
        <EmployeeDashboard 
          onLogout={async () => {
            await authService.logout();
            setIsLoggedIn(false);
          }}
        />
        <NotificationCenter />
      </>
    );
  };

  const renderAdminContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <EnhancedAdminDashboard />;
      case 'employees':
        return <EmployeeManagement />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'fraud-detection':
        return <FraudDetection />;
      case 'attendance':
        return <AttendanceCalendar />;
      case 'settings':
        return <SystemSettings />;
      case 'location-heatmap':
        return <LocationHeatmap />;
      case 'productivity':
        return <ProductivityDashboard />;
      case 'reports':
        return <AdvancedReports />;
      case 'predictive':
        return <PredictiveAnalytics />;
      case 'manager':
        return <ManagerDashboard />;
      case 'multi-location':
        return <MultiLocationManager />;
      case 'security':
        return <SecurityCenter />;
      case 'monitoring':
        return <SystemMonitoring />;
      case 'verification-trigger':
        return <AdminVerificationTrigger />;
      case 'map-view':
        return <MapView />;
      default:
        return <EnhancedAdminDashboard />;
    }
  };

  if (!isLoggedIn) {
    if (showEmployeeLogin) {
      return (
        <EmployeeLoginForm 
          onSuccess={() => {
            setIsLoggedIn(true);
            setShowEmployeeLogin(false);
          }}
        />
      );
    }
    return (
      <LoginScreen 
        onLogin={setIsLoggedIn} 
        onEmployeeLogin={() => setShowEmployeeLogin(true)}
      />
    );
  }

  const isAdmin = userRole === 'admin';
  const isEmployee = userRole === 'employee';

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <Header onLogout={async () => {
            await authService.logout();
            setIsLoggedIn(false);
          }} />
          
          <main className="flex-1 p-6">
            {renderAdminContent()}
          </main>
        </div>
        <NotificationCenter />
      </div>
    );
  }

  if (isEmployee) {
    return renderEmployeeContent();
  }

  // Fallback for unknown roles
  return renderEmployeeContent();
}

export default App;