/**
 * Woodbury Instagram - Popup Script
 * 
 * Handles the extension popup UI:
 * - Image selection/upload
 * - Caption input
 * - Post initiation
 * - Status display
 */

(function() {
  'use strict';

  // ============================================
  // DOM Elements
  // ============================================

  const elements = {
    // Image
    imageUpload: document.getElementById('image-upload'),
    fileInput: document.getElementById('file-input'),
    imagePreview: document.getElementById('image-preview'),
    previewImg: document.getElementById('preview-img'),
    uploadPrompt: document.getElementById('upload-prompt'),
    removeImage: document.getElementById('remove-image'),
    imageUrl: document.getElementById('image-url'),
    loadUrlBtn: document.getElementById('load-url'),
    
    // Caption
    caption: document.getElementById('caption'),
    charCount: document.getElementById('char-count'),
    
    // Actions
    postBtn: document.getElementById('post-btn'),
    postBtnText: document.getElementById('post-btn-text'),
    postBtnSpinner: document.getElementById('post-btn-spinner'),
    
    // Status
    statusBar: document.getElementById('status-bar'),
    statusIcon: document.getElementById('status-icon'),
    statusText: document.getElementById('status-text'),
    
    // Connection
    connectionDot: document.getElementById('connection-dot'),
    connectionText: document.getElementById('connection-text')
  };

  // ============================================
  // State
  // ============================================

  let state = {
    imageData: null,
    isPosting: false,
    instagramTabId: null,
    currentPostId: null
  };

  // ============================================
  // Status Management
  // ============================================

  const STATUS_MESSAGES = {
    starting: { icon: '🚀', text: 'Starting post creation...' },
    clicking_create: { icon: '👆', text: 'Opening create dialog...' },
    waiting_for_modal: { icon: '⏳', text: 'Waiting for dialog...' },
    uploading_image: { icon: '📤', text: 'Uploading image...' },
    crop_step: { icon: '✂️', text: 'Processing crop...' },
    filter_step: { icon: '🎨', text: 'Skipping filters...' },
    entering_caption: { icon: '✍️', text: 'Adding caption...' },
    sharing: { icon: '📤', text: 'Sharing post...' },
    waiting_for_completion: { icon: '⏳', text: 'Finalizing...' },
    completed: { icon: '✅', text: 'Post shared successfully!' },
    error: { icon: '❌', text: 'Error occurred' }
  };

  function showStatus(status, extraText = '') {
    const info = STATUS_MESSAGES[status] || { icon: '📝', text: status };
    
    elements.statusBar.classList.remove('hidden', 'error', 'success', 'processing');
    elements.statusIcon.textContent = info.icon;
    elements.statusText.textContent = extraText ? `${info.text} ${extraText}` : info.text;
    
    if (status === 'error') {
      elements.statusBar.classList.add('error');
    } else if (status === 'completed') {
      elements.statusBar.classList.add('success');
    } else {
      elements.statusBar.classList.add('processing');
    }
  }

  function hideStatus() {
    elements.statusBar.classList.add('hidden');
  }

  // ============================================
  // Image Handling
  // ============================================

  function showImage(dataUrl) {
    state.imageData = dataUrl;
    elements.previewImg.src = dataUrl;
    elements.imagePreview.classList.remove('hidden');
    elements.uploadPrompt.classList.add('hidden');
    updatePostButton();
  }

  function removeImage() {
    state.imageData = null;
    elements.previewImg.src = '';
    elements.imagePreview.classList.add('hidden');
    elements.uploadPrompt.classList.remove('hidden');
    elements.fileInput.value = '';
    elements.imageUrl.value = '';
    updatePostButton();
  }

  function handleFileSelect(file) {
    if (!file || !file.type.startsWith('image/')) {
      showStatus('error', 'Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      showImage(e.target.result);
      hideStatus();
    };
    reader.onerror = () => {
      showStatus('error', 'Failed to read image file');
    };
    reader.readAsDataURL(file);
  }

  async function loadImageFromUrl(url) {
    if (!url) return;

    showStatus('uploading_image', 'Loading from URL...');

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL does not point to a valid image');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        showImage(e.target.result);
        hideStatus();
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      showStatus('error', error.message);
    }
  }

  // ============================================
  // Post Button State
  // ============================================

  function updatePostButton() {
    const canPost = state.imageData && !state.isPosting && state.instagramTabId;
    elements.postBtn.disabled = !canPost;
  }

  function setPosting(isPosting) {
    state.isPosting = isPosting;
    
    if (isPosting) {
      elements.postBtnText.textContent = 'Posting...';
      elements.postBtnSpinner.classList.remove('hidden');
    } else {
      elements.postBtnText.textContent = 'Post to Instagram';
      elements.postBtnSpinner.classList.add('hidden');
    }
    
    updatePostButton();
  }

  // ============================================
  // Connection Status
  // ============================================

  async function checkInstagramConnection() {
    elements.connectionDot.className = 'dot checking';
    elements.connectionText.textContent = 'Checking Instagram...';

    try {
      const response = await chrome.runtime.sendMessage({ action: 'checkInstagramTab' });
      
      if (response && response.found) {
        state.instagramTabId = response.tabId;
        elements.connectionDot.className = 'dot connected';
        elements.connectionText.textContent = 'Connected to Instagram';
      } else {
        state.instagramTabId = null;
        elements.connectionDot.className = 'dot disconnected';
        elements.connectionText.textContent = 'Open Instagram to post';
      }
    } catch (error) {
      state.instagramTabId = null;
      elements.connectionDot.className = 'dot disconnected';
      elements.connectionText.textContent = 'Connection error';
    }

    updatePostButton();
  }

  // ============================================
  // Post Creation
  // ============================================

  async function createPost() {
    if (!state.imageData) {
      showStatus('error', 'Please select an image');
      return;
    }

    setPosting(true);
    showStatus('starting');

    try {
      // Ensure Instagram tab exists
      if (!state.instagramTabId) {
        const { tabId } = await chrome.runtime.sendMessage({ action: 'openInstagram' });
        state.instagramTabId = tabId;
        // Wait for tab to load
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      const response = await chrome.runtime.sendMessage({
        action: 'createPost',
        data: {
          imageData: state.imageData,
          caption: elements.caption.value.trim()
        }
      });

      if (response && response.success) {
        state.currentPostId = response.postId;
        // Status updates will come via message listener
      } else {
        throw new Error(response?.error || 'Failed to start post creation');
      }

    } catch (error) {
      console.error('Post creation error:', error);
      showStatus('error', error.message);
      setPosting(false);
    }
  }

  // ============================================
  // Event Listeners
  // ============================================

  // Image upload click
  elements.imageUpload.addEventListener('click', () => {
    if (!state.imageData) {
      elements.fileInput.click();
    }
  });

  // File input change
  elements.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  });

  // Remove image
  elements.removeImage.addEventListener('click', (e) => {
    e.stopPropagation();
    removeImage();
  });

  // Load from URL
  elements.loadUrlBtn.addEventListener('click', () => {
    loadImageFromUrl(elements.imageUrl.value.trim());
  });

  elements.imageUrl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loadImageFromUrl(elements.imageUrl.value.trim());
    }
  });

  // Caption character count
  elements.caption.addEventListener('input', () => {
    elements.charCount.textContent = elements.caption.value.length;
  });

  // Post button
  elements.postBtn.addEventListener('click', createPost);

  // Listen for status updates from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'postStatus' && message.postId === state.currentPostId) {
      showStatus(message.status, message.error || '');
      
      if (message.status === 'completed' || message.status === 'error') {
        setPosting(false);
        
        if (message.status === 'completed') {
          // Reset form after successful post
          setTimeout(() => {
            removeImage();
            elements.caption.value = '';
            elements.charCount.textContent = '0';
          }, 2000);
        }
      }
    }
  });

  // Drag and drop
  elements.imageUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.imageUpload.style.borderColor = 'var(--accent)';
  });

  elements.imageUpload.addEventListener('dragleave', () => {
    elements.imageUpload.style.borderColor = '';
  });

  elements.imageUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.imageUpload.style.borderColor = '';
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  });

  // Paste image from clipboard
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) handleFileSelect(file);
        break;
      }
    }
  });

  // ============================================
  // Initialization
  // ============================================

  // Check Instagram connection on load
  checkInstagramConnection();

  // Periodically check connection
  setInterval(checkInstagramConnection, 5000);

})();
