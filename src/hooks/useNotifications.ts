import { useState, useEffect } from 'react';
import { notificationService } from '../lib/notificationService';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  return {
    notifications,
    addNotification: notificationService.addNotification.bind(notificationService),
    removeNotification: notificationService.removeNotification.bind(notificationService)
  };
}