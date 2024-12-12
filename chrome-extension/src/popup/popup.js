// State management
let currentResponse = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  const messagesContainer = document.getElementById('messages');
  const responseEditor = document.getElementById('responseEditor');
  const sendOriginalBtn = document.getElementById('sendOriginal');
  const sendEditedBtn = document.getElementById('sendEdited');

  // Event listeners
  sendOriginalBtn.addEventListener('click', () => sendResponse(false));
  sendEditedBtn.addEventListener('click', () => sendResponse(true));

  // Initialize message listener
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'newQuestion') {
      displayQuestion(message.question);
      getDifyResponse(message.question);
    } else if (message.type === 'difyResponse') {
      displayDifyResponse(message.response);
      currentResponse = message.response;
      responseEditor.value = message.response;
    }
  });
});

// Display functions
function displayQuestion(question) {
  appendMessage('Customer', question);
}

function displayDifyResponse(response) {
  appendMessage('Dify', response);
}

function appendMessage(sender, content) {
  const messagesContainer = document.getElementById('messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender.toLowerCase()}`;
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${content}`;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// API interaction
async function getDifyResponse(question) {
  // Send message to background script to handle Dify API call
  chrome.runtime.sendMessage({
    type: 'getDifyResponse',
    question: question
  });
}

// Response handling
async function sendResponse(isEdited) {
  const responseEditor = document.getElementById('responseEditor');
  const response = {
    type: 'sendResponse',
    content: responseEditor.value,
    isEdited: isEdited,
    originalContent: currentResponse
  };

  // Send to background script to handle response
  chrome.runtime.sendMessage(response);
}
