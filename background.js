/**
 * Woodbury Instagram - Background Service Worker
 * 
 * Handles:
 * - Message passing between popup and content scripts
 * - Extension state management
 * - Tab management
 */

// Store for pending operations
let pendingPosts = new Map();

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Woodbury IG] Background received:', message);

  switch (message.action) {
    case 'checkInstagramTab':
      checkInstagramTab().then(sendResponse);
      return true; // Async response

    case 'openInstagram':
      openInstagramTab().then(sendResponse);
      return true;

    case 'createPost':
      handleCreatePost(message.data).then(sendResponse);
      return true;

    case 'postStatus':
      // Forward status from content script to popup
      chrome.runtime.sendMessage(message);
      break;

    case 'getPostStatus':
      const status = pendingPosts.get(message.postId);
      sendResponse({ status });
      return true;

    default:
      console.log('[Woodbury IG] Unknown action:', message.action);
  }
});

/**
 * Check if there's an active Instagram tab
 */
async function checkInstagramTab() {
  const tabs = await chrome.tabs.query({
    url: ['https://www.instagram.com/*', 'https://instagram.com/*']
  });
  
  if (tabs.length > 0) {
    return {
      found: true,
      tabId: tabs[0].id,
      url: tabs[0].url
    };
  }
  
  return { found: false };
}

/**
 * Open Instagram in a new tab or focus existing one
 */
async function openInstagramTab() {
  const existing = await checkInstagramTab();
  
  if (existing.found) {
    // Focus the existing tab
    await chrome.tabs.update(existing.tabId, { active: true });
    return { tabId: existing.tabId, isNew: false };
  }
  
  // Create new tab
  const tab = await chrome.tabs.create({
    url: 'https://www.instagram.com/',
    active: true
  });
  
  return { tabId: tab.id, isNew: true };
}

/**
 * Handle post creation request
 */
async function handleCreatePost(data) {
  const { imageUrl, imageData, caption } = data;
  
  // Generate a unique post ID
  const postId = `post_${Date.now()}`;
  
  // Store pending post
  pendingPosts.set(postId, {
    status: 'pending',
    data,
    createdAt: Date.now()
  });
  
  try {
    // Find or open Instagram tab
    const { tabId, isNew } = await openInstagramTab();
    
    // If it's a new tab, wait for it to load
    if (isNew) {
      await waitForTabLoad(tabId);
    }
    
    // Inject the content script if needed and send the post request
    await chrome.tabs.sendMessage(tabId, {
      action: 'startPostCreation',
      postId,
      data: {
        imageUrl,
        imageData,
        caption
      }
    });
    
    pendingPosts.set(postId, {
      ...pendingPosts.get(postId),
      status: 'processing',
      tabId
    });
    
    return { success: true, postId, tabId };
    
  } catch (error) {
    console.error('[Woodbury IG] Error creating post:', error);
    pendingPosts.set(postId, {
      ...pendingPosts.get(postId),
      status: 'error',
      error: error.message
    });
    
    return { success: false, error: error.message, postId };
  }
}

/**
 * Wait for a tab to finish loading
 */
function waitForTabLoad(tabId, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkTab = async () => {
      try {
        const tab = await chrome.tabs.get(tabId);
        
        if (tab.status === 'complete') {
          resolve();
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          reject(new Error('Tab load timeout'));
          return;
        }
        
        setTimeout(checkTab, 100);
      } catch (error) {
        reject(error);
      }
    };
    
    checkTab();
  });
}

// Clean up old pending posts periodically
setInterval(() => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes
  
  for (const [postId, post] of pendingPosts.entries()) {
    if (now - post.createdAt > maxAge) {
      pendingPosts.delete(postId);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

console.log('[Woodbury IG] Background service worker started');
