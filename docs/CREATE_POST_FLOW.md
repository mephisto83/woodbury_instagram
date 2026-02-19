# Instagram Create Post Flow - Automation Guide

## Date: 2026-02-19
## Purpose: Step-by-step guide for automating post creation

---

## Overview

Instagram's web post creation is a multi-step modal flow:

1. **Click Create** → Opens modal
2. **Select Media** → Upload image/video
3. **Crop** → Adjust aspect ratio and zoom
4. **Filter/Edit** → Apply filters and adjustments
5. **Caption** → Add text, location, tags
6. **Share** → Publish the post

---

## Step 1: Open Create Modal

### Trigger
```javascript
// Find and click the Create button in sidebar
const createButton = document.querySelector(
  'div:nth-of-type(7) > div > span > div > a[href="#"]'
);

// Alternative: find by text
const createButton = Array.from(document.querySelectorAll('a[role="link"]'))
  .find(el => el.textContent.includes('Create'));

createButton.click();
```

### Wait for Modal
```javascript
await waitForElement('div[role="dialog"]');
```

### Expected State
- Modal appears with title "Create new post"
- Drag & drop zone visible
- "Select from computer" button visible

---

## Step 2: Upload Media

### Method A: File Input (Recommended for Content Scripts)
```javascript
// Find the file input (may be hidden)
const fileInput = document.querySelector('input[type="file"]');

if (!fileInput) {
  // Click "Select from computer" to reveal input
  const selectButton = findButtonByText('Select from computer');
  selectButton.click();
  await waitForElement('input[type="file"]');
}

// Create file from blob/URL
async function uploadImage(imageUrl) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
  
  const input = document.querySelector('input[type="file"]');
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  
  // Dispatch events to trigger React handlers
  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
```

### Method B: OS File Modal (Using flow-frame-core)

When automation requires interacting with the native OS file picker dialog (e.g., when clicking "Select from computer" triggers a system dialog), use `flow-frame-core`'s `fileModalOperate` function:

```javascript
// Import from flow-frame-core
import { fileModalOperate } from 'flow-frame-core/dist/operations.js';

// After clicking "Select from computer" which opens the OS file picker:
await fileModalOperate('/path/to/your/image.jpg');
```

#### How `fileModalOperate` Works

The function handles cross-platform file selection:

```javascript
// From flow-frame-core/src/operations.ts
export async function fileModalOperate(filePath) {
    // On macOS/Linux: open "Go to Folder" dialog first
    if (process.platform !== 'win32') {
        await pause(() => { goToFolderShortcut(); }, 3000);  // Cmd+Shift+G
    }

    await pause(() => { console_log_it('wait 10s'); }, 5000);
    
    // Paste the full file path
    await pasteText(filePath);

    // Press Enter to confirm
    await pause(() => { pressReturn(); }, 5000);

    // On macOS/Linux: press Enter again to select the file
    if (process.platform !== 'win32') {
        await pause(() => { pressReturn(); }, 5000);
    }
}
```

#### Platform-Specific Behavior

| Platform | Steps |
|----------|-------|
| **macOS/Linux** | 1. Press Cmd+Shift+G (Go to Folder) → 2. Paste path → 3. Press Enter → 4. Press Enter again |
| **Windows** | 1. Paste path directly → 2. Press Enter |

#### Example: Full Upload Flow with File Modal

```javascript
import { 
    moveMouse, 
    mouseClick, 
    fileModalOperate,
    pause 
} from 'flow-frame-core/dist/operations.js';

async function uploadViaFileModal(imagePath, selectButtonPosition) {
    // 1. Click the "Select from computer" button
    await moveMouse(selectButtonPosition);  // {left, top, width, height}
    await mouseClick();
    
    // 2. Wait for OS file dialog to open
    await pause(() => {}, 2000);
    
    // 3. Navigate to file and select it
    await fileModalOperate(imagePath);
    
    // 4. Wait for upload to complete
    await pause(() => {}, 3000);
}
```

