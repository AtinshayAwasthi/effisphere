interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

class NotificationService {
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private notifications: Notification[] = [];

  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    this.notifications = [newNotification, ...this.notifications.slice(0, 4)];
    this.notifyListeners();
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(newNotification.id);
    }, 5000);
  }

  removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Convenience methods
  success(title: string, message: string) {
    this.addNotification({ type: 'success', title, message });
  }

  error(title: string, message: string) {
    this.addNotification({ type: 'error', title, message });
  }

  warning(title: string, message: string) {
    this.addNotification({ type: 'warning', title, message });
  }

  info(title: string, message: string) {
    this.addNotification({ type: 'info', title, message });
  }
}

export const notificationService = new NotificationService();