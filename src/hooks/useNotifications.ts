import { useState, useEffect, useCallback } from 'react';
import { Measurement } from '../types';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Keys for localStorage
const NOTIFICATION_SETTINGS_KEY = 'medidas_notification_settings';
const LAST_NOTIFICATION_KEY = 'medidas_last_notification';

export interface NotificationSettings {
    enabled: boolean;
    weightReminderDay: number; // 0=Sunday, 1=Monday, ... 6=Saturday
    weightReminderTime: string; // HH:mm format
    measurementReminderDay: number; // Day of the week for measurement reminder
    measurementReminderTime: string; // HH:mm format
}

interface LastNotification {
    weight: string | null; // ISO date string of last weight notification
    measurement: string | null; // ISO date string of last measurement notification
}

const DEFAULT_SETTINGS: NotificationSettings = {
    enabled: false,
    weightReminderDay: 1, // Monday
    weightReminderTime: '08:00',
    measurementReminderDay: 4, // Thursday
    measurementReminderTime: '08:00',
};

function getSettings(): NotificationSettings {
    const saved = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
}

function getLastNotification(): LastNotification {
    const saved = localStorage.getItem(LAST_NOTIFICATION_KEY);
    return saved ? JSON.parse(saved) : { weight: null, measurement: null };
}

function saveLastNotification(data: LastNotification) {
    localStorage.setItem(LAST_NOTIFICATION_KEY, JSON.stringify(data));
}

// Check if a measurement with body measurements (not just weight) exists in the last 14 days
function hasMeasurementsInLastTwoWeeks(measurements: Measurement[]): boolean {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    return measurements.some(m => {
        const mDate = new Date(m.date);
        if (mDate < fourteenDaysAgo) return false;
        // Check if it has any body measurement (not just weight)
        return !!(m.chest || m.waist || m.hips || m.leftArm || m.rightArm || m.leftThigh || m.rightThigh || m.calves);
    });
}

// Count how many days this week have measurements with body data
function measurementDaysThisWeek(measurements: Measurement[]): number {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const daysSet = new Set<string>();
    measurements.forEach(m => {
        const mDate = new Date(m.date);
        if (mDate >= startOfWeek) {
            if (m.chest || m.waist || m.hips || m.leftArm || m.rightArm || m.leftThigh || m.rightThigh || m.calves) {
                daysSet.add(mDate.toDateString());
            }
        }
    });
    return daysSet.size;
}

// Check if weight was measured this week
function hasWeightThisWeek(measurements: Measurement[]): boolean {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return measurements.some(m => {
        const mDate = new Date(m.date);
        return mDate >= startOfWeek && m.weight;
    });
}

async function showNotification(title: string, body: string, tag: string) {
    if (Capacitor.isNativePlatform()) {
        await LocalNotifications.schedule({
            notifications: [
                {
                    title,
                    body,
                    id: Math.floor(Math.random() * 1000000),
                    schedule: { at: new Date(Date.now() + 1000) },
                    channelId: 'medidas-reminders'
                }
            ]
        });
        return;
    }

    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
            body,
            icon: '/icon.svg',
            badge: '/badge.png',
            requireInteraction: true,
            data: { url: '/' },
        } as NotificationOptions);
    } else if ('Notification' in window) {
        new Notification(title, { body, icon: '/icon.svg' });
    }
}

