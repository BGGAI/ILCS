// State management
let currentResponse = null;
let currentQuestion = null;

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
      currentQuestion = message.question;
      getDifyResponse(message.question);
    } else if (message.type === 'difyResponse') {
      displayDifyResponse(message.response);
      currentResponse = message.response;
      responseEditor.value = message.response;
    } else if (message.type === 'difyError') {
      displayError(message.error);
    }
  });

  // Check for Dify API key
  chrome.storage.local.get(['difyApiKey'], (result) => {
    if (!result.difyApiKey) {
      displayError('Please set Dify API key in extension options');
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

function displayError(error) {
  appendMessage('Error', error);
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
    originalContent: currentResponse,
    question: currentQuestion
  };

  // Send to content script to handle response
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, response);
  });
}
