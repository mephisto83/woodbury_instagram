# Instagram DOM Selectors for Automation

## Date: 2026-02-19
## Purpose: Reliable selectors for browser automation

---

## ⚠️ Important Notes

1. **Class names are unreliable** - Instagram minifies class names and they change frequently
2. **Prefer these selector strategies** (in order of reliability):
   - `aria-label` attributes
   - `role` attributes
   - Text content matching
   - Structural position (nth-of-type)
   - `data-*` attributes (when available)

3. **Always use `MutationObserver`** - Instagram is a React SPA, elements appear asynchronously

---

## Navigation Elements

### Left Sidebar Items

```javascript
// Instagram Logo (Home)
'div:nth-of-type(1) > div > span > div > a[href="/"]'

// Home
'a[href="/"]:has-text("Home")'
// or by position
'div:nth-of-type(1) > div > span > div > a'

// Reels
'a[href="/reels/"]'

// Messages (with badge count)
'a[href="/direct/inbox/"]'

// Search (opens panel, not a real navigation)
'div > div:nth-of-type(4) > span > div > a[href="#"]'

// Explore
'a[href="/explore/"]'

// Notifications (opens panel)
'div:nth-of-type(6) > div > span > div > a[href="#"]'

// Create Post (critical for posting)
'div:nth-of-type(7) > div > span > div > a[href="#"]'
// Alternative: find by aria or text
'a:has-text("Create")'
'a:has-text("New post")'

// Profile
'a[href="/<username>/"]'  // Replace <username>

// Settings/More
'div > div:nth-of-type(3) > span:nth-of-type(1) > div > a[href="#"]'
```

---

## Create Post Flow

### Step 1: Open Create Modal

```javascript
// Click Create button
const createButton = document.querySelector('div:nth-of-type(7) > div > span > div > a[href="#"]');
createButton.click();

// Wait for modal
await waitForElement('div[role="dialog"]');
```

### Step 2: Modal Elements

```javascript
// Modal container
'div[role="dialog"]'

// Close button
'div[aria-label="Close"]'

// File input (may be hidden)
'input[type="file"][accept*="image"]'
'input[type="file"]'

// "Select from computer" button
// Usually a button or clickable div that triggers the file input
'button:has-text("Select from computer")'
'div[role="button"]:has-text("Select")'
```

### Step 3: Caption/Share

```javascript
// Caption textarea
'textarea[aria-label*="caption"]'
'textarea[placeholder*="caption"]'

// Share button
'button:has-text("Share")'
'div[role="button"]:has-text("Share")'

// Next button (between steps)
'button:has-text("Next")'
'div[role="button"]:has-text("Next")'
```

---

## Feed Interactions

### Post Container

```javascript
// Article elements contain individual posts
'article'

// Post author link
'article a[role="link"][href^="/"]'  // Links starting with /
```

### Interaction Buttons

```javascript
// Like button (in section)
'section > div:nth-of-type(1) > span:nth-of-type(1) > div > div[role="button"]'
// Alternative: by aria-label
'div[role="button"][aria-label="Like"]'
'svg[aria-label="Like"]'

// Unlike (when already liked)
'svg[aria-label="Unlike"]'

// Comment button
'div[role="button"]:has(svg[aria-label="Comment"])'

// Share button
'div[role="button"]:has-text("Share")'

// Save button
'div[role="button"]:has-text("Save")'
'div[role="button"][aria-label="Save"]'

// Remove from saved
'div[role="button"][aria-label="Remove"]'
```

### Like/Comment Counts

```javascript
// Like count (clickable to see who liked)
'span[role="button"]:has-text("likes")'
'button:has-text("likes")'

// View all comments
'span:has-text("View all")'
```

---

## Stories

### Story Tray

```javascript
// Story items (unseen)
'div[aria-label^="Story by"][aria-label$="not seen"]'

// Story items (already seen)
'div[aria-label^="Story by"]:not([aria-label$="not seen"])'

// Specific user's story
'div[aria-label="Story by USERNAME, not seen"]'  // Replace USERNAME

// Story navigation
'button[aria-label="Next"]'
'button[aria-label="Previous"]'
```

---

## Reels

### Navigation

```javascript
// Previous reel
'div[aria-label="Navigate to previous Reel"]'

// Next reel
'div[aria-label="Navigate to next Reel"]'
```

### Video Controls

```javascript
// Mute/Unmute
'button[aria-label="Toggle audio"]'

// Current state indicator
'div[aria-label="Audio is muted"]'
```

### Reel Interactions

