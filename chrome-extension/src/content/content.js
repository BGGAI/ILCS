// Debug logging configuration
const CONFIG = {
    DEBUG: true,
    POLL_INTERVAL: 500,
    MAX_RETRIES: 60,
    MUTATION_CONFIG: {
        childList: true,
        subtree: true,
        characterData: true
    }
};

// Debug logging function with timestamp
function debug(...args) {
    if (CONFIG.DEBUG) {
        const timestamp = new Date().toISOString();
        console.log(`[ILCS Debug ${timestamp}]`, ...args);
    }
}

// Immediately log that content script is loaded
console.log('[ILCS] Content script loaded at:', window.location.href);
debug('Content script initialized');

// Wait for chat interface to load
function waitForChatInterface() {
    debug('Waiting for chat interface...');
    let retryCount = 0;

    function pollForInterface() {
        debug(`Polling attempt ${retryCount + 1}/${CONFIG.MAX_RETRIES}`);

        // Check for any element that indicates chat interface is loaded
        const interfaceElements = {
            chatContainer: document.querySelector('.chat-container, .message-container, [class*="chat"], [class*="message"]'),
            textarea: document.querySelector('textarea, [contenteditable="true"]'),
            sendButton: document.querySelector('button, [class*="send"], [role="button"]')
        };

        const elementsFound = Object.entries(interfaceElements)
            .filter(([_, el]) => el !== null)
            .map(([name, _]) => name);

        if (elementsFound.length > 0) {
            debug('Found interface elements:', elementsFound);
            initializeMessageMonitoring();
            return;
        }

        retryCount++;
        if (retryCount < CONFIG.MAX_RETRIES) {
            setTimeout(pollForInterface, CONFIG.POLL_INTERVAL);
        } else {
            debug('Failed to find chat interface after max retries');
        }
    }

    // Start polling
    pollForInterface();
}

// Initialize message monitoring
function initializeMessageMonitoring() {
    debug('Initializing message monitoring');

    // Create mutation observer for dynamic content
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                checkForNewCustomerMessages(mutation.addedNodes);
            } else if (mutation.type === 'characterData') {
                checkForNewCustomerMessages([mutation.target.parentNode]);
            }
        }
    });

    // Find chat container using multiple strategies
    function findChatContainer() {
        debug('Attempting to find chat container...');
        const containers = document.querySelectorAll('*');
        const potentialContainers = Array.from(containers).filter(el => {
            try {
                const hasTimePattern = el.textContent && /\d{2}:\d{2}/.test(el.textContent);
                const hasMultipleChildren = el.children && el.children.length > 2;

                // Multiple strategies to detect message/chat classes
                const classNames = [
                    el.className,
                    el.getAttribute('class'),
                    el.id,
                    Array.from(el.classList || []).join(' ')
                ].filter(Boolean);

                const hasMessageClass = classNames.some(className =>
                    className &&
                    typeof className === 'string' &&
                    (className.toLowerCase().includes('message') ||
                     className.toLowerCase().includes('chat') ||
                     className.toLowerCase().includes('conversation'))
                );

                const result = hasTimePattern && hasMultipleChildren && hasMessageClass;
                if (result) {
                    debug('Found potential container:', {
                        timePattern: hasTimePattern,
                        childrenCount: el.children?.length,
                        classes: classNames
                    });
                }
                return result;
            } catch (error) {
                debug('Error checking container:', error);
                return false;
            }
        });

        debug(`Found ${potentialContainers.length} potential chat containers`);
        return potentialContainers[0];
    }

    const chatContainer = findChatContainer();
    if (chatContainer) {
        debug('Found chat container, starting observation');
        observer.observe(chatContainer, CONFIG.MUTATION_CONFIG);
    } else {
        debug('Chat container not found, retrying...');
        setTimeout(initializeMessageMonitoring, CONFIG.POLL_INTERVAL);
    }
}

// Process new nodes to find customer messages
function checkForNewCustomerMessages(nodes) {
    nodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || node.nodeValue;
            const timeMatch = text.match(/(\d{2}:\d{2})/);

            if (timeMatch) {
                const messageText = text.replace(timeMatch[0], '').trim();
                if (messageText) {
                    debug('Found new message:', { time: timeMatch[0], text: messageText });
                    sendQuestionToPopup(messageText);
                }
            }
        }
    });
}

// Send customer question to popup
function sendQuestionToPopup(question) {
    debug('Sending question to popup:', question);
    chrome.runtime.sendMessage({
        type: 'newQuestion',
        question: question
    }, response => {
        if (chrome.runtime.lastError) {
            debug('Error sending message:', chrome.runtime.lastError);
        } else {
            debug('Question sent successfully');
        }
    });
}

// Handle response from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'sendResponse') {
        debug('Received response from popup:', message);
        sendResponseToCustomer(message.content);

        if (message.isEdited) {
            debug('Response was edited, updating Dify knowledge');
            chrome.runtime.sendMessage({
                type: 'updateDifyKnowledge',
                originalResponse: message.originalContent,
                improvedResponse: message.content,
                question: message.question
            });
        }
    }
});

// Function to send response in PDD interface
function sendResponseToCustomer(response) {
    debug('Attempting to send response:', response);

    const inputField = document.querySelector('textarea, [contenteditable="true"], [class*="input"]');
    if (!inputField) {
        debug('Input field not found');
        return;
    }

    // Set input value and trigger events
    if (inputField.isContentEditable) {
        inputField.textContent = response;
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        inputField.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
        inputField.value = response;
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        inputField.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Find and click send button
    const sendButton = document.querySelector('[class*="send"], button:not([disabled]), [role="button"]');
    if (sendButton) {
        debug('Found send button, clicking...');
        sendButton.click();
    } else {
        debug('Send button not found');
    }
}

// Start monitoring when content script loads
debug('Starting chat monitoring...');
waitForChatInterface();
