// Monitor customer messages in PDD customer service system
function initializeMessageMonitoring() {
  // Set up mutation observer to watch for new messages
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        checkForNewCustomerMessages(mutation.addedNodes);
      }
    });
  });

  // Start observing the chat container
  const config = { childList: true, subtree: true };
  // We'll need to identify the correct chat container element
  const chatContainer = document.querySelector('.chat-messages-container');
  if (chatContainer) {
    observer.observe(chatContainer, config);
  }
}

// Process new nodes to find customer messages
function checkForNewCustomerMessages(nodes) {
  nodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      // Look for customer message elements
      const messageElement = node.querySelector('.customer-message');
      if (messageElement) {
        const messageText = messageElement.textContent.trim();
        if (messageText) {
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
  // Find the response input field
  const responseInput = document.querySelector('.response-input');
  if (responseInput) {
    // Set the response text
    responseInput.value = response;
    // Trigger input event to ensure PDD's JS picks up the change
    responseInput.dispatchEvent(new Event('input', { bubbles: true }));

    // Find and click the send button
    const sendButton = document.querySelector('.send-button');
    if (sendButton) {
      sendButton.click();
    }
  }
}

// Initialize monitoring when content script loads
initializeMessageMonitoring();
