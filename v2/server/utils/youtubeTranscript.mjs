/**
 * YouTube Transcript Reader - Using youtube-transcript.io service
 * Simple, reliable API for fetching YouTube transcripts
 */

import { logger } from './logger.js';

/**
 * Extract video ID from any YouTube URL format
 */
function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

/**
 * Get YouTube transcript using youtube-transcript.io API
 */
export async function getYouTubeTranscript(urlOrId: string): Promise<string> {
    const videoId = extractVideoId(urlOrId);

    if (!videoId) {
        throw new Error('Invalid YouTube URL or video ID');
    }

    try {
        // Use youtube-transcript.io API
        const apiUrl = `https://www.youtube-transcript.io/api/transcript?videoId=${videoId}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.transcript || data.transcript.length === 0) {
            throw new Error('No transcript available for this video');
        }

        // Combine all transcript segments
        const fullText = data.transcript
            .map((segment: any) => segment.text)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

        logger.info(`[YouTube] Fetched transcript for ${videoId} (${fullText.length} chars)`);

        return fullText;

    } catch (error) {
        logger.error(`[YouTube] Error fetching transcript for ${videoId}:`, error);
        throw new Error(`YouTube transcript error: ${(error as Error).message}`);
    }
}

/**
 * Check if transcript is available for a video
 */
export async function hasTranscript(urlOrId: string): Promise<boolean> {
    try {
        await getYouTubeTranscript(urlOrId);
        return true;
    } catch {
        return false;
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const urlOrId = process.argv[2];

    if (!urlOrId) {
        console.log('Usage: node youtubeTranscript.mjs <youtube-url-or-id>');
        console.log('Example: node youtubeTranscript.mjs xNcEgqzlPqs');
        process.exit(1);
    }

    getYouTubeTranscript(urlOrId)
        .then(transcript => {
            console.log('=== TRANSCRIPT ===');
            console.log(transcript);
            console.log('\n=== END ===');
            console.log(`\nLength: ${transcript.length} characters`);
        })
        .catch(err => {
            console.error('❌ Error:', err.message);
            process.exit(1);
        });
}
