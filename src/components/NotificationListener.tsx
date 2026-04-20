import { useEffect } from 'react';
import { toast } from 'sonner';
import { Notification, UserProfile } from '../types';
import { MessageCircle, Package, Bell } from 'lucide-react';
import React from 'react';

export default function NotificationListener({ userProfile }: { userProfile: UserProfile | null }) {
  useEffect(() => {
    if (!userProfile) return;
    
    // Notifications are disabled without Firebase
    console.log("Notification listener disabled (no Firebase)");
  }, [userProfile]);

  return null;
}
