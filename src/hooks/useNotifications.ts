import { useState, useEffect, useCallback } from 'react';
import { Measurement } from '../types';

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
    const [permission, setPermission] = useState<NotificationPermission>(
        'Notification' in window ? Notification.permission : 'denied'
    );

    // Save settings when they change
    const updateSettings = useCallback((newSettings: NotificationSettings) => {
        setSettings(newSettings);
        localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
    }, []);

    // Request notification permission
    const requestPermission = useCallback(async () => {
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
            const currentDay = now.getDay();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const today = now.toDateString();
            const lastNotif = getLastNotification();

            console.log(`[Medidas] Verificando lembretes: Hoje=${currentDay}, Hora=${currentTime}, ConfigPeso=${settings.weightReminderDay}@${settings.weightReminderTime}, ConfigMedida=${settings.measurementReminderDay}@${settings.measurementReminderTime}`);

            // Check weight reminder
            if (currentDay === settings.weightReminderDay && currentTime >= settings.weightReminderTime) {
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
            if (currentDay === settings.measurementReminderDay && currentTime >= settings.measurementReminderTime) {
                // If weight reminder was just sent, the lastNotif object in memory might be stale for deep properties
                // but since we use separate keys and tags, it's fine.
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

        // Check every minute
        const interval = setInterval(checkNotifications, 60 * 1000);

        return () => clearInterval(interval);
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