#### Related flow-frame-core Functions

| Function | Description |
|----------|-------------|
| `fileModalOperate(filePath)` | Navigate OS file picker and select a file |
| `goToFolderShortcut()` | Press Cmd+Shift+G (macOS "Go to Folder") |
| `pasteText(text)` | Paste text from clipboard |
| `pressReturn()` | Press the Enter/Return key |
| `pause(fn, ms)` | Wait for specified milliseconds |
| `clearAllText()` | Select all (Cmd/Ctrl+A) then delete |

### Method C: Drag & Drop
```javascript
function simulateDrop(file) {
  const dropZone = document.querySelector('div[role="dialog"]');
  
  const dt = new DataTransfer();
  dt.items.add(file);
  
  const dropEvent = new DragEvent('drop', {
    bubbles: true,
    cancelable: true,
    dataTransfer: dt
  });
  
  dropZone.dispatchEvent(dropEvent);
}
```

### Wait for Upload Complete
```javascript
// Wait for crop interface to appear
await waitForElement('button:has-text("Next")');
// Or wait for loading to finish
await waitForElementToDisappear('[aria-label="Loading"]');
```

---

## Step 3: Crop Screen

### Available Controls

```javascript
// Aspect ratio buttons (in modal header/toolbar)
// Common ratios: Original, 1:1, 4:5, 16:9
const aspectButtons = document.querySelectorAll(
  'div[role="dialog"] button, div[role="dialog"] div[role="button"]'
);

// Zoom slider
const zoomSlider = document.querySelector('input[type="range"]');
if (zoomSlider) {
  zoomSlider.value = 50; // 0-100
  zoomSlider.dispatchEvent(new Event('input', { bubbles: true }));
}

// Add more media button (for carousel)
const addMoreButton = findButtonByText('Add');
```

### Proceed to Next Step
```javascript
const nextButton = findButtonByText('Next');
nextButton.click();

await waitForStep('filter'); // Wait for filter UI
```

---

## Step 4: Filter/Edit Screen

### Filter Selection
```javascript
// Filters are usually in a horizontal scrollable list
// Each filter has a preview thumbnail

// Skip filters (optional step)
const nextButton = findButtonByText('Next');
nextButton.click();

// Or select a specific filter by name
// Filter names: Normal, Clarendon, Gingham, Moon, Lark, Reyes, Juno, etc.
```

### Adjustments Tab
```javascript
// Switch to Adjustments tab if needed
const adjustTab = findButtonByText('Adjustments');
if (adjustTab) adjustTab.click();

// Adjustment sliders:
// Brightness, Contrast, Saturation, Temperature, Fade, Vignette, etc.
const sliders = document.querySelectorAll('input[type="range"]');
```

---

## Step 5: Caption & Details Screen

### Add Caption
```javascript
// Find caption textarea
const captionInput = document.querySelector(
  'textarea[aria-label*="caption"]'
) || document.querySelector(
  'div[role="dialog"] textarea'
);

if (captionInput) {
  // Clear existing content
  captionInput.value = '';
  
  // Set new caption
  captionInput.value = 'Your caption here #hashtag';
  
  // Trigger React handlers
  captionInput.dispatchEvent(new Event('input', { bubbles: true }));
  captionInput.dispatchEvent(new Event('change', { bubbles: true }));
  
  // For contenteditable divs
  if (captionInput.contentEditable === 'true') {
    captionInput.textContent = 'Your caption here';
    captionInput.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      inputType: 'insertText'
    }));
  }
}
```

### Add Location (Optional)
```javascript
const addLocationButton = findButtonByText('Add location');
if (addLocationButton) {
  addLocationButton.click();
  await waitForElement('input[placeholder*="location"]');
  
  const locationInput = document.querySelector('input[placeholder*="location"]');
  locationInput.value = 'New York, NY';
  locationInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Wait for suggestions and select first
  await waitForElement('div[role="listbox"] div[role="option"]');
  const firstSuggestion = document.querySelector('div[role="option"]');
  firstSuggestion.click();
}
```

