/**
 * FILE: context/NotificationContext.jsx
 *
 * PURPOSE:
 * In-app notification bell state — payment/subscription reminders and crisis alerts.
 *
 * RESPONSIBILITIES:
 * - Fetch subscriptions from API for reminder generation
 * - Merge expense + subscription + crisis notifications
 * - Handle dismissals (localStorage) and optional browser Notification API
 *
 * DEPENDENCIES:
 * - FinanceContext (expenses, crisis)
 * - utils/notifications.js, services/subscriptions.js
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useFinance } from './FinanceContext';

import { buildAllNotifications } from '../utils/notifications';

import { dismissNotification, clearDismissedNotifications } from '../utils/localData';

import * as subscriptionsApi from '../services/subscriptions';



const NotificationContext = createContext(null);



function maybeShowBrowserNotification(notifications) {

  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission !== 'granted') return;

  if (!notifications.length) return;



  const top = notifications[0];

  try {

    new Notification(`FlexiBudget · ${top.title}`, {

      body: top.message,

      tag: top.id,

    });

  } catch {

    /* ignore */

  }

}



export function NotificationProvider({ children }) {

  const { view } = useFinance();

  const [tick, setTick] = useState(0);

  const [lastBrowserId, setLastBrowserId] = useState(null);

  const [subscriptions, setSubscriptions] = useState([]);



  useEffect(() => {

    const onStorage = (e) => {

      if (e.key?.startsWith('flexibudget_')) setTick((t) => t + 1);

    };

    window.addEventListener('storage', onStorage);

    const interval = setInterval(() => setTick((t) => t + 1), 60 * 60 * 1000);

    const onFocus = () => setTick((t) => t + 1);

    window.addEventListener('focus', onFocus);

    window.addEventListener('flexibudget-storage', onFocus);

    return () => {

      window.removeEventListener('storage', onStorage);

      window.removeEventListener('focus', onFocus);

      window.removeEventListener('flexibudget-storage', onFocus);

      clearInterval(interval);

    };

  }, []);



  useEffect(() => {

    let cancelled = false;

    subscriptionsApi.listSubscriptions()

      .then((items) => { if (!cancelled) setSubscriptions(items); })

      .catch(() => { if (!cancelled) setSubscriptions([]); });

    return () => { cancelled = true; };

  }, [tick]);



  const notifications = useMemo(() => {

    void tick;

    return buildAllNotifications(view?.expenses || [], view?.crisis, subscriptions);

  }, [view?.expenses, view?.crisis, subscriptions, tick]);



  useEffect(() => {

    if (!notifications.length) return;

    const firstId = notifications[0].id;

    if (firstId === lastBrowserId) return;

    setLastBrowserId(firstId);

    maybeShowBrowserNotification(notifications);

  }, [notifications, lastBrowserId]);



  const dismiss = useCallback((id) => {

    dismissNotification(id);

    setTick((t) => t + 1);

  }, []);



  const dismissAll = useCallback(() => {

    notifications.forEach((n) => dismissNotification(n.id));

    setTick((t) => t + 1);

  }, [notifications]);



  const resetDismissed = useCallback(() => {

    clearDismissedNotifications();

    setTick((t) => t + 1);

  }, []);



  const requestBrowserPermission = useCallback(async () => {

    if (!('Notification' in window)) return 'unsupported';

    const result = await Notification.requestPermission();

    return result;

  }, []);



  return (

    <NotificationContext.Provider

      value={{

        notifications,

        unreadCount: notifications.length,

        dismiss,

        dismissAll,

        resetDismissed,

        requestBrowserPermission,

      }}

    >

      {children}

    </NotificationContext.Provider>

  );

}



export function useNotifications() {

  const ctx = useContext(NotificationContext);

  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');

  return ctx;

}

