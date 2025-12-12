// DeepFish Terminal - Natural Language Interface
// Simplified for direct natural language input (no commands)

class DeepFishTerminal {
    constructor() {
        this.output = document.getElementById('output');
        this.hiddenInput = document.getElementById('hidden-input');
        this.messageBuffer = '';

        this.init();
    }

    init() {
        // Hidden input for keyboard
        this.hiddenInput.addEventListener('input', (e) => this.handleInput(e));
        this.hiddenInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleSubmit();
            }
        });

        // Desktop keyboard support - auto-focus when typing
        document.addEventListener('keydown', (e) => {
            // Auto-focus input when user starts typing
            if (!this.hiddenInput.matches(':focus')) {
                // Only for printable characters
                if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                    this.hiddenInput.focus();
                }
            }
        });

        // Tap terminal to focus input
        document.querySelector('.terminal-box').addEventListener('click', () => {
            this.hiddenInput.focus();
        });

        // Auto-focus on load
        this.hiddenInput.focus();
    }

    handleInput(e) {
        this.messageBuffer = e.target.value;

        // Show typing in separate text element
        const inputTextEl = document.getElementById('input-text');
        if (inputTextEl) {
            inputTextEl.textContent = this.messageBuffer;
        }
    }

    async handleSubmit() {
        const message = this.messageBuffer.trim();

        if (!message) return;

        // Clear input
        this.hiddenInput.value = '';
        this.messageBuffer = '';
        const inputTextEl = document.getElementById('input-text');
        if (inputTextEl) inputTextEl.textContent = '';

        // Hide keyboard on mobile
        this.hiddenInput.blur();

        // Log user message
        this.addLine(`> ${message}`, 'prompt');

        // Process natural language message
        this.addLine('Processing...', 'dim');
        await this.sendMessage(message);
    }

    async sendMessage(message) {
        try {
            // Call Express API with natural language
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: message,
                    userId: 'web-user'
                    // No botId - let backend router determine which bot(s)
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            // Display response
            this.addLine('', ''); // Blank line
            this.addLine(data.text || 'Bot response received', 'bot-response');
            this.addLine('', ''); // Blank line
            this.addLine('> Ready', 'dim');
            this.addLine('', ''); // Blank line

        } catch (error) {
            console.error('API call failed:', error);
            this.addLine(`Error: ${error.message}`, 'error');
            this.addLine('Make sure the server is running (npm run start)', 'dim');
            this.addLine('', '');
        }

        // Re-focus input for next message
        this.hiddenInput.focus();
    }

    addLine(text, className = '') {
        const line = document.createElement('div');
        if (className) {
            line.className = className;
        }
        line.textContent = text;
        this.output.appendChild(line);

        // Auto-scroll to bottom
        this.output.scrollTop = this.output.scrollHeight;
    }
}

// Initialize terminal when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.terminal = new DeepFishTerminal();

    // Prevent zoom on double-tap (mobile)
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Prevent pull-to-refresh
    document.body.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
});

// Service Worker for PWA (optional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/terminal/sw.js').catch(() => {
        // Service worker registration failed, but app still works
    });
}
