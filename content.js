/**
 * Woodbury Instagram - Content Script
 * 
 * Injected into instagram.com pages to:
 * - Interact with the Instagram DOM
 * - Automate post creation flow
 * - Report status back to extension
 */

(function() {
  'use strict';

  console.log('[Woodbury IG] Content script loaded');

  // ============================================
  // DOM Selectors and Utilities
  // ============================================

  const SELECTORS = {
    // Navigation
    createButton: '[aria-label="New post"], [aria-label="Create"], svg[aria-label="New post"]',
    
    // Create Modal
    createModal: '[role="dialog"]',
    modalTitle: '[role="dialog"] h1',
    
    // File Upload
    fileInput: 'input[type="file"][accept*="image"]',
    selectFromComputerBtn: 'button:has-text("Select from computer"), button:has-text("Select From Computer")',
    dragDropArea: '[role="dialog"] [role="button"]',
    
    // Navigation buttons in modal
    nextButton: '[role="dialog"] button:has-text("Next")',
    shareButton: '[role="dialog"] button:has-text("Share")',
    backButton: '[role="dialog"] button[aria-label="Back"], [role="dialog"] button:has-text("Back")',
    
    // Caption
    captionTextarea: '[role="dialog"] textarea[aria-label*="caption"], [role="dialog"] textarea[placeholder*="caption"], [role="dialog"] div[contenteditable="true"]',
    
    // Crop/Edit view
    cropView: '[role="dialog"] [data-crop]',
    aspectRatioButton: '[aria-label="Select crop"]',
    zoomSlider: 'input[type="range"]',
    
    // Close/Discard
    closeButton: '[role="dialog"] button[aria-label="Close"]',
    discardButton: 'button:has-text("Discard")',
    
    // Success indicators
    postSharedText: ':has-text("Your post has been shared")',
    
    // Generic
    spinner: '[role="progressbar"], [data-visualcompletion="loading-state"]'
  };

  // ============================================
  // Utility Functions
  // ============================================

  /**
   * Wait for an element to appear in the DOM
   */
  function waitForElement(selector, timeout = 10000, parent = document) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // Try to find immediately
      const element = findElement(selector, parent);
      if (element) {
        resolve(element);
        return;
      }
      
      // Set up MutationObserver
      const observer = new MutationObserver((mutations, obs) => {
        const element = findElement(selector, parent);
        if (element) {
          obs.disconnect();
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          obs.disconnect();
          reject(new Error(`Timeout waiting for element: ${selector}`));
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Also set a timeout as backup
      setTimeout(() => {
        observer.disconnect();
        const element = findElement(selector, parent);
        if (element) {
          resolve(element);
        } else {
          reject(new Error(`Timeout waiting for element: ${selector}`));
        }
      }, timeout);
    });
  }

  /**
   * Find element using various strategies
   */
  function findElement(selector, parent = document) {
    // Handle :has-text() pseudo-selector
    if (selector.includes(':has-text(')) {
      return findElementByText(selector, parent);
    }
    
    // Standard CSS selector
    try {
      return parent.querySelector(selector);
    } catch (e) {
      console.warn('[Woodbury IG] Invalid selector:', selector);
      return null;
    }
  }

  /**
   * Find element by text content
   */
  function findElementByText(selector, parent = document) {
    const match = selector.match(/:has-text\(["']?([^"')]+)["']?\)/);
    if (!match) return null;
    
    const text = match[1];
    const baseSelector = selector.replace(/:has-text\([^)]+\)/, '').trim() || '*';
    
    const elements = parent.querySelectorAll(baseSelector);
    for (const el of elements) {
      if (el.textContent && el.textContent.toLowerCase().includes(text.toLowerCase())) {
        return el;
      }
    }
    return null;
  }

  /**
   * Find all elements matching text
   */
  function findElementsByText(text, tagName = '*') {
    const elements = document.querySelectorAll(tagName);
    return Array.from(elements).filter(el => 
      el.textContent && el.textContent.toLowerCase().includes(text.toLowerCase())
    );
  }

  /**
   * Click an element reliably
   */
  async function clickElement(element) {
    if (!element) throw new Error('Cannot click null element');
    
    // Scroll into view
    element.scrollIntoView({ behavior: 'instant', block: 'center' });
    
    // Small delay for scroll
    await sleep(100);
    
    // Try multiple click methods
    try {
      // Method 1: Direct click
      element.click();
    } catch (e) {
      // Method 2: Dispatch event
      element.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
    }
    
    await sleep(300);
  }

  /**
   * Sleep for given milliseconds
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send status update to background script
   */
  function sendStatus(postId, status, data = {}) {
    chrome.runtime.sendMessage({
      action: 'postStatus',
      postId,
      status,
      ...data
    });
  }

  // ============================================
  // Post Creation Functions
  // ============================================

  /**
   * Find and click the Create button in the sidebar
   */
  async function clickCreateButton() {
    console.log('[Woodbury IG] Looking for Create button...');
    
    // Try multiple selectors for the Create button
    const selectors = [
      '[aria-label="New post"]',
      '[aria-label="Create"]',
      'a[href="#"] svg[aria-label="New post"]',
      'svg[aria-label="New post"]',
      'span:has-text("Create")'
    ];
    
    for (const selector of selectors) {
      try {
        const element = findElement(selector);
        if (element) {
          // Find the clickable parent if we found an SVG or span
          let clickTarget = element;
          if (element.tagName === 'SVG' || element.tagName === 'SPAN') {
            clickTarget = element.closest('a, button, [role="button"]') || element.parentElement;
          }
          
          console.log('[Woodbury IG] Found Create button:', clickTarget);
          await clickElement(clickTarget);
          return true;
        }
      } catch (e) {
        console.warn('[Woodbury IG] Selector failed:', selector, e);
      }
    }
    
    // Fallback: Find by text content
    const createElements = findElementsByText('Create');
    for (const el of createElements) {
      if (el.closest('nav, aside')) {
        const clickTarget = el.closest('a, button, [role="button"]') || el;
        console.log('[Woodbury IG] Found Create by text:', clickTarget);
        await clickElement(clickTarget);
        return true;
      }
    }
    
    throw new Error('Could not find Create button');
  }

  /**
   * Wait for the Create modal to appear
   */
  async function waitForCreateModal() {
    console.log('[Woodbury IG] Waiting for Create modal...');
    
    const modal = await waitForElement('[role="dialog"]', 5000);
    
    // Verify it's the create modal by looking for expected content
    await sleep(500);
    
    return modal;
  }

  /**
   * Upload an image file to the modal
   */
  async function uploadImage(imageData) {
    console.log('[Woodbury IG] Uploading image...');
    
    // Find or create file input
    let fileInput = document.querySelector('input[type="file"]');
    
    if (!fileInput) {
      // Look for the "Select from computer" button and click it
      const selectBtn = findElement('button:has-text("Select")') || 
                        findElement('button:has-text("computer")');
      
      if (selectBtn) {
        console.log('[Woodbury IG] Clicking select button...');
        await clickElement(selectBtn);
        await sleep(500);
        fileInput = document.querySelector('input[type="file"]');
      }
    }
    
    if (!fileInput) {
      // Create our own file input as fallback
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*,video/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
    }
    
    // Create a File object from the image data
    let file;
    
    if (imageData.startsWith('data:')) {
      // Base64 data URL
      const response = await fetch(imageData);
      const blob = await response.blob();
      file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
    } else if (imageData.startsWith('http')) {
      // URL - fetch and convert
      try {
        const response = await fetch(imageData);
        const blob = await response.blob();
        file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' });
      } catch (e) {
        throw new Error(`Failed to fetch image from URL: ${e.message}`);
      }
    } else {
      throw new Error('Invalid image data format');
    }
    
    // Create a DataTransfer to set the file
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    
    // Dispatch change event
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('[Woodbury IG] Image uploaded');
    await sleep(1000);
  }

  /**
   * Click the Next button to proceed through the modal steps
   */
  async function clickNextButton() {
    console.log('[Woodbury IG] Looking for Next button...');
    
    // Wait a moment for the UI to update
    await sleep(500);
    
    // Find Next button
    const nextBtn = findElement('button:has-text("Next")') ||
                    findElement('[role="dialog"] button[type="button"]:last-of-type');
    
    if (!nextBtn) {
      throw new Error('Could not find Next button');
    }
    
    console.log('[Woodbury IG] Clicking Next...');
    await clickElement(nextBtn);
    await sleep(500);
  }

  /**
   * Enter the caption text
   */
  async function enterCaption(caption) {
    console.log('[Woodbury IG] Entering caption...');
    
    // Find caption input (could be textarea or contenteditable div)
    const captionInput = await waitForElement(
      'textarea[aria-label*="caption"], textarea[placeholder*="caption"], div[aria-label*="caption"], [role="textbox"]',
      5000
    );
    
    if (!captionInput) {
      throw new Error('Could not find caption input');
    }
    
    // Focus the input
    captionInput.focus();
    await sleep(100);
    
    // Enter the caption
    if (captionInput.tagName === 'TEXTAREA') {
      captionInput.value = caption;
      captionInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // Contenteditable div
      captionInput.textContent = caption;
      captionInput.dispatchEvent(new InputEvent('input', { 
        bubbles: true, 
        inputType: 'insertText',
        data: caption
      }));
    }
    
    await sleep(300);
    console.log('[Woodbury IG] Caption entered');
  }

  /**
   * Click the Share button to publish the post
   */
  async function clickShareButton() {
    console.log('[Woodbury IG] Looking for Share button...');
    
    const shareBtn = findElement('button:has-text("Share")') ||
                     findElement('[role="dialog"] button[type="submit"]');
    
    if (!shareBtn) {
      throw new Error('Could not find Share button');
    }
    
    console.log('[Woodbury IG] Clicking Share...');
    await clickElement(shareBtn);
  }

  /**
   * Wait for the post to be shared successfully
   */
  async function waitForPostComplete(timeout = 30000) {
    console.log('[Woodbury IG] Waiting for post to complete...');
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      // Look for success indicators
      const successText = findElement(':has-text("Your post has been shared")') ||
                          findElement(':has-text("shared")');
      
      if (successText && successText.closest('[role="dialog"]')) {
        console.log('[Woodbury IG] Post shared successfully!');
        return true;
      }
      
      // Check for errors
      const errorText = findElement(':has-text("error")') ||
                        findElement(':has-text("failed")');
      
      if (errorText && errorText.closest('[role="dialog"]')) {
        throw new Error('Instagram reported an error while posting');
      }
      
      await sleep(500);
    }
    
    throw new Error('Timeout waiting for post to complete');
  }

  // ============================================
  // Main Post Creation Flow
  // ============================================

  /**
   * Create a post with the given data
   */
  async function createPost(postId, data) {
    const { imageUrl, imageData, caption } = data;
    const image = imageData || imageUrl;
    
    if (!image) {
      throw new Error('No image provided');
    }
    
    try {
      sendStatus(postId, 'starting');
      
      // Step 1: Click Create button
      sendStatus(postId, 'clicking_create');
      await clickCreateButton();
      
      // Step 2: Wait for modal
      sendStatus(postId, 'waiting_for_modal');
      await waitForCreateModal();
      
      // Step 3: Upload image
      sendStatus(postId, 'uploading_image');
      await uploadImage(image);
      
      // Step 4: Click Next (crop view)
      sendStatus(postId, 'crop_step');
      await sleep(1000);
      await clickNextButton();
      
      // Step 5: Click Next (filters view)
      sendStatus(postId, 'filter_step');
      await sleep(500);
      await clickNextButton();
      
      // Step 6: Enter caption
      sendStatus(postId, 'entering_caption');
      if (caption) {
        await enterCaption(caption);
      }
      
      // Step 7: Click Share
      sendStatus(postId, 'sharing');
      await clickShareButton();
      
      // Step 8: Wait for completion
      sendStatus(postId, 'waiting_for_completion');
      await waitForPostComplete();
      
      sendStatus(postId, 'completed', { success: true });
      
    } catch (error) {
      console.error('[Woodbury IG] Post creation failed:', error);
      sendStatus(postId, 'error', { error: error.message });
      throw error;
    }
  }

  // ============================================
  // Message Listener
  // ============================================

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Woodbury IG] Content script received:', message);
    
    switch (message.action) {
      case 'startPostCreation':
        createPost(message.postId, message.data)
          .then(() => sendResponse({ success: true }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Async response
        
      case 'ping':
        sendResponse({ alive: true, url: window.location.href });
        break;
        
      case 'inspectDOM':
        // Debug helper - return info about the current page
        sendResponse({
          url: window.location.href,
          hasCreateButton: !!findElement('[aria-label="New post"], [aria-label="Create"]'),
          hasModal: !!document.querySelector('[role="dialog"]'),
          bodyClasses: document.body.className
        });
        break;
        
      default:
        console.log('[Woodbury IG] Unknown action:', message.action);
    }
  });

  // ============================================
  // Initialization
  // ============================================

  // Notify that content script is ready
  chrome.runtime.sendMessage({ action: 'contentScriptReady', url: window.location.href });

})();
