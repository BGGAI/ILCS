// Debug configuration
const CONFIG = {
    DEBUG: true,
    POLL_INTERVAL: 500,
    MAX_RETRIES: 60,
    MUTATION_CONFIG: {
        childList: true,
        subtree: true,
        attributes: true
    }
};

// Debug logging with timestamp
function debug(...args) {
    if (CONFIG.DEBUG) {
        const timestamp = new Date().toISOString();
        console.log(`[ILCS Content ${timestamp}]`, ...args);
        // Force log to background script
        chrome.runtime.sendMessage({
            type: 'DEBUG_LOG',
            timestamp,
            args: args.map(arg => String(arg))
        }).catch(err => console.error('[ILCS Content] Failed to send debug log:', err));
    }
}

// Initialize content script
function initializeContentScript() {
    debug('Content script initialization started');
    debug('Document readyState:', document.readyState);
    debug('URL:', window.location.href);
    debug('Is iframe:', window.self !== window.top);

    // Connect to background script
    const port = chrome.runtime.connect({ name: 'content-script' });
    port.onDisconnect.addListener(() => {
        debug('Disconnected from background script');
    });
    port.postMessage({ type: 'INIT', url: window.location.href });

    // Set up mutation observer for dynamic content
    const observer = new MutationObserver((mutations) => {
        debug('DOM mutation detected:', mutations.length, 'changes');
        const elements = checkForChatInterface();
        port.postMessage({ type: 'ELEMENTS_UPDATE', elements });
    });

    // Start observing
    observer.observe(document.body, CONFIG.MUTATION_CONFIG);
    debug('Mutation observer started');

    // Initial check
    const elements = checkForChatInterface();
    port.postMessage({ type: 'ELEMENTS_UPDATE', elements });
}

// Check for chat interface elements
function checkForChatInterface() {
    debug('Checking for chat interface elements');
    const elements = {
        chatContainer: document.querySelector('.chat-container, .message-container, [class*="chat"], [class*="message"]')?.outerHTML,
        textarea: document.querySelector('textarea, [contenteditable="true"]')?.outerHTML,
        sendButton: document.querySelector('button, [class*="send"], [role="button"]')?.outerHTML
    };

    debug('Found elements:', elements);
    return elements;
}

// Initialize on various document states
['DOMContentLoaded', 'load'].forEach(event => {
    document.addEventListener(event, () => {
        debug(`Initializing on ${event} event`);
        initializeContentScript();
    });
});

// Initialize immediately if document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    debug('Initializing immediately - document already loaded');
    initializeContentScript();
}

// Alert background script that content script is loaded
chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_LOADED' });
