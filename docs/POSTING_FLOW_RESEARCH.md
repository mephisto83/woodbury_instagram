# Instagram Posting Flow - Detailed Research

> Research conducted 2024-02-20 by exploring instagram.com web interface

## Overview

This document details the complete flow for posting images/videos to Instagram via the web interface, including exact selectors, coordinates, and automation strategies.

## Post Creation Flow

### Step 1: Open Create Post Modal

**Method A: Click Create in Sidebar**
1. The sidebar has navigation items. The "Create" button (7th item) has selector:
   - `div:nth-of-type(7) > div > span > div > a` (when sidebar is expanded)
   - Contains SVG with `aria-label="New post"`
   - Text: "New postCreate"

2. **Important Discovery**: Clicking "Create" opens a **submenu** with two options:
   - **"Post"** - For regular image/video posts
   - **"AI"** - Links to Instagram AI Studio

3. Click **"Post"** to open the Create modal:
   - Selector: `div > div > div > div:nth-of-type(1) > a:nth-of-type(1)`
   - Text: "PostPost"

**Method B: Direct URL**
- There is no direct URL to open the create modal (it's a client-side overlay)

### Step 2: Create New Post Modal

**Modal Structure:**
- `role="dialog"` with `aria-label="Create new post"`
- Title: "Create new post"
- Size: ~895x938 pixels

**Elements:**
- **Drag/Drop Zone**: Icon and text "Drag photos and videos here"
- **Select Button**: `button` with text "Select from computer"
  - Position: (1028, 639)
  - Size: 179x32
  - Selector: `div > div > div:nth-of-type(2) > div > button`
- **File Input**: Hidden `input[type="file"]` elements (multiple for different contexts)
  - Selector: `div > div:nth-of-type(2) > div:nth-of-type(1) > form > input`

### Step 3: File Selection

**Triggering File Picker:**
1. Clicking "Select from computer" button doesn't always work via DOM click
2. **Working approach**: Use keyboard after focusing the button:
   - Tab to button
   - Press Enter
   - This opens the macOS file picker

**File Modal Operation (macOS):**
1. Press `Cmd+Shift+G` to open "Go to Folder" dialog
2. Type/paste the full file path
3. Press Enter (navigates to file)
4. Press Enter again (selects file)

This is exactly what `flow-frame-core`'s `fileModalOperate()` function does.

### Step 4: Crop View

**Modal Changes:**
- `aria-label="Crop"`
- Shows uploaded image/video with crop overlay

**Elements:**
- **Back Button**: `button[aria-label="Go back"]` at ~(626, 551)
- **Next Button**: `div[role="button"]` with text "Next"
  - Position: ~(1424, 123)
  - Selector: `div > div > div:nth-of-type(3) > div > div` (in Crop dialog context)
- **Select Crop**: Button to change aspect ratio
  - Position: ~(633, 968)
  - Selector: `div:nth-of-type(1) > div > div:nth-of-type(2) > div > button`
- **Media Gallery**: Button to add more images
  - Position: ~(1424, 968)

**Crop Options** (available via Select Crop):
- Original
- 1:1 (Square)
- 4:5 (Portrait)
- 16:9 (Landscape)

### Step 5: Edit View (for Videos)

If uploading a video, shows:
- **Cover Photo Selection**: Choose video frame or upload custom
- **Trim**: Adjust video length
- **Sound Toggle**: On/Off

**Next Button**: ~(1594, 123)

### Step 6: Caption & Details View

**Modal Changes:**
- Title changes to "New reel" (for videos) or stays "Create new post" (for images)
- Size expands to ~1235x938

**Elements:**

1. **User Avatar & Name**: Shows posting account
   - Username: mephistophelesporter (example)

2. **Caption Textbox**:
   - `div[role="textbox"]` with `aria-label="Write a caption..."`
   - Position: ~(1456, 289)
   - Size: 339x168
   - Character limit: 2,200
   - Counter shows: "0/2,200"
   - **Emoji Picker**: Available next to caption

3. **Add Location**:
   - `input` field
   - Position: ~(1440, 440)
   - Selector: `div:nth-of-type(1) > div:nth-of-type(3) > div > label > input`

4. **Add Collaborators**:
   - `input` field
   - Position: ~(1440, 484)
   - Selector: `div:nth-of-type(1) > div:nth-of-type(4) > div > label > input`

5. **Share to Facebook Toggle**:
   - `input[role="switch"]`
   - Position: ~(1590, 580)

6. **Advanced Settings** (collapsed by default):
   - Accessibility alt text
   - Turn off commenting
   - Hide like counts

7. **Tags Button**: For tagging people in the photo
   - Text: "Tags" / "Tag people"

### Step 7: Share/Publish

**Share Button:**
- `div[role="button"]` with text "Share"
- Position: ~(1590, 123) (top right of dialog)
- Selector: `div > div > div:nth-of-type(3) > div > div` (in caption dialog context)

**After Sharing:**
- Modal shows "Sharing..." progress
- On success: "Your reel has been shared" / "Post shared"
- Option to view the post

## Key DOM Selectors Summary

| Element | Selector | Notes |
|---------|----------|-------|
| Create button (sidebar) | `svg[aria-label="New post"]` | Icon |
| Post option (submenu) | `a:contains("Post")` | After Create click |
| Select from computer | `div[role="dialog"] button:contains("Select from computer")` | Modal |
| File input | `input[type="file"]` | Hidden |
| Crop Next | `div[aria-label="Crop"] div[role="button"]:contains("Next")` | |
| Caption textbox | `div[aria-label="Write a caption..."]` | role="textbox" |
| Location input | `label:contains("Add location") input` | |
| Share button | `div[role="dialog"] div[role="button"]:contains("Share")` | Final |

## Automation Strategy

### Recommended Approach

1. **Use `browser_query` for element discovery** - Get exact selectors and positions
2. **Use `browser_query(action="click_element")` for DOM interactions** - Works for most buttons
3. **Use `mouse` click for file dialog trigger** - DOM click doesn't always work
4. **Use `keyboard` for file path entry** - Cmd+Shift+G, type path, Enter, Enter
5. **Use `browser_query(action="set_value")` for text inputs** - Caption, location

### Focus Sandwich Pattern

```
browser(action="focus", appName="Google Chrome")  // Focus Chrome
// ... interact with elements ...
browser(action="focus", appName="Terminal")       // Return focus
```

### Complete Automation Example

```javascript
// 1. Open Instagram
browser({ action: "open", url: "https://www.instagram.com/", waitMs: 5000 });

// 2. Click Create button
browser_query({ action: "click_element", selector: "svg[aria-label='New post']" });
// Wait for submenu
await pause(500);

// 3. Click "Post" option
browser_query({ action: "find_element_by_text", text: "Post", tag: "a" });
browser_query({ action: "click_element", x: result.x, y: result.y });
// Wait for modal
await pause(1000);

// 4. Open file picker
browser({ action: "focus", appName: "Google Chrome" });
keyboard({ action: "press", key: "tab" });
keyboard({ action: "press", key: "enter" });
await pause(1000);

// 5. Navigate to file
keyboard({ action: "hotkey", key: "g", ctrl: true, shift: true });
await pause(500);
keyboard({ action: "type", text: "/path/to/image.jpg" });
keyboard({ action: "press", key: "enter" });
await pause(500);
keyboard({ action: "press", key: "enter" });
await pause(2000);

// 6. Skip crop (click Next)
browser_query({ action: "find_interactive", description: "Next button in Crop dialog" });
browser_query({ action: "click_element", x: result.x, y: result.y });
await pause(1000);

// 7. Add caption
browser_query({ action: "click_element", selector: "div[aria-label='Write a caption...']" });
keyboard({ action: "type", text: "My awesome post! #instagram #automation" });

// 8. Share
browser_query({ action: "find_interactive", description: "Share button" });
browser_query({ action: "click_element", x: result.x, y: result.y });
```

## Challenges & Solutions

### Challenge 1: Create button submenu
**Problem**: Clicking "Create" opens a submenu, not directly the modal
**Solution**: After clicking Create, wait for submenu and click "Post"

### Challenge 2: File input doesn't respond to programmatic clicks
**Problem**: `browser_query(action="click_element")` on "Select from computer" doesn't always open file picker
**Solution**: Use Tab + Enter keyboard navigation, or click with `mouse` tool

### Challenge 3: File dialog is OS-level
**Problem**: Can't interact with macOS file picker via DOM
**Solution**: Use `flow-frame-core`'s `fileModalOperate()` or keyboard shortcuts:
  - Cmd+Shift+G → Type path → Enter → Enter

### Challenge 4: Dynamic selectors
**Problem**: Instagram uses generated class names that change
**Solution**: Use stable attributes:
  - `aria-label`
  - `role`
  - Text content
  - Relative position selectors

### Challenge 5: React event handling
**Problem**: Some elements need real mouse events, not just DOM clicks
**Solution**: Use `mouse` tool with flow-frame's Chrome offset compensation

## Page Structure Reference

```
instagram.com/
├── Left Sidebar (navigation)
│   ├── Instagram logo (home link)
│   ├── Home
│   ├── Reels
│   ├── Messages
│   ├── Search
│   ├── Explore  
│   ├── Notifications
│   ├── Create → Opens submenu
│   │   ├── Post → Opens Create modal
│   │   └── AI → Links to aistudio.instagram.com
│   ├── Profile
│   └── More (settings)
├── Main Feed (center)
└── Suggestions (right sidebar)

Create Modal Flow:
├── Step 1: Upload
│   ├── Drag/drop zone
│   └── "Select from computer" button
├── Step 2: Crop
│   ├── Image preview with crop handles
│   ├── Aspect ratio selector
│   └── Next button
├── Step 3: Edit (videos only)
│   ├── Cover photo selector
│   ├── Trim control
│   └── Sound toggle
└── Step 4: Caption & Share
    ├── Caption textbox (2200 char limit)
    ├── Emoji picker
    ├── Location input
    ├── Collaborators input
    ├── Tag people
    ├── Share to Facebook toggle
    ├── Advanced settings
    └── Share button
```

## Testing Notes

- Tested on: macOS, Chrome, Instagram web (February 2024)
- Account logged in as: mephistophelesporter
- Image uploaded: PNG file from ~/Documents/ai/renders/
- Video handling: Automatically detected, shows as "New reel" with additional editing options
