# Instagram Button Research

Comprehensive documentation of Instagram's web interface buttons and their functions.

## Last Updated
2024-02-22

---

## Left Sidebar Navigation

The left sidebar contains the main navigation buttons. They are arranged vertically from top to bottom:

| Position | Button | Selector | Action | Notes |
|----------|--------|----------|--------|-------|
| 1 | **Instagram Logo** | `div:nth-of-type(1) > div > span > div > a[href='/']` | Navigate to home | Top of sidebar |
| 2 | **Home** | `div:nth-of-type(1) > div > span > div > a[href='/']` | Navigate to home feed | SVG icon: house |
| 3 | **Reels** | `div > div:nth-of-type(2) > span > div > a[href='/reels/']` | Navigate to Reels | SVG icon: video play |
| 4 | **Messages** | `div > div > span > div > a[href='/direct/inbox/']` | Navigate to DMs | Shows unread count badge |
| 5 | **Search** | `div > div:nth-of-type(4) > span > div > a[href='#']` | Opens search panel | Slides out from left |
| 6 | **Explore** | `div > div:nth-of-type(5) > span > div > a[href='/explore/']` | Navigate to Explore | Grid of suggested content |
| 7 | **Notifications** | `div:nth-of-type(6) > div > span > div > a[href='#']` | Opens notifications panel | Slides out from left |
| 8 | **Create** | `div:nth-of-type(7) > div > span > div > a[href='#']` | Opens create submenu | SVG: `aria-label="New post"` |
| 9 | **Profile** | `div:nth-of-type(8) > div > span > div > a[href='/<username>/']` | Navigate to your profile | Shows profile picture |
| 10 | **More/Settings** | `div > div:nth-of-type(3) > span:nth-of-type(1) > div > a[href='#']` | Opens settings menu | At bottom of sidebar |
| 11 | **Also from Meta** | `div > div:nth-of-type(3) > span:nth-of-type(2) > div > a[href='#']` | Opens Meta apps menu | Threads, Facebook links |

---

## Create Button Deep Dive

### Step 1: Click Create Button

**Selector:** `svg[aria-label="New post"]` or parent `div:nth-of-type(7) > div > span > div > a`

**Position:** `left=12, top=626, width=48, height=56`

**Screen Coordinates:** `(36, 819)` (includes Chrome offset)

### Step 2: Create Submenu Appears

After clicking Create, a small popup menu appears with two options:

| Option | Selector | Position | Action |
|--------|----------|----------|--------|
| **Post** | `a:nth-of-type(1)` containing text "Post" | `left=28, top=694` | Opens "Create new post" dialog |
| **AI** | (second option in menu) | Below Post | Opens AI generation feature |

**Post option details:**
- Text selector: `span` containing "Post" at `left=28, top=694`
- SVG icon: `svg[aria-label="Post"]` at `left=172, top=692`
- Screen coords for click: `(94, 869)`

### Step 3: Create New Post Dialog

**Dialog selector:** `div[aria-label="Create new post"]` or `[role='dialog']`

**Dialog position:** `left=581, top=83, width=895, height=938`

**Dialog contents:**

| Element | Selector | Purpose |
|---------|----------|--------|
| Title | (header text) | "Create new post" |
| Icon | SVG | Media icon (images/videos) |
| Instructions | (text) | "Drag photos and videos here" |
| **Select from computer** | `div > div > div:nth-of-type(2) > div > button` | Opens file picker |
| Hidden file input | `form > input` | Receives selected files |

**"Select from computer" button:**
- Position: `left=939, top=623, width=179, height=32`
- Screen coords: `(1028, 804)`

---

## Post Creation Flow (Complete)

