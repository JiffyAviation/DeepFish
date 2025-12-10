/**
 * M*A*S*H Theme for DeepFish AI Studio
 * Inspired by 1970s military field hospital aesthetic
 * Olive drab, vintage, typewriter-style interface
 */

export const MASHTheme = {
    name: 'Field Hospital',

    // Military olive drab color palette
    colors: {
        // Primary colors
        oliveDrab: '#6B7C3C',      // Military olive
        khaki: '#C3B091',          // Khaki tan
        armyGreen: '#4B5320',      // Dark army green
        canvas: '#E8DCC4',         // Canvas tent color

        // Accent colors
        medicalRed: '#8B0000',     // Dark red (medical cross)
        signYellow: '#DAA520',     // Goldenrod (signage)
        rustBrown: '#8B4513',      // Rust/weathered metal

        // Backgrounds
        tentInterior: '#D4C5A9',   // Inside tent
        mudBrown: '#5C4033',       // Muddy ground
        paperWhite: '#F5F5DC',     // Aged paper

        // Text
        typewriter: '#2C2416',     // Dark brown (typewriter ink)
        faded: '#6B6B6B',          // Faded text
        stamp: '#8B0000',          // Rubber stamp red
    },

    // Typography (typewriter style)
    fonts: {
        primary: '"Courier Prime", "Courier New", monospace',
        display: '"Special Elite", "Courier New", monospace', // Typewriter font
        handwritten: '"Caveat", cursive',
    },

    // Vintage styling
    effects: {
        paperTexture: 'url(/textures/paper.png)',
        stampOverlay: 'url(/textures/stamp.png)',
        weathering: 'sepia(20%) contrast(90%)',
    },
};

// Agent assignments (M*A*S*H roles)
export const FieldHospitalRoles = {
    oracle: { role: 'Colonel', unit: 'Command', color: '#6B7C3C' },
    mei: { role: 'Chief Surgeon', unit: 'Medical', color: '#8B0000' },
    vesper: { role: 'Head Nurse', unit: 'Medical', color: '#C3B091' },
    skillz: { role: 'Corpsman', unit: 'Medical', color: '#4B5320' },
    hanna: { role: 'Morale Officer', unit: 'Recreation', color: '#DAA520' },
    it: { role: 'Supply Sergeant', unit: 'Logistics', color: '#8B4513' },
    hr: { role: 'Company Clerk', unit: 'Administration', color: '#6B7C3C' },
};

// Vintage UI messages
export const FieldHospitalMessages = {
    startup: '*** FIELD HOSPITAL SYSTEMS ONLINE ***',
    agentActivated: (name: string) => `${name.toUpperCase()} REPORTING FOR DUTY`,
    taskComplete: '*** OPERATION SUCCESSFUL ***',
    error: '*** ATTENTION: SYSTEM MALFUNCTION ***',
    powerMode: '*** CALLING IN REINFORCEMENTS ***',
};

// Typewriter sound effects
export const TypewriterSounds = {
    keyPress: 'typewriter-key.mp3',
    carriageReturn: 'typewriter-return.mp3',
    bell: 'typewriter-bell.mp3',
};

// Date format (military style)
export const formatMilitaryDate = (): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}${month}${year} ${hours}${minutes} HRS`;
};
