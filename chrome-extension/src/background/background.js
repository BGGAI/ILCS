const DIFY_API_ENDPOINT = 'https://api.dify.ai/v1';
let DIFY_API_KEY = '';

// Debug logging with timestamp
function debug(...args) {
  const timestamp = new Date().toISOString();
  console.log(`[ILCS Background ${timestamp}]`, ...args);
}

// Log background script initialization
debug('Background script initialized');

// URL patterns to match
const URL_PATTERNS = [
  "*://*.pinduoduo.com/*",
  "*://*.yangkeduo.com/*"
];

// Initialize Dify API key from storage
chrome.storage.local.get(['difyApiKey'], (result) => {
  if (result.difyApiKey) {
    DIFY_API_KEY = result.difyApiKey;
    debug('Dify API key loaded from storage');
  } else {
    debug('No Dify API key found in storage');
  }
});

// Handle content script connections
chrome.runtime.onConnect.addListener((port) => {
  debug('New connection from content script:', port.name);

  port.onMessage.addListener((msg) => {
    debug('Received port message:', msg);

    if (msg.type === 'ELEMENTS_UPDATE') {
      debug('Chat interface elements:', msg.elements);
    }
  });

  port.onDisconnect.addListener(() => {
    debug('Content script disconnected');
  });
});

// Inject content script function
async function injectContentScript(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    debug('Tab info:', {
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
      }
    });

    // Then inject the actual content script file
    await chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      files: ['src/content/content.js']
    });

    debug('Content script injection successful for tab:', tabId);
  } catch (err) {
    console.error('[ILCS Background] Script injection error:', err.message, err.stack);
  }
}

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  debug('Tab updated event:', {
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
      debug('Testing pattern:', pattern, 'against URL:', tab.url, 'Result:', doesMatch);
      return doesMatch;
    });

    if (matches) {
      debug('URL matches pattern, injecting content script');
      injectContentScript(tabId);
    } else {
      debug('URL does not match patterns, skipping injection');
    }
  }
});

// Handle debug logs from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DEBUG_LOG') {
    debug('Content Script Log:', ...message.args);
  } else if (message.type === 'CONTENT_SCRIPT_LOADED') {
    debug('Content script loaded in tab:', sender.tab?.id);
  }
  return true;
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
    debug('Error calling Dify API:', error);
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
    debug('Error updating Dify knowledge:', error);
  }
}
