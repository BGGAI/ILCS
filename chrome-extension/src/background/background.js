// Configuration (to be replaced with actual Dify API endpoint)
const DIFY_API_ENDPOINT = 'https://api.dify.ai/v1';

// Handle Dify API calls
async function callDifyAPI(question) {
  try {
    // Placeholder for actual Dify API call
    // Will be implemented with proper authentication and endpoints
    console.log('Calling Dify API with question:', question);

    // Simulate API response for now
    return {
      response: 'This is a placeholder response from Dify'
    };
  } catch (error) {
    console.error('Error calling Dify API:', error);
    throw error;
  }
}

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getDifyResponse') {
    callDifyAPI(message.question)
      .then(response => {
        chrome.runtime.sendMessage({
          type: 'difyResponse',
          response: response.response
        });
      })
      .catch(error => {
        console.error('Error getting Dify response:', error);
      });
  }
  // Return true to indicate async response
  return true;
});