```
1. Click Create button
   ├── Selector: svg[aria-label="New post"] or parent link
   └── Screen: (36, 819)

2. Click "Post" in submenu
   ├── Selector: span containing "Post"
   └── Screen: (94, 869)

3. "Create new post" dialog opens
   ├── Selector: div[aria-label="Create new post"]
   └── Contains file upload area

4. Click "Select from computer" OR drag file
   ├── Selector: div > div > div:nth-of-type(2) > div > button
   └── Screen: (1028, 804)

5. File picker opens (OS-level)
   ├── Use flow-frame-core fileModalOperate()
   └── macOS: Cmd+Shift+G → paste path → Enter → Enter

6. Image appears in crop view
   ├── Look for "Next" button
   └── May have aspect ratio options

7. Click "Next" for filters/edit view
   ├── Optional filters and adjustments
   └── Click "Next" again

8. Caption view
   ├── Caption textbox: div[aria-label="Write a caption..."]
   ├── Location, tags, accessibility options
   └── Click "Share" to publish

9. Post published
   └── Dialog closes, feed may refresh
```

---

## Reliable Selectors Summary

### Navigation
```css
/* Home */
a[href='/']:has(svg)

/* Create */
svg[aria-label="New post"]

/* Search (opens panel) */
div:nth-of-type(4) > span > div > a[href='#']

/* Notifications (opens panel) */
div:nth-of-type(6) > div > span > div > a[href='#']
```

### Create Flow
```css
/* Create button */
svg[aria-label="New post"]

/* Post option in submenu */
svg[aria-label="Post"]

/* Create dialog */
div[aria-label="Create new post"]
[role='dialog']

/* Select from computer button */
[role='dialog'] button

/* File input (hidden) */
[role='dialog'] form input[type='file']

/* Next button (in dialog) */
[role='dialog'] [role='button']:contains('Next')
div[role='button'] containing text "Next"

/* Share button */
div[role='button'] containing text "Share"
```

---

## Panel Behavior

### Search Panel
- Opens from left sidebar when Search clicked
- Contains search input and recent searches
- Close: Click elsewhere or press Escape

### Notifications Panel
- Opens from left sidebar when Notifications clicked
- Shows likes, comments, follows, mentions
- Organized by time periods (Today, This Week, etc.)
- Close: Click elsewhere or press Escape

### Create Submenu
- Small popup near Create button
- Contains: Post, AI
- Close: Click elsewhere or press Escape

---

## Automation Tips

### 1. Always dismiss panels first
Before clicking Create, ensure notifications/search panels are closed:
```javascript
keyboard(action="press", key="escape")
```

### 2. Use screen coordinates for reliable clicking
The DOM click sometimes doesn't trigger the submenu. Use mouse click with screen coords:
```javascript
mouse(action="click", x=36, y=819)  // Create button
// Wait for submenu
mouse(action="click", x=94, y=869)  // Post option
```

### 3. Wait for dialog to appear
After clicking Post, wait for the dialog:
```javascript
browser_query(action="find_elements", selector="[role='dialog']")
```

### 4. File upload via input
The hidden file input can be used directly:
```javascript
// Find the input
browser_query(action="find_elements", selector="[role='dialog'] form input")
// Set value programmatically may not work - use flow-frame-core fileModalOperate()
```

### 5. Handle the crop/edit views
After file selection, multiple "Next" buttons appear:
- Crop view → Next → Edit/Filter view → Next → Caption view
- Look for `div[role='button']` containing "Next"

---

## Known Issues

1. **Notifications panel blocking**: Clicking near the sidebar often opens notifications instead of the intended button. Always close panels first.

2. **DOM click vs mouse click**: DOM `.click()` doesn't always trigger Instagram's React event handlers. Use actual mouse coordinates.

3. **Dynamic selectors**: Instagram uses minified class names that change. Use `aria-label`, `role`, and structural selectors.

4. **Timing**: Instagram's SPA needs time to render. Use `MutationObserver` or polling to wait for elements.

---

## Screen Coordinate Reference

With Chrome UI offset of 121px:

| Element | Screen X | Screen Y |
|---------|----------|----------|
| Create button | 36 | 819 |
| Post option | 94 | 869 |
| Select from computer | 1028 | 804 |
| Dialog center | 1028 | 717 |
