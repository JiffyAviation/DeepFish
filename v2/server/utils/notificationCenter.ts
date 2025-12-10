/**
 * Notification Center
 * Building-wide alert system for system messages
 */

import { logger } from './logger.js';

export type NotificationPriority = 'info' | 'warning' | 'urgent';
export type NotificationType = 'maintenance' | 'update' | 'alert' | 'announcement';

export interface Notification {
    id: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    component?: string;
    scheduledTime?: Date;
    duration?: number; // minutes
    timestamp: Date;
}

export class NotificationCenter {
    private notifications: Notification[] = [];
    private subscribers: Array<(notification: Notification) => void> = [];

    /**
     * Broadcast system-wide notification
     */
    broadcast(notification: Omit<Notification, 'id' | 'timestamp'>): void {
        const fullNotification: Notification = {
            ...notification,
            id: this.generateId(),
            timestamp: new Date()
        };

        this.notifications.push(fullNotification);

        // Log based on priority
        const emoji = this.getEmoji(notification.priority);
        logger.info(`${emoji} [Notification] ${notification.title}`);
        logger.info(`   ${notification.message}`);

        // Notify all subscribers
        for (const subscriber of this.subscribers) {
            subscriber(fullNotification);
        }

        // Keep only last 100 notifications
        if (this.notifications.length > 100) {
            this.notifications = this.notifications.slice(-100);
        }
    }

    /**
     * Schedule maintenance notification
     */
    scheduleMaintenance(component: string, startTime: Date, durationMinutes: number): void {
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        this.broadcast({
            type: 'maintenance',
            priority: 'warning',
            title: `${component} Maintenance Scheduled`,
            message: `${component} will be closed for cleaning from ${this.formatTime(startTime)} to ${this.formatTime(endTime)} today.`,
            component,
            scheduledTime: startTime,
            duration: durationMinutes
        });
    }

    /**
     * Component update notification
     */
    componentUpdate(component: string, version: string, impact: 'none' | 'brief' | 'extended'): void {
        const impactMsg = impact === 'none'
            ? 'No service interruption expected.'
            : impact === 'brief'
                ? 'Brief service interruption (< 1 minute).'
                : 'Extended maintenance window.';

        this.broadcast({
            type: 'update',
            priority: impact === 'none' ? 'info' : 'warning',
            title: `${component} Updated`,
            message: `${component} has been updated to version ${version}. ${impactMsg}`,
            component
        });
    }

    /**
     * Emergency alert
     */
    emergency(component: string, message: string): void {
        this.broadcast({
            type: 'alert',
            priority: 'urgent',
            title: `⚠️ ${component} Alert`,
            message,
            component
        });
    }

    /**
     * General announcement
     */
    announce(title: string, message: string): void {
        this.broadcast({
            type: 'announcement',
            priority: 'info',
            title,
            message
        });
    }

    /**
     * Subscribe to notifications
     */
    subscribe(callback: (notification: Notification) => void): () => void {
        this.subscribers.push(callback);

        // Return unsubscribe function
        return () => {
            const index = this.subscribers.indexOf(callback);
            if (index > -1) {
                this.subscribers.splice(index, 1);
            }
        };
    }

    /**
     * Get recent notifications
     */
    getRecent(limit: number = 10): Notification[] {
        return this.notifications.slice(-limit);
    }

    /**
     * Get active maintenance windows
     */
    getActiveMaintenance(): Notification[] {
        const now = new Date();
        return this.notifications.filter(n => {
            if (n.type !== 'maintenance' || !n.scheduledTime || !n.duration) return false;
            const endTime = new Date(n.scheduledTime.getTime() + n.duration * 60000);
            return n.scheduledTime <= now && now <= endTime;
        });
    }

    private generateId(): string {
        return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private formatTime(date: Date): string {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    private getEmoji(priority: NotificationPriority): string {
        switch (priority) {
            case 'urgent': return '🚨';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
        }
    }
}

// Global notification center
export const notificationCenter = new NotificationCenter();
