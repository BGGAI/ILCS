// Monitor customer messages in PDD customer service system
function initializeMessageMonitoring() {
  // We'll implement the specific PDD message monitoring logic here
  // This is a placeholder that will be replaced with actual implementation
  console.log('Message monitoring initialized');
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
    // We'll implement the specific PDD response sending logic here
    console.log('Received response to send:', message.content);
  }
});

// Initialize monitoring when content script loads
initializeMessageMonitoring();
