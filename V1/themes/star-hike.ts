/**
 * Starfleet LCARS Theme for DeepFish AI Studio
 * Inspired by Star Trek: The Next Generation interface design
 */

export const StarfleetTheme = {
    name: 'Starfleet LCARS',

    // LCARS Color Palette
    colors: {
        // Primary LCARS colors
        orange: '#FF9966',      // LCARS Orange (primary accent)
        blue: '#9999FF',        // LCARS Blue (secondary)
        purple: '#CC99CC',      // LCARS Purple (tertiary)
        red: '#CC6666',         // LCARS Red (alerts)
        peach: '#FFCC99',       // LCARS Peach (highlights)

        // Background colors
        black: '#000000',       // Deep space black
        darkGray: '#1A1A1A',    // Panel background
        mediumGray: '#333333',  // Secondary panels

        // Text colors
        textPrimary: '#FF9966', // Orange text
        textSecondary: '#9999FF', // Blue text
        textMuted: '#666666',   // Muted text

        // Status colors
        online: '#99CC99',      // Green (operational)
        offline: '#CC6666',     // Red (offline)
        standby: '#FFCC99',     // Peach (standby)
    },

    // Typography
    fonts: {
        primary: '"Antonio", "Helvetica Neue", Arial, sans-serif', // LCARS-style font
        mono: '"Courier New", monospace',
        display: '"Antonio", sans-serif',
    },

    // Border radius (LCARS uses rounded corners)
    borderRadius: {
        small: '20px',
        medium: '30px',
        large: '40px',
        pill: '999px',
    },

    // Spacing
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
    },
};

// Agent rank assignments (Starfleet hierarchy)
export const AgentRanks = {
    oracle: { rank: 'Admiral', division: 'Command', color: '#FF9966' },
    mei: { rank: 'Captain', division: 'Command', color: '#FF9966' },
    vesper: { rank: 'Commander', division: 'Operations', color: '#FFCC99' },
    skillz: { rank: 'Lieutenant Commander', division: 'Engineering', color: '#FFCC99' },
    hanna: { rank: 'Lieutenant', division: 'Sciences', color: '#9999FF' },
    it: { rank: 'Chief Engineer', division: 'Engineering', color: '#FFCC99' },
    hr: { rank: 'Counselor', division: 'Medical', color: '#9999FF' },
};

// Starfleet sound effects (optional)
export const StarfleetSounds = {
    buttonClick: 'lcars-beep.mp3',
    alert: 'red-alert.mp3',
    notification: 'chirp.mp3',
    startup: 'computer-working.mp3',
};

// LCARS panel styles
export const LCARSPanelStyles = {
    header: {
        background: 'linear-gradient(90deg, #FF9966 0%, #FFCC99 100%)',
        borderRadius: '40px 40px 0 0',
        padding: '20px 40px',
        color: '#000000',
        fontWeight: 'bold',
        fontSize: '24px',
    },

    sidebar: {
        background: '#1A1A1A',
        borderRight: '4px solid #FF9966',
        borderRadius: '0 40px 40px 0',
    },

    button: {
        background: '#FF9966',
        color: '#000000',
        border: 'none',
        borderRadius: '20px',
        padding: '12px 24px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            background: '#FFCC99',
            transform: 'scale(1.05)',
        },
    },

    panel: {
        background: '#1A1A1A',
        border: '2px solid #FF9966',
        borderRadius: '30px',
        padding: '20px',
    },

    statusBar: {
        background: 'linear-gradient(90deg, #9999FF 0%, #CC99CC 100%)',
        borderRadius: '0 0 40px 40px',
        padding: '10px 40px',
        color: '#000000',
        fontSize: '14px',
        fontWeight: 'bold',
    },
};

// Agent status indicators (Starfleet style)
export const AgentStatusIndicators = {
    active: {
        color: '#99CC99',
        label: 'OPERATIONAL',
        icon: '●',
    },
    thinking: {
        color: '#FFCC99',
        label: 'PROCESSING',
        icon: '◐',
    },
    offline: {
        color: '#CC6666',
        label: 'OFFLINE',
        icon: '○',
    },
};

// Stardate calculator (for fun!)
export const calculateStardate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const dayOfYear = Math.floor((now.getTime() - new Date(year, 0, 0).getTime()) / 86400000);
    const stardate = ((year - 2323) * 1000) + (dayOfYear * 2.74);
    return stardate.toFixed(2);
};

// LCARS system messages
export const LCARSMessages = {
    startup: 'COMPUTER SYSTEMS ONLINE',
    agentActivated: (name: string) => `${name.toUpperCase()} STANDING BY`,
    taskComplete: 'OPERATION COMPLETE',
    error: 'WARNING: SYSTEM ANOMALY DETECTED',
    powerMode: 'ENGAGING AUXILIARY SYSTEMS',
};
