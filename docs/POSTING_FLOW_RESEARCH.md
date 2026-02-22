# Instagram Posting Flow - Detailed Research

> Research conducted 2024-02-22 by exploring instagram.com web interface
> Updated with precise coordinates and DOM selectors from browser automation testing

## Overview

This document details the complete flow for posting images/videos to Instagram via the web interface, including exact selectors, coordinates, and automation strategies.

---

## CRITICAL: Exact Screen Coordinates

With Chrome UI offset of **121px** (tabs + address bar):

| Element | Viewport (left, top) | Screen (x, y) | Size |
|---------|---------------------|---------------|------|
| Create button | (24, 642) | (36, 819) | 24x24 |
| Post option (submenu) | (28, 694) | (94, 869) | 132x20 |
| Select from computer | (939, 623) | (1028, 804) | 179x32 |
| Dialog center | - | (1028, 717) | 895x938 |

---

## Post Creation Flow

### Step 1: Click Create Button

**Location:** Left sidebar, 7th navigation item

**Selectors:**
- SVG icon: `svg[aria-label="New post"]`
- Parent link: `div:nth-of-type(7) > div > span > div > a`
- Text: "New postCreate"

**Position:**
- Viewport: `left=24, top=642, width=24, height=24`
- Screen coords: `(36, 819)` 

**Code:**
```javascript
// Option 1: Mouse click (most reliable)
mouse({ action: "click", x: 36, y: 819, delayMs: 1500 })

// Option 2: DOM click (sometimes doesn't trigger)
browser_query({ action: "click_element", selector: "div:nth-of-type(7) > div > span > div > a" })
```

---

### Step 2: Click "Post" in Submenu

**IMPORTANT:** After clicking Create, a small popup menu appears with two options:
- **Post** - Opens the create post modal
- **AI** - Opens AI generation feature

**Selectors for "Post" option:**
- Text span: `span` containing "Post" 
- SVG: `svg[aria-label="Post"]`
- Container: `a:nth-of-type(1) > div > div > div > div:nth-of-type(2)`

**Position:**
- Viewport: `left=28, top=694, width=132, height=20`
- Screen coords: `(94, 869)`

**Code:**
```javascript
// Wait for submenu to appear (500-1000ms)
mouse({ action: "click", x: 94, y: 869, delayMs: 1500 })
```

---

### Step 3: Create New Post Dialog

**Dialog appears with:**
- `role="dialog"` 
- `aria-label="Create new post"`
- Size: ~895x938 pixels
- Position: `left=581, top=83`

**Contents:**

| Element | Selector | Position (viewport) | Size |
|---------|----------|---------------------|------|
| Title | (header text) | - | - |
| Media Icon | SVG | - | - |
| Instructions | text | - | "Drag photos and videos here" |
| **Select from computer** | `div > div > div:nth-of-type(2) > div > button` | (939, 623) | 179x32 |
| Hidden file input | `form > input` | (0, 0) | Hidden |

**Dialog selectors:**
```css
/* The dialog itself */
div[aria-label="Create new post"]
[role='dialog']

/* Select from computer button */
[role='dialog'] button
div > div > div:nth-of-type(2) > div > button

/* File input (hidden) */
[role='dialog'] form input
```

---

### Step 4: File Selection

**Method A: Click "Select from computer"**
```javascript
mouse({ action: "click", x: 1028, y: 804, delayMs: 1000 })
// This opens the macOS file picker
```

**Method B: OS File Modal (macOS)**

Using `flow-frame-core`'s `fileModalOperate()`:
1. Press `Cmd+Shift+G` to open "Go to Folder" dialog
2. Type/paste the full file path
3. Press Enter (navigates to file)
4. Press Enter again (selects file)

```javascript
// flow-frame-core pattern
keyboard({ action: "hotkey", key: "g", ctrl: true, shift: true })
// Wait 500ms
keyboard({ action: "type", text: "/path/to/image.png" })
keyboard({ action: "press", key: "enter" })
// Wait 500ms  
keyboard({ action: "press", key: "enter" })
```

**Method C: Drag and Drop**
- The dialog supports drag-and-drop of files onto the upload area
- Less reliable for automation

---

### Step 5: Crop View

**Dialog changes to:**
- `aria-label="Crop"`
- Shows uploaded image with crop overlay

**Elements:**

| Element | Purpose | Notes |
|---------|---------|-------|
| Back button | Return to upload | `button[aria-label="Go back"]` |
| Image preview | Shows cropped result | |
| Crop handles | Resize crop area | |
| Aspect ratio | Change crop shape | 1:1, 4:5, 16:9, Original |
| Add more | Add multiple images | |
| **Next button** | Proceed to edit | `div[role="button"]` containing "Next" |

**Crop aspect ratios:**
- Original (preserves upload ratio)
- 1:1 (Square - default for posts)
- 4:5 (Portrait)
- 16:9 (Landscape)

---

