// Save options to chrome.storage
function saveOptions() {
  const difyApiKey = document.getElementById('difyApiKey').value;
  chrome.storage.local.set(
    { difyApiKey: difyApiKey },
    () => {
      // Update status to let user know options were saved
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      status.className = 'status success';
      status.style.display = 'block';

      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    }
  );
}

// Restore options from chrome.storage
function restoreOptions() {
  chrome.storage.local.get(
    { difyApiKey: '' },
    (items) => {
      document.getElementById('difyApiKey').value = items.difyApiKey;
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