```javascript
// Like
'div:nth-of-type(2) > div:nth-of-type(1) > span > div > div[role="button"]'

// Comment
'div:nth-of-type(2) > div:nth-of-type(2) > div[role="button"]'

// Share
'div:nth-of-type(2) > div:nth-of-type(3) > div[role="button"]'

// Save
'div:nth-of-type(2) > div:nth-of-type(4) > div > div[role="button"]'
```

---

## Direct Messages

### Inbox

```javascript
// New message button
'div[role="button"]:has-text("New message")'

// Thread items
'div[role="button"]:has-text("Unread")' // Unread threads

// Message requests
'a[href="/direct/requests/"]'
```

### Conversation

```javascript
// Message input
'textarea[placeholder*="Message"]'
'div[role="textbox"]'

// Send button
'button:has-text("Send")'
```

---

## Profile Page

### Profile Header

```javascript
// Profile picture
'section:nth-of-type(1) span[role="link"]'  // Clickable avatar

// Edit profile button
'a[href="/accounts/edit/"]'

// Followers count
'a[href*="/followers/"]'

// Following count
'a[href*="/following/"]'

// Options button
'div[role="button"]:has-text("Options")'
```

### Profile Tabs

```javascript
// Posts tab
'a[href="/<username>/"]'  // Base profile URL

// Reels tab
'a[href="/<username>/reels/"]'

// Saved tab (own profile only)
'a[href="/<username>/saved/"]'

// Tagged tab
'a[href="/<username>/tagged/"]'
```

### Post Grid

```javascript
// All post links
'main a[role="link"][href*="/p/"]'  // Regular posts
'main a[role="link"][href*="/reel/"]'  // Reels

// Post type indicators (visible on hover)
'a[role="link"]:has-text("Clip")'  // Reel
'a[role="link"]:has-text("Carousel")'  // Multi-image
```

---

## Settings

### Settings Menu (from sidebar)

```javascript
// Settings link
'a[href="/accounts/edit/"]:has-text("Settings")'

// Your activity
'a[href="/your_activity/interactions"]'

// Saved
'a:has-text("Saved")'

// Switch appearance (theme)
'div[role="button"]:has-text("Switch appearance")'

// Log out
'div[role="button"]:has-text("Log out")'
```

### Edit Profile Form

```javascript
// Change photo
'div[role="button"]:has-text("Change photo")'

// Form inputs (by position/label context)
// Name, Username, Bio, etc.

// Toggle switches
'input[role="switch"][aria-label="Show Threads badge"]'
'input[role="switch"][aria-label="Show account suggestions on profiles"]'

// Submit button
'div[role="button"]:has-text("Submit")'
```

---

## Search

### Search Panel

```javascript
// Search input
'input[aria-label="Search input"]'
'input[placeholder="Search"]'

// Clear search
'div[aria-label="Clear the search box"]'

// Recent searches
'div:has-text("Recent") + div'  // Container after "Recent" label

// Clear all recents
'div[role="button"]:has-text("Clear all")'

// Search result items
'a[role="link"][href^="/"]'  // User/hashtag links in results
```

---

## Notifications

### Notification Panel

```javascript
// Notification items
'div[role="button"]'  // In notification panel context

// Follow back button
'button:has-text("Follow")'
```

---

## Utility Functions

### Wait for Element

```javascript
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found after ${timeout}ms`));
    }, timeout);
  });
}
```

### Find by Text Content

```javascript
function findByText(text, tag = '*') {
  const elements = document.querySelectorAll(tag);
  return Array.from(elements).find(el => 
    el.textContent.includes(text)
  );
}

function findButtonByText(text) {
  return findByText(text, 'button, div[role="button"], a[role="link"]');
}
```

### Click with Retry

```javascript
async function clickWithRetry(selector, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const element = await waitForElement(selector, 5000);
      element.click();
      return true;
    } catch (e) {
      if (i === maxAttempts - 1) throw e;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}