### Add Alt Text (Accessibility)
```javascript
const altTextButton = findButtonByText('Accessibility');
// or
const altTextButton = findButtonByText('Alt text');

if (altTextButton) {
  altTextButton.click();
  await waitForElement('textarea[placeholder*="alt"]');
  
  const altInput = document.querySelector('textarea[placeholder*="alt"]');
  altInput.value = 'Description of the image';
  altInput.dispatchEvent(new Event('input', { bubbles: true }));
}
```

### Advanced Settings (Optional)
```javascript
const advancedButton = findButtonByText('Advanced settings');
if (advancedButton) {
  advancedButton.click();
  
  // Hide like counts
  const hideLikesToggle = document.querySelector(
    'input[type="checkbox"][aria-label*="like"]'
  );
  
  // Turn off comments
  const turnOffCommentsToggle = document.querySelector(
    'input[type="checkbox"][aria-label*="comment"]'
  );
}
```

---

## Step 6: Share/Publish

### Click Share Button
```javascript
const shareButton = findButtonByText('Share');
shareButton.click();
```

### Wait for Completion
```javascript
// Wait for "Post shared" confirmation or modal to close
async function waitForPostComplete() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Post sharing timeout'));
    }, 30000); // 30 second timeout
    
    // Method 1: Wait for success message
    const checkSuccess = setInterval(() => {
      const successMsg = document.querySelector(
        'div:has-text("shared"), div:has-text("Posted")'
      );
      if (successMsg) {
        clearInterval(checkSuccess);
        clearTimeout(timeout);
        resolve();
      }
    }, 500);
    
    // Method 2: Wait for modal to close
    const observer = new MutationObserver(() => {
      if (!document.querySelector('div[role="dialog"]')) {
        observer.disconnect();
        clearInterval(checkSuccess);
        clearTimeout(timeout);
        resolve();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

await waitForPostComplete();
console.log('Post shared successfully!');
```

---

## Complete Automation Example

```javascript
async function createInstagramPost(imageUrl, caption) {
  try {
    // Step 1: Open create modal
    console.log('Opening create modal...');
    const createButton = document.querySelector(
      'div:nth-of-type(7) > div > span > div > a[href="#"]'
    );
    createButton.click();
    await waitForElement('div[role="dialog"]');
    await sleep(500);
    
    // Step 2: Upload image
    console.log('Uploading image...');
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
    
    // Find or reveal file input
    let fileInput = document.querySelector('input[type="file"]');
    if (!fileInput) {
      const selectBtn = findButtonByText('Select from computer');
      selectBtn?.click();
      await waitForElement('input[type="file"]');
      fileInput = document.querySelector('input[type="file"]');
    }
    
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Wait for crop screen
    await waitForElement('button:has-text("Next")');
    await sleep(1000);
    
    // Step 3: Skip crop (use default)
    console.log('Proceeding through crop...');
    let nextButton = findButtonByText('Next');
    nextButton.click();
    await sleep(1000);
    
    // Step 4: Skip filters
    console.log('Proceeding through filters...');
    nextButton = findButtonByText('Next');
    nextButton.click();
    await sleep(1000);
    
    // Step 5: Add caption
    console.log('Adding caption...');
    const captionInput = document.querySelector(
      'div[role="dialog"] textarea'
    );
    if (captionInput) {
      captionInput.focus();
      captionInput.value = caption;
      captionInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await sleep(500);
    
    // Step 6: Share
    console.log('Sharing post...');
    const shareButton = findButtonByText('Share');
    shareButton.click();
    
    // Wait for completion
    await waitForPostComplete();
    console.log('Post created successfully!');
    
    return { success: true };
    
  } catch (error) {
    console.error('Failed to create post:', error);
    return { success: false, error: error.message };
  }
}

// Helper functions
function findButtonByText(text) {
  const selectors = 'button, div[role="button"], a[role="link"]';
  return Array.from(document.querySelectorAll(selectors))
    .find(el => el.textContent.includes(text));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) { resolve(el); return; }
    
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for ${selector}`));
    }, timeout);
  });
}
```

---

## Using flow-frame-core for Desktop Automation

When automating Instagram from outside the browser (e.g., with woodbury or a Node.js script), you can use flow-frame-core's mouse/keyboard functions:

```javascript
import { 
    moveMouse,           // Move mouse to element (with Chrome offset)
    moveMouseDesktop,    // Move mouse (no Chrome offset)
    mouseClick,          // Left click
    scroll,              // Scroll mouse wheel
    typeText,            // Type with modifiers
    pressKey,            // Press key with modifiers  
    pasteText,           // Paste from clipboard
    clearAllText,        // Cmd/Ctrl+A then Delete
    pressReturn,         // Press Enter
    fileModalOperate,    // Navigate OS file picker
    isWindows            // Platform check
} from 'flow-frame-core/dist/operations.js';

