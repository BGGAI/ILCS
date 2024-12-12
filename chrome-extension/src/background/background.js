// Configuration
const DIFY_API_ENDPOINT = 'https://api.dify.ai/v1';
let DIFY_API_KEY = '';

// Initialize Dify API key from storage
chrome.storage.local.get(['difyApiKey'], (result) => {
  if (result.difyApiKey) {
    DIFY_API_KEY = result.difyApiKey;
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
