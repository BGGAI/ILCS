// Monitor customer messages in PDD customer service system
console.log('[ILCS] Content script loaded');

// Wait for chat interface to load
function waitForChatInterface() {
    console.log('[ILCS] Waiting for chat interface...');

    // Check for any element that indicates chat interface is loaded
    const checkForInterface = () => {
        const possibleElements = [
            document.querySelector('[class*="chat"]'),
            document.querySelector('[class*="message"]'),
            document.querySelector('textarea'),
            document.querySelector('[class*="input"]')
        ];

        return possibleElements.some(el => el !== null);
    };

    if (checkForInterface()) {
        console.log('[ILCS] Chat interface found, initializing...');
        initializeMessageMonitoring();
    } else {
        console.log('[ILCS] Chat interface not found, retrying...');
        setTimeout(waitForChatInterface, 1000);
    }
}

// Initialize message monitoring
function initializeMessageMonitoring() {
    console.log('[ILCS] Initializing message monitoring');

    // Create mutation observer for dynamic content
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                checkForNewCustomerMessages(mutation.addedNodes);
            }
        });
    });

    // Find chat container using multiple strategies
    const findChatContainer = () => {
        // Log all potential message containers for debugging
        const allElements = document.querySelectorAll('*');
        const potentialContainers = Array.from(allElements).filter(el => {
            const hasMessages = el.textContent.includes('04:') || el.textContent.includes('03:');
            const isContainer = el.children.length > 2;
            return hasMessages && isContainer;
        });

        console.log('[ILCS] Found potential containers:', potentialContainers.length);
        return potentialContainers[0];
    };

    const chatContainer = findChatContainer();
    if (chatContainer) {
        console.log('[ILCS] Found chat container:', chatContainer);
        observer.observe(chatContainer, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });
    } else {
        console.log('[ILCS] Chat container not found, retrying...');
        setTimeout(initializeMessageMonitoring, 1000);
    }
}

// Process new nodes to find customer messages
function checkForNewCustomerMessages(nodes) {
    nodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            // Look for elements containing timestamps (04:33, 04:09, etc.)
            const hasTimestamp = node.textContent.match(/\d{2}:\d{2}/);
            if (hasTimestamp) {
                console.log('[ILCS] Found message with timestamp:', {
                    text: node.textContent.trim(),
                    timestamp: hasTimestamp[0]
                });

                // Extract the actual message content
                const messageText = node.textContent
                    .replace(hasTimestamp[0], '')
                    .trim();

                if (messageText) {
                    console.log('[ILCS] Extracted message:', messageText);
                    sendQuestionToPopup(messageText);
                }
            }
        }
    });
}

// Send customer question to popup
function sendQuestionToPopup(question) {
    chrome.runtime.sendMessage({
        type: 'newQuestion',
        question: question
    });
}

// Handle response from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'sendResponse') {
        // Send response to customer
        sendResponseToCustomer(message.content);

        // If the response was edited, send feedback to Dify
        if (message.isEdited) {
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
    console.log('[ILCS] Attempting to send response:', response);

    // Try multiple selectors for the input field
    const inputSelectors = [
        '.response-input',
        '[class*="input"]',
        'textarea',
        '.reply-input',
        '.message-input'
    ];

    let responseInput = null;
    for (const selector of inputSelectors) {
        responseInput = document.querySelector(selector);
        if (responseInput) {
            console.log(`[ILCS] Found input field with selector: ${selector}`);
            break;
        }
    }

    if (responseInput) {
        // Set the response text
        responseInput.value = response;
        responseInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('[ILCS] Response text set in input field');

        // Try multiple selectors for the send button
        const buttonSelectors = [
            '.send-button',
            '[class*="send"]',
            'button',
            '.submit-button',
            '.reply-button'
        ];

        let sendButton = null;
        for (const selector of buttonSelectors) {
            sendButton = document.querySelector(selector);
            if (sendButton) {
                console.log(`[ILCS] Found send button with selector: ${selector}`);
                break;
            }
        }

        if (sendButton) {
            sendButton.click();
            console.log('[ILCS] Send button clicked');
        } else {
            console.log('[ILCS] Send button not found');
        }
    } else {
        console.log('[ILCS] Response input field not found');
    }
}

// Start monitoring when content script loads
console.log('[ILCS] Starting chat monitoring...');
waitForChatInterface();