async function automateInstagramPost(imagePath, caption) {
    const SPEED = 5000; // Delay between actions
    
    // Assume browser_query has given us element positions
    // from the Chrome extension
    
    // 1. Click Create button
    await moveMouse(createButtonPosition);
    await mouseClick();
    await pause(() => {}, SPEED);
    
    // 2. Click "Select from computer"
    await moveMouse(selectFilesButtonPosition);
    await mouseClick();
    await pause(() => {}, 2000);
    
    // 3. Handle OS file dialog
    await fileModalOperate(imagePath);
    await pause(() => {}, SPEED);
    
    // 4. Click through crop/filter screens
    await moveMouse(nextButtonPosition);
    await mouseClick();
    await pause(() => {}, SPEED);
    
    await moveMouse(nextButtonPosition);
    await mouseClick();
    await pause(() => {}, SPEED);
    
    // 5. Add caption
    await moveMouse(captionInputPosition);
    await mouseClick();
    await clearAllText();
    await pasteText(caption);
    await pause(() => {}, SPEED);
    
    // 6. Click Share
    await moveMouse(shareButtonPosition);
    await mouseClick();
}
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Modal doesn't open | Create button not found | Check sidebar selectors |
| File upload fails | File input hidden | Click "Select from computer" first |
| OS file dialog issues | Wrong platform handling | Use `fileModalOperate` which handles macOS/Windows |
| Caption not saved | React state not updated | Use dispatchEvent properly |
| Share button inactive | Required fields missing | Check for validation errors |
| Timeout on share | Network/server issues | Retry with exponential backoff |

### Validation Checks
```javascript
function validatePostReady() {
  const errors = [];
  
  // Check if media is uploaded
  const mediaPreview = document.querySelector('img[src*="blob:"], video');
  if (!mediaPreview) errors.push('No media uploaded');
  
  // Check if share button is enabled
  const shareBtn = findButtonByText('Share');
  if (shareBtn?.disabled) errors.push('Share button is disabled');
  
  return errors;
}
```

---

## Rate Limiting Considerations

- Instagram has undisclosed rate limits for posting
- Recommended: No more than 1 post per 5 minutes via automation
- Monitor for "Action Blocked" errors
- Include random delays between actions to appear more human-like

---

## Testing Checklist

- [ ] Create modal opens correctly
- [ ] Single image upload works
- [ ] OS file dialog works (via fileModalOperate)
- [ ] Caption is saved correctly
- [ ] Share button publishes post
- [ ] Error states are handled
- [ ] Modal can be cancelled/closed
- [ ] Works with different image formats (JPEG, PNG)
- [ ] Works with different image sizes
- [ ] Hashtags are preserved in caption
- [ ] Emojis are preserved in caption