export function useNotifications(measurements: Measurement[]) {
    const [settings, setSettings] = useState<NotificationSettings>(getSettings);
    const [permission, setPermission] = useState<NotificationPermission>(() => {
        if (Capacitor.isNativePlatform()) {
            return 'default';
        }
        return 'Notification' in window ? Notification.permission : 'denied';
    });

    // Create channel and sync permissions on mount for Native Platforms
    useEffect(() => {
        const syncNativeAndPermission = async () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    // Create high-priority notification channel for Android
                    await LocalNotifications.createChannel({
                        id: 'medidas-reminders',
                        name: 'Lembretes de Medidas',
                        description: 'Notificações de lembrete para registrar peso e medidas corporais',
                        importance: 5,
                        visibility: 1,
                        vibration: true,
                        lights: true,
                    });

                    const status = await LocalNotifications.checkPermissions();
                    const result = status.display === 'granted' ? 'granted' : 
                                   status.display === 'denied' ? 'denied' : 'default';
                    setPermission(result as NotificationPermission);
                } catch (e) {
                    console.error('Error syncing native permissions/channels:', e);
                }
            } else if ('Notification' in window) {
                setPermission(Notification.permission);
            }
        };
        syncNativeAndPermission();
    }, []);

    // Save settings when they change
    const updateSettings = useCallback((newSettings: NotificationSettings) => {
        setSettings(newSettings);
        localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
    }, []);

    // Request notification permission
    const requestPermission = useCallback(async () => {
        if (Capacitor.isNativePlatform()) {
            const permStatus = await LocalNotifications.requestPermissions();
            const result = permStatus.display === 'granted' ? 'granted' : 'denied';
            setPermission(result as NotificationPermission);
            return result as NotificationPermission;
        }

        if (!('Notification' in window)) {
            return 'denied' as NotificationPermission;
        }
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
    }, []);

    // Enable notifications (request permission + turn on)
    const enableNotifications = useCallback(async () => {
        const perm = await requestPermission();
        if (perm === 'granted') {
            updateSettings({ ...settings, enabled: true });
            return true;
        }
        return false;
    }, [requestPermission, settings, updateSettings]);

    // Disable notifications
    const disableNotifications = useCallback(() => {
        updateSettings({ ...settings, enabled: false });
    }, [settings, updateSettings]);

    // Test notification function
    const testNotification = useCallback(async () => {
        const perm = await requestPermission();
        if (perm === 'granted') {
            const time = new Date().toLocaleTimeString();
            showNotification(
                '🔔 Teste de Notificação',
                `Teste realizado às ${time}. Se você está vendo isso, as notificações estão funcionando!`,
                'test-' + Date.now()
            );
            return true;
        }
        return false;
    }, [requestPermission]);

    // Check and send notifications
    useEffect(() => {
        if (!settings.enabled || permission !== 'granted') return;

        const checkNotifications = () => {
            const now = new Date();
            const today = now.toDateString();
            const lastNotif = getLastNotification();

            const getReminderDate = (dayOfWk: number, timeStr: string) => {
                const d = new Date(now);
                const currentDay = d.getDay();
                const diff = dayOfWk - currentDay;
                d.setDate(d.getDate() + diff);
                const [hours, minutes] = timeStr.split(':').map(Number);
                d.setHours(hours, minutes, 0, 0);
                return d;
            };

            const weightReminderDate = getReminderDate(settings.weightReminderDay, settings.weightReminderTime);
            const measurementReminderDate = getReminderDate(settings.measurementReminderDay, settings.measurementReminderTime);

            console.log(`[Medidas] Verificando lembretes: Agora=${now.toISOString()}`);

            // Check weight reminder: if we are past the reminder time this week
            if (now >= weightReminderDate) {
                if (lastNotif.weight !== today && !hasWeightThisWeek(measurements)) {
                    console.log('[Medidas] Disparando lembrete de peso');
                    showNotification(
                        '⚖️ Hora de pesar!',
                        'Você ainda não registrou seu peso esta semana. Que tal medir agora?',
                        'weight-reminder'
                    );
                    lastNotif.weight = today;
                    saveLastNotification(lastNotif);
                }
            }

            // Check measurement reminders
            if (now >= measurementReminderDate) {
                if (lastNotif.measurement !== today && !hasMeasurementsInLastTwoWeeks(measurements)) {
                    console.log('[Medidas] Disparando lembrete de medidas');
                    showNotification(
                        '📏 Hora das medidas!',
                        `Você não registrou suas medidas corporais nas últimas 2 semanas. Que tal registrar agora?`,
                        'measurement-reminder'
                    );
                    lastNotif.measurement = today;
                    saveLastNotification(lastNotif);
                }
            }
        };

        // Check immediately
        checkNotifications();

        // Check when user brings app to foreground
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkNotifications();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Check every minute
        const interval = setInterval(checkNotifications, 60 * 1000);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [settings, permission, measurements]);

    // Register periodic sync if available (for background notifications)
    useEffect(() => {
        if (!settings.enabled || permission !== 'granted') return;

        const registerPeriodicSync = async () => {
            if ('serviceWorker' in navigator && 'periodicSync' in (await navigator.serviceWorker.ready as any)) {
                try {
                    const registration = await navigator.serviceWorker.ready as any;
                    await registration.periodicSync.register('check-reminders', {
                        minInterval: 60 * 60 * 1000, // 1 hour minimum
                    });
                } catch {
                    // Periodic sync not available, polling is the fallback
                }
            }
        };

        registerPeriodicSync();
    }, [settings.enabled, permission]);

    // Schedule native notifications
    useEffect(() => {
        const scheduleNative = async () => {
            if (!Capacitor.isNativePlatform()) return;
            
            const pending = await LocalNotifications.getPending();
            if (pending.notifications.length > 0) {
                await LocalNotifications.cancel(pending);
            }
            
            if (!settings.enabled || permission !== 'granted') return;
            
            const notifications = [];
            
            if (!hasWeightThisWeek(measurements)) {
                const [wHour, wMin] = settings.weightReminderTime.split(':').map(Number);
                const wDay = settings.weightReminderDay + 1; // Capacitor: 1=Sunday, 2=Monday
                notifications.push({
                    title: '⚖️ Hora de pesar!',
                    body: 'Você ainda não registrou seu peso esta semana. Que tal medir agora?',
                    id: 1,
                    schedule: { every: 'week', on: { weekday: wDay, hour: wHour, minute: wMin } },
                    channelId: 'medidas-reminders'
                });
            }
            
            if (!hasMeasurementsInLastTwoWeeks(measurements)) {
                const [mHour, mMin] = settings.measurementReminderTime.split(':').map(Number);
                const mDay = settings.measurementReminderDay + 1;
                notifications.push({
                    title: '📏 Hora das medidas!',
                    body: 'Você não registrou suas medidas corporais nas últimas 2 semanas. Que tal registrar agora?',
                    id: 2,
                    schedule: { every: 'week', on: { weekday: mDay, hour: mHour, minute: mMin } },
                    channelId: 'medidas-reminders'
                });
            }
            
            if (notifications.length > 0) {
                await LocalNotifications.schedule({ notifications });
            }
        };
        scheduleNative();
    }, [settings, permission, measurements]);

    return {
        settings,
        updateSettings,
        permission,
        requestPermission,
        enableNotifications,
        disableNotifications,
        testNotification,
        hasWeightThisWeek: hasWeightThisWeek(measurements),
        hasMeasurementsInLastTwoWeeks: hasMeasurementsInLastTwoWeeks(measurements),
    };
}
