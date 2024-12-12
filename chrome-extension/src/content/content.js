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

// Debug logging
function debug(...args) {
    if (CONFIG.DEBUG) {
        console.log('[ILCS Content]', ...args);
    }
}

// Initialize content script
function initializeContentScript() {
    debug('Content script initialization started');
    debug('Document readyState:', document.readyState);
    debug('URL:', window.location.href);
    debug('Is iframe:', window.self !== window.top);

    // Set up mutation observer for dynamic content
    const observer = new MutationObserver((mutations) => {
        debug('DOM mutation detected:', mutations.length, 'changes');
        checkForChatInterface();
    });

    // Start observing
    observer.observe(document.body, CONFIG.MUTATION_CONFIG);
    debug('Mutation observer started');

    // Initial check
    checkForChatInterface();
}

// Check for chat interface elements
function checkForChatInterface() {
    debug('Checking for chat interface elements');
    const elements = {
        chatContainer: document.querySelector('.chat-container, .message-container, [class*="chat"], [class*="message"]'),
        textarea: document.querySelector('textarea, [contenteditable="true"]'),
        sendButton: document.querySelector('button, [class*="send"], [role="button"]')
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