### Step 6: Edit/Filter View (Optional)

For images: Shows filters and adjustments
For videos: Shows cover photo and trim options

**Elements:**
- Filter options (various Instagram filters)
- Adjustment sliders
- **Next button** to proceed

---

### Step 7: Caption & Details View

**Dialog contents:**

| Element | Selector | Purpose |
|---------|----------|--------|
| Caption textbox | `div[aria-label="Write a caption..."]` | Enter caption text |
| Emoji picker | (button near caption) | Add emojis |
| Character counter | - | Shows "0/2,200" |
| Location input | `input` in location section | Add location tag |
| Collaborators | `input` in collab section | Invite collaborators |
| Tag people | button | Tag users in image |
| Share to Facebook | `input[role="switch"]` | Cross-post toggle |
| Advanced settings | collapsed section | Alt text, comments, likes |
| **Share button** | Top-right `div[role="button"]` containing "Share" | Publish post |

**Caption textbox:**
- Character limit: 2,200
- Supports hashtags, mentions, emojis
- Line breaks allowed

---

### Step 8: Publish

**Share button:**
- Located top-right of caption dialog
- Selector: `div[role="button"]` containing text "Share"

**After clicking Share:**
1. Dialog shows "Sharing..." progress
2. On success: "Your post has been shared" confirmation
3. Dialog closes
4. Feed may refresh to show new post

---

## Complete Automation Code Example

```javascript
// === POST TO INSTAGRAM ===

// 1. Ensure on Instagram
browser({ action: "open", url: "https://www.instagram.com/", waitMs: 5000 });

// 2. Close any open panels (notifications, search)
keyboard({ action: "press", key: "escape" });
await pause(500);

// 3. Click Create button  
mouse({ action: "click", x: 36, y: 819, delayMs: 1500 });

// 4. Click "Post" in submenu
mouse({ action: "click", x: 94, y: 869, delayMs: 1500 });

// 5. Wait for dialog and click "Select from computer"
await waitForElement('[role="dialog"]');
mouse({ action: "click", x: 1028, y: 804, delayMs: 1000 });

// 6. Handle file picker (macOS)
keyboard({ action: "hotkey", key: "g", cmd: true, shift: true });
await pause(500);
keyboard({ action: "type", text: "/Users/user/Pictures/photo.jpg" });
keyboard({ action: "press", key: "enter" });
await pause(500);
keyboard({ action: "press", key: "enter" });
await pause(2000);

// 7. Click Next (skip crop)
browser_query({ action: "find_interactive", description: "Next button" });
mouse({ action: "click", position: result.bounds, delayMs: 1000 });

// 8. Click Next (skip filters)
browser_query({ action: "find_interactive", description: "Next button" });
mouse({ action: "click", position: result.bounds, delayMs: 1000 });

// 9. Enter caption
browser_query({ action: "click_element", selector: "div[aria-label='Write a caption...']" });
keyboard({ action: "type", text: "My awesome photo! #photography #instagram" });

// 10. Click Share
browser_query({ action: "find_interactive", description: "Share button" });
mouse({ action: "click", position: result.bounds, delayMs: 2000 });

// Done! Post is published
```

---

## Key Selectors Quick Reference

```css
/* Navigation */
svg[aria-label="New post"]              /* Create button icon */
div:nth-of-type(7) > div > span > div > a /* Create button link */

/* Create submenu */
svg[aria-label="Post"]                  /* Post option icon */
a:nth-of-type(1)                         /* Post option link (first in submenu) */

/* Create dialog */
div[aria-label="Create new post"]       /* Dialog container */
[role='dialog']                          /* Any dialog */
[role='dialog'] button                   /* Select from computer */

/* Crop view */
div[aria-label="Crop"]                  /* Crop dialog */
button[aria-label="Go back"]            /* Back button */

/* Caption view */
div[aria-label="Write a caption..."]    /* Caption textbox */

/* Action buttons (find by text) */
div[role="button"]                      /* All buttons - filter by text */
```

---

## Troubleshooting

### Problem: Notifications panel opens instead of Create
**Solution:** Click elsewhere first to close any open panels, or press Escape

### Problem: DOM click doesn't trigger submenu
**Solution:** Use mouse click with screen coordinates instead of DOM click

### Problem: File picker doesn't open
**Solution:** Use Tab + Enter after focusing the button, or use direct mouse click

### Problem: Can't interact with file picker
**Solution:** Use flow-frame-core's fileModalOperate() or keyboard shortcuts

### Problem: Selectors not found
**Solution:** Instagram uses dynamic class names. Use stable attributes:
- `aria-label`
- `role`
- Text content
- Structural position (nth-of-type)

---

## Testing Notes

- Tested on: macOS, Chrome, Instagram web (February 2024)
- Chrome UI offset: 121px (tabs + address bar)
- Image formats: PNG, JPEG
- Video formats: MP4 (shows as "New reel" with additional options)
