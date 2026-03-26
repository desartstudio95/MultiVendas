import { useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { Notification, UserProfile } from '../types';
import { MessageCircle, Package, Bell } from 'lucide-react';
import React from 'react';

export default function NotificationListener({ userProfile }: { userProfile: UserProfile | null }) {
  useEffect(() => {
    if (!userProfile) return;

    // Listen for notifications for the current user
    const notificationUserIds = [userProfile.uid];
    if (userProfile.role === 'admin' || userProfile.email === 'isacruimugabe@gmail.com') {
      notificationUserIds.push('admin');
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', notificationUserIds),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notification = { id: change.doc.id, ...change.doc.data() } as Notification;
          
          // Show toast for new unread notifications
          toast.success(notification.title, {
            description: notification.message,
            duration: 5000,
            icon: notification.type === 'message' ? <MessageCircle className="w-5 h-5 text-blue-500" /> : 
                  notification.type === 'order' ? <Package className="w-5 h-5 text-green-500" /> : 
                  <Bell className="w-5 h-5 text-purple-500" />,
            action: {
              label: 'Lida',
              onClick: () => markAsRead(notification.id)
            }
          });
        }
      });
    }, (error) => {
      console.error("Notification listener error:", error);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return null;
}
