/**
 * Simple Logger
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
    log(level: LogLevel, message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

        if (data) {
            console.log(logEntry, data);
        } else {
            console.log(logEntry);
        }
    }

    debug(message: string, data?: any) {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, data);
        }
    }

    info(message: string, data?: any) {
        this.log('info', message, data);
    }

    warn(message: string, data?: any) {
        this.log('warn', message, data);
    }

    error(message: string, data?: any) {
        this.log('error', message, data);
    }
}

export const logger = new Logger();