```

### Trigger File Input

```javascript
function triggerFileUpload(file) {
  const input = document.querySelector('input[type="file"]');
  if (!input) throw new Error('File input not found');
  
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
```

---

## flow-frame-core Integration

When automating Instagram from outside the browser (e.g., via woodbury or a Node.js script), use flow-frame-core's mouse, keyboard, and file modal functions.

### Key Functions from flow-frame-core

```javascript
import {
    // Mouse control
    moveMouse,           // Move to element position (with Chrome offset)
    moveMouseDesktop,    // Move to position (no Chrome offset, for desktop apps)
    moveMouseRelative,   // Move relative to current position
    mouseClick,          // Left click at current position
    scroll,              // Scroll mouse wheel (x, y)
    
    // Keyboard control
    typeText,            // Press key with modifiers {keys, ctrl, shift, alt}
    pressKey,            // Press key with modifier toggle
    pasteText,           // Paste text from clipboard
    clearAllText,        // Cmd/Ctrl+A then Delete
    pressReturn,         // Press Enter key
    pressEscapeAsync,    // Press Escape key
    
    // File modal handling
    fileModalOperate,    // Navigate OS file picker dialog
    
    // Platform detection
    isWindows            // Returns true on Windows
} from 'flow-frame-core/dist/operations.js';
```

### Mouse Movement with Chrome Offset

flow-frame-core automatically compensates for Chrome's UI (tabs, address bar):

```javascript
// Chrome offset values used internally
const chrome_offsets = { x: 1, y: 125 };

// moveMouse calculates:
// targetX = element.left + chrome_offsets.x + (element.width / 2)
// targetY = element.top + chrome_offsets.y + (element.height / 4)
```

### Using Element Positions

Element positions come from browser queries (e.g., Chrome extension or browser_query tool):

```javascript
// Position object format
const elementPosition = {
    left: 419.87,    // X coordinate in viewport
    top: 379.89,     // Y coordinate in viewport
    width: 120.24,   // Element width
    height: 24.00    // Element height
};

// Move and click
await moveMouse(elementPosition);
await mouseClick();
```

### File Modal Operation

When clicking "Select from computer" triggers an OS file picker:

```javascript
// fileModalOperate handles cross-platform file selection
export async function fileModalOperate(filePath) {
    // macOS/Linux: Press Cmd+Shift+G to open "Go to Folder"
    if (process.platform !== 'win32') {
        await pause(() => { goToFolderShortcut(); }, 3000);
    }

    // Wait for dialog to be ready
    await pause(() => {}, 5000);
    
    // Paste the full file path
    await pasteText(filePath);

    // Press Enter to navigate/confirm
    await pause(() => { pressReturn(); }, 5000);

    // macOS/Linux: Press Enter again to select the file
    if (process.platform !== 'win32') {
        await pause(() => { pressReturn(); }, 5000);
    }
}
```

### Complete Example: Post Image via Desktop Automation

```javascript
import { 
    moveMouse, 
    mouseClick, 
    pasteText, 
    clearAllText,
    fileModalOperate,
    scroll
} from 'flow-frame-core/dist/operations.js';

async function postToInstagram(imagePath, caption, positions) {
    const SPEED = 3000;
    
    // positions = object containing element positions from browser_query
    // e.g., { createButton, selectFiles, nextButton, captionInput, shareButton }
    
    // 1. Click Create button
    await moveMouse(positions.createButton);
    await pause(() => {}, 500);
    await mouseClick();
    await pause(() => {}, SPEED);
    
    // 2. Click "Select from computer" (triggers OS file dialog)
    await moveMouse(positions.selectFiles);
    await mouseClick();
    await pause(() => {}, 2000);
    
    // 3. Handle OS file dialog
    await fileModalOperate(imagePath);
    await pause(() => {}, SPEED);
    
    // 4. Click Next (crop screen)
    await moveMouse(positions.nextButton);
    await mouseClick();
    await pause(() => {}, SPEED);
    
    // 5. Click Next (filter screen)
    await moveMouse(positions.nextButton);
    await mouseClick();
    await pause(() => {}, SPEED);
    
    // 6. Enter caption
    await moveMouse(positions.captionInput);
    await mouseClick();
    await clearAllText();
    await pasteText(caption);
    await pause(() => {}, 1000);
    
    // 7. Click Share
    await moveMouse(positions.shareButton);
    await mouseClick();
    
    console.log('Post submitted!');
}

function pause(fn, ms) {
    return new Promise(resolve => {
        setTimeout(() => {
            if (fn) fn();
            resolve();
        }, ms);
    });
}
```

---

## Debugging Tips

### In Chrome DevTools

```javascript
// Find all role="button" elements
document.querySelectorAll('[role="button"]')

// Find all aria-label attributes
document.querySelectorAll('[aria-label]')

// Check if element is visible
function isVisible(el) {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

// Get computed styles
getComputedStyle(element)

// Monitor DOM changes
const observer = new MutationObserver(mutations => {
  console.log('DOM changed:', mutations);
});
observer.observe(document.body, { childList: true, subtree: true });
```

### Common Issues

1. **Element not found:** Element may not be rendered yet. Use MutationObserver.
2. **Click not working:** Element may be covered by another element. Check z-index.
3. **Form not submitting:** May need to trigger React's synthetic events.
4. **Modal not closing:** Look for close button or click outside modal.
5. **OS file dialog issues:** Use `fileModalOperate` from flow-frame-core for cross-platform handling.
6. **Wrong click position:** Ensure Chrome offset compensation is applied (use `moveMouse` not `moveMouseDesktop`).
