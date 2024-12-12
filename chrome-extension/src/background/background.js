const DIFY_API_ENDPOINT = 'https://api.dify.ai/v1';
let DIFY_API_KEY = '';

// Log background script initialization
console.log('[ILCS Background] Background script initialized');

// URL patterns to match
const URL_PATTERNS = [
  "*://*.pinduoduo.com/*",
  "*://*.yangkeduo.com/*"
];

// Initialize Dify API key from storage
chrome.storage.local.get(['difyApiKey'], (result) => {
  if (result.difyApiKey) {
    DIFY_API_KEY = result.difyApiKey;
    console.log('[ILCS Background] Dify API key loaded from storage');
  } else {
    console.log('[ILCS Background] No Dify API key found in storage');
  }
});

// Inject content script function
async function injectContentScript(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    console.log('[ILCS Background] Tab info:', {
      id: tab.id,
      url: tab.url,
      status: tab.status
    });

    // First try to inject the script directly
    await chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      func: () => {
        console.log('[ILCS Content] Direct injection started');
        console.log('[ILCS Content] Document readyState:', document.readyState);
        console.log('[ILCS Content] URL:', window.location.href);
        console.log('[ILCS Content] Is iframe:', window.self !== window.top);
        console.log('[ILCS Content] Available elements:', {
          chatContainer: !!document.querySelector('.chat-container, .message-container, [class*="chat"], [class*="message"]'),
          textarea: !!document.querySelector('textarea, [contenteditable="true"]'),
          sendButton: !!document.querySelector('button, [class*="send"], [role="button"]')
        });
      }
    });

    // Then inject the actual content script file
    await chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      files: ['src/content/content.js']
    });

    console.log('[ILCS Background] Content script injection successful for tab:', tabId);
  } catch (err) {
    console.error('[ILCS Background] Script injection error:', err.message, err.stack);
  }
}

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('[ILCS Background] Tab updated event:', {
    tabId,
    status: changeInfo.status,
    url: tab.url,
    changeInfo
  });

  if (changeInfo.status === 'loading' || changeInfo.status === 'complete') {
    // Check if URL matches our patterns
    const matches = URL_PATTERNS.some(pattern => {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      const doesMatch = regex.test(tab.url);
      console.log('[ILCS Background] Testing pattern:', pattern, 'against URL:', tab.url, 'Result:', doesMatch);
      return doesMatch;
    });

    if (matches) {
      console.log('[ILCS Background] URL matches pattern, injecting content script');
      injectContentScript(tabId);
    } else {
      console.log('[ILCS Background] URL does not match patterns, skipping injection');
    }
  }
});

// Handle Dify API calls
async function callDifyAPI(question, endpoint = '/completion') {
  if (!DIFY_API_KEY) {
    throw new Error('Dify API key not set');
  }

  try {
    const response = await fetch(`${DIFY_API_ENDPOINT}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`
      },
      body: JSON.stringify({
        query: question,
        response_mode: 'blocking'
      })
    });

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling Dify API:', error);
    throw error;
  }
}

// Update Dify knowledge base with improved response
async function updateDifyKnowledge(originalResponse, improvedResponse, question) {
  try {
    await callDifyAPI({
      original_response: originalResponse,
      improved_response: improvedResponse,
      question: question
    }, '/feedback');
  } catch (error) {
    console.error('Error updating Dify knowledge:', error);
  }
}

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[ILCS Background] Received message:', message.type);

  if (message.type === 'getDifyResponse') {
    callDifyAPI(message.question)
      .then(response => {
        chrome.runtime.sendMessage({
          type: 'difyResponse',
          response: response.answer,
          question: message.question
        });
      })
      .catch(error => {
        console.error('Error getting Dify response:', error);
        chrome.runtime.sendMessage({
          type: 'difyError',
          error: error.message
        });
      });
  } else if (message.type === 'updateDifyKnowledge') {
    updateDifyKnowledge(
      message.originalResponse,
      message.improvedResponse,
      message.question
    );
  }
  return true;
});
